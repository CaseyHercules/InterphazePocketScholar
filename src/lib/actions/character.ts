"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export type CharacterFormData = {
  name: string;
  race: string;
  primaryClassId?: string;
  primaryClassLvl: number;
  secondaryClassId?: string | null;
  secondaryClassLvl: number;
  attributes?: Record<string, any>;
  notes?: Record<string, any>;
  phazians: number;
};

export async function createCharacter(formData: CharacterFormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("You must be logged in to create a character");
  }

  const character = await db.character.create({
    data: {
      name: formData.name,
      primaryClassId: formData.primaryClassId || null,
      primaryClassLvl: formData.primaryClassLvl || 1,
      secondaryClassId:
        formData.secondaryClassId === "none"
          ? null
          : formData.secondaryClassId || null,
      secondaryClassLvl: formData.secondaryClassLvl || 0,
      Attributes: {
        ...(formData.attributes || {}),
        race: formData.race,
      },
      notes: formData.notes || {},
      phazians: formData.phazians || 0,
      userId: session.user.id,
    },
  });

  revalidatePath("/characters");
  return { success: true, characterId: character.id };
}

export async function updateCharacter(
  characterId: string,
  formData: CharacterFormData
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("You must be logged in to update a character");
  }

  // First verify the character belongs to the user
  const existingCharacter = await db.character.findUnique({
    where: { id: characterId },
    select: {
      userId: true,
      primaryClassId: true,
      primaryClassLvl: true,
      secondaryClassId: true,
      secondaryClassLvl: true,
    },
  });

  if (!existingCharacter) {
    throw new Error("Character not found");
  }

  if (existingCharacter.userId !== session.user.id) {
    throw new Error("You don't have permission to update this character");
  }

  // Check if user is adding a secondary class for the first time
  const isAddingSecondaryClass =
    !existingCharacter.secondaryClassId &&
    formData.secondaryClassId &&
    formData.secondaryClassId !== "none";

  // If adding a secondary class, check if user has enough unallocated levels
  if (isAddingSecondaryClass) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { UnallocatedLevels: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.UnallocatedLevels < 1) {
      throw new Error(
        "You need at least 1 unallocated level to add a secondary class"
      );
    }

    // Perform both updates in a transaction
    await db.$transaction([
      db.character.update({
        where: { id: characterId },
        data: {
          name: formData.name,
          primaryClassId:
            formData.primaryClassId || existingCharacter.primaryClassId,
          primaryClassLvl:
            formData.primaryClassLvl || existingCharacter.primaryClassLvl,
          secondaryClassId:
            formData.secondaryClassId === "none"
              ? null
              : formData.secondaryClassId,
          secondaryClassLvl: formData.secondaryClassLvl || 1, // Start at level 1
          Attributes: formData.attributes || {},
          notes: formData.notes || {},
          phazians: formData.phazians,
        },
      }),
      db.user.update({
        where: { id: session.user.id },
        data: {
          UnallocatedLevels: { decrement: 1 },
        },
      }),
    ]);
  } else {
    // Regular update without spending unallocated levels
    await db.character.update({
      where: { id: characterId },
      data: {
        name: formData.name,
        primaryClassId:
          formData.primaryClassId || existingCharacter.primaryClassId,
        primaryClassLvl:
          formData.primaryClassLvl || existingCharacter.primaryClassLvl,
        secondaryClassId:
          formData.secondaryClassId === "none"
            ? null
            : formData.secondaryClassId || existingCharacter.secondaryClassId,
        secondaryClassLvl:
          formData.secondaryClassLvl || existingCharacter.secondaryClassLvl,
        Attributes: formData.attributes || {},
        notes: formData.notes || {},
        phazians: formData.phazians,
      },
    });
  }

  revalidatePath(`/characters`);
  revalidatePath(`/passport/${characterId}`);
  return { success: true, characterId };
}

export async function deleteCharacter(characterId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("You must be logged in to delete a character");
  }

  // First verify the character belongs to the user
  const existingCharacter = await db.character.findUnique({
    where: { id: characterId },
    select: { userId: true },
  });

  if (!existingCharacter) {
    throw new Error("Character not found");
  }

  if (existingCharacter.userId !== session.user.id) {
    throw new Error("You don't have permission to delete this character");
  }

  await db.character.delete({
    where: { id: characterId },
  });

  revalidatePath("/characters");
  return { success: true };
}

export async function getCharacter(characterId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const character = await db.character.findUnique({
    where: { id: characterId },
    include: {
      primaryClass: true,
      secondaryClass: true,
      skills: true,
      inventory: true,
      spells: true,
      user: true,
    },
  });

  if (!character) {
    throw new Error("Character not found");
  }

  if (character.userId !== session.user.id) {
    throw new Error("You don't have permission to view this character");
  }

  return character;
}

export async function levelUpCharacterClass(
  characterId: string,
  classType: "primary" | "secondary",
  levelsToAdd: number
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("You must be logged in to level up a character");
  }

  // First verify the character belongs to the user and get both character and user data
  const character = await db.character.findUnique({
    where: { id: characterId },
    select: {
      userId: true,
      primaryClassLvl: true,
      secondaryClassLvl: true,
      primaryClassId: true,
      secondaryClassId: true,
    },
  });

  if (!character) {
    throw new Error("Character not found");
  }

  if (character.userId !== session.user.id) {
    throw new Error("You don't have permission to update this character");
  }

  // Check if the class is already at max level (20)
  const currentLevel =
    classType === "primary"
      ? character.primaryClassLvl
      : character.secondaryClassLvl;

  if (currentLevel >= 20) {
    throw new Error(
      `Your ${classType} class is already at the maximum level of 20.`
    );
  }

  // Check if leveling up would exceed the max level
  if (currentLevel + levelsToAdd > 20) {
    throw new Error(
      `Cannot exceed the maximum level of 20. You can only add ${
        20 - currentLevel
      } more levels to this class.`
    );
  }

  // Get user to check available unallocated levels
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { UnallocatedLevels: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user has enough unallocated levels
  if (user.UnallocatedLevels < levelsToAdd) {
    throw new Error(
      `Not enough unallocated levels. You have ${user.UnallocatedLevels} level(s) available.`
    );
  }

  // For secondary class, ensure it exists before leveling it up
  if (classType === "secondary" && !character.secondaryClassId) {
    throw new Error(
      "This character doesn't have a secondary class to level up"
    );
  }

  // Update the character level and decrease unallocated levels
  await db.$transaction([
    db.character.update({
      where: { id: characterId },
      data: {
        ...(classType === "primary"
          ? { primaryClassLvl: character.primaryClassLvl + levelsToAdd }
          : { secondaryClassLvl: character.secondaryClassLvl + levelsToAdd }),
      },
    }),
    db.user.update({
      where: { id: session.user.id },
      data: {
        UnallocatedLevels: user.UnallocatedLevels - levelsToAdd,
      },
    }),
  ]);

  revalidatePath(`/passport/${characterId}`);
  return { success: true };
}

export async function addSpellToCharacter(
  characterId: string,
  spellId: string
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("You must be logged in to add a spell to a character");
  }

  // First verify the character belongs to the user
  const character = await db.character.findUnique({
    where: { id: characterId },
    select: { userId: true },
  });

  if (!character) {
    throw new Error("Character not found");
  }

  if (character.userId !== session.user.id) {
    throw new Error("You don't have permission to update this character");
  }

  // Verify the spell exists
  const spell = await db.spell.findUnique({
    where: { id: spellId },
  });

  if (!spell) {
    throw new Error("Spell not found");
  }

  // Update the spell to be associated with this character
  // If the spell is already associated with another character, create a copy
  let updatedSpell;

  if (spell.characterId && spell.characterId !== characterId) {
    // Create a copy of the spell for this character
    updatedSpell = await db.spell.create({
      data: {
        title: spell.title,
        type: spell.type,
        description: spell.description,
        level: spell.level,
        data: spell.data as any,
        characterId: characterId,
      },
    });
  } else {
    // Update the existing spell to be associated with this character
    updatedSpell = await db.spell.update({
      where: { id: spellId },
      data: { characterId },
    });
  }

  revalidatePath(`/passport/${characterId}`);
  return { success: true, spell: updatedSpell };
}

export async function removeSpellFromCharacter(
  characterId: string,
  spellId: string
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("You must be logged in to remove a spell from a character");
  }

  // First verify the character belongs to the user
  const character = await db.character.findUnique({
    where: { id: characterId },
    select: { userId: true },
  });

  if (!character) {
    throw new Error("Character not found");
  }

  if (character.userId !== session.user.id) {
    throw new Error("You don't have permission to update this character");
  }

  // Verify the spell exists and belongs to this character
  const spell = await db.spell.findUnique({
    where: { id: spellId },
  });

  if (!spell) {
    throw new Error("Spell not found");
  }

  if (spell.characterId !== characterId) {
    throw new Error("This spell doesn't belong to the character");
  }

  // Instead of deleting, just remove the association with the character
  await db.spell.update({
    where: { id: spellId },
    data: { characterId: null },
  });

  revalidatePath(`/passport/${characterId}`);
  return { success: true };
}

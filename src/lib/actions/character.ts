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
    select: { userId: true },
  });

  if (!existingCharacter) {
    throw new Error("Character not found");
  }

  if (existingCharacter.userId !== session.user.id) {
    throw new Error("You don't have permission to update this character");
  }

  await db.character.update({
    where: { id: characterId },
    data: {
      name: formData.name,
      primaryClassId: formData.primaryClassId || null,
      primaryClassLvl: formData.primaryClassLvl,
      secondaryClassId:
        formData.secondaryClassId === "none"
          ? null
          : formData.secondaryClassId || null,
      secondaryClassLvl: formData.secondaryClassLvl,
      Attributes: formData.attributes || {},
      notes: formData.notes || {},
      phazians: formData.phazians,
    },
  });

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

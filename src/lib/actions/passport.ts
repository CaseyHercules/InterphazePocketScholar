"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  adjustmentMatchesRace,
  getCharacterRace,
} from "@/lib/utils/adjustments";
import { getSkillVisibilityWhere, getVisibilityWhere } from "@/lib/visibility";
import {
  getSkillEffects,
  isGrantSkillEffect,
  type GrantSkillEffect,
} from "@/types/skill-effects";

const characterPassportInclude = {
  primaryClass: true,
  secondaryClass: true,
  primarySkills: { orderBy: { title: "asc" as const } },
  secondarySkills: { orderBy: { title: "asc" as const } },
  inventory: { orderBy: { title: "asc" as const } },
  spells: { orderBy: { level: "asc" as const } },
  user: { select: { id: true, UnallocatedLevels: true } },
} as const;

export type CharacterForPassport = Prisma.CharacterGetPayload<{
  include: typeof characterPassportInclude;
}>;

/**
 * Server action to fetch character data with all necessary relations for passport view
 */
export async function getCharacterForPassport(
  characterId: string
): Promise<CharacterForPassport> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch the character with all its relations
  const baseInclude = {
    primaryClass: true,
    secondaryClass: true,
    primarySkills: {
      orderBy: {
        title: "asc",
      },
    },
    secondarySkills: {
      orderBy: {
        title: "asc",
      },
    },
    inventory: {
      orderBy: {
        title: "asc",
      },
    },
    spells: {
      orderBy: {
        level: "asc",
      },
    },
    user: {
      select: {
        id: true,
        UnallocatedLevels: true,
      },
    },
  } as const;

  const adjustmentClient = (db as unknown as { adjustment?: any }).adjustment;
  const characterAdjustmentClient = (db as unknown as { characterAdjustment?: any })
    .characterAdjustment;
  const characterInclude =
    adjustmentClient && characterAdjustmentClient
      ? {
          ...baseInclude,
          adjustments: {
            include: {
              adjustment: true,
            },
            orderBy: {
              appliedAt: "desc" as const,
            },
          },
        }
      : baseInclude;

  let character;
  try {
    character = await db.character.findUnique({
      where: {
        id: characterId,
      },
      include: characterInclude,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Unknown field `adjustments`")) {
      character = await db.character.findUnique({
        where: {
          id: characterId,
        },
        include: baseInclude,
      });
    } else {
      throw error;
    }
  }

  if (!character) {
    notFound();
  }

  // Verify ownership unless the user is an admin
  if (
    character.userId !== session.user.id &&
    session.user.role !== "ADMIN" &&
    session.user.role !== "SUPERADMIN"
  ) {
    redirect("/unauthorized");
  }

  return character as CharacterForPassport;
}

/**
 * Server action to fetch available classes for secondary class selection
 */
export async function getAvailableClasses() {
  const session = await getServerSession(authOptions);
  return await db.class.findMany({
    select: { id: true, Title: true },
    where: {
      NOT: {
        Title: {
          contains: "none",
          mode: "insensitive",
        },
      },
      ...getVisibilityWhere(session?.user?.role),
    },
    orderBy: { Title: "asc" },
  });
}

/**
 * Server action to get available skills for a character based on their class progression
 */
export async function getAvailableSkillsForCharacter(characterId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Get character with class information
  const character = await db.character.findUnique({
    where: { id: characterId },
    include: {
      primaryClass: true,
      secondaryClass: true,
      primarySkills: true,
      secondarySkills: true,
    },
  });

  if (!character) {
    notFound();
  }

  // Verify ownership unless the user is an admin
  if (
    character.userId !== session.user.id &&
    session.user.role !== "ADMIN" &&
    session.user.role !== "SUPERADMIN"
  ) {
    redirect("/unauthorized");
  }

  // Helper function to get skill tier gains for a class at a specific level
  const getSkillTierForLevel = (classData: any, level: number): number => {
    if (!classData?.SkillTierGains) return 0;

    let tierGains: number[];
    if (typeof classData.SkillTierGains === "string") {
      tierGains = JSON.parse(classData.SkillTierGains);
    } else if (Array.isArray(classData.SkillTierGains)) {
      tierGains = classData.SkillTierGains;
    } else {
      return 0;
    }

    const index = level - 1; // Convert 1-based level to 0-based index
    return index >= 0 && index < tierGains.length ? tierGains[index] : 0;
  };

  // Get available tiers for primary class
  const primarySkillTiers: { [level: number]: number } = {};
  for (let level = 1; level <= character.primaryClassLvl; level++) {
    const tier = character.primaryClass
      ? getSkillTierForLevel(character.primaryClass, level)
      : 0;
    if (tier > 0) {
      primarySkillTiers[level] = tier;
    }
  }

  // Get available tiers for secondary class
  const secondarySkillTiers: { [level: number]: number } = {};
  for (let level = 1; level <= character.secondaryClassLvl; level++) {
    const tier = character.secondaryClass
      ? getSkillTierForLevel(character.secondaryClass, level)
      : 0;
    if (tier > 0) {
      secondarySkillTiers[level] = tier;
    }
  }

  // Get class IDs for filtering
  const primaryClassId = character.primaryClass?.id;
  const secondaryClassId = character.secondaryClass?.id;
  const classIds = [primaryClassId, secondaryClassId].filter(
    Boolean
  ) as string[];

  // Fetch all skills that belong to the character's classes
  const availableSkills = await db.skill.findMany({
    where: {
      classId: { in: classIds },
      ...getSkillVisibilityWhere(session?.user?.role),
    },
    include: {
      class: true,
    },
    orderBy: [{ tier: "asc" }, { title: "asc" }],
  });

  // Get learned skill IDs
  const primarySkillIds = character.primarySkills.map((s) => s.id);
  const secondarySkillIds = character.secondarySkills.map((s) => s.id);
  const learnedSkillIds = new Set([...primarySkillIds, ...secondarySkillIds]);

  // Organize skills by tier and filter based on what character can learn
  const skillsByTier: { [tier: number]: typeof availableSkills } = {};
  const maxPrimaryTier = Math.max(...Object.values(primarySkillTiers), 0);
  const maxSecondaryTier = Math.max(...Object.values(secondarySkillTiers), 0);
  const maxTier = Math.max(maxPrimaryTier, maxSecondaryTier);

  for (const skill of availableSkills) {
    if (skill.tier <= maxTier) {
      if (!skillsByTier[skill.tier]) {
        skillsByTier[skill.tier] = [];
      }
      skillsByTier[skill.tier].push(skill);
    }
  }

  // Process grant_skill effects from learned skills
  const allLearnedSkills = [...character.primarySkills, ...character.secondarySkills];
  const grantedSkillIds = new Set<string>();
  const grantedClassTiers: { classId: string; maxTier: number }[] = [];
  
  // Collect all grant_skill effects (with loop prevention)
  const processedSkillIds = new Set<string>();
  const skillsToProcess = [...allLearnedSkills];
  
  while (skillsToProcess.length > 0) {
    const skill = skillsToProcess.pop();
    if (!skill || processedSkillIds.has(skill.id)) continue;
    processedSkillIds.add(skill.id);
    
    const effects = getSkillEffects(skill.additionalInfo);
    
    for (const effect of effects) {
      if (!isGrantSkillEffect(effect)) continue;
      
      // Handle specific skill grants
      if (effect.skillId) {
        grantedSkillIds.add(effect.skillId);
      }
      if (effect.skillIds) {
        for (const id of effect.skillIds) {
          grantedSkillIds.add(id);
        }
      }
      
      // Handle class-wide tier grants
      if (effect.classId && effect.maxTier && effect.maxTier > 0) {
        grantedClassTiers.push({
          classId: effect.classId,
          maxTier: effect.maxTier,
        });
      }
    }
  }
  
  // Fetch specifically granted skills by ID
  if (grantedSkillIds.size > 0) {
    const specificGrantedSkills = await db.skill.findMany({
      where: {
        id: { in: Array.from(grantedSkillIds) },
        ...getSkillVisibilityWhere(session?.user?.role),
      },
      include: { class: true },
    });
    
    for (const skill of specificGrantedSkills) {
      // Add to appropriate tier if within maxTier
      if (skill.tier <= maxTier) {
        if (!skillsByTier[skill.tier]) {
          skillsByTier[skill.tier] = [];
        }
        // Avoid duplicates
        if (!skillsByTier[skill.tier].some((s) => s.id === skill.id)) {
          skillsByTier[skill.tier].push(skill);
        }
      }
    }
  }
  
  // Fetch skills from granted class tiers
  for (const { classId, maxTier: grantedMaxTier } of grantedClassTiers) {
    // Skip if this is already one of the character's classes
    if (classId === primaryClassId || classId === secondaryClassId) continue;
    
    const grantedClassSkills = await db.skill.findMany({
      where: {
        classId,
        tier: { lte: Math.min(grantedMaxTier, maxTier) },
        ...getSkillVisibilityWhere(session?.user?.role),
      },
      include: { class: true },
    });
    
    for (const skill of grantedClassSkills) {
      if (!skillsByTier[skill.tier]) {
        skillsByTier[skill.tier] = [];
      }
      // Avoid duplicates
      if (!skillsByTier[skill.tier].some((s) => s.id === skill.id)) {
        skillsByTier[skill.tier].push(skill);
      }
    }
  }

  return {
    character,
    primarySkillTiers,
    secondarySkillTiers,
    skillsByTier,
    learnedSkillIds,
    maxPrimaryTier,
    maxSecondaryTier,
  };
}

/**
 * Server action to add a skill to a character
 */
export async function addSkillToCharacter(
  characterId: string,
  skillId: string,
  isPrimary: boolean = true
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  try {
    // Get character to verify ownership
    const character = await db.character.findUnique({
      where: { id: characterId },
      include: {
        primarySkills: true,
        secondarySkills: true,
      },
    });

    if (!character) {
      throw new Error("Character not found");
    }

    // Verify ownership unless the user is an admin
    if (
      character.userId !== session.user.id &&
      session.user.role !== "ADMIN" &&
      session.user.role !== "SUPERADMIN"
    ) {
      throw new Error("Unauthorized");
    }

    // Check if skill already exists
    const skillAlreadyExists = [
      ...character.primarySkills.map((s) => s.id),
      ...character.secondarySkills.map((s) => s.id),
    ].includes(skillId);

    if (skillAlreadyExists) {
      throw new Error("Skill already learned");
    }

    // Add skill to character
    if (isPrimary) {
      await db.character.update({
        where: { id: characterId },
        data: {
          primarySkills: {
            connect: { id: skillId },
          },
        },
      });
    } else {
      await db.character.update({
        where: { id: characterId },
        data: {
          secondarySkills: {
            connect: { id: skillId },
          },
        },
      });
    }

    // Refresh the passport page to show the updated skills
    revalidatePath(`/passport/${characterId}`);

    return { success: true };
  } catch (error) {
    console.error("Error adding skill to character:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to add skill"
    );
  }
}

/**
 * Server action to remove a skill from a character
 */
export async function removeSkillFromCharacter(
  characterId: string,
  skillId: string
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  try {
    // Get character to verify ownership
    const character = await db.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      throw new Error("Character not found");
    }

    // Verify ownership unless the user is an admin
    if (
      character.userId !== session.user.id &&
      session.user.role !== "ADMIN" &&
      session.user.role !== "SUPERADMIN"
    ) {
      throw new Error("Unauthorized");
    }

    // Remove skill from both primary and secondary (one will succeed)
    await db.character.update({
      where: { id: characterId },
      data: {
        primarySkills: {
          disconnect: { id: skillId },
        },
        secondarySkills: {
          disconnect: { id: skillId },
        },
      },
    });

    // Refresh the passport page to show the updated skills
    revalidatePath(`/passport/${characterId}`);

    return { success: true };
  } catch (error) {
    console.error("Error removing skill from character:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to remove skill"
    );
  }
}

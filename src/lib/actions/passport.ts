"use server";

import { cache } from "react";
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
import { getSkillVisibilityWhere, getVisibilityWhere, canSeeAdminOnlyAdjustments } from "@/lib/visibility";
import {
  getSkillEffects,
  getEffectsFromJson,
  isGrantSkillEffect,
  isPickSkillByTierEffect,
  type SkillEffect,
} from "@/types/skill-effects";

const characterPassportInclude = {
  primaryClass: true,
  secondaryClass: true,
  primarySkillEntries: {
    include: { skill: { include: { class: true } } },
  },
  secondarySkillEntries: {
    include: { skill: { include: { class: true } } },
  },
  inventory: { orderBy: { title: "asc" as const } },
  spells: { orderBy: { level: "asc" as const } },
  user: { select: { id: true, UnallocatedLevels: true } },
} as const;

type CharacterPassportPayload = Prisma.CharacterGetPayload<{
  include: typeof characterPassportInclude;
}>;

export type CharacterForPassport = Omit<
  CharacterPassportPayload,
  "primarySkillEntries" | "secondarySkillEntries"
> & {
  primarySkills: NonNullable<CharacterPassportPayload["primarySkillEntries"]>[number]["skill"][];
  secondarySkills: NonNullable<CharacterPassportPayload["secondarySkillEntries"]>[number]["skill"][];
};

export const getCharacterForPassport = cache(async function getCharacterForPassport(
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
    primarySkillEntries: {
      include: { skill: { include: { class: true } } },
    },
    secondarySkillEntries: {
      include: { skill: { include: { class: true } } },
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

  const primarySkills = (character.primarySkillEntries ?? [])
    .map((e) => e.skill)
    .filter(Boolean);
  const secondarySkills = (character.secondarySkillEntries ?? [])
    .map((e) => e.skill)
    .filter(Boolean);
  const characterForReturn = {
    ...character,
    primarySkills,
    secondarySkills,
  };

  if (
    characterForReturn.userId !== session.user.id &&
    session.user.role !== "ADMIN" &&
    session.user.role !== "SUPERADMIN"
  ) {
    redirect("/unauthorized");
  }

  const adjustments = (characterForReturn as { adjustments?: { adjustment?: { visibilityRoles?: unknown[] } }[] }).adjustments;
  if (Array.isArray(adjustments) && !canSeeAdminOnlyAdjustments(session.user.role)) {
    (characterForReturn as { adjustments: typeof adjustments }).adjustments = adjustments.filter(
      (e) => !(e?.adjustment?.visibilityRoles?.length ?? 0)
    );
  }

  const inventory = Array.isArray(characterForReturn.inventory) ? characterForReturn.inventory : [];
  const adjustmentIds = inventory
    .map((item) => {
      const data = item?.data as { adjustmentId?: string; inlineEffects?: { effects?: unknown[] } } | null | undefined;
      if (!data?.adjustmentId) return null;
      if (Array.isArray(data.inlineEffects?.effects) && data.inlineEffects.effects.length > 0) return null;
      return data.adjustmentId;
    })
    .filter(Boolean) as string[];
  const uniqueIds = Array.from(new Set(adjustmentIds));

  if (uniqueIds.length > 0) {
    const adjustments = await db.adjustment.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true, effectsJson: true },
    });
    const adjMap = new Map(adjustments.map((a) => [a.id, a.effectsJson]));
    for (const item of inventory) {
      const data = item?.data as { adjustmentId?: string; inlineEffects?: { effects?: unknown[] } } | null | undefined;
      if (!data?.adjustmentId) continue;
      if (Array.isArray(data.inlineEffects?.effects) && data.inlineEffects.effects.length > 0) continue;
      const effects = adjMap.get(data.adjustmentId);
      if (effects != null) {
        (item as { _resolvedAdjustmentEffects?: unknown })._resolvedAdjustmentEffects = effects;
      }
    }
  }

  return characterForReturn as CharacterForPassport;
});

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


export async function getAvailableSkillsForCharacter(characterId: string) {
  const [character, session] = await Promise.all([
    getCharacterForPassport(characterId),
    getServerSession(authOptions),
  ]);

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

    const index = level - 1; 
    return index >= 0 && index < tierGains.length ? tierGains[index] : 0;
  };

  const primarySkillTiers: { [level: number]: number } = {};
  for (let level = 1; level <= character.primaryClassLvl; level++) {
    const tier = character.primaryClass
      ? getSkillTierForLevel(character.primaryClass, level)
      : 0;
    if (tier > 0) {
      primarySkillTiers[level] = tier;
    }
  }

  const secondarySkillTiers: { [level: number]: number } = {};
  for (let level = 1; level <= character.secondaryClassLvl; level++) {
    const tier = character.secondaryClass
      ? getSkillTierForLevel(character.secondaryClass, level)
      : 0;
    if (tier > 0) {
      secondarySkillTiers[level] = tier;
    }
  }

  const primaryClassId = character.primaryClass?.id;
  const secondaryClassId = character.secondaryClass?.id;
  const classIds = [primaryClassId, secondaryClassId].filter(
    Boolean
  ) as string[];

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

  const primarySkillIds = character.primarySkills.map((s) => s.id);
  const secondarySkillIds = character.secondarySkills.map((s) => s.id);
  const learnedSkillIds = new Set([...primarySkillIds, ...secondarySkillIds]);

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

  const allLearnedSkills = [...character.primarySkills, ...character.secondarySkills];
  const grantedSkillIds = new Set<string>();
  const grantedClassTiers: { classId: string; maxTier: number }[] = [];
  let pickSkillByTierMax = 0;

  const processEffects = (effects: SkillEffect[]) => {
    for (const effect of effects) {
      if (isGrantSkillEffect(effect)) {
        if (effect.skillId) grantedSkillIds.add(effect.skillId);
        if (effect.skillIds) {
          for (const id of effect.skillIds) grantedSkillIds.add(id);
        }
        if (effect.classId && effect.maxTier && effect.maxTier > 0) {
          grantedClassTiers.push({ classId: effect.classId, maxTier: effect.maxTier });
        }
      }
      if (isPickSkillByTierEffect(effect) && effect.maxTier > 0) {
        pickSkillByTierMax = Math.max(pickSkillByTierMax, effect.maxTier);
      }
    }
  };

  const processedSkillIds = new Set<string>();
  const skillsToProcess = [...allLearnedSkills];
  while (skillsToProcess.length > 0) {
    const skill = skillsToProcess.pop();
    if (!skill || processedSkillIds.has(skill.id)) continue;
    processedSkillIds.add(skill.id);
    processEffects(getSkillEffects(skill.additionalInfo));
  }

  const charAdjustments = Array.isArray((character as Record<string, unknown>).adjustments)
    ? ((character as Record<string, unknown>).adjustments as { adjustment?: { effectsJson?: unknown } }[])
    : [];
  for (const entry of charAdjustments) {
    const adjustment = entry?.adjustment ?? entry;
    processEffects(getEffectsFromJson((adjustment as { effectsJson?: unknown })?.effectsJson));
  }

  const inlineEffectsJson = (character as Record<string, unknown>).inlineEffectsJson;
  if (inlineEffectsJson) {
    processEffects(getEffectsFromJson(inlineEffectsJson));
  }

  const inventory = Array.isArray((character as Record<string, unknown>).inventory)
    ? ((character as Record<string, unknown>).inventory as { data?: { adjustmentId?: string; inlineEffects?: { effects?: unknown[] } } }[])
    : [];
  for (const item of inventory) {
    const data = item?.data;
    if (!data) continue;
    const inlineEffects = data.inlineEffects;
    if (Array.isArray(inlineEffects?.effects) && inlineEffects.effects.length > 0) {
      processEffects(getEffectsFromJson({ effects: inlineEffects.effects }));
    } else if (data.adjustmentId) {
      const resolved = (item as { _resolvedAdjustmentEffects?: unknown })._resolvedAdjustmentEffects;
      if (resolved) {
        processEffects(getEffectsFromJson(resolved));
      }
    }
  }

  const visibilityWhere = getSkillVisibilityWhere(session?.user?.role);
  const extraSkillPromises: Promise<typeof availableSkills>[] = [];

  if (grantedSkillIds.size > 0) {
    extraSkillPromises.push(
      db.skill.findMany({
        where: {
          id: { in: Array.from(grantedSkillIds) },
          ...visibilityWhere,
        },
        include: { class: true },
      })
    );
  }

  const externalGrantedTiers = grantedClassTiers.filter(
    ({ classId }) => classId !== primaryClassId && classId !== secondaryClassId
  );
  for (const { classId, maxTier: grantedMaxTier } of externalGrantedTiers) {
    extraSkillPromises.push(
      db.skill.findMany({
        where: {
          classId,
          tier: { lte: Math.min(grantedMaxTier, maxTier) },
          ...visibilityWhere,
        },
        include: { class: true },
      })
    );
  }

  if (pickSkillByTierMax > 0 && classIds.length > 0) {
    extraSkillPromises.push(
      db.skill.findMany({
        where: {
          classId: { in: classIds },
          tier: { lte: pickSkillByTierMax },
          ...visibilityWhere,
        },
        include: { class: true },
      })
    );
  }

  const extraSkillResults = await Promise.all(extraSkillPromises);
  for (const skills of extraSkillResults) {
    for (const skill of skills) {
      if (skill.tier <= maxTier) {
        if (!skillsByTier[skill.tier]) skillsByTier[skill.tier] = [];
        if (!skillsByTier[skill.tier].some((s) => s.id === skill.id)) {
          skillsByTier[skill.tier].push(skill);
        }
      }
    }
  }

  for (const tier of Object.keys(skillsByTier)) {
    skillsByTier[Number(tier)].sort((a, b) =>
      (a.title ?? "").localeCompare(b.title ?? "")
    );
  }

  return {
    character,
    primarySkillTiers,
    secondarySkillTiers,
    skillsByTier,
    learnedSkillIds: Array.from(learnedSkillIds),
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
    const character = await db.character.findUnique({
      where: { id: characterId },
      include: {
        primarySkillEntries: { select: { skillId: true } },
        secondarySkillEntries: { select: { skillId: true } },
      },
    });

    if (!character) {
      throw new Error("Character not found");
    }

    if (
      character.userId !== session.user.id &&
      session.user.role !== "ADMIN" &&
      session.user.role !== "SUPERADMIN"
    ) {
      throw new Error("Unauthorized");
    }

    const primaryIds = character.primarySkillEntries.map((e) => e.skillId);
    const secondaryIds = character.secondarySkillEntries.map((e) => e.skillId);
    const alreadyLearned = isPrimary
      ? primaryIds.includes(skillId)
      : secondaryIds.includes(skillId);

    if (alreadyLearned) {
      const skill = await db.skill.findUnique({
        where: { id: skillId },
        select: { canBeTakenMultiple: true },
      });
      if (!skill?.canBeTakenMultiple) {
        throw new Error("Skill already learned");
      }
    }

    if (isPrimary) {
      await db.characterPrimarySkill.create({
        data: { characterId, skillId },
      });
    } else {
      await db.characterSecondarySkill.create({
        data: { characterId, skillId },
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

    const primaryEntry = await db.characterPrimarySkill.findFirst({
      where: { characterId, skillId },
    });
    if (primaryEntry) {
      await db.characterPrimarySkill.delete({ where: { id: primaryEntry.id } });
    } else {
      const secondaryEntry = await db.characterSecondarySkill.findFirst({
        where: { characterId, skillId },
      });
      if (secondaryEntry) {
        await db.characterSecondarySkill.delete({
          where: { id: secondaryEntry.id },
        });
      }
    }

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

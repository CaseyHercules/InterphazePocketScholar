"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdjustmentSourceType } from "@prisma/client";

export type AdjustmentFormData = {
  title: string;
  description?: string | null;
  sourceType: AdjustmentSourceType;
  effectsJson: Record<string, any>;
  tags?: Record<string, any> | null;
  archived?: boolean;
};

export async function createAdjustment(formData: AdjustmentFormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("You must be logged in to create an adjustment");
  }

  const adjustment = await db.adjustment.create({
    data: {
      title: formData.title,
      description: formData.description ?? null,
      sourceType: formData.sourceType,
      effectsJson: formData.effectsJson,
      tags: formData.tags ?? null,
      archived: formData.archived ?? false,
    },
  });

  return adjustment;
}

export async function updateAdjustment(
  adjustmentId: string,
  formData: Partial<AdjustmentFormData>
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("You must be logged in to update an adjustment");
  }

  const adjustment = await db.adjustment.update({
    where: { id: adjustmentId },
    data: {
      ...(formData.title !== undefined && { title: formData.title }),
      ...(formData.description !== undefined && {
        description: formData.description ?? null,
      }),
      ...(formData.sourceType !== undefined && {
        sourceType: formData.sourceType,
      }),
      ...(formData.effectsJson !== undefined && {
        effectsJson: formData.effectsJson,
      }),
      ...(formData.tags !== undefined && { tags: formData.tags ?? null }),
      ...(formData.archived !== undefined && { archived: formData.archived }),
    },
  });

  return adjustment;
}

export async function attachAdjustmentToCharacter(
  characterId: string,
  adjustmentId: string,
  notes?: string | null
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("You must be logged in to attach an adjustment");
  }

  return db.characterAdjustment.create({
    data: {
      characterId,
      adjustmentId,
      notes: notes ?? null,
    },
  });
}

export async function detachAdjustmentFromCharacter(
  characterId: string,
  adjustmentId: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("You must be logged in to detach an adjustment");
  }

  return db.characterAdjustment.delete({
    where: {
      characterId_adjustmentId: {
        characterId,
        adjustmentId,
      },
    },
  });
}


import { db } from "@/lib/db";

export async function autoAssignPassportsForEmail(
  userId: string,
  email: string
): Promise<void> {
  const emailLower = email.trim().toLowerCase();
  if (!emailLower || !emailLower.includes("@")) return;

  const unassigned = await db.character.findMany({
    where: {
      userId: null,
      claimEmail: emailLower,
    },
    select: { id: true },
  });

  if (unassigned.length === 0) return;

  await db.$transaction(
    unassigned.map((c) =>
      db.character.update({
        where: { id: c.id },
        data: { userId, claimEmail: null },
      })
    )
  );
}

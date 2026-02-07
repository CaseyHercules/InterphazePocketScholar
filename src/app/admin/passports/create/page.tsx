import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CharacterForm } from "@/components/CharacterForm";
import { getVisibilityWhere } from "@/lib/visibility";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Create Passport | Admin",
  description: "Create a character passport with optional owner.",
};

export default async function AdminPassportsCreatePage() {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")
  ) {
    redirect("/auth/signin");
  }

  const classes = await db.class.findMany({
    select: { id: true, Title: true },
    where: getVisibilityWhere(session.user.role),
    orderBy: { Title: "asc" },
  });

  const raceAdjustments = await db.adjustment.findMany({
    where: { sourceType: "RACE", archived: false },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  const races = raceAdjustments
    .filter((a) => a.title?.trim())
    .map((a) => ({ id: a.title!.trim(), name: a.title!.trim() }));

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/passports">← Passports</Link>
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-2">Create passport</h1>
      <p className="text-muted-foreground mb-6">
        Create a character passport. Leave owner unassigned to assign later by
        user email or username.
      </p>
      <CharacterForm classes={classes} races={races} adminMode />
    </div>
  );
}

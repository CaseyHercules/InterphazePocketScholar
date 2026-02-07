import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { AdminPassportsTable } from "./AdminPassportsTable";

export const metadata = {
  title: "Passport Management | Admin",
  description: "Create, assign, and edit character passports.",
};

export default async function AdminPassportsPage() {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")
  ) {
    redirect("/auth/signin");
  }

  const characters = await db.character.findMany({
    select: {
      id: true,
      name: true,
      primaryClassId: true,
      secondaryClassId: true,
      primaryClassLvl: true,
      secondaryClassLvl: true,
      userId: true,
      phazians: true,
      primaryClass: { select: { Title: true } },
      secondaryClass: { select: { Title: true } },
      user: {
        select: { id: true, name: true, email: true, username: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="w-full py-8 px-4 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Passport Management</h1>
          <p className="text-sm text-muted-foreground">
            Create unassigned passports and assign owners by user.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/passports/create">Create passport</Link>
        </Button>
      </div>
      <AdminPassportsTable characters={characters} />
    </div>
  );
}

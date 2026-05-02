import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PassportPDFDebugView } from "./PassportPDFDebugView";

export default async function DebugPassportPDFPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const characters = await db.character.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-900 p-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl font-bold mb-4">Passport PDF Layout Debug</h1>
        <PassportPDFDebugView
          characters={characters}
        />
      </div>
    </div>
  );
}

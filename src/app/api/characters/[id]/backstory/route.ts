import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const characterId = params.id;

    // Verify character ownership
    const character = await db.character.findUnique({
      where: {
        id: characterId,
        userId: session.user.id,
      },
      select: {
        id: true,
        notes: true,
      },
    });

    if (!character) {
      return new NextResponse("Character not found or unauthorized", {
        status: 404,
      });
    }

    // Parse request body
    const { backstory } = await req.json();

    if (!backstory) {
      return new NextResponse("Backstory is required", { status: 400 });
    }

    // Update only the backstory part of the notes, preserving other notes
    const currentNotes = (character.notes as Record<string, any>) || {};
    const updatedNotes = {
      ...currentNotes,
      backstory: backstory,
    };

    // Update the character
    await db.character.update({
      where: {
        id: characterId,
      },
      data: {
        notes: updatedNotes,
      },
    });

    // Revalidate related paths
    revalidatePath(`/passport/${characterId}`);
    revalidatePath(`/characters/${characterId}/backstory`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating backstory:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

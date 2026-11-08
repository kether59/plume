import { NextResponse } from "next/server";
import { deleteCharacter, updateCharacter, type UpdateCharacterInput } from "@/features/characters/repository";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const charId = parseInt(id, 10);
    const body = await req.json();

    if (!Number.isInteger(charId) || charId <= 0) {
      return NextResponse.json({ error: "Identifiant de personnage invalide." }, { status: 400 });
    }

    const update: UpdateCharacterInput = {};
    for (const field of ["name", "role", "consciousDesire", "unconsciousNeed", "lieOrFlaw", "eyeColor", "hairColor", "height", "physicalParticularity", "age", "birthDate", "externalObstacles", "internalObstacles", "characterArc", "distinguishingFeatures", "relationships", "notes", "color"] as const) {
      if (body[field] !== undefined) Object.assign(update, { [field]: body[field] });
    }
    const updated = await updateCharacter(charId, update);
    if (!updated) return NextResponse.json({ error: "Personnage introuvable." }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("PATCH /api/characters/[id] error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Impossible de modifier le personnage." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const charId = parseInt(id, 10);
    if (!Number.isInteger(charId) || charId <= 0) {
      return NextResponse.json({ error: "Identifiant de personnage invalide." }, { status: 400 });
    }
    await deleteCharacter(charId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE /api/characters/[id] error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Impossible de supprimer le personnage." }, { status: 500 });
  }
}

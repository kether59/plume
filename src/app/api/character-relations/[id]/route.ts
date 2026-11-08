import { NextResponse } from "next/server";
import {
  characterRelationTypes,
  deleteCharacterRelation,
  updateCharacterRelation,
} from "@/features/characters/relations";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Identifiant de relation invalide." }, { status: 400 });
  }
  try {
    const body: unknown = await req.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const update: { relationType?: typeof characterRelationTypes[number]; description?: string } = {};
    if (input.relationType !== undefined) {
      if (typeof input.relationType !== "string" ||
        !characterRelationTypes.includes(input.relationType as typeof characterRelationTypes[number])) {
        return NextResponse.json({ error: "Type de relation invalide." }, { status: 400 });
      }
      update.relationType = input.relationType as typeof characterRelationTypes[number];
    }
    if (input.description !== undefined) {
      if (typeof input.description !== "string") {
        return NextResponse.json({ error: "Description de relation invalide." }, { status: 400 });
      }
      update.description = input.description.trim();
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Aucune information à modifier." }, { status: 400 });
    }
    const relation = await updateCharacterRelation(id, update);
    if (!relation) return NextResponse.json({ error: "Relation introuvable." }, { status: 404 });
    return NextResponse.json(relation);
  } catch (error: unknown) {
    console.error("PATCH /api/character-relations/[id] error:", error);
    return NextResponse.json({ error: "Impossible de modifier la relation." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Identifiant de relation invalide." }, { status: 400 });
  }
  try {
    const relation = await deleteCharacterRelation(id);
    if (!relation) return NextResponse.json({ error: "Relation introuvable." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE /api/character-relations/[id] error:", error);
    return NextResponse.json({ error: "Impossible de supprimer la relation." }, { status: 500 });
  }
}

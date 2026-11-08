import { NextResponse } from "next/server";
import {
  characterRelationTypes,
  createCharacterRelation,
  listCharacterRelations,
} from "@/features/characters/relations";

export async function GET(req: Request) {
  const projectId = Number(new URL(req.url).searchParams.get("projectId"));
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return NextResponse.json({ error: "projectId est requis." }, { status: 400 });
  }
  try {
    return NextResponse.json(await listCharacterRelations(projectId));
  } catch (error: unknown) {
    console.error("GET /api/character-relations error:", error);
    return NextResponse.json({ error: "Impossible de charger les relations." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const projectId = Number(input.projectId);
    const sourceCharacterId = Number(input.sourceCharacterId);
    const targetCharacterId = Number(input.targetCharacterId);
    const relationType = input.relationType;
    if (
      !Number.isInteger(projectId) || projectId <= 0 ||
      !Number.isInteger(sourceCharacterId) || sourceCharacterId <= 0 ||
      !Number.isInteger(targetCharacterId) || targetCharacterId <= 0 ||
      typeof relationType !== "string" ||
      !characterRelationTypes.includes(relationType as typeof characterRelationTypes[number])
    ) {
      return NextResponse.json({ error: "Les données de la relation sont invalides." }, { status: 400 });
    }

    const result = await createCharacterRelation({
      projectId,
      sourceCharacterId,
      targetCharacterId,
      relationType: relationType as typeof characterRelationTypes[number],
      description: typeof input.description === "string" ? input.description.trim() : "",
    });
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json(result.relation, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/character-relations error:", error);
    return NextResponse.json({ error: "Impossible d’enregistrer la relation." }, { status: 500 });
  }
}

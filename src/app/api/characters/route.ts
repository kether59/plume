import { NextResponse } from "next/server";
import { createCharacter } from "@/features/characters/repository";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!Number.isInteger(body.projectId) || body.projectId <= 0 || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "projectId and name are required" }, { status: 400 });
    }

    const newChar = await createCharacter({
      projectId: body.projectId,
      name: body.name.trim(),
      role: body.role,
      consciousDesire: body.consciousDesire,
      unconsciousNeed: body.unconsciousNeed,
      lieOrFlaw: body.lieOrFlaw,
      eyeColor: body.eyeColor,
      hairColor: body.hairColor,
      height: body.height,
      physicalParticularity: body.physicalParticularity,
      age: body.age,
      birthDate: body.birthDate,
      externalObstacles: body.externalObstacles,
      internalObstacles: body.internalObstacles,
      characterArc: body.characterArc,
      distinguishingFeatures: body.distinguishingFeatures,
      relationships: body.relationships,
      notes: body.notes,
      color: body.color,
    });

    return NextResponse.json(newChar, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/characters error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Impossible de créer le personnage." }, { status: 500 });
  }
}

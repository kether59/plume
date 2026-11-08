import { NextResponse } from "next/server";
import { createChapter } from "@/features/chapters/repository";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const projectId = body.projectId;
    if (!Number.isInteger(projectId) || projectId <= 0) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const newChapter = await createChapter({
      projectId,
      title: body.title,
      orderIndex: body.orderIndex,
      act: body.act,
      synopsis: body.synopsis,
      povCharacter: body.povCharacter,
      location: body.location,
      content: body.content,
      status: body.status,
    });

    return NextResponse.json(newChapter, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/chapters error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Impossible de créer le chapitre." }, { status: 500 });
  }
}

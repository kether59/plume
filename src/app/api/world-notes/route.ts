import { NextResponse } from "next/server";
import { createWorldNote } from "@/features/world-notes/repository";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!Number.isInteger(body.projectId) || body.projectId <= 0 || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json({ error: "projectId and title are required" }, { status: 400 });
    }

    const newNote = await createWorldNote({
      projectId: body.projectId,
      title: body.title.trim(),
      category: body.category,
      content: body.content,
      tags: body.tags,
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/world-notes error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Impossible de créer la fiche." }, { status: 500 });
  }
}

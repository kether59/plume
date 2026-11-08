import { NextResponse } from "next/server";
import { deleteChapter, updateChapter, type UpdateChapterInput } from "@/features/chapters/repository";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const chapterId = parseInt(id, 10);
    const body = await req.json();
    if (!Number.isInteger(chapterId) || chapterId <= 0) {
      return NextResponse.json({ error: "Identifiant de chapitre invalide." }, { status: 400 });
    }

    const update: UpdateChapterInput = {};
    for (const field of ["title", "orderIndex", "act", "synopsis", "povCharacter", "location", "content", "status", "aiNotes"] as const) {
      if (body[field] !== undefined) Object.assign(update, { [field]: body[field] });
    }
    const updated = await updateChapter(chapterId, update);
    if (!updated) return NextResponse.json({ error: "Chapitre introuvable." }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("PATCH /api/chapters/[id] error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Impossible de modifier le chapitre." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const chapterId = parseInt(id, 10);
    if (!Number.isInteger(chapterId) || chapterId <= 0) {
      return NextResponse.json({ error: "Identifiant de chapitre invalide." }, { status: 400 });
    }
    await deleteChapter(chapterId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE /api/chapters/[id] error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Impossible de supprimer le chapitre." }, { status: 500 });
  }
}

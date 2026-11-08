import { NextResponse } from "next/server";
import { deleteWorldNote, updateWorldNote, type UpdateWorldNoteInput } from "@/features/world-notes/repository";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const noteId = parseInt(id, 10);
    const body = await req.json();
    if (!Number.isInteger(noteId) || noteId <= 0) {
      return NextResponse.json({ error: "Identifiant de fiche invalide." }, { status: 400 });
    }

    const update: UpdateWorldNoteInput = {};
    for (const field of ["title", "category", "content", "tags"] as const) {
      if (body[field] !== undefined) Object.assign(update, { [field]: body[field] });
    }
    const updated = await updateWorldNote(noteId, update);
    if (!updated) return NextResponse.json({ error: "Fiche introuvable." }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("PATCH /api/world-notes/[id] error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Impossible de modifier la fiche." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const noteId = parseInt(id, 10);
    if (!Number.isInteger(noteId) || noteId <= 0) {
      return NextResponse.json({ error: "Identifiant de fiche invalide." }, { status: 400 });
    }
    await deleteWorldNote(noteId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE /api/world-notes/[id] error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Impossible de supprimer la fiche." }, { status: 500 });
  }
}

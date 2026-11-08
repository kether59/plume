import { NextResponse } from "next/server";
import { deleteBetaFeedback, updateBetaFeedback, type UpdateBetaFeedbackInput } from "@/features/beta-feedback/repository";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const feedbackId = parseInt(id, 10);
    const body = await req.json();
    if (!Number.isInteger(feedbackId) || feedbackId <= 0) {
      return NextResponse.json({ error: "Identifiant de retour invalide." }, { status: 400 });
    }
    const update: UpdateBetaFeedbackInput = {};
    for (const field of ["chapterId", "readerName", "readerEmail", "overallImpression", "hookRating", "paceRating", "dropOffMoment", "favoriteCharacter", "plotQuestions", "generalAdvice", "status"] as const) {
      if (body[field] !== undefined) Object.assign(update, { [field]: body[field] });
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Aucune information à modifier." }, { status: 400 });
    }
    const updated = await updateBetaFeedback(feedbackId, update);
    if (!updated) return NextResponse.json({ error: "Retour introuvable." }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("PATCH /api/beta-feedback/[id] error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Impossible de modifier le retour." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const feedbackId = parseInt(id, 10);
    if (!Number.isInteger(feedbackId) || feedbackId <= 0) {
      return NextResponse.json({ error: "Identifiant de retour invalide." }, { status: 400 });
    }
    await deleteBetaFeedback(feedbackId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE /api/beta-feedback/[id] error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Impossible de supprimer le retour." }, { status: 500 });
  }
}

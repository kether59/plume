import { NextResponse } from "next/server";
import { createBetaFeedback, listBetaFeedback } from "@/features/beta-feedback/repository";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!Number.isInteger(body.projectId) || body.projectId <= 0 ||
      typeof body.readerName !== "string" || !body.readerName.trim()) {
      return NextResponse.json({ error: "projectId and readerName are required" }, { status: 400 });
    }

    const feedback = await createBetaFeedback({
      projectId: body.projectId,
      chapterId: body.chapterId ? Number(body.chapterId) : null,
      readerName: body.readerName.trim(),
      readerEmail: body.readerEmail,
      overallImpression: body.overallImpression,
      hookRating: body.hookRating,
      paceRating: body.paceRating,
      dropOffMoment: body.dropOffMoment,
      favoriteCharacter: body.favoriteCharacter,
      plotQuestions: body.plotQuestions,
      generalAdvice: body.generalAdvice,
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/beta-feedback error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Impossible d’enregistrer le retour." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawProjectId = searchParams.get("projectId");
    const projectId = rawProjectId === null ? NaN : Number(rawProjectId);
    if (!Number.isInteger(projectId) || projectId <= 0) {
      return NextResponse.json({ error: "projectId query param is required" }, { status: 400 });
    }

    const feedbacks = await listBetaFeedback(projectId);
    return NextResponse.json(feedbacks);
  } catch (error: unknown) {
    console.error("GET /api/beta-feedback error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Impossible de charger les retours." }, { status: 500 });
  }
}

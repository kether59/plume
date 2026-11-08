import { NextResponse } from "next/server";
import { databaseFailure } from "@/db/errors";
import { createProject, listProjects } from "@/features/projects/service";

export async function GET() {
  try {
    return NextResponse.json(await listProjects());
  } catch (error: unknown) {
    const databaseError = databaseFailure(error);
    console.error("GET /api/projects error:", error, error instanceof Error ? error.cause : undefined);
    return NextResponse.json(
      { error: databaseError?.message || "Impossible de charger les projets." },
      { status: databaseError?.status || 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const project = await createProject({
      title: body.title,
      subtitle: body.subtitle,
      synopsis: body.synopsis,
      genre: body.genre,
      tone: body.tone,
      targetWordCount: body.targetWordCount,
      dailyGoalWords: body.dailyGoalWords,
      dailyGoalMinutes: body.dailyGoalMinutes,
      workflowOrder: body.workflowOrder,
      narrativeStructure: body.narrativeStructure,
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Impossible de créer le projet." },
      { status: 500 },
    );
  }
}

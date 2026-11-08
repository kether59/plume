import { NextResponse } from "next/server";
import { createWritingSession, listWritingSessions } from "@/features/writing-sessions/repository";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!Number.isInteger(body.projectId) || body.projectId <= 0) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const session = await createWritingSession({
      projectId: body.projectId,
      wordsWritten: body.wordsWritten,
      durationMinutes: body.durationMinutes,
      mood: body.mood,
      antiSelfCensorshipUsed: body.antiSelfCensorshipUsed,
      notes: body.notes,
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/sessions error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Impossible d’enregistrer la session." }, { status: 500 });
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

    const sessions = await listWritingSessions(projectId);
    return NextResponse.json(sessions);
  } catch (error: unknown) {
    console.error("GET /api/sessions error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Impossible de charger les sessions." }, { status: 500 });
  }
}

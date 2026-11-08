import { NextResponse } from "next/server";
import { deleteProject, getProjectDetail, updateProject, type UpdateProjectInput } from "@/features/projects/service";

type RouteContext = { params: Promise<{ id: string }> };

function parseProjectId(rawId: string): number | null {
  const projectId = Number(rawId);
  return Number.isInteger(projectId) && projectId > 0 ? projectId : null;
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const projectId = parseProjectId(id);
  if (projectId === null) return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });

  try {
    const project = await getProjectDetail(projectId);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json(project);
  } catch (error: unknown) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Impossible de charger le projet." },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id } = await params;
  const projectId = parseProjectId(id);
  if (projectId === null) return NextResponse.json({ error: "Identifiant de projet invalide." }, { status: 400 });

  try {
    const body = await req.json();
    if (body.workflowOrder !== undefined && !["prepare_first", "write_first"].includes(body.workflowOrder)) {
      return NextResponse.json({ error: "Ordre de parcours invalide." }, { status: 400 });
    }

    const update: UpdateProjectInput = {};
    for (const field of [
      "title", "subtitle", "synopsis", "genre", "tone", "targetWordCount", "currentWordCount",
      "dailyGoalWords", "dailyGoalMinutes", "currentStage", "workflowOrder", "narrativeStructure", "restingSince",
    ] as const) {
      if (body[field] !== undefined) Object.assign(update, { [field]: body[field] });
    }
    const project = await updateProject(projectId, update);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json(project);
  } catch (error: unknown) {
    console.error("PATCH /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Impossible de modifier le projet." },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const projectId = parseProjectId(id);
  if (projectId === null) return NextResponse.json({ error: "Identifiant de projet invalide." }, { status: 400 });

  try {
    await deleteProject(projectId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Impossible de supprimer le projet." },
      { status: 500 },
    );
  }
}

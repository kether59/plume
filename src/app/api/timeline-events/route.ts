import { NextResponse } from "next/server";
import { createTimelineEvent, getTimelineEvents } from "@/features/timeline/service";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET(req: Request) {
  const projectId = Number(new URL(req.url).searchParams.get("projectId"));
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return NextResponse.json({ error: "projectId est requis." }, { status: 400 });
  }

  try {
    return NextResponse.json(await getTimelineEvents(projectId));
  } catch (error: unknown) {
    console.error("GET /api/timeline-events error:", error);
    return NextResponse.json({ error: "Impossible de charger la frise chronologique." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    if (!isRecord(body)) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
    }

    const result = await createTimelineEvent(body);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result.value, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/timeline-events error:", error);
    return NextResponse.json({ error: "Impossible d’ajouter cet événement." }, { status: 500 });
  }
}

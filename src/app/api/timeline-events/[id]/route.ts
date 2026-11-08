import { NextResponse } from "next/server";
import { deleteTimelineEvent, updateTimelineEvent } from "@/features/timeline/service";

type RouteContext = { params: Promise<{ id: string }> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseEventId(rawId: string): number | null {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = parseEventId(rawId);
  if (id === null) return NextResponse.json({ error: "Identifiant d’événement invalide." }, { status: 400 });

  try {
    const body: unknown = await req.json();
    if (!isRecord(body)) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
    }

    const result = await updateTimelineEvent(id, body);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result.value);
  } catch (error: unknown) {
    console.error("PATCH /api/timeline-events/[id] error:", error);
    return NextResponse.json({ error: "Impossible de modifier cet événement." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = parseEventId(rawId);
  if (id === null) return NextResponse.json({ error: "Identifiant d’événement invalide." }, { status: 400 });

  try {
    const result = await deleteTimelineEvent(id);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result.value);
  } catch (error: unknown) {
    console.error("DELETE /api/timeline-events/[id] error:", error);
    return NextResponse.json({ error: "Impossible de supprimer cet événement." }, { status: 500 });
  }
}

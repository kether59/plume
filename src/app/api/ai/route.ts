import { NextResponse } from "next/server";
import { generateNovelContent } from "@/features/ai/generate-novel-content";
import type { AiRequestOptions } from "@/lib/ai-service";
import { AI_TASKS, CHARACTER_SUGGESTION_FIELDS, type AiTask } from "@/features/ai/types";

export const maxDuration = 300;

const aiTasks = new Set<string>(AI_TASKS);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAiTask(value: unknown): value is AiTask {
  return typeof value === "string" && aiTasks.has(value);
}

function parseUserConfig(value: unknown): Partial<AiRequestOptions> | undefined {
  if (!isRecord(value)) return undefined;
  return {
    provider: typeof value.provider === "string" ? value.provider : undefined,
    endpoint: typeof value.endpoint === "string" ? value.endpoint : undefined,
    model: typeof value.model === "string" ? value.model : undefined,
    apiKey: typeof value.apiKey === "string" ? value.apiKey : undefined,
    toneDirective: typeof value.toneDirective === "string" ? value.toneDirective : undefined,
    timeoutMs: typeof value.timeoutMs === "number" ? value.timeoutMs : undefined,
  };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête JSON invalide." }, { status: 400 });
  }

  if (!isRecord(body) || !isAiTask(body.task)) {
    return NextResponse.json({ error: "task is required" }, { status: 400 });
  }

  const projectId = body.projectId === undefined ? undefined : Number(body.projectId);
  const chapterId = body.chapterId === undefined ? undefined : Number(body.chapterId);
  if (
    (projectId !== undefined && (!Number.isInteger(projectId) || projectId <= 0)) ||
    (chapterId !== undefined && (!Number.isInteger(chapterId) || chapterId <= 0))
  ) {
    return NextResponse.json({ error: "Identifiant de projet ou de chapitre invalide." }, { status: 400 });
  }

  try {
    const requestedLocale = body.locale === "en" ? "en" : body.locale === "fr" ? "fr" : undefined;
    const extraParams = isRecord(body.extraParams) ? body.extraParams : {};
    if (body.task === "rewrite" && extraParams.mode !== undefined &&
      !["show_dont_tell", "tighten", "paraphrase", "help_express"].includes(String(extraParams.mode))) {
      return NextResponse.json({ error: "Sous-action de réécriture non prise en charge." }, { status: 400 });
    }
    if (body.task === "extract" && extraParams.types !== undefined &&
      (!Array.isArray(extraParams.types) || extraParams.types.length === 0 ||
        extraParams.types.some((type) => typeof type !== "string" ||
          !["characters", "places", "events", "generalInfo"].includes(type)))) {
      return NextResponse.json({ error: "Les catégories d’extraction sont invalides." }, { status: 400 });
    }
    if (body.task === "character_help" && extraParams.missingFields !== undefined &&
      (!Array.isArray(extraParams.missingFields) ||
        extraParams.missingFields.some((field) => typeof field !== "string" ||
          !(CHARACTER_SUGGESTION_FIELDS as readonly string[]).includes(field)))) {
      return NextResponse.json({ error: "Les champs demandés pour la fiche personnage sont invalides." }, { status: 400 });
    }
    const result = await generateNovelContent({
      task: body.task,
      text: typeof body.text === "string" ? body.text : undefined,
      projectId,
      chapterId,
      extraParams: { ...extraParams, ...(requestedLocale ? { locale: requestedLocale } : {}) },
      userConfig: parseUserConfig(body.userConfig),
    });
    return NextResponse.json({ result });
  } catch (error: unknown) {
    console.error("POST /api/ai error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Échec de la requête au fournisseur IA." },
      { status: 502 },
    );
  }
}

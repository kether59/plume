import { NextResponse } from "next/server";
import { getAiConfiguration, saveAiConfiguration } from "@/features/ai/config-service";

export async function GET() {
  try {
    return NextResponse.json(await getAiConfiguration());
  } catch (error: unknown) {
    console.error("GET /api/ai/config error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Impossible de charger la configuration IA." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json(await saveAiConfiguration(body));
  } catch (error: unknown) {
    console.error("POST /api/ai/config error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Impossible d’enregistrer la configuration IA." },
      { status: 500 },
    );
  }
}

import { callAiService, type AiRequestOptions } from "@/lib/ai-service";
import { loadNovelContext, loadStoredAiConfig } from "@/features/ai/repository";

export type AiTask =
  | "continue"
  | "unblock"
  | "rewrite"
  | "extract"
  | "coherence"
  | "character_help"
  | "structure_help";

export interface GenerateNovelContentInput {
  task: AiTask;
  text?: string;
  projectId?: number;
  chapterId?: number;
  extraParams?: Record<string, unknown>;
  userConfig?: Partial<AiRequestOptions>;
}

export async function generateNovelContent(input: GenerateNovelContentInput): Promise<string> {
  const { task, text = "", projectId, chapterId, extraParams, userConfig } = input;
  const [context, savedConfig] = await Promise.all([
    loadNovelContext(projectId, chapterId),
    loadStoredAiConfig(),
  ]);
  const config: AiRequestOptions = {
    provider: userConfig?.provider || savedConfig?.provider || "builtin",
    endpoint: userConfig?.endpoint || savedConfig?.endpoint || "http://localhost:11434",
    model: userConfig?.model || savedConfig?.model || "llama3",
    apiKey:
      userConfig?.apiKey ||
      savedConfig?.apiKey ||
      (savedConfig?.provider === "openai" ? process.env.OPENAI_API_KEY : "") ||
      "",
    toneDirective: userConfig?.toneDirective || savedConfig?.toneDirective || undefined,
  };

  return callAiService({ task, text, context, extraParams, config });
}

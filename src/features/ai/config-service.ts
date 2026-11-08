import { eq } from "drizzle-orm";
import { db } from "@/db";
import { aiConfig } from "@/db/schema";

const defaultTone = "Bienveillant, encourageant, stimulant pour un auteur débutant";
const maskedKey = "••••••••";

function presentConfig(config: typeof aiConfig.$inferSelect | undefined) {
  const hasOpenAiEnvKey = Boolean(process.env.OPENAI_API_KEY);
  if (!config) {
    return {
      provider: "builtin",
      endpoint: "http://localhost:11434",
      model: "llama3",
      hasApiKey: false,
      hasOpenAiEnvKey,
      toneDirective: defaultTone,
    };
  }

  return {
    ...config,
    apiKey: config.apiKey ? maskedKey : "",
    hasApiKey: Boolean(config.apiKey) || (config.provider === "openai" && hasOpenAiEnvKey),
    hasOpenAiEnvKey,
  };
}

export async function getAiConfiguration() {
  const [config] = await db.select().from(aiConfig).limit(1);
  return presentConfig(config);
}

export interface SaveAiConfigurationInput {
  provider?: string;
  endpoint?: string;
  model?: string;
  apiKey?: string;
  temperature?: number;
  toneDirective?: string;
}

export async function saveAiConfiguration(input: SaveAiConfigurationInput) {
  const [existing] = await db.select().from(aiConfig).limit(1);
  if (existing) {
    const updateData = {
      provider: input.provider,
      endpoint: input.endpoint,
      model: input.model,
      temperature: input.temperature,
      toneDirective: input.toneDirective,
      updatedAt: new Date(),
      ...(typeof input.apiKey === "string" && !input.apiKey.includes(maskedKey)
        ? { apiKey: input.apiKey }
        : {}),
    };
    const [updated] = await db.update(aiConfig).set(updateData)
      .where(eq(aiConfig.id, existing.id)).returning();
    return presentConfig(updated);
  }

  const [created] = await db.insert(aiConfig).values({
    provider: input.provider || "builtin",
    endpoint: input.endpoint || "http://localhost:11434",
    model: input.model || "llama3",
    apiKey: input.apiKey || "",
    temperature: input.temperature || 70,
    toneDirective: input.toneDirective || defaultTone,
  }).returning();
  return presentConfig(created);
}

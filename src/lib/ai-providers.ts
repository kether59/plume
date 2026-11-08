export const cloudProviders = {
  openai: {
    label: "OpenAI / ChatGPT",
    endpoint: "https://api.openai.com/v1",
    models: ["gpt-4o-mini", "gpt-4o", "o3-mini"],
    keyHint: "sk-…",
  },
  gemini: {
    label: "Google Gemini",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/openai",
    models: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"],
    keyHint: "Clé API Google AI Studio",
  },
  grok: {
    label: "xAI Grok",
    endpoint: "https://api.x.ai/v1",
    models: ["grok-3-mini", "grok-3", "grok-2-latest"],
    keyHint: "Clé API xAI",
  },
  claude: {
    label: "Anthropic Claude",
    endpoint: "https://api.anthropic.com/v1",
    models: ["claude-sonnet-4-20250514", "claude-3-7-sonnet-latest", "claude-3-5-haiku-latest"],
    keyHint: "Clé API Anthropic",
  },
  openrouter: {
    label: "OpenRouter",
    endpoint: "https://openrouter.ai/api/v1",
    models: ["openrouter/auto", "anthropic/claude-sonnet-4", "openai/gpt-4o-mini", "google/gemini-2.5-flash"],
    keyHint: "Clé API OpenRouter",
  },
} as const;

export type CloudProvider = keyof typeof cloudProviders;

export function isCloudProvider(provider: string): provider is CloudProvider {
  return Object.hasOwn(cloudProviders, provider);
}

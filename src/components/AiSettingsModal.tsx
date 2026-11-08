"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Cpu, Key, Server, Sparkles, X } from "lucide-react";
import { cloudProviders, isCloudProvider } from "@/lib/ai-providers";

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const providers = [
  { id: "builtin", label: "Moteur intégré", description: "Aide locale sans clé ni modèle distant" },
  { id: "ollama", label: "Ollama", description: "Modèle installé sur votre machine" },
  { id: "lmstudio", label: "LM Studio", description: "Serveur local compatible OpenAI" },
  { id: "custom", label: "API personnalisée", description: "Serveur compatible OpenAI (URL configurable)" },
  ...Object.entries(cloudProviders).map(([id, provider]) => ({
    id,
    label: provider.label,
    description: "API cloud — une clé du fournisseur est requise",
  })),
];

const defaultModels: Record<string, string> = {
  builtin: "",
  ollama: "llama3",
  lmstudio: "local-model",
  custom: "model",
  openai: "gpt-4o-mini",
  gemini: "gemini-2.5-flash",
  grok: "grok-3-mini",
  claude: "claude-sonnet-4-20250514",
  openrouter: "openrouter/auto",
};

export function AiSettingsModal({ isOpen, onClose }: AiSettingsModalProps) {
  const [provider, setProvider] = useState("builtin");
  const [endpoint, setEndpoint] = useState("http://localhost:11434");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [hasOpenAiEnvKey, setHasOpenAiEnvKey] = useState(false);
  const [loadedProvider, setLoadedProvider] = useState("builtin");
  const [toneDirective, setToneDirective] = useState("Bienveillant, encourageant pour un auteur débutant");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    fetch("/api/ai/config")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Impossible de charger les réglages IA.");
        if (cancelled) return;
        setProvider(data.provider || "builtin");
        setLoadedProvider(data.provider || "builtin");
        setEndpoint(data.endpoint || "http://localhost:11434");
        setModel(data.model || defaultModels[data.provider] || "");
        setHasApiKey(Boolean(data.hasApiKey));
        setHasOpenAiEnvKey(Boolean(data.hasOpenAiEnvKey));
        setToneDirective(data.toneDirective || "Bienveillant, encourageant pour un auteur débutant");
        setError("");
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Erreur de chargement des réglages.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleProviderChange = (nextProvider: string) => {
    setProvider(nextProvider);
    setModel(defaultModels[nextProvider] || "");
    if (nextProvider === "ollama") setEndpoint("http://localhost:11434");
    if (nextProvider === "lmstudio") setEndpoint("http://localhost:1234/v1");
    if (nextProvider === "custom") setEndpoint("");
    if (isCloudProvider(nextProvider)) setHasApiKey(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/ai/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          endpoint,
          model,
          apiKey: apiKey || (provider !== loadedProvider ? "" : undefined),
          toneDirective,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible d’enregistrer les réglages.");
      setHasApiKey(Boolean(data.hasApiKey));
      setLoadedProvider(provider);
      setApiKey("");
      setSavedSuccess(true);
      window.setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 900);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Erreur d’enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;
  const selectedCloud = isCloudProvider(provider) ? cloudProviders[provider] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative my-8 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/20 p-2 text-purple-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Configuration des moteurs IA</h3>
              <p className="text-xs text-slate-400">Moteur intégré, modèles locaux ou API cloud</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5 text-sm">
          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Fournisseur d&apos;IA
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {providers.map((item) => {
                const selected = provider === item.id;
                const cloud = isCloudProvider(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleProviderChange(item.id)}
                    aria-pressed={selected}
                    className={`flex flex-col gap-1 rounded-xl border p-3 text-left transition ${
                      selected
                        ? "border-indigo-500 bg-indigo-950/40 text-white"
                        : "border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      {cloud ? <Key className="h-3.5 w-3.5 text-purple-400" /> :
                        item.id === "builtin" ? <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> :
                          <Server className="h-3.5 w-3.5 text-emerald-400" />}
                      {item.label}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.description}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {(provider === "ollama" || provider === "lmstudio" || provider === "custom") && (
            <section className="space-y-3 rounded-xl border border-slate-700 bg-slate-800/40 p-3">
              <div>
                <label htmlFor="ai-endpoint" className="mb-1 block text-xs font-medium text-slate-300">URL de l&apos;instance locale</label>
                <input
                  id="ai-endpoint"
                  value={endpoint}
                  onChange={(event) => setEndpoint(event.target.value)}
                  placeholder={
                    provider === "ollama" ? "http://localhost:11434" :
                      provider === "lmstudio" ? "http://localhost:1234/v1" : "https://api.example.com/v1"
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="ai-model" className="mb-1 block text-xs font-medium text-slate-300">
                  {provider === "custom" ? "Identifiant du modèle" : "Nom du modèle local"}
                </label>
                <input
                  id="ai-model"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  placeholder="ex. llama3, mistral, qwen"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </section>
          )}

          {provider === "custom" && (
            <section className="space-y-3 rounded-xl border border-slate-700 bg-slate-800/40 p-3">
              <div>
                <label htmlFor="custom-api-key" className="mb-1 block text-xs font-medium text-slate-300">Clé API (si requise)</label>
                <input
                  id="custom-api-key"
                  type="password"
                  autoComplete="new-password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder={hasApiKey ? "Clé enregistrée — laissez vide pour la conserver" : "Clé API"}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </section>
          )}

          {selectedCloud && (
            <section className="space-y-3 rounded-xl border border-purple-900/50 bg-slate-800/40 p-3">
              <div>
                <label htmlFor="cloud-api-key" className="mb-1 block text-xs font-medium text-slate-300">
                  Clé API — {selectedCloud.label}
                </label>
                <input
                  id="cloud-api-key"
                  type="password"
                  autoComplete="new-password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder={
                    hasApiKey ? "Clé enregistrée — laissez vide pour la conserver" :
                      provider === "openai" && hasOpenAiEnvKey ? "Clé OPENAI_API_KEY définie dans l’environnement" :
                        selectedCloud.keyHint
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  La clé est stockée dans les réglages locaux de l’application. Elle est transmise uniquement au fournisseur sélectionné.
                </p>
              </div>
              <div>
                <label htmlFor="cloud-model" className="mb-1 block text-xs font-medium text-slate-300">Modèle</label>
                <select
                  aria-label="Choisir un modèle suggéré"
                  value={selectedCloud.models.some((availableModel) => availableModel === model) ? model : ""}
                  onChange={(event) => {
                    if (event.target.value) setModel(event.target.value);
                  }}
                  className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Sélectionner un modèle suggéré…</option>
                  {selectedCloud.models.map((availableModel) => (
                    <option key={availableModel} value={availableModel}>{availableModel}</option>
                  ))}
                </select>
                <input
                  id="cloud-model"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  placeholder="Choisissez ou saisissez l’identifiant du modèle"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
                {provider === "openrouter" && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    `openrouter/auto` délègue le choix du modèle à OpenRouter. Vous pouvez aussi sélectionner un modèle précis ou saisir son identifiant OpenRouter.
                  </p>
                )}
                {provider !== "openrouter" && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    La liste donne des exemples ; vous pouvez saisir tout identifiant de modèle disponible sur votre compte.
                  </p>
                )}
              </div>
            </section>
          )}

          <div>
            <label htmlFor="ai-tone" className="mb-1 block text-xs font-medium text-slate-300">Directive d&apos;attitude du Mentor IA</label>
            <input
              id="ai-tone"
              value={toneDirective}
              onChange={(event) => setToneDirective(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          {error && <p role="alert" className="rounded-lg border border-rose-400/30 bg-rose-950/40 p-3 text-xs text-rose-200">{error}</p>}
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 p-4">
          <span className="text-[11px] text-slate-500">Les appels cloud envoient le texte au fournisseur sélectionné.</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {savedSuccess ? <><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Enregistré</> :
              saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

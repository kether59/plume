"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { 
  Sparkles, 
  Flame, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Wand2, 
  Lightbulb, 
  ShieldAlert, 
  FileText, 
  ChevronDown, 
  Maximize2, 
  Minimize2, 
  Award, 
  ArrowRight,
  BookOpen,
  Eye,
  AlertCircle,
  Plus,
  LoaderCircle,
} from "lucide-react";
import { ChapterExtractionPanel } from "@/components/ChapterExtractionPanel";
import { parseStoryExtraction, type ExtractionType, type StoryExtractionResult } from "@/lib/story-extraction";
import { useAppLocale } from "@/components/AppLocaleProvider";

interface RewriteSuggestion {
  start: number;
  end: number;
  original: string;
  replacement: string;
  explanation: string;
}

interface RewriteTarget {
  start: number;
  end: number;
  original: string;
}

interface WritingIntentSuggestion {
  intention: string;
  proposals: string[];
}

interface DraftingStudioTabProps {
  projectId: number;
  project: any;
  chapters: any[];
  characters: any[];
  worldNotes: any[];
  activeChapterId?: number;
  onRefresh: () => void | Promise<void>;
  onRecordSession: (words: number, durationMinutes: number) => void;
}

export function DraftingStudioTab({
  projectId,
  project,
  chapters,
  characters,
  worldNotes,
  activeChapterId,
  onRefresh,
  onRecordSession,
}: DraftingStudioTabProps) {
  const { locale } = useAppLocale();
  // Current active chapter
  const [selectedChapterId, setSelectedChapterId] = useState<number>(
    activeChapterId || chapters[0]?.id || 0
  );

  const currentChapter = chapters.find((c) => c.id === selectedChapterId) || chapters[0];

  const [content, setContent] = useState<string>(currentChapter?.content || "");
  const [chapterTitle, setChapterTitle] = useState<string>(currentChapter?.title || "");
  const [synopsis, setSynopsis] = useState<string>(currentChapter?.synopsis || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Anti-autocensure & Sprint Modes
  const [antiSelfCensorship, setAntiSelfCensorship] = useState(false);
  const [isSprintActive, setIsSprintActive] = useState(false);
  const [sprintMinutes, setSprintMinutes] = useState(25);
  const [sprintSecondsRemaining, setSprintSecondsRemaining] = useState(25 * 60);
  const [sprintStartingWordCount, setSprintStartingWordCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // AI State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [unblockCards, setUnblockCards] = useState<any[]>([]);
  const [rewriteSuggestion, setRewriteSuggestion] = useState<string | null>(null);
  const [rewriteTarget, setRewriteTarget] = useState<RewriteTarget | null>(null);
  const [tightenSuggestions, setTightenSuggestions] = useState<RewriteSuggestion[]>([]);
  const [writingIntentSuggestion, setWritingIntentSuggestion] = useState<WritingIntentSuggestion | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [extractionResult, setExtractionResult] = useState<StoryExtractionResult | null>(null);
  const [extractionError, setExtractionError] = useState("");
  const [extractionTypes, setExtractionTypes] = useState<ExtractionType[]>([
    "characters",
    "places",
    "events",
    "generalInfo",
  ]);
  const [aiError, setAiError] = useState("");
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);

  // Encouraging mantras for novice writers
  const MANTRAS = [
    "« Le premier jet a pour unique mission d'exister. Vous le peaufinerez plus tard. »",
    "« La perfection immédiate est l'ennemie jurée du mot FIN. Avancez ! »",
    "« Chaque mot brut posé sur la page est infiniment supérieur à une page blanche parfaite. »",
    "« Les grands auteurs ont tous écrit d'atroces brouillons avant d'en faire des chefs-d'œuvre. »",
    "« Votre histoire mérite d'être racontée jusqu'au bout. Continuez d'avancer. »",
  ];
  const [currentMantraIndex, setCurrentMantraIndex] = useState(0);

  // Update content when chapter changes
  useEffect(() => {
    if (currentChapter) {
      setContent(currentChapter.content || "");
      setChapterTitle(currentChapter.title || "");
      setSynopsis(currentChapter.synopsis || "");
    }
  }, [currentChapter?.id]);

  useEffect(() => {
    if (activeChapterId && chapters.some((chapter) => chapter.id === activeChapterId)) {
      setSelectedChapterId(activeChapterId);
    }
  }, [activeChapterId, chapters]);

  // Pomodoro Sprint Timer
  useEffect(() => {
    let timer: any;
    if (isSprintActive && sprintSecondsRemaining > 0) {
      timer = setInterval(() => {
        setSprintSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isSprintActive && sprintSecondsRemaining === 0) {
      finishSprint();
    }
    return () => clearInterval(timer);
  }, [isSprintActive, sprintSecondsRemaining]);

  const currentWordCount = content.trim().length > 0 ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const wordsWrittenInSprint = Math.max(0, currentWordCount - sprintStartingWordCount);

  const requestAi = async (task: string, text: string, extraParams?: Record<string, unknown>) => {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, projectId, chapterId: currentChapter?.id, text, extraParams, locale }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `L’action IA a échoué (${res.status}).`);
    if (typeof data.result !== "string") throw new Error("Le fournisseur IA n’a pas renvoyé de résultat exploitable.");
    return data.result;
  };

  const handleCreateChapter = async () => {
    if (!project?.id || isCreatingChapter) return;
    setIsCreatingChapter(true);
    setSaveError("");
    try {
      const saved = await handleSaveContent();
      if (!saved) throw new Error("Le chapitre en cours n’a pas pu être sauvegardé. Le nouveau chapitre n’a pas été créé.");
      const res = await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: `Chapitre ${chapters.length + 1}`,
          status: "draft",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impossible de créer le chapitre.");
      await onRefresh();
      setSelectedChapterId(data.id);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Impossible de créer le chapitre.");
    } finally {
      setIsCreatingChapter(false);
    }
  };

  const handleSaveContent = async () => {
    if (!currentChapter) return false;
    setSaveError("");
    setIsSaving(true);

    try {
      const res = await fetch(`/api/chapters/${currentChapter.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: chapterTitle.trim() || currentChapter.title,
          content,
          wordCount: currentWordCount,
          status: currentWordCount > 0 && currentChapter.status === "outline" ? "drafting" : currentChapter.status,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Impossible d’enregistrer le chapitre.");
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1800);
      return true;
    } catch (e) {
      console.error(e);
      setSaveError(e instanceof Error ? e.message : "Impossible d’enregistrer le chapitre.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!currentChapter) return;
    const timeout = setTimeout(() => {
      void handleSaveContent();
    }, 1000);
    return () => clearTimeout(timeout);
  }, [content, chapterTitle, currentChapter?.id]);

  const startSprint = (minutes: number) => {
    setSprintMinutes(minutes);
    setSprintSecondsRemaining(minutes * 60);
    setSprintStartingWordCount(currentWordCount);
    setIsSprintActive(true);
  };

  const finishSprint = () => {
    setIsSprintActive(false);
    confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    const duration = Math.max(1, Math.round((sprintMinutes * 60 - sprintSecondsRemaining) / 60));
    onRecordSession(wordsWrittenInSprint, duration);
  };

  // Keyboard anti-autocensure blocker
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (antiSelfCensorship && (e.key === "Backspace" || e.key === "Delete")) {
      // Soft nudge: show banner & discourage deleting during raw first draft
      setCurrentMantraIndex((prev) => (prev + 1) % MANTRAS.length);
    }
  };

  // AI ACTIONS
  const handleAiContinue = async () => {
    setIsAiLoading(true);
    setAiError("");
    try {
      const result = await requestAi("continue", content);
      setContent((prev) => (prev ? `${prev}\n\n${result}` : result));
    } catch (e) {
      console.error(e);
      setAiError(e instanceof Error ? e.message : "Impossible de continuer la scène.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiUnblock = async () => {
    setIsAiLoading(true);
    setAiError("");
    setUnblockCards([]);
    try {
      const result = await requestAi("unblock", content);
      try {
        const parsed = JSON.parse(result);
        if (Array.isArray(parsed)) setUnblockCards(parsed);
        else setUnblockCards([{ title: "Piste narrative", description: result, starter: "" }]);
      } catch {
        setUnblockCards([{ title: "Piste narrative", description: result, starter: "" }]);
        }
    } catch (e) {
      console.error(e);
      setAiError(e instanceof Error ? e.message : "Impossible de proposer des pistes.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiRewrite = async (mode: "show_dont_tell" | "tighten" | "paraphrase" | "help_express") => {
    setIsAiLoading(true);
    setAiError("");
    setRewriteSuggestion(null);
    setTightenSuggestions([]);
    setWritingIntentSuggestion(null);
    try {
      const editor = editorRef.current;
      const selectionStart = editor?.selectionStart ?? 0;
      const selectionEnd = editor?.selectionEnd ?? 0;
      const hasSelection = selectionEnd > selectionStart;
      if ((mode === "paraphrase" || mode === "help_express") && !hasSelection) {
        setAiError(locale === "en"
          ? "Select a phrase or passage in the editor first."
          : "Sélectionnez d’abord une phrase ou un passage dans le texte.");
        return;
      }
      const target = hasSelection
        ? { start: selectionStart, end: selectionEnd, original: content.slice(selectionStart, selectionEnd) }
        : { start: 0, end: content.length, original: content };
      if (!target.original.trim()) {
        setAiError(locale === "en" ? "Write some text or select a passage first." : "Écrivez ou sélectionnez d’abord un passage.");
        return;
      }

      const result = await requestAi("rewrite", target.original, {
        mode,
        contextBefore: content.slice(Math.max(0, target.start - 500), target.start),
        contextAfter: content.slice(target.end, Math.min(content.length, target.end + 500)),
      });
      if (mode === "tighten") {
        let parsed: unknown;
        try {
          parsed = JSON.parse(result.replace(/^```(?:json)?\s*|\s*```$/gi, "").trim());
        } catch {
          throw new Error(locale === "en" ? "The AI response could not be read as a list of suggestions." : "La réponse IA ne contient pas une liste de suggestions lisible.");
        }
        if (!Array.isArray(parsed)) throw new Error(locale === "en" ? "The AI did not return a valid suggestions list." : "L’IA n’a pas renvoyé une liste de suggestions valide.");
        const suggestions: RewriteSuggestion[] = [];
        for (const item of parsed) {
          if (!item || typeof item.original !== "string" || typeof item.replacement !== "string") continue;
          const localStart = target.original.indexOf(item.original);
          if (!item.original || localStart < 0 || target.original.indexOf(item.original, localStart + 1) >= 0) continue;
          suggestions.push({
            start: target.start + localStart,
            end: target.start + localStart + item.original.length,
            original: item.original,
            replacement: item.replacement,
            explanation: typeof item.explanation === "string" ? item.explanation : "",
          });
        }
        setTightenSuggestions(suggestions);
        if (suggestions.length === 0) {
          setAiError(locale === "en" ? "No safe, applicable edits were found in this passage." : "Aucune correction sûre et applicable n’a été trouvée dans ce passage.");
        }
      } else if (mode === "help_express") {
        const parsed = JSON.parse(result) as WritingIntentSuggestion;
        setRewriteTarget(target);
        setWritingIntentSuggestion(parsed);
      } else {
        setRewriteTarget(target);
        setRewriteSuggestion(result.trim());
      }
    } catch (e) {
      console.error(e);
      setAiError(e instanceof Error ? e.message : locale === "en" ? "Could not suggest a rewrite." : "Impossible de proposer une réécriture.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyRewrite = () => {
    if (!rewriteTarget || rewriteSuggestion === null) return;
    if (content.slice(rewriteTarget.start, rewriteTarget.end) !== rewriteTarget.original) {
      setAiError(locale === "en" ? "The text changed since this suggestion was generated. Generate it again to avoid replacing the wrong passage." : "Le texte a changé depuis cette suggestion. Relancez-la pour éviter de remplacer le mauvais passage.");
      setRewriteSuggestion(null);
      return;
    }
    setContent((current) =>
      `${current.slice(0, rewriteTarget.start)}${rewriteSuggestion}${current.slice(rewriteTarget.end)}`
    );
    setRewriteSuggestion(null);
    setRewriteTarget(null);
  };

  const applyTightenSuggestion = (suggestion: RewriteSuggestion) => {
    if (content.slice(suggestion.start, suggestion.end) !== suggestion.original) {
      setAiError(locale === "en" ? "This passage changed. Discard the stale suggestion and run the tool again." : "Ce passage a changé. Ignorez cette suggestion périmée et relancez l’outil.");
      setTightenSuggestions((current) => current.filter((item) => item !== suggestion));
      return;
    }
    const delta = suggestion.replacement.length - (suggestion.end - suggestion.start);
    setContent((current) =>
      `${current.slice(0, suggestion.start)}${suggestion.replacement}${current.slice(suggestion.end)}`
    );
    setTightenSuggestions((current) => current
      .filter((item) =>
        item !== suggestion && (item.end <= suggestion.start || item.start >= suggestion.end)
      )
      .map((item) => item.start >= suggestion.end
        ? { ...item, start: item.start + delta, end: item.end + delta }
        : item));
  };

  const handleAiExtract = async () => {
    if (extractionTypes.length === 0) {
      setExtractionError("Sélectionnez au moins une catégorie à extraire.");
      return;
    }
    setIsAiLoading(true);
    setExtractionResult(null);
    setExtractionError("");
    setAiError("");
    try {
      const result = await requestAi("extract", content, { types: extractionTypes });
      setExtractionResult(parseStoryExtraction(result, extractionTypes));
    } catch (e) {
      console.error(e);
      setExtractionError(e instanceof Error ? e.message : "L’analyse du chapitre a échoué.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentChapter) {
    return (
      <div className="text-center py-16 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
        <p className="text-sm">Veuillez d&apos;abord créer un chapitre dans l&apos;Étape 2 (Structure & Plan) pour commencer à rédiger.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isFullscreen ? "fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto" : ""}`}>
      {/* Studio Control Header */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Chapter Switcher & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Chapitre :</span>
            <select
              value={currentChapter.id}
              onChange={(e) => {
                void handleSaveContent();
                setSelectedChapterId(Number(e.target.value));
              }}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none focus:border-amber-500"
            >
              {chapters.map((c, i) => (
                <option key={c.id} value={c.id}>
                  #{i + 1} — {c.id === currentChapter.id ? chapterTitle || c.title : c.title} ({c.wordCount || 0} mots)
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleCreateChapter}
              disabled={isCreatingChapter}
              className="flex items-center gap-1 rounded-xl bg-sky-700 px-3 py-1.5 font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
              title="Créer un chapitre sans passer par le plan"
            >
              <Plus className="h-3.5 w-3.5" />
              {isCreatingChapter ? "Création…" : "Nouveau chapitre"}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            {currentChapter.povCharacter && (
              <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                POV : <strong className="text-slate-200">{currentChapter.povCharacter}</strong>
              </span>
            )}
            {currentChapter.location && (
              <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                Lieu : <strong className="text-slate-200">{currentChapter.location}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Word Counts & Sprints */}
        <div className="flex items-center gap-2.5">
          {/* Live Word Count */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-slate-200">
            <span className="text-amber-400 font-bold">{currentWordCount.toLocaleString()}</span> mots
            {isSprintActive && (
              <span className="text-emerald-400 ml-1.5 font-sans text-[11px]">
                (+{wordsWrittenInSprint} dans le sprint)
              </span>
            )}
          </div>

          {/* Pomodoro Sprint Controls */}
          {isSprintActive ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span className="font-mono font-bold text-sm">{formatTimer(sprintSecondsRemaining)}</span>
              <button
                onClick={finishSprint}
                className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium text-[11px] ml-1"
              >
                Terminer le sprint
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => startSprint(15)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 text-[11px]"
                title="Lancer un sprint de 15 minutes"
              >
                <Clock className="w-3 h-3 text-amber-400" /> Sprint 15m
              </button>
              <button
                onClick={() => startSprint(25)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 text-[11px]"
                title="Lancer un sprint de 25 minutes"
              >
                <Clock className="w-3 h-3 text-amber-400" /> Sprint 25m
              </button>
            </div>
          )}

          {/* Anti-autocensure Mode Toggle */}
          <button
            onClick={() => setAntiSelfCensorship(!antiSelfCensorship)}
            className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
              antiSelfCensorship
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm shadow-rose-900/30"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Désactive la tentation d'effacer pour forcer l'écriture continue"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{antiSelfCensorship ? "Mode Anti-Autocensure ACTIF" : "Mode Anti-Autocensure"}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            title={isFullscreen ? "Quitter le plein écran" : "Mode plein écran"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Anti-autocensure Mantra Banner */}
      {antiSelfCensorship && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-rose-950/60 to-slate-900 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-rose-500/20 text-rose-300">
              <Flame className="w-3.5 h-3.5" />
            </span>
            <span className="italic font-medium">{MANTRAS[currentMantraIndex]}</span>
          </div>
          <span className="text-[10px] text-rose-400 uppercase tracking-wider font-bold">Avancez sans raturer</span>
        </div>
      )}

      {/* Main Drafting Canvas & AI Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* The Writing Area */}
        <div className="lg:col-span-3 space-y-3">
          <div className={`relative rounded-2xl bg-slate-900/90 border ${
            antiSelfCensorship ? "border-rose-500/40 flow-active" : "border-slate-800"
          } p-5 sm:p-7 shadow-xl`}>
            {/* Chapter title inline header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-500/80">
                  {currentChapter.act}
                </span>
                <label className="sr-only" htmlFor="draft-chapter-title">Titre du chapitre</label>
                <input
                  id="draft-chapter-title"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  aria-label="Titre du chapitre"
                  className="mt-0.5 w-full border-0 bg-transparent p-0 font-serif text-xl font-bold text-slate-100 focus:outline-none focus:ring-0"
                  placeholder="Titre du chapitre"
                />
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <div className="text-slate-500">
                  {isSaving ? (
                    <span className="animate-pulse">Sauvegarde…</span>
                  ) : saveSuccess ? (
                    <span className="flex items-center gap-1 font-medium text-emerald-700">
                      <Check className="h-3.5 w-3.5" /> Enregistré
                    </span>
                  ) : (
                    <span>Auto-sauvegarde active</span>
                  )}
                  {saveError && <p role="alert" className="text-rose-700">{saveError}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => void handleSaveContent()}
                  disabled={isSaving}
                  className="rounded-lg bg-amber-700 px-3 py-1.5 font-semibold text-white hover:bg-amber-800 disabled:opacity-50"
                >
                  Enregistrer
                </button>
              </div>
            </div>

            {/* Synopsis Reminder Pill */}
            {currentChapter.synopsis && (
              <div className="mb-4 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-400 italic flex items-start gap-2">
                <BookOpen className="w-3.5 h-3.5 text-sky-400 mt-0.5 shrink-0" />
                <span>Rappel de l&apos;objectif de la scène : {currentChapter.synopsis}</span>
              </div>
            )}

            {/* The Textarea */}
            <textarea
              ref={editorRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={() => void handleSaveContent()}
              onKeyDown={handleKeyDown}
              rows={isFullscreen ? 28 : 20}
              placeholder="Écrivez librement... Ne vous souciez ni des répétitions, ni de la grammaire. Votre seul devoir ici est de faire vivre l'histoire."
              className="w-full bg-transparent text-slate-100 font-novel text-base leading-relaxed focus:outline-none resize-y placeholder:text-slate-600 placeholder:italic"
            />
          </div>

          {/* Unblock Suggestions Popout */}
          {unblockCards.length > 0 && (
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-purple-400" />
                  3 Pistes Narratives pour débloquer votre scène :
                </span>
                <button
                  onClick={() => setUnblockCards([])}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Fermer
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {unblockCards.map((card, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-900/90 border border-purple-800/40 text-xs flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 block uppercase">
                        {card.type || `Piste ${i + 1}`}
                      </span>
                      <h4 className="font-semibold text-white mt-0.5">{card.title}</h4>
                      <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">
                        {card.description}
                      </p>
                    </div>

                    {card.starter && (
                      <button
                        onClick={() => {
                          setContent((prev) => `${prev}\n\n${card.starter} `);
                          setUnblockCards([]);
                        }}
                        className="mt-2 w-full py-1.5 px-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-medium transition flex items-center justify-center gap-1"
                      >
                        Insérer cette amorce <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guided Rewrite Comparison Modal / Popout */}
          {rewriteSuggestion && (
            <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/40 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-300 flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-sky-400" />
                  {locale === "en" ? "Rewrite proposal — review before applying:" : "Suggestion de réécriture — relisez avant application :"}
                </span>
                <button onClick={() => { setRewriteSuggestion(null); setRewriteTarget(null); }} className="text-slate-400 hover:text-white">
                  {locale === "en" ? "Dismiss" : "Ignorer"}
                </button>
              </div>
              <p className="text-slate-400">
                {locale === "en" ? "Scope: " : "Portée : "}
                {rewriteTarget?.start === 0 && rewriteTarget.end === rewriteTarget.original.length
                  ? (locale === "en" ? "entire chapter" : "chapitre entier")
                  : (locale === "en" ? "selected passage" : "texte sélectionné")}
              </p>
              <div className="p-3 bg-slate-900/90 rounded-xl border border-sky-800/40 text-slate-200 font-novel leading-relaxed">
                {rewriteSuggestion}
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={applyRewrite}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-[11px]"
                >
                  {locale === "en" ? "Replace the original passage" : "Remplacer le texte d’origine"}
                </button>
              </div>
            </div>
          )}

          {writingIntentSuggestion && rewriteTarget && (
            <section aria-live="polite" className="space-y-3 rounded-2xl border border-indigo-500/40 bg-indigo-950/30 p-4 text-xs">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-indigo-200">
                  {locale === "en" ? "Possible meaning and ways to express it" : "Sens possible et pistes de formulation"}
                </h3>
                <button
                  type="button"
                  onClick={() => { setWritingIntentSuggestion(null); setRewriteTarget(null); }}
                  className="text-slate-400 hover:text-white"
                >
                  {locale === "en" ? "Dismiss" : "Ignorer"}
                </button>
              </div>
              <p className="rounded-lg border border-slate-700 bg-slate-900 p-3 text-slate-200">
                <strong className="text-indigo-300">{locale === "en" ? "You may be trying to say: " : "Vous cherchez peut-être à dire : "}</strong>
                {writingIntentSuggestion.intention}
              </p>
              {writingIntentSuggestion.proposals.map((proposal, index) => (
                <article key={`${index}-${proposal}`} className="rounded-lg border border-slate-700 bg-slate-900 p-3">
                  <p className="whitespace-pre-wrap text-slate-100">{proposal}</p>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (content.slice(rewriteTarget.start, rewriteTarget.end) !== rewriteTarget.original) {
                          setAiError(locale === "en"
                            ? "The selected text changed. Select it again and request new suggestions."
                            : "Le texte sélectionné a changé. Sélectionnez-le à nouveau pour demander de nouvelles propositions.");
                          setWritingIntentSuggestion(null);
                          return;
                        }
                        setContent((current) =>
                          `${current.slice(0, rewriteTarget.start)}${proposal}${current.slice(rewriteTarget.end)}`
                        );
                        setWritingIntentSuggestion(null);
                        setRewriteTarget(null);
                      }}
                      className="rounded-lg bg-indigo-700 px-2.5 py-1.5 font-medium text-white hover:bg-indigo-600"
                    >
                      {locale === "en" ? "Replace selected text" : "Remplacer le texte sélectionné"}
                    </button>
                  </div>
                </article>
              ))}
              {writingIntentSuggestion.proposals.length === 0 && (
                <p className="text-slate-400">
                  {locale === "en"
                    ? "The built-in engine can help identify the limitation, but needs a configured AI model to suggest wording."
                    : "Le moteur intégré peut signaler sa limite, mais il faut configurer un modèle IA pour obtenir des propositions de formulation."}
                </p>
              )}
            </section>
          )}

          {tightenSuggestions.length > 0 && (
            <section aria-live="polite" className="space-y-2 rounded-2xl border border-amber-500/40 bg-amber-950/30 p-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-xs font-bold text-amber-200">
                  <Wand2 className="h-4 w-4 text-amber-400" />
                  {locale === "en" ? "Editing suggestions — your text is unchanged" : "Propositions d’élagage — votre texte reste inchangé"}
                </h3>
                <button type="button" onClick={() => setTightenSuggestions([])} className="text-xs text-slate-400 hover:text-white">
                  {locale === "en" ? "Dismiss all" : "Tout ignorer"}
                </button>
              </div>
              {tightenSuggestions.map((suggestion, index) => (
                <article key={`${suggestion.start}-${suggestion.original}-${index}`} className="rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-xs">
                  <p className="text-slate-400">{locale === "en" ? "Original passage" : "Passage repéré"}</p>
                  <p className="mt-1 text-slate-200"><mark className="rounded bg-amber-400/25 px-0.5 text-amber-100">{suggestion.original}</mark></p>
                  <p className="mt-2 text-slate-400">{locale === "en" ? "Suggested change" : "Proposition"}</p>
                  <p className="mt-1 whitespace-pre-wrap text-emerald-200">{suggestion.replacement || (locale === "en" ? "(remove)" : "(supprimer)")}</p>
                  {suggestion.explanation && <p className="mt-2 text-slate-400">{suggestion.explanation}</p>}
                  <div className="mt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => setTightenSuggestions((current) => current.filter((item) => item !== suggestion))} className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-slate-300 hover:bg-slate-800">
                      {locale === "en" ? "Ignore" : "Ignorer"}
                    </button>
                    <button type="button" onClick={() => applyTightenSuggestion(suggestion)} className="rounded-lg bg-emerald-700 px-2.5 py-1.5 font-medium text-white hover:bg-emerald-600">
                      {locale === "en" ? "Apply replacement" : "Valider le remplacement"}
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}

          {extractionError && <p role="alert" className="rounded-xl border border-rose-700/50 bg-rose-950/40 p-3 text-xs text-rose-200">{extractionError}</p>}
          {extractionResult && (
            <ChapterExtractionPanel
              projectId={projectId}
              chapterId={currentChapter.id}
              result={extractionResult}
              characters={characters}
              worldNotes={worldNotes}
              onRefresh={onRefresh}
              onClose={() => setExtractionResult(null)}
            />
          )}
        </div>

        {/* The AI & Assistant Sidebar */}
        <div className="space-y-4">
          {/* AI Creative Copilot Toolbox */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-[#312e81] text-xs">Copilote IA Bienveillant</h3>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Des outils ciblés pour ne jamais rester bloqué devant le curseur clignotant.
            </p>

            <div className="space-y-2 pt-1">
              {/* Unblock Me */}
              <button
                onClick={handleAiUnblock}
                disabled={isAiLoading}
                className="w-full py-2 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/40 text-purple-200 text-xs font-medium transition flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-purple-400" />
                  « Débloque-moi ! » (3 pistes)
                </span>
                <span className="text-[10px] text-purple-400">Pannes</span>
              </button>
              <p className="px-1 text-[11px] leading-relaxed text-slate-600">Propose trois directions possibles pour relancer votre scène, sans modifier votre texte.</p>

              {/* Continue Contextually */}
              <button
                onClick={handleAiContinue}
                disabled={isAiLoading}
                className="w-full py-2 px-3 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/70 border border-indigo-500/40 text-indigo-200 text-xs font-medium transition flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Continuer la scène
                </span>
                <span className="text-[10px] text-indigo-400">+2 §</span>
              </button>
              <p className="px-1 text-[11px] leading-relaxed text-slate-600">Ajoute une courte suite à la fin de votre brouillon. Relisez-la et modifiez-la librement.</p>

              {/* Show Don't Tell guided rewriting */}
              <button
                onClick={() => handleAiRewrite("show_dont_tell")}
                disabled={isAiLoading}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition flex items-center justify-between"
                title="Transforme les explications abstraites en sensations concrètes"
              >
                <span className="flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-sky-400" />
                  « Show, Don&apos;t Tell »
                </span>
                <span className="text-[10px] text-slate-400">Sensations</span>
              </button>
              <p className="px-1 text-[11px] leading-relaxed text-slate-600">{locale === "en" ? "Rewrites the selected passage, or the whole chapter if nothing is selected. Review and explicitly replace the original." : "Réécrit le passage sélectionné, ou tout le chapitre si rien n’est sélectionné. Relisez puis validez le remplacement."}</p>

              {/* Tighten prose */}
              <button
                onClick={() => handleAiRewrite("tighten")}
                disabled={isAiLoading}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition flex items-center justify-between"
                title="Supprime les adverbes et longueurs inutiles"
              >
                <span className="flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  Alléger le style
                </span>
                <span className="text-[10px] text-slate-400">Élaguer</span>
              </button>
              <p className="px-1 text-[11px] leading-relaxed text-slate-600">{locale === "en" ? "Finds passages to tighten in your selection or chapter and presents each change for approval." : "Repère les passages à alléger dans la sélection ou le chapitre et soumet chaque changement à validation."}</p>

              <button
                onClick={() => handleAiRewrite("paraphrase")}
                disabled={isAiLoading}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                  {locale === "en" ? "Paraphrase selection" : "Reformuler la sélection"}
                </span>
                <span className="text-[10px] text-slate-400">{locale === "en" ? "Rephrase" : "Paraphraser"}</span>
              </button>
              <p className="px-1 text-[11px] leading-relaxed text-slate-600">
                {locale === "en" ? "Select text first; preserves meaning and offers a replacement for approval." : "Sélectionnez du texte; le sens est préservé et le remplacement reste soumis à validation."}
              </p>

              <button
                onClick={() => handleAiRewrite("help_express")}
                disabled={isAiLoading}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                  {locale === "en" ? "Help me express this idea" : "M’aider à exprimer cette idée"}
                </span>
                <span className="text-[10px] text-slate-400">{locale === "en" ? "Interpret" : "Interpréter"}</span>
              </button>
              <p className="px-1 text-[11px] leading-relaxed text-slate-600">
                {locale === "en" ? "Select a passage to get a tentative interpretation and wording options." : "Sélectionnez un passage pour obtenir une interprétation prudente et des formulations possibles."}
              </p>

              {/* Select extraction categories */}
              <fieldset className="space-y-2 rounded-xl border border-slate-700 bg-slate-950/50 p-3">
                <legend className="px-1 text-[11px] font-semibold text-slate-300">Éléments à rechercher</legend>
                {([
                  ["characters", "Personnages"],
                  ["places", "Lieux"],
                  ["events", "Événements"],
                  ["generalInfo", "Informations générales"],
                ] as const).map(([type, label]) => (
                  <label key={type} className="flex items-center gap-2 text-[11px] text-slate-300">
                    <input
                      type="checkbox"
                      checked={extractionTypes.includes(type)}
                      onChange={(event) => {
                        setExtractionTypes((selected) => event.target.checked
                          ? [...selected, type]
                          : selected.filter((item) => item !== type));
                      }}
                      className="accent-emerald-500"
                    />
                    {label}
                  </label>
                ))}
              </fieldset>

              {/* Extract story elements */}
              <button
                onClick={handleAiExtract}
                disabled={isAiLoading || extractionTypes.length === 0}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition flex items-center justify-between"
                title="Détecte personnages et faits mentionnés dans ce chapitre"
              >
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  Extraire la sélection
                </span>
                <span className="text-[10px] text-slate-400">Carnet</span>
              </button>
              <p className="px-1 text-[11px] leading-relaxed text-slate-600">Limitez la recherche aux catégories choisies. Les propositions restent à vérifier avant enregistrement.</p>
            </div>
            {isAiLoading && (
              <div role="status" className="flex items-start gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-2.5 text-[11px] text-indigo-900">
                <LoaderCircle className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
                <span>Le modèle prépare sa réponse. Avec LM Studio, cela peut prendre plusieurs minutes ; laissez cette fenêtre ouverte.</span>
              </div>
            )}
            {aiError && <p role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-2.5 text-[11px] text-rose-900">{aiError}</p>}
          </div>

          {/* Active Characters Quick Reference Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
              Aide-mémoire Personnages
            </h4>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {characters.map((char) => (
                <div key={char.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: char.color || "#38bdf8" }} />
                    <span className="font-bold text-white text-[11px]">{char.name}</span>
                    <span className="text-[10px] text-slate-500">({char.role})</span>
                  </div>
                  {char.consciousDesire && (
                    <p className="text-[10px] text-slate-400">
                      🎯 Veut : <span className="text-slate-300">{char.consciousDesire}</span>
                    </p>
                  )}
                  {char.lieOrFlaw && (
                    <p className="text-[10px] text-rose-300/80 italic">
                      💔 Faille : {char.lieOrFlaw}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

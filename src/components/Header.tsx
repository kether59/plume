"use client";

import React, { useState } from "react";
import { 
  BookMarked, 
  Sparkles, 
  Compass, 
  Layers, 
  Cpu, 
  Flame, 
  Target, 
  Plus, 
  ChevronDown, 
  Feather,
  CheckCircle,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useAppLocale } from "@/components/AppLocaleProvider";

interface HeaderProps {
  currentProject: any;
  allProjects: any[];
  onSelectProject: (id: number) => void;
  onCreateProject: (proj: any) => void;
  workflowOrder: string;
  onChangeWorkflow: (workflowOrder: string) => void;
  currentStage: string;
  onSelectStage: (stage: string) => void;
  onOpenCompass: () => void;
  onOpenArchitecture: () => void;
  onOpenAiSettings: () => void;
  todayWords: number;
  onLogout: () => void;
}

export const STAGES = [
  { id: "research", label: "1. Recherche & Lore", icon: "💡", desc: "Notes, univers & inspirations" },
  { id: "structure", label: "2. Structure & Plan", icon: "📐", desc: "3 Actes & découpage des scènes" },
  { id: "characters", label: "3. Personnages", icon: "🎭", desc: "Désir, Faille & Obstacles" },
  { id: "draft", label: "4. Premier Jet", icon: "✍️", desc: "Studio anti-autocensure & Flow" },
  { id: "revision", label: "5. Relecture & Repos", icon: "🔍", desc: "Cohérence, décantation & style" },
  { id: "beta", label: "6. Bêta-lecture", icon: "👥", desc: "Retours bienveillants & Export" },
];

const TIMELINE_STAGE = {
  id: "timeline",
  label: "Frise chronologique",
  icon: "⏳",
  desc: "Événements et liens de l’histoire",
};

const STAGE_ORDERS: Record<string, string[]> = {
  prepare_first: ["research", "structure", "characters", "draft", "timeline", "revision", "beta"],
  write_first: ["draft", "research", "characters", "timeline", "structure", "revision", "beta"],
};

export function Header({
  currentProject,
  allProjects,
  onSelectProject,
  onCreateProject,
  workflowOrder,
  onChangeWorkflow,
  currentStage,
  onSelectStage,
  onOpenCompass,
  onOpenArchitecture,
  onOpenAiSettings,
  todayWords,
  onLogout,
}: HeaderProps) {
  const { locale, setLocale } = useAppLocale();
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newGenre, setNewGenre] = useState("Fantasy Urbaine");
  const [newTarget, setNewTarget] = useState(50000);
  const [newWorkflowOrder, setNewWorkflowOrder] = useState("prepare_first");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateProject({
      title: newTitle,
      genre: newGenre,
      targetWordCount: newTarget,
      workflowOrder: newWorkflowOrder,
    });
    setNewTitle("");
    setNewWorkflowOrder("prepare_first");
    setShowNewModal(false);
  };

  const totalWords = currentProject?.currentWordCount || 0;
  const targetWords = currentProject?.targetWordCount || 50000;
  const progressPercent = Math.min(100, Math.round((totalWords / targetWords) * 100));
  const dailyGoal = currentProject?.dailyGoalWords || 500;
  const dailyProgress = Math.min(100, Math.round((todayWords / dailyGoal) * 100));

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800 text-slate-100">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo and Project Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-serif tracking-wide text-lg text-amber-950">
            <span className="p-2 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-md shadow-amber-900/40">
              <Feather className="w-5 h-5" />
            </span>
            <span className="font-bold hidden sm:inline">Plume & Premier Jet</span>
          </div>

          {/* Project Dropdown */}
          <div className="relative">
            <select
              value={currentProject?.id || ""}
              onChange={(e) => onSelectProject(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700/80 text-xs sm:text-sm font-medium rounded-xl px-3 py-1.5 text-slate-200 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer pr-7 appearance-none"
            >
              {allProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  📖 {p.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <label className="sr-only" htmlFor="workflow-order">{locale === "en" ? "Workflow order" : "Ordre du parcours"}</label>
          <select
            id="workflow-order"
            value={workflowOrder === "write_first" ? "write_first" : "prepare_first"}
            onChange={(e) => onChangeWorkflow(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 text-xs rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            title={locale === "en" ? "Choose your writing workflow" : "Choisir l’ordre de votre parcours d’écriture"}
          >
            <option value="prepare_first">{locale === "en" ? "Plan, then write" : "Préparer puis écrire"}</option>
            <option value="write_first">{locale === "en" ? "Write, then build" : "Écrire puis construire"}</option>
          </select>

          <label className="sr-only" htmlFor="app-locale">{locale === "fr" ? "Langue de l’application" : "Application language"}</label>
          <select
            id="app-locale"
            value={locale}
            onChange={(event) => setLocale(event.target.value as "fr" | "en")}
            className="bg-slate-900 border border-slate-700/80 text-xs rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            title={locale === "fr" ? "Langue de l’application" : "Application language"}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>

          <button
            onClick={() => setShowNewModal(true)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
            title={locale === "en" ? "New novel" : "Nouveau roman"}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Word Counts & Daily Habit Streak */}
        <div className="flex items-center gap-3 text-xs">
          {/* Target Roman Progress */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <Target className="w-4 h-4 text-sky-400" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white">{totalWords.toLocaleString()}</span>
                <span className="text-slate-500">/ {targetWords.toLocaleString()} {locale === "en" ? "words" : "mots"}</span>
                <span className="text-sky-400 font-bold ml-1">({progressPercent}%)</span>
              </div>
              <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Daily Streak Tracker */}
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <Flame className={`w-4 h-4 ${todayWords >= dailyGoal ? "text-amber-400 animate-bounce" : "text-amber-500/70"}`} />
            <div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-white">{todayWords}</span>
                <span className="text-slate-500">/ {dailyGoal} {locale === "en" ? "words today" : "mots auj."}</span>
              </div>
              <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    todayWords >= dailyGoal ? "bg-emerald-400" : "bg-amber-500"
                  }`}
                  style={{ width: `${dailyProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Special Modals Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenCompass}
              className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-medium transition flex items-center gap-1"
              title={locale === "en" ? "Encouraging advice for new writers" : "Conseils déculpabilisants pour auteurs débutants"}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{locale === "en" ? "Beginner's Compass" : "Boussole Débutant"}</span>
            </button>

            <button
              onClick={onOpenArchitecture}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-medium transition flex items-center gap-1"
              title={locale === "en" ? "Product vision & technical architecture" : "Vision produit & Architecture technique"}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{locale === "en" ? "Vision & Architecture" : "Vision & Architecture"}</span>
            </button>

            <button
              onClick={onOpenAiSettings}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
              title={locale === "en" ? "AI settings (Ollama, LM Studio, Cloud)" : "Paramètres de l'IA (Ollama, LM Studio, Cloud)"}
            >
              <Cpu className="w-4 h-4 text-purple-400" />
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-slate-900 border border-slate-800 transition"
              title={locale === "en" ? "Log out" : "Se déconnecter"}
              aria-label={locale === "en" ? "Log out" : "Se déconnecter"}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stage flow navigation, reordered per project */}
      <div className="border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-1 py-2 min-w-max">
          {(STAGE_ORDERS[workflowOrder] || STAGE_ORDERS.prepare_first).map((stageId, idx) => {
            const s = STAGES.find((stage) => stage.id === stageId) || TIMELINE_STAGE;
            const isActive = currentStage === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectStage(s.id)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bookmark-tab bg-amber-100 text-amber-950 border border-amber-300 shadow-sm"
                    : "bookmark-tab text-slate-600 hover:text-[#342c23] hover:bg-[#e8dfd0]"
                }`}
              >
                <span className="text-sm">{s.icon}</span>
                <span>{idx + 1}. {locale === "en" ? ({
                  research: "Research & Lore",
                  structure: "Structure & Outline",
                  characters: "Characters",
                  draft: "First Draft",
                  timeline: "Timeline",
                  revision: "Review & Rest",
                  beta: "Beta Reading",
                }[s.id] || s.label.replace(/^\d+\.\s*/, "")) : s.label.replace(/^\d+\.\s*/, "")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:items-center sm:py-6">
          <div className="new-project-dialog my-auto w-full max-w-md space-y-4 rounded-2xl border border-slate-700 p-6 text-slate-100 shadow-2xl" style={{ backgroundColor: "#0f172a", color: "#f1f5f9" }}>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-amber-400" />
              {locale === "en" ? "Start a new novel project" : "Initier un nouveau projet de roman"}
            </h3>
            <p className="text-xs text-slate-400">
              {locale === "en"
                ? <>Remember the beginner&apos;s golden rule: <em>“Finishing an imperfect novel is better than having 10 unfinished projects.”</em></>
                : <>Rappelez-vous la règle d&apos;or du débutant : <em>« Mieux vaut terminer un roman imparfait que d&apos;avoir 10 projets inachevés. »</em></>}
            </p>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">{locale === "en" ? "Working title" : "Titre de travail"}</label>
                <input
                  type="text"
                  required
                  placeholder={locale === "en" ? "e.g. The Fog Chronicles" : "ex: Les Chroniques du Brouillard"}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{locale === "en" ? "Literary genre" : "Genre littéraire"}</label>
                <select
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
                >
                  <option value="Fantasy Urbaine">{locale === "en" ? "Urban Fantasy / Fantasy" : "Fantasy Urbaine / Fantastique"}</option>
                  <option value="Thriller & Mystère">{locale === "en" ? "Thriller & Mystery" : "Thriller & Mystère"}</option>
                  <option value="Science-Fiction">{locale === "en" ? "Science Fiction / Dystopia" : "Science-Fiction / Dystopie"}</option>
                  <option value="Roman Contemporain">{locale === "en" ? "Contemporary Fiction / Drama" : "Roman Contemporain / Drame"}</option>
                  <option value="Romance">Romance</option>
                  <option value="Historique">{locale === "en" ? "Historical" : "Historique"}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{locale === "en" ? "First-draft word-count goal" : "Objectif total de mots pour le 1er jet"}</label>
                <input
                  type="number"
                  min={10000}
                  max={150000}
                  step={5000}
                  value={newTarget}
                  onChange={(e) => setNewTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">{locale === "en" ? "Recommended for a first novel: 40,000–60,000 words." : "Recommandé pour un premier roman : 40 000 à 60 000 mots."}</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{locale === "en" ? "Writing workflow" : "Parcours de travail"}</label>
                <select
                  value={newWorkflowOrder}
                  onChange={(e) => setNewWorkflowOrder(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
                >
                  <option value="prepare_first">{locale === "en" ? "Plan first (notes, outline, characters)" : "Préparer d’abord (fiches, plan, personnages)"}</option>
                  <option value="write_first">{locale === "en" ? "Write first, then extract chapter details" : "Écrire d’abord, puis extraire les éléments du chapitre"}</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  {locale === "en" ? "Cancel" : "Annuler"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium"
                >
                  {locale === "en" ? "Create novel" : "Créer le roman"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

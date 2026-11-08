"use client";

import React, { useState } from "react";
import { 
  Hourglass, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar, 
  Search, 
  BookOpen, 
  Flame, 
  RefreshCw,
  FileCheck2,
  HelpCircle
} from "lucide-react";

interface RevisionTabProps {
  projectId: number;
  project: any;
  chapters: any[];
  characters: any[];
  onRefresh: () => void;
}

export function RevisionTab({ projectId, project, chapters, characters, onRefresh }: RevisionTabProps) {
  const [isResting, setIsResting] = useState(Boolean(project.restingSince));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<number>(chapters[0]?.id || 0);
  const [coherenceReport, setCoherenceReport] = useState<any | null>(null);

  const selectedChapter = chapters.find((c) => c.id === selectedChapterId) || chapters[0];

  const handleToggleResting = async () => {
    const nextResting = !isResting ? new Date().toISOString() : null;
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restingSince: nextResting }),
    });
    setIsResting(!isResting);
    onRefresh();
  };

  const handleAnalyzeCoherence = async () => {
    if (!selectedChapter?.content) return;
    setIsAnalyzing(true);
    setCoherenceReport(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "coherence",
          projectId,
          chapterId: selectedChapter.id,
          text: selectedChapter.content,
        }),
      });
      const data = await res.json();
      if (data.result) {
        try {
          setCoherenceReport(JSON.parse(data.result));
        } catch {
          setCoherenceReport({
            score: 80,
            strengths: ["Texte fluide et agréable à lire."],
            warnings: [{ type: "Analyse générale", message: data.result }],
            beginnerTip: "Continuez d'avancer pas à pas.",
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calculate days resting if set
  const daysResting = project.restingSince
    ? Math.max(0, Math.floor((new Date().getTime() - new Date(project.restingSince).getTime()) / (1000 * 3600 * 24)))
    : 0;

  // Compute text statistics on current chapter
  const content = selectedChapter?.content || "";
  const words = content.trim() ? content.trim().split(/\s+/).filter(Boolean) : [];
  const adverbCount = words.filter((w: string) => w.toLowerCase().endsWith("ment") && w.length > 5).length;
  const sentenceCount = content.split(/[.!?]+/).filter(Boolean).length || 1;
  const avgWordsPerSentence = Math.round(words.length / sentenceCount);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
              <Hourglass className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-purple-100">Étape 5 : Relecture, Repos & Cohérence Narrative</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            La réécriture est l&apos;endroit où la magie opère réellement. Mais la première règle de la réécriture est de <strong>laisser reposer le texte</strong> pour le redécouvrir avec un regard neuf de lecteur.
          </p>
        </div>

        <button
          onClick={handleToggleResting}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition flex items-center gap-2 ${
            isResting
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          }`}
        >
          <Hourglass className="w-3.5 h-3.5" />
          <span>{isResting ? "Sortir du mode repos" : "Mettre le manuscrit au repos"}</span>
        </button>
      </div>

      {/* Incubation Chamber Card */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Calendar className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-white text-sm">La Chambre de Décantation Temporelle</h3>
          </div>
          {isResting && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
              En incubation depuis {daysResting} jour{daysResting > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          <em>« Lorsque vous venez de terminer un premier jet, vous en êtes encore trop amoureux ou trop dégoûté pour le corriger objectivement. Laissez-le dans un tiroir pendant au moins 14 jours. »</em> — Stephen King, <em>Écriture : Mémoires d&apos;un métier</em>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="font-semibold text-amber-400 block mb-1">Passer de créateur à lecteur</span>
            L&apos;oubli partiel de vos propres phrases vous permet de ressentir les vraies lenteurs et les trous dans l&apos;intrigue.
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="font-semibold text-sky-400 block mb-1">Traquer le Show vs Tell</span>
            Repérer les scènes où vous dites au lecteur ce qu&apos;il doit ressentir au lieu de lui faire vivre par l&apos;action.
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="font-semibold text-emerald-400 block mb-1">Élaguer les branches mortes</span>
            Supprimer les scènes secondaires qui n&apos;apportent ni tension, ni obstacle au désir du personnage.
          </div>
        </div>
      </div>

      {/* Active Chapter Analysis Sandbox */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Auditer le chapitre :</span>
            <select
              value={selectedChapter?.id}
              onChange={(e) => setSelectedChapterId(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none focus:border-purple-500"
            >
              {chapters.map((c, i) => (
                <option key={c.id} value={c.id}>
                  #{i + 1} — {c.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAnalyzeCoherence}
            disabled={isAnalyzing || !selectedChapter?.content}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-md shadow-purple-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isAnalyzing ? "Analyse narrative en cours..." : "Lancer l'audit de cohérence IA"}
          </button>
        </div>

        {/* Quick Style Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[11px]">Volume de mots</span>
            <span className="text-base font-bold text-white font-mono">{words.length}</span>
            <span className="text-slate-400 block text-[10px] mt-0.5">Longueur standard d&apos;une scène</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[11px]">Rythme moyen</span>
            <span className="text-base font-bold text-sky-400 font-mono">{avgWordsPerSentence} mots/phrase</span>
            <span className="text-slate-400 block text-[10px] mt-0.5">Viser l&apos;alternance court / long</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[11px]">Adverbes en -ment</span>
            <span className={`text-base font-bold font-mono ${adverbCount > 15 ? "text-amber-400" : "text-emerald-400"}`}>
              {adverbCount}
            </span>
            <span className="text-slate-400 block text-[10px] mt-0.5">À alléger pour renforcer les verbes d&apos;action</span>
          </div>
        </div>

        {/* AI Coherence Diagnostic Results */}
        {coherenceReport && (
          <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-purple-800/40 pb-3">
              <div>
                <h4 className="font-bold text-purple-200 text-sm flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-purple-400" />
                  Rapport de Relecture Bienveillante
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Évaluation basée sur les arcs de personnages et la tension dramatique
                </p>
              </div>

              {coherenceReport.score && (
                <div className="text-right">
                  <span className="text-lg font-bold text-emerald-400 font-mono">{coherenceReport.score}/100</span>
                  <span className="block text-[10px] text-slate-400">Score de solidité</span>
                </div>
              )}
            </div>

            {/* Strengths */}
            {coherenceReport.strengths && (
              <div className="space-y-1.5">
                <span className="font-semibold text-emerald-400 block">Points forts constatés :</span>
                <ul className="space-y-1 text-slate-300">
                  {coherenceReport.strengths.map((str: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {coherenceReport.warnings && (
              <div className="space-y-2 pt-2 border-t border-purple-800/40">
                <span className="font-semibold text-amber-400 block">Pistes d&apos;amélioration pour le 2e jet :</span>
                <div className="space-y-1.5">
                  {coherenceReport.warnings.map((w: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900/80 border border-amber-900/40 text-slate-300">
                      <span className="font-bold text-amber-300 block text-[11px]">{w.type}</span>
                      <p className="mt-0.5 text-slate-300">{w.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {coherenceReport.beginnerTip && (
              <div className="p-3 rounded-xl bg-purple-900/30 border border-purple-700/50 text-purple-200 italic">
                💡 <strong>Conseil du mentor :</strong> {coherenceReport.beginnerTip}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

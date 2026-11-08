"use client";

import React, { useState } from "react";
import { Plus, Sparkles, Layers, CheckCircle2, Circle, Edit, Trash2, ArrowUpDown, HelpCircle, ShieldAlert } from "lucide-react";

interface StructureTabProps {
  projectId: number;
  project: any;
  chapters: any[];
  onRefresh: () => void;
  onOpenDraftChapter?: (chapterId: number) => void;
}

const NARRATIVE_FRAMEWORKS = [
  {
    id: "three_acts",
    name: "Structure en 3 Actes (La plus recommandée pour débuter)",
    desc: "Exposition (25%) -> Confrontation & Point Médian (50%) -> Climax & Dénouement (25%). Simple, claire et indémodable.",
    acts: ["Acte 1 : Exposition & Incident Déclencheur", "Acte 2 : Confrontation & Point Médian", "Acte 3 : Climax & Résolution"],
  },
  {
    id: "heros_journey",
    name: "Le Voyage du Héros (Mythe & Aventure)",
    desc: "Départ du monde ordinaire -> Appel de l'aventure -> Les Épreuves & l'Élixir. Idéal pour quêtes et fantasy.",
    acts: ["Étape 1 : Le Départ (Monde ordinaire & Appel)", "Étape 2 : L'Initiation (Épreuves & Abîme)", "Étape 3 : Le Retour (Élixir & Transformation)"],
  },
  {
    id: "save_the_cat",
    name: "Save the Cat! (Rythme hollywoodien soutenu)",
    desc: "Le débat intérieur -> Briser le statu quo -> Tout est perdu -> Climax final.",
    acts: ["Partie 1 : Thèse & Choix", "Partie 2 : Antithèse & Fausse Victoire", "Partie 3 : Synthèse & Triomphe"],
  },
];

export function StructureTab({ projectId, project, chapters, onRefresh, onOpenDraftChapter }: StructureTabProps) {
  const [selectedFramework, setSelectedFramework] = useState(project.narrativeStructure || "three_acts");
  const [isCreating, setIsCreating] = useState(false);
  const [editingChapter, setEditingChapter] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [act, setAct] = useState("Acte 1 : Exposition & Incident Déclencheur");
  const [synopsis, setSynopsis] = useState("");
  const [povCharacter, setPovCharacter] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("outline");
  const [isAiAuditing, setIsAiAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const activeFrameworkObj = NARRATIVE_FRAMEWORKS.find((f) => f.id === selectedFramework) || NARRATIVE_FRAMEWORKS[0];

  const handleSaveFramework = async (newFw: string) => {
    setSelectedFramework(newFw);
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ narrativeStructure: newFw }),
    });
    onRefresh();
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingChapter) {
      await fetch(`/api/chapters/${editingChapter.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          act,
          synopsis,
          povCharacter,
          location,
          status,
        }),
      });
      setEditingChapter(null);
    } else {
      await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title,
          act,
          synopsis,
          povCharacter,
          location,
          status,
        }),
      });
    }

    setTitle("");
    setSynopsis("");
    setPovCharacter("");
    setLocation("");
    setIsCreating(false);
    onRefresh();
  };

  const handleEdit = (c: any) => {
    setEditingChapter(c);
    setTitle(c.title);
    setAct(c.act || activeFrameworkObj.acts[0]);
    setSynopsis(c.synopsis || "");
    setPovCharacter(c.povCharacter || "");
    setLocation(c.location || "");
    setStatus(c.status || "outline");
    setIsCreating(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce chapitre du plan ? (Son contenu texte sera également effacé)")) return;
    await fetch(`/api/chapters/${id}`, { method: "DELETE" });
    onRefresh();
  };

  const handleAiAudit = async () => {
    setIsAiAuditing(true);
    try {
      const outlineSummary = chapters.map((c) => `[${c.act}] ${c.title}: ${c.synopsis || "pas de résumé"}`).join("\n");
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "structure_help",
          projectId,
          text: outlineSummary,
        }),
      });
      const data = await res.json();
      if (data.result) {
        try {
          const parsed = JSON.parse(data.result);
          setAuditResult(parsed);
        } catch {
          setAuditResult({ feedback: data.result });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiAuditing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900 border border-sky-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-300">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-sky-100">Étape 2 : L&apos;Échafaudage & le Plan Narratif</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Avoir un plan, c&apos;est avoir une boussole dans la tempête du milieu de roman. Même un plan simple de 5 à 10 scènes vous évitera 80% des abandons.
          </p>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-sky-300/80 bg-sky-950/50 px-2.5 py-1 rounded-lg border border-sky-800/40 w-fit">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Règle d&apos;or : Le plan est une carte, pas une prison. Vous avez le droit de bifurquer quand l&apos;histoire le demande !</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleAiAudit}
            disabled={isAiAuditing}
            className="px-3.5 py-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-medium transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            {isAiAuditing ? "Audit du rythme..." : "Auditer la structure IA"}
          </button>

          <button
            onClick={() => {
              setEditingChapter(null);
              setTitle("");
              setSynopsis("");
              setPovCharacter("");
              setLocation("");
              setStatus("outline");
              setIsCreating(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-md shadow-sky-600/20"
          >
            <Plus className="w-4 h-4" />
            Nouveau chapitre
          </button>
        </div>
      </div>

      {/* AI Audit Feedback Card */}
      {auditResult && (
        <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Suggestions de jalons narratifs pour consolider votre intrigue :
            </span>
            <button onClick={() => setAuditResult(null)} className="text-slate-400 hover:text-white">Fermer</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
            {auditResult.incitingIncident && (
              <div className="p-3 bg-slate-900/80 rounded-lg border border-purple-800/40">
                <span className="font-semibold text-amber-300 block mb-1">Incident Déclencheur suggéré :</span>
                {auditResult.incitingIncident}
              </div>
            )}
            {auditResult.midpoint && (
              <div className="p-3 bg-slate-900/80 rounded-lg border border-purple-800/40">
                <span className="font-semibold text-sky-300 block mb-1">Point Médian / Fausse Victoire :</span>
                {auditResult.midpoint}
              </div>
            )}
            {auditResult.climax && (
              <div className="p-3 bg-slate-900/80 rounded-lg border border-purple-800/40">
                <span className="font-semibold text-rose-300 block mb-1">Climax / Choix Crucial :</span>
                {auditResult.climax}
              </div>
            )}
            {auditResult.resolution && (
              <div className="p-3 bg-slate-900/80 rounded-lg border border-purple-800/40">
                <span className="font-semibold text-emerald-300 block mb-1">Résolution / Le monde transformé :</span>
                {auditResult.resolution}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Narrative Framework Selector */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Modèle Narratif Choisi :
          </span>
          <span className="text-[11px] text-slate-500">Pour débuter, la structure en 3 actes est idéale</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {NARRATIVE_FRAMEWORKS.map((fw) => (
            <button
              key={fw.id}
              onClick={() => handleSaveFramework(fw.id)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                selectedFramework === fw.id
                  ? "border-sky-500 bg-sky-950/30 text-white"
                  : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div>
                <span className="font-semibold text-xs block text-slate-200">{fw.name}</span>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{fw.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Create / Edit Chapter Form */}
      {isCreating && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-sky-500/40 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-sky-200">
            {editingChapter ? "Modifier le chapitre" : "Ajouter un chapitre au plan"}
          </h3>
          <form onSubmit={handleSaveChapter} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Titre du chapitre / scène</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Chapitre 1 : Le réveil dans les brumes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Acte / Phase narrative</label>
                <select
                  value={act}
                  onChange={(e) => setAct(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                >
                  {activeFrameworkObj.acts.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                  <option value="Autre / Intermède">Autre / Intermède</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Objectif narratif / Résumé de la scène (Quel est le conflit ?)</label>
              <textarea
                rows={3}
                placeholder="Que veut le personnage au début de cette scène ? Quel obstacle surgit ? Comment la situation empire-t-elle à la fin de la scène ?"
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Personnage Point de Vue (POV)</label>
                <input
                  type="text"
                  placeholder="ex: Éléonore"
                  value={povCharacter}
                  onChange={(e) => setPovCharacter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Lieu principal</label>
                <input
                  type="text"
                  placeholder="ex: L'Atelier du Marais"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Statut d&apos;avancement</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="outline">📝 Planifié (À écrire)</option>
                  <option value="drafting">✍️ Premier jet en cours</option>
                  <option value="first_draft_done">🎉 Premier jet terminé</option>
                  <option value="revised">🔍 Révisé</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium"
              >
                {editingChapter ? "Mettre à jour" : "Ajouter au plan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Chapters Breakdown grouped by Act */}
      <div className="space-y-4">
        {chapters.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-400">
            <p className="font-medium text-slate-300">Votre plan est encore vide</p>
            <p className="text-xs mt-1">Créez votre premier chapitre pour poser les fondations de votre histoire !</p>
          </div>
        ) : (
          chapters.map((chap, idx) => {
            const wordCount = chap.wordCount || 0;
            const isDone = chap.status === "first_draft_done" || chap.status === "revised";

            return (
              <div
                key={chap.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">#{idx + 1}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {chap.act || "Acte 1"}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      isDone ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      chap.status === "drafting" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      "bg-slate-800 text-slate-400"
                    }`}>
                      {chap.status === "first_draft_done" ? "✓ Premier jet terminé" :
                       chap.status === "drafting" ? "✍️ En cours de rédaction" :
                       chap.status === "revised" ? "🔍 Révisé" : "📝 Planifié"}
                    </span>
                  </div>

                  <h3 className="font-semibold text-white text-sm">{chap.title}</h3>
                  {chap.synopsis && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {chap.synopsis}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                    {chap.povCharacter && (
                      <span>POV : <strong className="text-slate-300">{chap.povCharacter}</strong></span>
                    )}
                    {chap.location && (
                      <span>Lieu : <strong className="text-slate-300">{chap.location}</strong></span>
                    )}
                    <span>Mots rédigés : <strong className="text-sky-400">{wordCount.toLocaleString()} mots</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  {onOpenDraftChapter && (
                    <button
                      onClick={() => onOpenDraftChapter(chap.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-medium transition flex items-center gap-1"
                    >
                      <span>✍️ Rédiger</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(chap)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Modifier la fiche"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(chap.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-slate-800 transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { 
  Users, 
  Download, 
  Plus, 
  MessageSquare, 
  Star, 
  CheckCircle, 
  Trash2, 
  FileText, 
  ShieldCheck, 
  HelpCircle,
  Copy,
  Check
} from "lucide-react";

interface BetaReadingTabProps {
  projectId: number;
  project: any;
  chapters: any[];
  characters: any[];
  worldNotes: any[];
  betaFeedbacks: any[];
  onRefresh: () => void;
}

export function BetaReadingTab({
  projectId,
  project,
  chapters,
  characters,
  worldNotes,
  betaFeedbacks,
  onRefresh,
}: BetaReadingTabProps) {
  const [isAddingFeedback, setIsAddingFeedback] = useState(false);
  const [readerName, setReaderName] = useState("");
  const [readerEmail, setReaderEmail] = useState("");
  const [overallImpression, setOverallImpression] = useState("");
  const [hookRating, setHookRating] = useState(4);
  const [paceRating, setPaceRating] = useState(4);
  const [dropOffMoment, setDropOffMoment] = useState("");
  const [favoriteCharacter, setFavoriteCharacter] = useState("");
  const [plotQuestions, setPlotQuestions] = useState("");
  const [generalAdvice, setGeneralAdvice] = useState("");
  const [copiedQuestionnaire, setCopiedQuestionnaire] = useState(false);

  const QUESTIONNAIRE_TEMPLATE = `QUESTIONNAIRE DE BÊTA-LECTURE POUR "${project.title}" :
Merci infiniment de prendre le temps de lire mon manuscrit. Pour m'aider au mieux dans ma réécriture, voici 5 questions clés :

1. À quel moment précis as-tu ressenti une baisse de rythme ou as-tu été tenté de sauter des lignes ?
2. Quel personnage as-tu trouvé le plus vivant et attachant ? Y en a-t-il un qui t'a semblé fade ou incohérent ?
3. Y a-t-il des éléments de l'intrigue ou des règles du monde que tu n'as pas compris ou qui t'ont semblé contradictoires ?
4. La fin ou le dénouement t'a-t-il paru mérité et satisfaisant ?
5. Quelle a été ton émotion dominante à la lecture ?`;

  const handleCopyQuestionnaire = () => {
    navigator.clipboard.writeText(QUESTIONNAIRE_TEMPLATE);
    setCopiedQuestionnaire(true);
    setTimeout(() => setCopiedQuestionnaire(false), 1500);
  };

  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!readerName.trim()) return;

    await fetch("/api/beta-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        readerName,
        readerEmail,
        overallImpression,
        hookRating,
        paceRating,
        dropOffMoment,
        favoriteCharacter,
        plotQuestions,
        generalAdvice,
      }),
    });

    setReaderName("");
    setReaderEmail("");
    setOverallImpression("");
    setDropOffMoment("");
    setFavoriteCharacter("");
    setPlotQuestions("");
    setGeneralAdvice("");
    setIsAddingFeedback(false);
    onRefresh();
  };

  const handleDeleteFeedback = async (id: number) => {
    if (!confirm("Supprimer ce retour de bêta-lecteur ?")) return;
    await fetch(`/api/beta-feedback/${id}`, { method: "DELETE" });
    onRefresh();
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "processed" ? "new" : "processed";
    await fetch(`/api/beta-feedback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    onRefresh();
  };

  // Export functions
  const exportAsTxt = () => {
    let fullText = `${project.title}\n${project.subtitle || ""}\n\n`;
    chapters.forEach((c, idx) => {
      fullText += `--- Chapitre ${idx + 1} : ${c.title} ---\n\n`;
      fullText += `${c.content || "(Chapitre non rédigé)"}\n\n\n`;
    });

    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, "_")}_Manuscrit.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsMarkdown = () => {
    let md = `# ${project.title}\n\n> ${project.synopsis || ""}\n\n`;
    chapters.forEach((c, idx) => {
      md += `## Chapitre ${idx + 1} : ${c.title}\n\n`;
      if (c.povCharacter) md += `*Point de vue : ${c.povCharacter}*\n\n`;
      md += `${c.content || "*Chapitre non rédigé*"}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, "_")}_Manuscrit.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPitchDossier = () => {
    let dossier = `# DOSSIER DE PRÉSENTATION : ${project.title.toUpperCase()}\n\n`;
    dossier += `**Genre :** ${project.genre}\n`;
    dossier += `**Tonalité :** ${project.tone}\n`;
    dossier += `**Volume cible :** ${project.targetWordCount} mots\n\n`;
    dossier += `## PITCH / SYNOPSIS\n${project.synopsis}\n\n`;
    dossier += `## PERSONNAGES PRINCIPAUX\n`;
    characters.forEach((char) => {
      dossier += `- **${char.name}** (${char.role})\n`;
      dossier += `  - Désir conscient : ${char.consciousDesire || "N/A"}\n`;
      dossier += `  - Besoin inconscient : ${char.unconsciousNeed || "N/A"}\n`;
      dossier += `  - Faille : ${char.lieOrFlaw || "N/A"}\n`;
    });
    dossier += `\n## PLAN DES CHAPITRES\n`;
    chapters.forEach((c, i) => {
      dossier += `${i + 1}. **${c.title}** [${c.act}] : ${c.synopsis || "Sans synopsis"}\n`;
    });

    const blob = new Blob([dossier], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Dossier_Pitch_${project.title.replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Users className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-emerald-100">Étape 6 : Bêta-lecture & Partage Bienveillant</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Ne donnez jamais votre manuscrit à lire sans guide ! Un questionnaire ciblé protège votre cœur d&apos;auteur débutant et évite les avis vagues du type « C&apos;est sympa ».
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingFeedback(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            Ajouter un retour
          </button>
        </div>
      </div>

      {/* Questionnaire Template & Export Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Questionnaire Guide */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Questionnaire Recommandé pour vos lecteurs
            </h3>
            <button
              onClick={handleCopyQuestionnaire}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition flex items-center gap-1"
            >
              {copiedQuestionnaire ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedQuestionnaire ? "Copié !" : "Copier le texte"}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Copiez et envoyez ces questions à vos premiers lecteurs tests (amis de confiance ou auteurs partenaires) pour recevoir des retours constructifs :
          </p>

          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {QUESTIONNAIRE_TEMPLATE}
          </pre>
        </div>

        {/* Manuscript Export Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4 text-sky-400" />
              Exporter votre manuscrit
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Téléchargez votre œuvre pour l&apos;imprimer, l&apos;envoyer à vos bêta-lecteurs ou préparer votre soumission.
            </p>

            <div className="mt-4 space-y-2">
              <button
                onClick={exportAsMarkdown}
                className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  Manuscrit au format Markdown (.md)
                </span>
                <span className="text-[10px] text-slate-400">Idéal Scrivener & Obsidian</span>
              </button>

              <button
                onClick={exportAsTxt}
                className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Manuscrit au format Texte brut (.txt)
                </span>
                <span className="text-[10px] text-slate-400">Compatible tout traitement</span>
              </button>

              <button
                onClick={exportPitchDossier}
                className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Dossier de Présentation & Pitch (.md)
                </span>
                <span className="text-[10px] text-slate-400">Synopsis + Fiches + Plan</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 italic">
            🛡️ Vos écrits restent stockés en toute sécurité dans votre base locale.
          </div>
        </div>
      </div>

      {/* Add Feedback Form Modal */}
      {isAddingFeedback && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-emerald-200">Enregistrer une fiche retour de bêta-lecteur</h3>
          <form onSubmit={handleSaveFeedback} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Prénom ou pseudo du lecteur</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Camille, Thomas..."
                  value={readerName}
                  onChange={(e) => setReaderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Email ou contact (facultatif)</label>
                <input
                  type="email"
                  placeholder="lecteur@exemple.com"
                  value={readerEmail}
                  onChange={(e) => setReaderEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Impression générale & ressenti global</label>
              <textarea
                rows={2}
                placeholder="ex: Très accrocheur, atmosphère réussie..."
                value={overallImpression}
                onChange={(e) => setOverallImpression(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Moment où il a eu envie de décrocher / sauter des lignes</label>
                <input
                  type="text"
                  placeholder="ex: Au milieu du chapitre 2 lors de la description du marché"
                  value={dropOffMoment}
                  onChange={(e) => setDropOffMoment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Personnage préféré ou le plus marquant</label>
                <input
                  type="text"
                  placeholder="ex: Éléonore pour sa fragilité"
                  value={favoriteCharacter}
                  onChange={(e) => setFavoriteCharacter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Incohérences ou incompréhensions relevées</label>
              <textarea
                rows={2}
                placeholder="ex: Je n'ai pas compris comment Silas connaissait l'adresse..."
                value={plotQuestions}
                onChange={(e) => setPlotQuestions(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingFeedback(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                Sauvegarder la fiche
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feedbacks Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Retours reçus ({betaFeedbacks.length})
        </h3>

        {betaFeedbacks.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-400">
            <p className="font-medium text-slate-300">Aucun retour de bêta-lecteur enregistré</p>
            <p className="text-xs mt-1">Partagez votre questionnaire avec 2 ou 3 lecteurs de confiance pour débuter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {betaFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{fb.readerName}</h4>
                      {fb.readerEmail && <span className="text-[11px] text-slate-500">{fb.readerEmail}</span>}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(fb.id, fb.status)}
                        className={`text-[10px] px-2 py-0.5 rounded font-medium border transition ${
                          fb.status === "processed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {fb.status === "processed" ? "✓ Pris en compte" : "À traiter"}
                      </button>
                      <button
                        onClick={() => handleDeleteFeedback(fb.id)}
                        className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-slate-800 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {fb.overallImpression && (
                    <p className="text-xs text-slate-200 mt-2 font-novel italic leading-relaxed">
                      &laquo; {fb.overallImpression} &raquo;
                    </p>
                  )}

                  <div className="mt-3 space-y-1.5 text-[11px]">
                    {fb.dropOffMoment && (
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80">
                        <span className="font-semibold text-rose-400">Baisse de rythme : </span>
                        <span className="text-slate-300">{fb.dropOffMoment}</span>
                      </div>
                    )}
                    {fb.favoriteCharacter && (
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80">
                        <span className="font-semibold text-emerald-400">Personnage marquant : </span>
                        <span className="text-slate-300">{fb.favoriteCharacter}</span>
                      </div>
                    )}
                    {fb.plotQuestions && (
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80">
                        <span className="font-semibold text-amber-400">Points flous : </span>
                        <span className="text-slate-300">{fb.plotQuestions}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

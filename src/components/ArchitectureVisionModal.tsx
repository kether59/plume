"use client";

import React, { useState } from "react";
import { X, Layers, Cpu, Compass, CheckCircle2, AlertTriangle, Lightbulb, Rocket, Database, Code, BookOpen } from "lucide-react";

interface ArchitectureVisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ArchitectureVisionModal({ isOpen, onClose }: ArchitectureVisionModalProps) {
  const [activeTab, setActiveTab] = useState<"vision" | "architecture" | "choices" | "mvp" | "risks">("vision");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-700 text-slate-100 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-indigo-200">Vision Produit & Architecture Technique</h2>
                <p className="text-xs text-slate-400">Dossier de conception : Outil d&apos;écriture assisté par IA pour romanciers débutants</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 text-sm">
            <button
              onClick={() => setActiveTab("vision")}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === "vision" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Compass className="w-4 h-4" /> 1. Vision Produit
            </button>
            <button
              onClick={() => setActiveTab("architecture")}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === "architecture" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Cpu className="w-4 h-4" /> 2. Architecture Globale
            </button>
            <button
              onClick={() => setActiveTab("choices")}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === "choices" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Code className="w-4 h-4" /> 3. Choix Techniques
            </button>
            <button
              onClick={() => setActiveTab("mvp")}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === "mvp" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Rocket className="w-4 h-4" /> 4. Découpe MVP
            </button>
            <button
              onClick={() => setActiveTab("risks")}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === "risks" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <AlertTriangle className="w-4 h-4" /> 5. Risques & Opportunités
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm leading-relaxed flex-1">
          {activeTab === "vision" && (
            <div className="space-y-5">
              <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-800/40">
                <h3 className="text-base font-semibold text-indigo-300 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-400" />
                  La thèse centrale : Résoudre le « cimetière des premiers chapitres »
                </h3>
                <p className="mt-2 text-slate-300">
                  95% des aspirants auteurs abandonnent avant d&apos;avoir dépassé le tiers de leur premier roman. Les raisons ne sont pas un manque d&apos;idées, mais :
                  <br />• <strong>L&apos;autocensure prématurée</strong> (vouloir peaufiner la prose dès la page 5).
                  <br />• <strong>Le syndrome de l&apos;imposteur</strong> (se comparer immédiatement à des monuments littéraires).
                  <br />• <strong>Le manque de cadre narratif</strong> (perte de repères au milieu du récit, absence de désir clair chez le protagoniste).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                  <h4 className="font-semibold text-white mb-2">Principes directeurs du produit</h4>
                  <ul className="space-y-2 list-disc list-inside text-slate-300 text-xs">
                    <li><strong>Valoriser le brouillon brut :</strong> Un premier jet bancal a une valeur inestimable ; une page immaculée n&apos;en a aucune.</li>
                    <li><strong>L&apos;IA comme copilote déculpabilisant :</strong> L&apos;IA ne se substitue pas à l&apos;auteur, elle propose des tremplins créatifs et des relances pour relancer le flot.</li>
                    <li><strong>Régularité sans pression toxique :</strong> Sprints de 15 à 25 minutes, quotas quotidiens modulables (300 à 500 mots), célébrations des jalons.</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                  <h4 className="font-semibold text-white mb-2">Les étapes fondamentales du parcours</h4>
                  <ol className="space-y-1 list-decimal list-inside text-slate-300 text-xs">
                    <li><strong>Recherche & Documentation :</strong> Fiches d&apos;univers, inspirations, chaudron de notes.</li>
                    <li><strong>Structure & Plan :</strong> Modèles narratifs guidés (3 actes, voyage du héros, save the cat).</li>
                    <li><strong>Personnages :</strong> Modèle Désir Conscient + Besoin Inconscient + Faille + Obstacles.</li>
                    <li><strong>Écriture du roman :</strong> Mode anti-autocensure, sprints et extraction à la demande depuis le chapitre sélectionné.</li>
                    <li><strong>Frise chronologique :</strong> Événements proposés depuis un chapitre, modifiables et reliés aux fiches et personnages.</li>
                    <li><strong>Relecture & Repos :</strong> Détection de répétitions, analyse de cohérence, chambre de repos.</li>
                    <li><strong>Bêta-lecture :</strong> Questionnaire calibré et collecte de retours bienveillants.</li>
                  </ol>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40">
                <h4 className="font-semibold text-amber-200 mb-1">Deux ordres de travail, au choix pour chaque roman</h4>
                <p className="text-xs text-slate-300">
                  Le parcours « Préparer puis écrire » conserve la progression guidée actuelle. Le parcours « Écrire puis construire » ouvre directement le studio d&apos;écriture, puis permet de transformer les éléments d&apos;un chapitre sélectionné en propositions de fiches, de personnages et d&apos;événements. L&apos;auteur relit et valide chaque ajout ; la frise reste éditable et réordonnable.
                </p>
              </div>
            </div>
          )}

          {activeTab === "architecture" && (
            <div className="space-y-5">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <h3 className="text-base font-semibold text-sky-300 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-sky-400" />
                  Cartographie Technique Globale
                </h3>
                <p className="mt-1 text-slate-400 text-xs">
                  Une architecture fullstack résiliente, conçue pour un fonctionnement hybride fluide (Cloud & Modèles Locaux privés).
                </p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="font-bold text-sky-400 block mb-1">Frontend & Éditeur</span>
                    Next.js App Router (React 19), Tailwind CSS v4, mode zen distraction-free, système de timers et de sprint sans rature.
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="font-bold text-emerald-400 block mb-1">Backend & Persistance</span>
                    PostgreSQL géré via Drizzle ORM avec typage statique strict. Schémas pour romans, chapitres, personnages, fiches de lore, événements chronologiques et retours.
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="font-bold text-purple-400 block mb-1">Couche IA Hybride</span>
                    Module unifié <code>callAiService</code> supportant : Local Ollama (`/api/generate`), LM Studio, OpenAI (`/chat/completions`) et Moteur heuristique intégré de secours.
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <h4 className="font-semibold text-white mb-2 text-xs uppercase tracking-wider text-slate-400">Flux d&apos;injection contextuelle pour l&apos;IA (RAG-lite romanesque)</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 p-2 bg-slate-900 rounded">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">1</span>
                    <span>Agrégation de l&apos;état narratif : Synopsis global + Profil du POV actif (Désir/Faille) + Lieu + Dernier millier de caractères rédigés.</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-slate-900 rounded">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">2</span>
                    <span>Prompt pédagogique injectant la règle du « Premier Jet » (éviter le style académique froid, encourager le rebondissement sensoriel).</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-slate-900 rounded">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">3</span>
                    <span>Extraction à la demande depuis le chapitre sélectionné : l&apos;IA propose des personnages, des fiches et des événements liés. Rien n&apos;est enregistré avant validation de l&apos;auteur.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "choices" && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-emerald-300 flex items-center gap-2">
                <Code className="w-5 h-5 text-emerald-400" />
                Justification des grands choix techniques
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700">
                  <span className="font-semibold text-white text-sm">PostgreSQL + Drizzle ORM</span>
                  <p className="mt-1 text-slate-300">
                    Un roman est par nature une structure hautement relationnelle : un chapitre appartient à un projet, fait intervenir certains personnages, se déroule dans des lieux répertoriés dans les fiches de lore, et génère des retours de bêta-lecteurs. PostgreSQL garantit l&apos;intégrité référentielle (cascade deletes), tandis que Drizzle offre un typage TypeScript strict à zéro coût d&apos;abstraction.
                  </p>
                </div>

                <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700">
                  <span className="font-semibold text-white text-sm">Prise en charge native d&apos;Ollama & LM Studio en local</span>
                  <p className="mt-1 text-slate-300">
                    Les auteurs de fiction sont extrêmement sensibles à la confidentialité de leurs écrits et à la propriété intellectuelle de leurs univers. Pouvoir faire tourner un modèle local (ex: Llama 3, Mistral 7B) en <code>localhost:11434</code> sans jamais envoyer leurs textes à un tiers cloud est un atout concurrentiel et éthique déterminant.
                  </p>
                </div>

                <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700">
                  <span className="font-semibold text-white text-sm">Fallback Heuristique Intelligent sans blocage</span>
                  <p className="mt-1 text-slate-300">
                    Même si l&apos;utilisateur n&apos;a pas configuré d&apos;instance Ollama ni de clé OpenAI, l&apos;application ne doit JAMAIS afficher une erreur technique bloquante. Un moteur de déblocage contextuel en TypeScript pur génère des pistes narratives valides immédiatement.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "mvp" && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-amber-300 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-amber-400" />
                Découpe du MVP vs Roadmap V2
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-emerald-950/30 rounded-xl border border-emerald-800/40">
                  <h4 className="font-bold text-emerald-300 text-sm mb-2">MVP Déjà Intégré dans l&apos;application</h4>
                  <ul className="space-y-1.5 text-slate-300">
                    <li>✅ Gestion complète de projets de romans et quotas</li>
                    <li>✅ Étape 1 : Carnet de recherche, lore, magie, époques</li>
                    <li>✅ Étape 2 : Plan narratif modélisé (3 Actes, Voyage Héros)</li>
                    <li>✅ Étape 3 : Fiches de personnages centrées Désir / Faille</li>
                    <li>✅ Étape 4 : Studio premier jet anti-autocensure + Pomodoro</li>
                    <li>✅ Deux ordres de parcours configurables par roman (préparer ou écrire d&apos;abord)</li>
                    <li>✅ Extraction révisable de fiches, personnages et événements depuis un chapitre</li>
                    <li>✅ Frise chronologique éditable avec liens vers chapitres, personnages et fiches</li>
                    <li>✅ IA contextuelle : Relance 3 pistes, Show Don&apos;t Tell, Extraction</li>
                    <li>✅ Étape 5 : Chambre de repos temporel & Analyseur de cohérence</li>
                    <li>✅ Étape 6 : Questionnaire de bêta-lecture et export de manuscrit</li>
                  </ul>
                </div>

                <div className="p-4 bg-indigo-950/30 rounded-xl border border-indigo-800/40">
                  <h4 className="font-bold text-indigo-300 text-sm mb-2">Roadmap V2 (Évolutions futures)</h4>
                  <ul className="space-y-1.5 text-slate-300">
                    <li>🚀 Synchronisation Cloud sécurisée chiffrée de bout en bout</li>
                    <li>🚀 Application Desktop légère (Tauri) pour travail hors-ligne complet</li>
                    <li>🚀 Portail public de lecture sécurisé avec liens de partage uniques pour bêta-lecteurs annotateurs</li>
                    <li>🚀 Export direct au format ePub et maquette PDF d&apos;imprimerie</li>
                    <li>🚀 Vue graphique avancée de la frise avec embranchements de scènes</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "risks" && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                Points d&apos;attention, Risques & Opportunités
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-800/40">
                  <span className="font-semibold text-rose-300 text-sm">Risque 1 : La paresse d&apos;écriture & la perte de voix</span>
                  <p className="mt-1 text-slate-300">
                    Si l&apos;IA génère trop facilement des pages entières au kilomètre, l&apos;écrivain débutant ne développera pas sa propre sensibilité stylistique.
                    <br />
                    <em>Mitigation :</em> L&apos;application privilégie des continuations courtes (2-3 paragraphes maximum), des questions maïeutiques (« Que ressentirait ton personnage ici ? ») et des options de relance plutôt que la génération massive aveugle.
                  </p>
                </div>

                <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-800/40">
                  <span className="font-semibold text-amber-300 text-sm">Risque 2 : L&apos;illusion du travail de préparation infini (Worldbuilder&apos;s Disease)</span>
                  <p className="mt-1 text-slate-300">
                    Beaucoup de débutants passent 18 mois à créer le dictionnaire linguistique de leur univers de fantasy sans jamais écrire la première ligne du chapitre 1.
                    <br />
                    <em>Mitigation :</em> L&apos;interface encourage l&apos;écriture sans l&apos;imposer : chaque roman peut démarrer par la préparation ou directement par un chapitre, puis enrichir ses fiches à partir du texte.
                  </p>
                </div>

                <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-800/40">
                  <span className="font-semibold text-emerald-300 text-sm">Opportunité majeure : Démocratiser l&apos;aboutissement littéraire</span>
                  <p className="mt-1 text-slate-300">
                    Donner à quiconque a une histoire dans le cœur les outils méthodologiques (d&apos;ordinaire réservés aux ateliers d&apos;écriture coûteux ou aux masterclasses) pour aller jusqu&apos;au mot « FIN ».
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition"
          >
            Fermer le dossier de conception
          </button>
        </div>
      </div>
    </div>
  );
}

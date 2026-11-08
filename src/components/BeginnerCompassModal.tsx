"use client";

import React from "react";
import { X, Compass, HeartHandshake, ShieldCheck, BookOpen, Sparkles, CheckCircle2, Clock } from "lucide-react";

interface BeginnerCompassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BeginnerCompassModal({ isOpen, onClose }: BeginnerCompassModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-amber-500/30 text-slate-100 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900/60 p-6 border-b border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-amber-200">La Boussole du Romancier en Devenir</h2>
                <p className="text-sm text-slate-400">Les 6 principes cardinaux pour surmonter le doute et terminer votre premier roman</p>
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
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Rule 1 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-amber-500/40 transition">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-300">1. Valoriser son statut d&apos;écrivain débutant</h3>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                  Être débutant n&apos;est pas une tare, c&apos;est un super-pouvoir : votre regard est neuf, vos passions sont sincères et vous n&apos;êtes pas encore formaté par les conventions. Acceptez de tâtonner. L&apos;apprentissage du romancier ne se fait pas dans la théorie, mais dans l&apos;encre accumulée.
                </p>
                <div className="mt-2 text-xs italic text-amber-300/80 bg-amber-950/40 p-2 rounded border border-amber-800/40">
                  « Le premier jet de n&apos;importe quel texte est toujours imparfait. L&apos;unique mission du premier jet est d&apos;exister. » — Anne Lamott
                </div>
              </div>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-amber-500/40 transition">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-rose-300">2. Interdiction formelle de se comparer</h3>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                  Ne comparez jamais votre premier brouillon brut avec le chef-d&apos;œuvre d&apos;un auteur publié. Ce livre publié a traversé 8 réécritures, les retours de deux éditeurs professionnels, un correcteur typographique et 15 ans de pratique. Vous comparez vos coulisses au spectacle final des autres.
                </p>
              </div>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-amber-500/40 transition">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-300">3. La force des petits pas réguliers (Sanctuariser 20 min)</h3>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                  N&apos;attendez pas d&apos;avoir une semaine entière de libre pour écrire. Écrire 300 à 500 mots chaque jour pendant 30 minutes représente 15 000 mots par mois : votre premier roman sera bouclé en seulement 3 à 4 mois. La régularité bat toujours le génie intermittent.
                </p>
              </div>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-amber-500/40 transition">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sky-300">4. Finir avant de polir (La règle anti-autocensure)</h3>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                  Le piège mortel du débutant est de réécrire le Chapitre 1 pendant six mois sans jamais entamer le Chapitre 3. Pendant le premier jet : on fonce tout droit. Si vous réalisez qu&apos;une scène précédente doit changer, notez-le dans la fiche de révision et continuez d&apos;avancer. On répare une voiture qui roule, pas une voiture restée en pièces au garage.
                </p>
              </div>
            </div>
          </div>

          {/* Rule 5 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-amber-500/40 transition">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-300">5. Équilibre sain : 1h de lecture nourrit 1h d&apos;écriture</h3>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                  Un auteur qui n&apos;écrit plus est souvent un auteur qui ne lit plus. Lisez activement des romans de votre genre pour observer comment les maîtres résolvent une transition, gèrent le suspense ou dosent les descriptions. Votre imagination a besoin de combustible.
                </p>
              </div>
            </div>
          </div>

          {/* Rule 6 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-amber-500/40 transition">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-300">6. L&apos;IA est un échafaudage, pas le maçon</h3>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                  Dans notre outil, l&apos;IA est là pour débloquer votre imagination, vous relancer quand vous séchez, et tester vos idées de scènes. Mais l&apos;âme du récit, la sincérité de vos personnages et la vérité de vos émotions vous appartiennent. Ne laissez jamais l&apos;IA effacer votre voix singulière.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition shadow-lg shadow-amber-600/30"
          >
            J&apos;ai compris, place à l&apos;écriture !
          </button>
        </div>
      </div>
    </div>
  );
}

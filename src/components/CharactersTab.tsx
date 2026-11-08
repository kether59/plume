"use client";

import React, { useState } from "react";
import { Plus, Sparkles, User, Heart, ShieldAlert, Edit, Trash2, Zap, ArrowRight, UserCheck } from "lucide-react";
import { CharacterRelationsGraph } from "@/components/CharacterRelationsGraph";
import { useAppLocale } from "@/components/AppLocaleProvider";

interface CharactersTabProps {
  projectId: number;
  characters: any[];
  relations: any[];
  onRefresh: () => void;
  project: any;
}

export function CharactersTab({ projectId, characters, relations, onRefresh, project }: CharactersTabProps) {
  const { locale } = useAppLocale();
  const [isCreating, setIsCreating] = useState(false);
  const [editingChar, setEditingChar] = useState<any>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Protagoniste");
  const [consciousDesire, setConsciousDesire] = useState("");
  const [unconsciousNeed, setUnconsciousNeed] = useState("");
  const [lieOrFlaw, setLieOrFlaw] = useState("");
  const [eyeColor, setEyeColor] = useState("");
  const [hairColor, setHairColor] = useState("");
  const [height, setHeight] = useState("");
  const [physicalParticularity, setPhysicalParticularity] = useState("");
  const [age, setAge] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [externalObstacles, setExternalObstacles] = useState("");
  const [internalObstacles, setInternalObstacles] = useState("");
  const [characterArc, setCharacterArc] = useState("");
  const [distinguishingFeatures, setDistinguishingFeatures] = useState("");
  const [relationships, setRelationships] = useState("");
  const [color, setColor] = useState("#0284c7");
  const [isAiCoaching, setIsAiCoaching] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingChar) {
      await fetch(`/api/characters/${editingChar.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role,
          consciousDesire,
          unconsciousNeed,
          lieOrFlaw,
          eyeColor,
          hairColor,
          height,
          physicalParticularity,
          age,
          birthDate,
          externalObstacles,
          internalObstacles,
          characterArc,
          distinguishingFeatures,
          relationships,
          color,
        }),
      });
      setEditingChar(null);
    } else {
      await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          name,
          role,
          consciousDesire,
          unconsciousNeed,
          lieOrFlaw,
          eyeColor,
          hairColor,
          height,
          physicalParticularity,
          age,
          birthDate,
          externalObstacles,
          internalObstacles,
          characterArc,
          distinguishingFeatures,
          relationships,
          color,
        }),
      });
    }

    resetForm();
    setIsCreating(false);
    onRefresh();
  };

  const resetForm = () => {
    setName("");
    setRole("Secondaire");
    setConsciousDesire("");
    setUnconsciousNeed("");
    setLieOrFlaw("");
    setEyeColor("");
    setHairColor("");
    setHeight("");
    setPhysicalParticularity("");
    setAge("");
    setBirthDate("");
    setExternalObstacles("");
    setInternalObstacles("");
    setCharacterArc("");
    setDistinguishingFeatures("");
    setRelationships("");
    setColor("#0ea5e9");
    setEditingChar(null);
  };

  const handleEdit = (c: any) => {
    setEditingChar(c);
    setName(c.name);
    setRole(c.role || "Protagoniste");
    setConsciousDesire(c.consciousDesire || "");
    setUnconsciousNeed(c.unconsciousNeed || "");
    setLieOrFlaw(c.lieOrFlaw || "");
    setEyeColor(c.eyeColor || "");
    setHairColor(c.hairColor || "");
    setHeight(c.height || "");
    setPhysicalParticularity(c.physicalParticularity || "");
    setAge(c.age || "");
    setBirthDate(c.birthDate || "");
    setExternalObstacles(c.externalObstacles || "");
    setInternalObstacles(c.internalObstacles || "");
    setCharacterArc(c.characterArc || "");
    setDistinguishingFeatures(c.distinguishingFeatures || "");
    setRelationships(c.relationships || "");
    setColor(c.color || "#0ea5e9");
    setIsCreating(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce personnage ?")) return;
    await fetch(`/api/characters/${id}`, { method: "DELETE" });
    onRefresh();
  };

  const handleAiCoach = async () => {
    setIsAiCoaching(true);
    setAiSuggestions(null);
    try {
      const currentValues: Record<string, string> = {
        consciousDesire,
        unconsciousNeed,
        lieOrFlaw,
        internalObstacles,
        externalObstacles,
        characterArc,
        eyeColor,
        hairColor,
        height,
        physicalParticularity,
        age,
        birthDate,
        distinguishingFeatures,
      };
      const missingFields = Object.entries(currentValues)
        .filter(([, value]) => !value.trim())
        .map(([field]) => field);
      if (missingFields.length === 0) {
        setAiSuggestions({ error: locale === "en" ? "All supported fields are already filled in." : "Tous les champs concernés sont déjà renseignés." });
        return;
      }
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "character_help",
          projectId,
          text: name || "Nouveau protagoniste",
          locale,
          extraParams: {
            name: name || (locale === "en" ? "New character" : "Nouveau personnage"),
            existing: currentValues,
            missingFields,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "La suggestion IA a échoué.");
      if (data.result) {
        try {
          const parsed = JSON.parse(data.result);
          const safeSuggestions = Object.fromEntries(
            missingFields
              .filter((field) => !currentValues[field]?.trim() && typeof parsed[field] === "string")
              .map((field) => [field, parsed[field]])
          );
          setAiSuggestions(safeSuggestions);
        } catch {
          setAiSuggestions({ note: data.result });
        }
      }
    } catch (e) {
      console.error(e);
      setAiSuggestions({ error: e instanceof Error ? e.message : locale === "en" ? "Could not generate suggestions." : "Impossible de générer des propositions." });
    } finally {
      setIsAiCoaching(false);
    }
  };

  const applySuggestion = (field: string, value: string) => {
    if (field === "consciousDesire" && !consciousDesire) setConsciousDesire(value);
    else if (field === "unconsciousNeed" && !unconsciousNeed) setUnconsciousNeed(value);
    else if (field === "lieOrFlaw" && !lieOrFlaw) setLieOrFlaw(value);
    else if (field === "internalObstacles" && !internalObstacles) setInternalObstacles(value);
    else if (field === "externalObstacles" && !externalObstacles) setExternalObstacles(value);
    else if (field === "characterArc" && !characterArc) setCharacterArc(value);
    else if (field === "eyeColor" && !eyeColor) setEyeColor(value);
    else if (field === "hairColor" && !hairColor) setHairColor(value);
    else if (field === "height" && !height) setHeight(value);
    else if (field === "physicalParticularity" && !physicalParticularity) setPhysicalParticularity(value);
    else if (field === "age" && !age) setAge(value);
    else if (field === "birthDate" && !birthDate) setBirthDate(value);
    else if (field === "distinguishingFeatures" && !distinguishingFeatures) setDistinguishingFeatures(value);
    setAiSuggestions((current: Record<string, unknown> | null) => {
      if (!current) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const suggestionLabels: Record<string, string> = {
    consciousDesire: locale === "en" ? "Conscious desire" : "Désir conscient",
    unconsciousNeed: locale === "en" ? "Unconscious need" : "Besoin inconscient",
    lieOrFlaw: locale === "en" ? "Core flaw" : "Faille",
    internalObstacles: locale === "en" ? "Internal obstacles" : "Obstacles intérieurs",
    externalObstacles: locale === "en" ? "External obstacles" : "Obstacles extérieurs",
    characterArc: locale === "en" ? "Character arc" : "Arc du personnage",
    eyeColor: locale === "en" ? "Eyes" : "Yeux",
    hairColor: locale === "en" ? "Hair" : "Cheveux",
    height: locale === "en" ? "Height" : "Taille",
    physicalParticularity: locale === "en" ? "Physical feature" : "Particularité physique",
    age: locale === "en" ? "Age" : "Âge",
    birthDate: locale === "en" ? "Birth date" : "Date de naissance",
    distinguishingFeatures: locale === "en" ? "Voice / distinctive detail" : "Voix / détail saillant",
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
              <User className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-emerald-100">Étape 3 : Galerie des Personnages (Le Moteur du Récit)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Une intrigue n&apos;est jamais qu&apos;un personnage poussé hors de sa zone de confort. L&apos;essentiel n&apos;est pas sa couleur d&apos;yeux, mais son <strong>Désir Conscient</strong> opposé à ses <strong>Obstacles</strong>.
          </p>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-emerald-300/80 bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-800/40 w-fit">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Formule magique du débutant : Un Personnage = Ce qu&apos;il croit vouloir (Désir) + Ce qui le bloque (Faille & Obstacles).</span>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsCreating(true);
          }}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          Nouveau personnage
        </button>
      </div>

      {/* Creation / Edit Form Modal or Inline */}
      {isCreating && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-200">
              {editingChar ? `Modifier la fiche de ${name}` : "Créer un personnage vivant et nuancé"}
            </h3>
            <button
              type="button"
              onClick={handleAiCoach}
              disabled={isAiCoaching}
              className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-medium transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              {isAiCoaching
                ? (locale === "en" ? "Generating suggestions..." : "Propositions en cours...")
                : (locale === "en" ? "Suggest missing details with AI" : "Compléter les champs vides avec l’IA")}
            </button>
          </div>

          {aiSuggestions && (
            <section aria-live="polite" className="space-y-2 rounded-xl border border-purple-500/30 bg-purple-950/20 p-3 text-xs">
              <h4 className="font-semibold text-purple-200">{locale === "en" ? "AI suggestions — choose what to apply" : "Propositions IA — choisissez celles à appliquer"}</h4>
              {typeof aiSuggestions.error === "string" && <p role="alert" className="text-rose-300">{aiSuggestions.error}</p>}
              {Object.entries(suggestionLabels).map(([field, label]) => {
                const suggestion = aiSuggestions[field];
                if (typeof suggestion !== "string" || !suggestion.trim()) return null;
                return (
                  <div key={field} className="flex flex-col gap-2 rounded-lg border border-slate-700 bg-slate-950/80 p-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-slate-200"><span className="font-semibold text-slate-400">{label} :</span> {suggestion}</p>
                    <button
                      type="button"
                      onClick={() => applySuggestion(field, suggestion)}
                      className="shrink-0 rounded-lg bg-purple-700 px-2.5 py-1.5 font-medium text-white hover:bg-purple-600"
                    >
                      {locale === "en" ? "Apply" : "Appliquer"}
                    </button>
                  </div>
                );
              })}
              {Object.keys(suggestionLabels).every((field) => typeof aiSuggestions[field] !== "string" || !aiSuggestions[field].trim()) &&
                !aiSuggestions.error && <p className="text-slate-400">{locale === "en" ? "No usable suggestions were returned." : "Aucune proposition exploitable n’a été renvoyée."}</p>}
            </section>
          )}

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Nom complet du personnage</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Éléonore Vaneau"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Rôle dans le roman</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Protagoniste">Protagoniste (Héros)</option>
                  <option value="Antagoniste">Antagoniste (Opposant)</option>
                  <option value="Allié / Deutéragoniste">Allié / Ami proche</option>
                  <option value="Mentor">Mentor / Guide</option>
                  <option value="Déclencheur">Catalyseur / Déclencheur</option>
                  <option value="Secondaire">Personnage Secondaire</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Couleur repère</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                  />
                  <span className="text-slate-400 font-mono text-[11px]">{color}</span>
                </div>
              </div>
            </div>

            <fieldset className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
              <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-sky-300">Repères physiques (facultatifs)</legend>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <label className="text-slate-400">Yeux
                  <input value={eyeColor} onChange={(e) => setEyeColor(e.target.value)} placeholder="Ex. noisette" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-white" />
                </label>
                <label className="text-slate-400">Cheveux
                  <input value={hairColor} onChange={(e) => setHairColor(e.target.value)} placeholder="Ex. noirs, bouclés" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-white" />
                </label>
                <label className="text-slate-400">Taille
                  <input value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Ex. 1,72 m" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-white" />
                </label>
                <label className="text-slate-400">Particularité physique
                  <input value={physicalParticularity} onChange={(e) => setPhysicalParticularity(e.target.value)} placeholder="Ex. cicatrice, tatouage…" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-white" />
                </label>
                <label className="text-slate-400">Âge
                  <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="Ex. 28 ans" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-white" />
                </label>
                <label className="text-slate-400">Date de naissance
                  <input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} placeholder="Ex. 12 avril" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-white" />
                </label>
              </div>
            </fieldset>

            {/* Core Psychology Box (Desire vs Need vs Flaw) */}
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-emerald-400 block uppercase tracking-wider">
                Le Cœur Psychologique (Ce qui crée l&apos;empathie et la tension)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    🎯 Le Désir Conscient (Ce qu&apos;il croit vouloir à tout prix)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="ex: Récupérer l'héritage de sa mère, venger son mentor, décrocher la promotion..."
                    value={consciousDesire}
                    onChange={(e) => setConsciousDesire(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    🌱 Le Besoin Inconscient (Ce dont il a réellement besoin pour grandir)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="ex: Réapprendre à faire confiance, admettre qu'il n'est pas responsable de la tragédie..."
                    value={unconsciousNeed}
                    onChange={(e) => setUnconsciousNeed(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  💔 La Faille Centrale / Le Mensonge intérieur (The Lie he believes)
                </label>
                <input
                  type="text"
                  placeholder="ex: « Si je montre ma faiblesse, les gens m'abandonneront. »"
                  value={lieOrFlaw}
                  onChange={(e) => setLieOrFlaw(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Obstacles Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">
                  🛑 Obstacles Extérieurs (Antagonistes, nature, temps...)
                </label>
                <textarea
                  rows={2}
                  placeholder="ex: La police qui le traque, une montre arrêtée qui annonce sa perte..."
                  value={externalObstacles}
                  onChange={(e) => setExternalObstacles(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  🌪️ Obstacles Intérieurs (Peurs, culpabilité, doutes...)
                </label>
                <textarea
                  rows={2}
                  placeholder="ex: L'angoisse panique des lieux clos, le refus d'écouter les conseils..."
                  value={internalObstacles}
                  onChange={(e) => setInternalObstacles(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Détail saillant / Voix & Tics</label>
                <input
                  type="text"
                  placeholder="ex: Parle toujours à voix basse, fait tourner son alliance quand il ment..."
                  value={distinguishingFeatures}
                  onChange={(e) => setDistinguishingFeatures(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Relations clés avec les autres</label>
                <input
                  type="text"
                  placeholder="ex: Dévoué envers Thomas mais méfiant à l'extrême envers Silas"
                  value={relationships}
                  onChange={(e) => setRelationships(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsCreating(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                {editingChar ? "Mettre à jour le personnage" : "Enregistrer le personnage"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Characters List Grid */}
      {characters.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-400">
          <p className="font-medium text-slate-300">Aucun personnage défini pour le moment</p>
          <p className="text-xs mt-1">
            Donnez vie à votre protagoniste avec un désir clair et une faille qui le rend humain !
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {characters.map((char) => (
            <div
              key={char.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group space-y-4"
            >
              <div>
                {/* Character Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: char.color || "#0ea5e9" }}
                    />
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">{char.name}</h3>
                      <span className="text-[11px] text-slate-400 font-medium">{char.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleEdit(char)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(char.id)}
                      className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Desire vs Need Grid */}
                <div className="mt-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                  {char.consciousDesire && (
                    <div>
                      <span className="text-amber-300 font-semibold block text-[11px]">🎯 Désir Conscient :</span>
                      <p className="text-slate-300 mt-0.5">{char.consciousDesire}</p>
                    </div>
                  )}

                  {char.unconsciousNeed && (
                    <div>
                      <span className="text-emerald-300 font-semibold block text-[11px]">🌱 Besoin Inconscient :</span>
                      <p className="text-slate-300 mt-0.5">{char.unconsciousNeed}</p>
                    </div>
                  )}

                  {char.lieOrFlaw && (
                    <div>
                      <span className="text-rose-300 font-semibold block text-[11px]">💔 Faille / Le Mensonge :</span>
                      <p className="text-slate-300 italic mt-0.5">&laquo; {char.lieOrFlaw} &raquo;</p>
                    </div>
                  )}
                </div>

                {/* Obstacles & Details */}
                {(char.externalObstacles || char.internalObstacles) && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                    {char.externalObstacles && (
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 font-semibold block">Obstacles externes :</span>
                        <span className="text-slate-300">{char.externalObstacles}</span>
                      </div>
                    )}
                    {char.internalObstacles && (
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 font-semibold block">Obstacles internes :</span>
                        <span className="text-slate-300">{char.internalObstacles}</span>
                      </div>
                    )}
                  </div>
                )}

                {char.distinguishingFeatures && (
                  <p className="text-xs text-slate-400 mt-2 italic">
                    👁️ {char.distinguishingFeatures}
                  </p>
                )}
                {(char.eyeColor || char.hairColor || char.height || char.physicalParticularity || char.age || char.birthDate) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {[
                      ["Yeux", char.eyeColor],
                      ["Cheveux", char.hairColor],
                      ["Taille", char.height],
                      ["Particularité", char.physicalParticularity],
                      ["Âge", char.age],
                      ["Naissance", char.birthDate],
                    ].filter((entry) => entry[1]).map(([label, value]) => (
                      <span key={label} className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] text-slate-300">
                        <strong className="text-slate-400">{label} :</strong> {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {char.relationships && (
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <span className="text-slate-500 font-semibold">Dynamique relationnelle : </span>
                  {char.relationships}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <CharacterRelationsGraph
        projectId={projectId}
        characters={characters}
        relations={relations}
        onRefresh={onRefresh}
      />
    </div>
  );
}

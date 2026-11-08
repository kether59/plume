"use client";

import React, { useState } from "react";
import { Check, Eye, X } from "lucide-react";
import type { ExtractedCharacter, ExtractedTimelineEvent, ExtractedWorldNote, StoryExtractionResult } from "@/lib/story-extraction";

interface ChapterExtractionPanelProps {
  projectId: number;
  chapterId: number;
  result: StoryExtractionResult;
  characters: Array<{ id: number; name: string }>;
  worldNotes: Array<{ id: number; title: string }>;
  onRefresh: () => void;
  onClose: () => void;
}

async function postProposal(url: string, payload: Record<string, unknown>): Promise<{ id: number }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Impossible d’enregistrer la proposition.");
  return data as { id: number };
}

export function ChapterExtractionPanel({
  projectId,
  chapterId,
  result,
  characters,
  worldNotes,
  onRefresh,
  onClose,
}: ChapterExtractionPanelProps) {
  const [charactersDraft, setCharactersDraft] = useState(result.characters);
  const [placesDraft, setPlacesDraft] = useState(result.places);
  const [generalInfoDraft, setGeneralInfoDraft] = useState(result.generalInfo);
  const [eventsDraft, setEventsDraft] = useState(result.timelineEvents);
  const [savedCharacters, setSavedCharacters] = useState<number[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<number[]>([]);
  const [savedGeneralInfo, setSavedGeneralInfo] = useState<number[]>([]);
  const [savedEvents, setSavedEvents] = useState<number[]>([]);
  const [createdCharacters, setCreatedCharacters] = useState<Array<{ id: number; name: string }>>([]);
  const [createdNotes, setCreatedNotes] = useState<Array<{ id: number; title: string }>>([]);
  const [savingKey, setSavingKey] = useState("");
  const [error, setError] = useState("");

  const updateCharacter = (index: number, field: keyof ExtractedCharacter, value: string) => {
    setCharactersDraft((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };
  const updateNote = (type: "places" | "generalInfo", index: number, field: keyof ExtractedWorldNote, value: string) => {
    const update = (items: ExtractedWorldNote[]) =>
      items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item);
    if (type === "places") setPlacesDraft(update);
    else setGeneralInfoDraft(update);
  };
  const updateEvent = (index: number, field: keyof ExtractedTimelineEvent, value: string) => {
    setEventsDraft((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };

  const saveCharacter = async (item: ExtractedCharacter, index: number) => {
    setSavingKey(`character-${index}`);
    setError("");
    try {
      const created = await postProposal("/api/characters", {
        projectId,
        name: item.name.trim(),
        role: item.role,
        consciousDesire: item.consciousDesire,
        unconsciousNeed: item.unconsciousNeed,
        lieOrFlaw: item.lieOrFlaw,
        distinguishingFeatures: item.distinguishingFeatures,
        notes: item.notes,
      });
      setCreatedCharacters((items) => [...items, { id: created.id, name: item.name.trim() }]);
      setSavedCharacters((saved) => [...saved, index]);
      onRefresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Impossible d’enregistrer le personnage.");
    } finally {
      setSavingKey("");
    }
  };

  const saveNote = async (item: ExtractedWorldNote, index: number, type: "places" | "generalInfo") => {
    const key = `${type}-${index}`;
    setSavingKey(key);
    setError("");
    try {
      const created = await postProposal("/api/world-notes", {
        projectId,
        title: item.title.trim(),
        category: type === "places" ? "lieux" : item.category || "lore",
        content: item.content,
        tags: type === "places" ? "lieu, extrait d’un chapitre" : "extrait d’un chapitre",
      });
      setCreatedNotes((items) => [...items, { id: created.id, title: item.title.trim() }]);
      if (type === "places") setSavedPlaces((saved) => [...saved, index]);
      else setSavedGeneralInfo((saved) => [...saved, index]);
      onRefresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Impossible d’enregistrer la fiche.");
    } finally {
      setSavingKey("");
    }
  };

  const saveEvent = async (item: ExtractedTimelineEvent, index: number) => {
    setSavingKey(`event-${index}`);
    setError("");
    try {
      const characterIds = item.characterNames.flatMap((name) => {
        const character = characters.find((entry) => entry.name.toLocaleLowerCase() === name.toLocaleLowerCase())
          || createdCharacters.find((entry) => entry.name.toLocaleLowerCase() === name.toLocaleLowerCase());
        return character ? [character.id] : [];
      });
      const worldNoteIds = item.worldNoteTitles.flatMap((title) => {
        const note = worldNotes.find((entry) => entry.title.toLocaleLowerCase() === title.toLocaleLowerCase())
          || createdNotes.find((entry) => entry.title.toLocaleLowerCase() === title.toLocaleLowerCase());
        return note ? [note.id] : [];
      });
      await postProposal("/api/timeline-events", {
        projectId,
        chapterId,
        title: item.title.trim(),
        description: item.description,
        timeLabel: item.timeLabel,
        characterIds,
        worldNoteIds,
      });
      setSavedEvents((saved) => [...saved, index]);
      onRefresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Impossible d’ajouter l’événement à la frise.");
    } finally {
      setSavingKey("");
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-indigo-500/40 bg-indigo-950/30 p-4 text-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-bold text-indigo-200">
            <Eye className="h-4 w-4 text-indigo-300" />
            Propositions extraites — à relire avant enregistrement
          </h3>
          <p className="mt-1 text-slate-400">L’IA ne modifie rien sans votre validation. Corrigez les propositions puis ajoutez-les séparément aux fiches ou à la frise.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Fermer les propositions" className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      {result.note && <p className="rounded-lg border border-amber-700/40 bg-amber-950/30 p-2.5 text-amber-200">{result.note}</p>}
      {error && <p role="alert" className="rounded-lg border border-rose-700/50 bg-rose-950/40 p-2.5 text-rose-200">{error}</p>}

      {charactersDraft.length === 0 && placesDraft.length === 0 && generalInfoDraft.length === 0 && eventsDraft.length === 0 ? (
        <p className="rounded-lg bg-slate-900/80 p-3 text-slate-300">Aucun élément des catégories demandées n’a été proposé pour ce chapitre.</p>
      ) : (
        <div className="space-y-4">
          {charactersDraft.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sky-200">Personnages</h4>
              {charactersDraft.map((item, index) => {
                const exists = characters.some((character) => character.name.toLocaleLowerCase() === item.name.trim().toLocaleLowerCase());
                const isSaved = exists || savedCharacters.includes(index);
                return (
                  <article key={`character-${index}`} className="space-y-2 rounded-xl border border-slate-700 bg-slate-900/80 p-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="text-slate-400">Nom
                        <input value={item.name} onChange={(e) => updateCharacter(index, "name", e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white" />
                      </label>
                      <label className="text-slate-400">Rôle
                        <input value={item.role} onChange={(e) => updateCharacter(index, "role", e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white" />
                      </label>
                    </div>
                    <label className="block text-slate-400">Indices ou description tirés du chapitre
                      <textarea value={item.notes} onChange={(e) => updateCharacter(index, "notes", e.target.value)} rows={2} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white" />
                    </label>
                    <details>
                      <summary className="cursor-pointer text-indigo-300">Compléter la psychologie (facultatif)</summary>
                      <div className="mt-2 grid gap-2 sm:grid-cols-3">
                        <input aria-label="Désir conscient" placeholder="Désir conscient" value={item.consciousDesire} onChange={(e) => updateCharacter(index, "consciousDesire", e.target.value)} className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white" />
                        <input aria-label="Besoin inconscient" placeholder="Besoin inconscient" value={item.unconsciousNeed} onChange={(e) => updateCharacter(index, "unconsciousNeed", e.target.value)} className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white" />
                        <input aria-label="Faille" placeholder="Faille" value={item.lieOrFlaw} onChange={(e) => updateCharacter(index, "lieOrFlaw", e.target.value)} className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white" />
                      </div>
                    </details>
                    {isSaved ? <span className="inline-flex items-center gap-1 text-emerald-300"><Check className="h-3.5 w-3.5" /> {exists ? "Déjà dans les personnages" : "Ajouté"}</span> : (
                      <button type="button" disabled={!item.name.trim() || Boolean(savingKey)} onClick={() => saveCharacter(item, index)} className="rounded-lg bg-sky-700 px-3 py-1.5 font-medium text-white disabled:opacity-50">
                        {savingKey === `character-${index}` ? "Ajout…" : "Ajouter le personnage"}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {placesDraft.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-emerald-200">Lieux</h4>
              {placesDraft.map((item, index) => {
                const exists = worldNotes.some((note) => note.title.toLocaleLowerCase() === item.title.trim().toLocaleLowerCase());
                const isSaved = exists || savedPlaces.includes(index);
                return (
                  <article key={`place-${index}`} className="space-y-2 rounded-xl border border-slate-700 bg-slate-900/80 p-3">
                    <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
                      <label className="text-slate-400">Titre
                        <input value={item.title} onChange={(e) => updateNote("places", index, "title", e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white" />
                      </label>
                      <span className="self-end rounded bg-emerald-950 px-2.5 py-2 text-emerald-200">Lieu</span>
                    </div>
                    <label className="block text-slate-400">Description
                      <textarea value={item.content} onChange={(e) => updateNote("places", index, "content", e.target.value)} rows={2} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white" />
                    </label>
                    {isSaved ? <span className="inline-flex items-center gap-1 text-emerald-300"><Check className="h-3.5 w-3.5" /> {exists ? "Déjà dans les fiches" : "Ajoutée"}</span> : (
                      <button type="button" disabled={!item.title.trim() || Boolean(savingKey)} onClick={() => saveNote(item, index, "places")} className="rounded-lg bg-emerald-700 px-3 py-1.5 font-medium text-white disabled:opacity-50">
                        {savingKey === `places-${index}` ? "Ajout…" : "Ajouter le lieu"}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {generalInfoDraft.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-teal-200">Informations générales</h4>
              {generalInfoDraft.map((item, index) => {
                const exists = worldNotes.some((note) => note.title.toLocaleLowerCase() === item.title.trim().toLocaleLowerCase());
                const isSaved = exists || savedGeneralInfo.includes(index);
                return (
                  <article key={`general-info-${index}`} className="space-y-2 rounded-xl border border-slate-700 bg-slate-900/80 p-3">
                    <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
                      <label className="text-slate-400">Titre
                        <input value={item.title} onChange={(e) => updateNote("generalInfo", index, "title", e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white" />
                      </label>
                      <label className="text-slate-400">Catégorie
                        <select value={item.category} onChange={(e) => updateNote("generalInfo", index, "category", e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white">
                          <option value="lore">Information générale</option><option value="epoque">Époque</option><option value="magie_techno">Magie / technologie</option><option value="societe">Société</option><option value="regles">Règle</option>
                        </select>
                      </label>
                    </div>
                    <label className="block text-slate-400">Information tirée du chapitre
                      <textarea value={item.content} onChange={(e) => updateNote("generalInfo", index, "content", e.target.value)} rows={2} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white" />
                    </label>
                    {isSaved ? <span className="inline-flex items-center gap-1 text-emerald-300"><Check className="h-3.5 w-3.5" /> {exists ? "Déjà dans les fiches" : "Ajoutée"}</span> : (
                      <button type="button" disabled={!item.title.trim() || Boolean(savingKey)} onClick={() => saveNote(item, index, "generalInfo")} className="rounded-lg bg-teal-700 px-3 py-1.5 font-medium text-white disabled:opacity-50">
                        {savingKey === `generalInfo-${index}` ? "Ajout…" : "Ajouter l’information"}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {eventsDraft.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-amber-200">Événements de la frise</h4>
              {eventsDraft.map((item, index) => {
                const linkedCharacters = item.characterNames.filter((name) =>
                  characters.some((character) => character.name.toLocaleLowerCase() === name.toLocaleLowerCase())
                  || createdCharacters.some((character) => character.name.toLocaleLowerCase() === name.toLocaleLowerCase()),
                );
                const linkedNotes = item.worldNoteTitles.filter((title) =>
                  worldNotes.some((note) => note.title.toLocaleLowerCase() === title.toLocaleLowerCase())
                  || createdNotes.some((note) => note.title.toLocaleLowerCase() === title.toLocaleLowerCase()),
                );
                return (
                  <article key={`event-${index}`} className="space-y-2 rounded-xl border border-slate-700 bg-slate-900/80 p-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input aria-label="Titre de l’événement" value={item.title} onChange={(e) => updateEvent(index, "title", e.target.value)} className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white" />
                      <input aria-label="Repère temporel" placeholder="Repère temporel" value={item.timeLabel} onChange={(e) => updateEvent(index, "timeLabel", e.target.value)} className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white" />
                    </div>
                    <textarea aria-label="Description de l’événement" rows={2} value={item.description} onChange={(e) => updateEvent(index, "description", e.target.value)} className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white" />
                    <p className="text-[11px] text-slate-400">
                      Liens détectés : {linkedCharacters.length ? linkedCharacters.join(", ") : "aucun personnage existant"} · {linkedNotes.length ? linkedNotes.join(", ") : "aucune fiche existante"}
                      {(linkedCharacters.length !== item.characterNames.length || linkedNotes.length !== item.worldNoteTitles.length) && " (ajoutez d’abord les éléments proposés pour les lier automatiquement)"}
                    </p>
                    {savedEvents.includes(index) ? <span className="inline-flex items-center gap-1 text-emerald-300"><Check className="h-3.5 w-3.5" /> Ajouté à la frise</span> : (
                      <button type="button" disabled={!item.title.trim() || Boolean(savingKey)} onClick={() => saveEvent(item, index)} className="rounded-lg bg-amber-700 px-3 py-1.5 font-medium text-white disabled:opacity-50">
                        {savingKey === `event-${index}` ? "Ajout…" : "Ajouter l’événement à la frise"}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

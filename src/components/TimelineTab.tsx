"use client";

import React, { useState } from "react";
import { ArrowDown, ArrowUp, Clock3, Link2, Pencil, Plus, Trash2 } from "lucide-react";

interface TimelineEvent {
  id: number;
  title: string;
  description: string;
  timeLabel: string;
  orderIndex: number;
  chapterId: number | null;
  characterIds: number[];
  worldNoteIds: number[];
}

interface TimelineTabProps {
  projectId: number;
  events: TimelineEvent[];
  chapters: Array<{ id: number; title: string }>;
  characters: Array<{ id: number; name: string }>;
  worldNotes: Array<{ id: number; title: string }>;
  onRefresh: () => void;
}

export function TimelineTab({ projectId, events, chapters, characters, worldNotes, onRefresh }: TimelineTabProps) {
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLabel, setTimeLabel] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [characterIds, setCharacterIds] = useState<number[]>([]);
  const [worldNoteIds, setWorldNoteIds] = useState<number[]>([]);
  const [showForm, setShowForm] = useState(events.length === 0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const orderedEvents = [...events].sort((a, b) => a.orderIndex - b.orderIndex || a.id - b.id);

  const resetForm = () => {
    setEditingEvent(null);
    setShowForm(false);
    setTitle("");
    setDescription("");
    setTimeLabel("");
    setChapterId("");
    setCharacterIds([]);
    setWorldNoteIds([]);
  };

  const startEditing = (event: TimelineEvent) => {
    setEditingEvent(event);
    setShowForm(true);
    setTitle(event.title);
    setDescription(event.description || "");
    setTimeLabel(event.timeLabel || "");
    setChapterId(event.chapterId ? String(event.chapterId) : "");
    setCharacterIds(event.characterIds || []);
    setWorldNoteIds(event.worldNoteIds || []);
    setError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSaving(true);
    setError("");
    try {
      const res = await fetch(editingEvent ? `/api/timeline-events/${editingEvent.id}` : "/api/timeline-events", {
        method: editingEvent ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: title.trim(),
          description,
          timeLabel,
          chapterId: chapterId ? Number(chapterId) : null,
          characterIds,
          worldNoteIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impossible d’enregistrer l’événement.");
      resetForm();
      onRefresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Impossible d’enregistrer l’événement.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleId = (id: number, selected: number[], setSelected: (ids: number[]) => void) => {
    setSelected(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  };

  const moveEvent = async (event: TimelineEvent, direction: -1 | 1) => {
    const index = orderedEvents.findIndex((item) => item.id === event.id);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= orderedEvents.length) return;

    const reordered = [...orderedEvents];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    try {
      const responses = await Promise.all(reordered.map((item, position) =>
        fetch(`/api/timeline-events/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderIndex: (position + 1) * 10 }),
        }),
      ));
      if (responses.some((res) => !res.ok)) throw new Error("Impossible de réordonner la frise.");
      setError("");
      onRefresh();
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : "Impossible de réordonner la frise.");
    }
  };

  const deleteEvent = async (event: TimelineEvent) => {
    if (!window.confirm(`Supprimer « ${event.title} » de la frise ?`)) return;
    try {
      const res = await fetch(`/api/timeline-events/${event.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Impossible de supprimer l’événement.");
      }
      onRefresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Impossible de supprimer l’événement.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-900 p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-indigo-100">
              <Clock3 className="h-5 w-5 text-indigo-300" />
              Frise chronologique de l’histoire
            </h2>
            <p className="mt-1 max-w-2xl text-xs text-slate-400">
              Les événements proposés pendant l’analyse d’un chapitre peuvent être relus ici, réordonnés et reliés aux fiches et aux personnages.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { resetForm(); setShowForm(true); setError(""); }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Nouvel événement
          </button>
        </div>
      </header>

      {error && <p role="alert" className="rounded-lg border border-rose-700/50 bg-rose-950/40 p-3 text-xs text-rose-200">{error}</p>}

      {showForm && (
        <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
          <h3 className="text-sm font-semibold text-white">{editingEvent ? "Modifier l’événement" : "Ajouter un événement"}</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-xs text-slate-300">
              Événement
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                placeholder="Ex. La rencontre au vieux pont"
              />
            </label>
            <label className="text-xs text-slate-300">
              Repère temporel (date, époque ou ordre relatif)
              <input
                value={timeLabel}
                onChange={(e) => setTimeLabel(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                placeholder="Ex. Le lendemain, avant le chapitre 3"
              />
            </label>
          </div>
          <label className="block text-xs text-slate-300">
            Résumé
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              placeholder="Que se passe-t-il et quelles en sont les conséquences ?"
            />
          </label>
          <label className="block max-w-md text-xs text-slate-300">
            Chapitre associé
            <select
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            >
              <option value="">Aucun chapitre</option>
              {chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.title}</option>)}
            </select>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <fieldset className="space-y-2">
              <legend className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Link2 className="h-3.5 w-3.5" /> Personnages liés
              </legend>
              {characters.length === 0 ? <p className="text-xs text-slate-500">Aucune fiche personnage pour le moment.</p> : characters.map((character) => (
                <label key={character.id} className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={characterIds.includes(character.id)}
                    onChange={() => toggleId(character.id, characterIds, setCharacterIds)}
                    className="accent-indigo-500"
                  />
                  {character.name}
                </label>
              ))}
            </fieldset>
            <fieldset className="space-y-2">
              <legend className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Link2 className="h-3.5 w-3.5" /> Fiches liées
              </legend>
              {worldNotes.length === 0 ? <p className="text-xs text-slate-500">Aucune fiche d’univers pour le moment.</p> : worldNotes.map((note) => (
                <label key={note.id} className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={worldNoteIds.includes(note.id)}
                    onChange={() => toggleId(note.id, worldNoteIds, setWorldNoteIds)}
                    className="accent-indigo-500"
                  />
                  {note.title}
                </label>
              ))}
            </fieldset>
          </div>
          <div className="flex justify-end gap-2">
            {editingEvent && <button type="button" onClick={resetForm} className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300">Annuler</button>}
            <button disabled={isSaving} type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
              {isSaving ? "Enregistrement…" : editingEvent ? "Enregistrer" : "Ajouter à la frise"}
            </button>
          </div>
        </form>
      )}

      {orderedEvents.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
          La frise est vide. Analysez un chapitre pour recevoir des propositions d’événements, ou ajoutez-en un manuellement.
        </p>
      ) : (
        <ol className="space-y-3">
          {orderedEvents.map((event, index) => {
            const linkedCharacters = characters.filter((character) => event.characterIds.includes(character.id));
            const linkedNotes = worldNotes.filter((note) => event.worldNoteIds.includes(note.id));
            const chapter = chapters.find((item) => item.id === event.chapterId);
            return (
              <li key={event.id} className="relative rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-indigo-500/40 bg-indigo-950 text-xs font-bold text-indigo-200">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <h3 className="font-semibold text-white">{event.title}</h3>
                      {event.timeLabel && <span className="text-xs text-indigo-300">{event.timeLabel}</span>}
                    </div>
                    {event.description && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{event.description}</p>}
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                      {chapter && <span className="rounded-full bg-slate-800 px-2.5 py-1 text-slate-300">{chapter.title}</span>}
                      {linkedCharacters.map((character) => <span key={character.id} className="rounded-full bg-sky-950/70 px-2.5 py-1 text-sky-200">♟ {character.name}</span>)}
                      {linkedNotes.map((note) => <span key={note.id} className="rounded-full bg-emerald-950/70 px-2.5 py-1 text-emerald-200">▤ {note.title}</span>)}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" aria-label="Monter l’événement" disabled={index === 0} onClick={() => moveEvent(event, -1)} className="rounded p-1.5 text-slate-400 hover:bg-slate-800 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" aria-label="Descendre l’événement" disabled={index === orderedEvents.length - 1} onClick={() => moveEvent(event, 1)} className="rounded p-1.5 text-slate-400 hover:bg-slate-800 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                    <button type="button" aria-label="Modifier l’événement" onClick={() => startEditing(event)} className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"><Pencil className="h-4 w-4" /></button>
                    <button type="button" aria-label="Supprimer l’événement" onClick={() => deleteEvent(event)} className="rounded p-1.5 text-slate-400 hover:bg-rose-950 hover:text-rose-200"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

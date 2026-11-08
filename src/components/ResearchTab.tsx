"use client";

import React, { useState } from "react";
import { Plus, Sparkles, BookOpen, Trash2, Edit3, Tag, Globe, Wand2, Compass, ShieldAlert } from "lucide-react";

interface ResearchTabProps {
  projectId: number;
  worldNotes: any[];
  onRefresh: () => void;
  project: any;
}

const CATEGORIES = [
  { id: "all", label: "Toutes les notes" },
  { id: "lore", label: "Univers & Lore" },
  { id: "magie_techno", label: "Règles & Pouvoirs" },
  { id: "epoque", label: "Époque & Décors" },
  { id: "societe", label: "Société & Factions" },
  { id: "inspiration", label: "Inspirations & Thèmes" },
];

export function ResearchTab({ projectId, worldNotes, onRefresh, project }: ResearchTabProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("lore");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const filteredNotes = selectedCategory === "all"
    ? worldNotes
    : worldNotes.filter((n) => n.category === selectedCategory);

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (editingId) {
      await fetch(`/api/world-notes/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          content: newContent,
          tags: newTags,
        }),
      });
      setEditingId(null);
    } else {
      await fetch("/api/world-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: newTitle,
          category: newCategory,
          content: newContent,
          tags: newTags,
        }),
      });
    }

    setNewTitle("");
    setNewContent("");
    setNewTags("");
    setIsCreating(false);
    onRefresh();
  };

  const handleEdit = (note: any) => {
    setEditingId(note.id);
    setNewTitle(note.title);
    setNewCategory(note.category);
    setNewContent(note.content);
    setNewTags(note.tags || "");
    setIsCreating(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette note de recherche ?")) return;
    await fetch(`/api/world-notes/${id}`, { method: "DELETE" });
    onRefresh();
  };

  const handleAiBrainstorm = async () => {
    setIsAiGenerating(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "unblock",
          projectId,
          text: `Brainstorm de recherche d'univers pour: ${project.title}. Genre: ${project.genre}. Synopsis: ${project.synopsis}`,
        }),
      });
      const data = await res.json();
      if (data.result) {
        try {
          const parsed = JSON.parse(data.result);
          if (Array.isArray(parsed)) {
            setAiSuggestions(parsed.map((p) => `${p.title} : ${p.description}`));
          } else {
            setAiSuggestions([data.result]);
          }
        } catch {
          setAiSuggestions([data.result]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Beginner Welcome Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
              <BookOpen className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-amber-100">Étape 1 : Le Chaudron d&apos;Inspirations & de Documentation</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Rassemblez vos intuitions, l&apos;ambiance de l&apos;époque et les règles singulières de votre monde.
          </p>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-amber-300/80 bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-800/40 w-fit">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Conseil débutant : Ne tombez pas dans le piège de la documentation infinie ! 3 à 5 fiches suffisent pour commencer à écrire.</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleAiBrainstorm}
            disabled={isAiGenerating}
            className="px-3.5 py-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-medium transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            {isAiGenerating ? "Brainstorm en cours..." : "Idées d'univers IA"}
          </button>

          <button
            onClick={() => {
              setEditingId(null);
              setNewTitle("");
              setNewContent("");
              setNewTags("");
              setIsCreating(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-md shadow-amber-600/20"
          >
            <Plus className="w-4 h-4" />
            Nouvelle fiche
          </button>
        </div>
      </div>

      {/* AI brainstorm popout */}
      {aiSuggestions.length > 0 && (
        <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Pistes créatives soufflées par l&apos;IA :
            </span>
            <button onClick={() => setAiSuggestions([])} className="text-slate-400 hover:text-white">Fermer</button>
          </div>
          <div className="space-y-1.5">
            {aiSuggestions.map((s, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-900/80 border border-purple-800/30 text-slate-300 flex justify-between items-center gap-2">
                <span>{s}</span>
                <button
                  onClick={() => {
                    setNewTitle(`Inspiration IA #${idx + 1}`);
                    setNewContent(s);
                    setNewCategory("inspiration");
                    setIsCreating(true);
                  }}
                  className="px-2 py-1 bg-purple-600/30 hover:bg-purple-600 text-purple-200 rounded text-[10px] shrink-0"
                >
                  Ajouter en fiche
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl transition font-medium ${
              selectedCategory === cat.id
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Creation / Edit Form Modal or Inline */}
      {isCreating && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/40 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-amber-200">
            {editingId ? "Modifier la fiche" : "Ajouter une nouvelle fiche au Chaudron"}
          </h3>
          <form onSubmit={handleSaveNote} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Titre de la note ou de l&apos;élément</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Les lois de la magie temporelle, Le port de Brume..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Catégorie</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="lore">Univers & Lore</option>
                  <option value="magie_techno">Règles & Pouvoirs</option>
                  <option value="epoque">Époque & Décors</option>
                  <option value="societe">Société & Factions</option>
                  <option value="inspiration">Inspirations & Thèmes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Détails, règles ou notes d&apos;ambiance</label>
              <textarea
                rows={4}
                required
                placeholder="Décrivez cet élément avec des détails sensoriels concrets (odeurs, sons, lois physiques, interdits moraux)..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Mots-clés (séparés par des virgules)</label>
              <input
                type="text"
                placeholder="ex: magie, secret, paris, 1898"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
              />
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
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium"
              >
                {editingId ? "Mettre à jour" : "Sauvegarder dans le Chaudron"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Notes */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-400 space-y-2">
          <Globe className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="font-medium text-slate-300">Aucune fiche dans cette catégorie pour le moment</p>
          <p className="text-xs max-w-sm mx-auto">
            Créez votre première fiche d&apos;univers ou cliquez sur « Idées d&apos;univers IA » pour recevoir des suggestions adaptées à votre synopsis.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {CATEGORIES.find((c) => c.id === note.category)?.label || note.category}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleEdit(note)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-white text-sm mt-2">{note.title}</h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-4 leading-relaxed font-novel">
                  {note.content}
                </p>
              </div>

              {note.tags && (
                <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800/80">
                  {note.tags.split(",").map((t: string, i: number) => (
                    <span key={i} className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Tag className="w-2.5 h-2.5 text-slate-500" />
                      {t.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

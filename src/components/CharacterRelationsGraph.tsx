"use client";

import React, { useMemo, useState } from "react";
import { Network, Plus, Trash2 } from "lucide-react";

interface CharacterSummary {
  id: number;
  name: string;
  color?: string | null;
}

interface CharacterRelation {
  id: number;
  sourceCharacterId: number;
  targetCharacterId: number;
  relationType: string;
  description?: string | null;
}

const relationLabels: Record<string, string> = {
  friend: "Amie / Ami",
  enemy: "Ennemi",
  married: "Marié·e",
  lover: "Amant·e",
  family: "Famille",
  ally: "Allié·e",
  mentor: "Mentor",
  rival: "Rival·e",
  other: "Autre",
};

const relationColors: Record<string, string> = {
  friend: "#34d399",
  enemy: "#fb7185",
  married: "#f472b6",
  lover: "#c084fc",
  family: "#fbbf24",
  ally: "#38bdf8",
  mentor: "#a3e635",
  rival: "#fb923c",
  other: "#94a3b8",
};

const relationTypes = Object.entries(relationLabels);

interface CharacterRelationsGraphProps {
  projectId: number;
  characters: CharacterSummary[];
  relations: CharacterRelation[];
  onRefresh: () => void;
}

export function CharacterRelationsGraph({
  projectId,
  characters,
  relations,
  onRefresh,
}: CharacterRelationsGraphProps) {
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [relationType, setRelationType] = useState("friend");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const points = useMemo(() => {
    const centerX = 400;
    const centerY = 205;
    const radiusX = 285;
    const radiusY = 145;
    return characters.map((character, index) => {
      const angle = (2 * Math.PI * index) / Math.max(characters.length, 1) - Math.PI / 2;
      return {
        ...character,
        x: centerX + radiusX * Math.cos(angle),
        y: centerY + radiusY * Math.sin(angle),
      };
    });
  }, [characters]);
  const pointsById = new Map(points.map((point) => [point.id, point]));

  const addRelation = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/character-relations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          sourceCharacterId: Number(sourceId),
          targetCharacterId: Number(targetId),
          relationType,
          description,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible d’ajouter la relation.");
      setDescription("");
      onRefresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Impossible d’ajouter la relation.");
    } finally {
      setSaving(false);
    }
  };

  const removeRelation = async (id: number) => {
    setError("");
    try {
      const response = await fetch(`/api/character-relations/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible de supprimer la relation.");
      onRefresh();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Impossible de supprimer la relation.");
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-indigo-500/30 bg-slate-900/70 p-4">
      <div className="flex items-center gap-2">
        <Network className="h-4 w-4 text-indigo-300" />
        <h3 className="text-sm font-bold text-indigo-100">Relations entre personnages</h3>
      </div>
      {characters.length < 2 ? (
        <p className="text-xs text-slate-400">Ajoutez au moins deux personnages pour créer une relation.</p>
      ) : (
        <form onSubmit={addRelation} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.2fr_auto]">
          <label className="text-[11px] text-slate-400">Personnage
            <select required value={sourceId} onChange={(event) => setSourceId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-white">
              <option value="">Choisir…</option>
              {characters.map((character) => <option key={character.id} value={character.id}>{character.name}</option>)}
            </select>
          </label>
          <label className="text-[11px] text-slate-400">Relation
            <select value={relationType} onChange={(event) => setRelationType(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-white">
              {relationTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="text-[11px] text-slate-400">Avec
            <select required value={targetId} onChange={(event) => setTargetId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-white">
              <option value="">Choisir…</option>
              {characters.filter((character) => String(character.id) !== sourceId).map((character) => (
                <option key={character.id} value={character.id}>{character.name}</option>
              ))}
            </select>
          </label>
          <label className="text-[11px] text-slate-400">Précision (facultatif)
            <input value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-white" placeholder="Ex. amis d’enfance" />
          </label>
          <button type="submit" disabled={saving} className="self-end rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
            <Plus className="mr-1 inline h-3.5 w-3.5" />Ajouter
          </button>
        </form>
      )}
      {error && <p role="alert" className="rounded-lg border border-rose-700/50 bg-rose-950/40 p-2 text-xs text-rose-200">{error}</p>}

      {characters.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <svg viewBox="0 0 800 410" role="img" aria-label="Graphe des relations entre personnages" className="mx-auto min-w-[640px]">
            {relations.map((relation) => {
              const from = pointsById.get(relation.sourceCharacterId);
              const to = pointsById.get(relation.targetCharacterId);
              if (!from || !to) return null;
              const color = relationColors[relation.relationType] || relationColors.other;
              return (
                <g key={relation.id}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth="2" opacity="0.8" />
                  <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 7} textAnchor="middle" fill={color} fontSize="12">
                    {relationLabels[relation.relationType] || relation.relationType}
                  </text>
                </g>
              );
            })}
            {points.map((point) => (
              <g key={point.id}>
                <circle cx={point.x} cy={point.y} r="29" fill={point.color || "#4f46e5"} stroke="#e2e8f0" strokeWidth="2" />
                <text x={point.x} y={point.y + 46} textAnchor="middle" fill="#e2e8f0" fontSize="12">
                  {point.name.length > 22 ? `${point.name.slice(0, 20)}…` : point.name}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}

      {relations.length > 0 && (
        <ul className="space-y-1">
          {relations.map((relation) => {
            const source = characters.find((character) => character.id === relation.sourceCharacterId);
            const target = characters.find((character) => character.id === relation.targetCharacterId);
            return (
              <li key={relation.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-950/70 px-3 py-2 text-xs">
                <span className="text-slate-300">
                  <strong className="text-white">{source?.name || "Personnage supprimé"}</strong>
                  {" — "}<span style={{ color: relationColors[relation.relationType] || relationColors.other }}>
                    {relationLabels[relation.relationType] || relation.relationType}
                  </span>{" — "}<strong className="text-white">{target?.name || "Personnage supprimé"}</strong>
                  {relation.description && <span className="text-slate-500"> · {relation.description}</span>}
                </span>
                <button type="button" onClick={() => removeRelation(relation.id)} aria-label="Supprimer la relation" className="shrink-0 rounded p-1 text-rose-400 hover:bg-slate-800">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {relations.length === 0 && characters.length >= 2 && (
        <p className="text-xs text-slate-500">Aucune relation enregistrée pour le moment.</p>
      )}
    </section>
  );
}

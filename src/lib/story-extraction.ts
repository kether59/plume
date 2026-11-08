export interface ExtractedCharacter {
  name: string;
  role: string;
  consciousDesire: string;
  unconsciousNeed: string;
  lieOrFlaw: string;
  distinguishingFeatures: string;
  notes: string;
}

export interface ExtractedWorldNote {
  title: string;
  category: string;
  content: string;
}

export type ExtractionType = "characters" | "places" | "events" | "generalInfo";

export interface ExtractedTimelineEvent {
  title: string;
  description: string;
  timeLabel: string;
  characterNames: string[];
  worldNoteTitles: string[];
}

export interface StoryExtractionResult {
  characters: ExtractedCharacter[];
  places: ExtractedWorldNote[];
  timelineEvents: ExtractedTimelineEvent[];
  generalInfo: ExtractedWorldNote[];
  note?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asTextList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];
}

export function parseStoryExtraction(response: string, requestedTypes?: ExtractionType[]): StoryExtractionResult {
  const json = response.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const parsed: unknown = JSON.parse(json);

  if (!isRecord(parsed)) {
    throw new Error("La réponse d’extraction n’a pas le format attendu.");
  }

  const rawCharacters = Array.isArray(parsed.characters)
    ? parsed.characters
    : Array.isArray(parsed.charactersFound)
      ? parsed.charactersFound
      : [];
  const rawPlaces = Array.isArray(parsed.places) ? parsed.places : [];
  const rawGeneralInfo = Array.isArray(parsed.generalInfo) ? parsed.generalInfo : [];
  const legacyNotes = Array.isArray(parsed.worldNotes) ? parsed.worldNotes : [];
  const rawEvents = Array.isArray(parsed.timelineEvents) ? parsed.timelineEvents : [];
  const parseNotes = (items: unknown[], fallbackCategory: string): ExtractedWorldNote[] => items.flatMap((item) => {
    if (!isRecord(item) || !asText(item.title)) return [];
    return [{
      title: asText(item.title),
      category: asText(item.category) || fallbackCategory,
      content: asText(item.content) || asText(item.evidence),
    }];
  });
  const legacyParsedNotes = parseNotes(legacyNotes, "lore");
  const places = [
    ...parseNotes(rawPlaces, "lieux"),
    ...legacyParsedNotes.filter((note) => note.category === "lieux"),
  ];
  const generalInfo = [
    ...parseNotes(rawGeneralInfo, "lore"),
    ...legacyParsedNotes.filter((note) => note.category !== "lieux"),
  ];
  const selected = new Set(requestedTypes);

  return {
    characters: (!selected.size || selected.has("characters") ? rawCharacters : []).flatMap((item) => {
      const character = typeof item === "string" ? { name: item } : item;
      if (!isRecord(character) || !asText(character.name)) return [];
      return [{
        name: asText(character.name),
        role: asText(character.role) || "Secondaire",
        consciousDesire: asText(character.consciousDesire),
        unconsciousNeed: asText(character.unconsciousNeed),
        lieOrFlaw: asText(character.lieOrFlaw),
        distinguishingFeatures: asText(character.distinguishingFeatures),
        notes: asText(character.notes) || asText(character.evidence),
      }];
    }),
    places: !selected.size || selected.has("places") ? places : [],
    generalInfo: !selected.size || selected.has("generalInfo") ? generalInfo : [],
    timelineEvents: (!selected.size || selected.has("events") ? rawEvents : []).flatMap((item) => {
      if (!isRecord(item) || !asText(item.title)) return [];
      return [{
        title: asText(item.title),
        description: asText(item.description) || asText(item.evidence),
        timeLabel: asText(item.timeLabel),
        characterNames: asTextList(item.characterNames),
        worldNoteTitles: asTextList(item.worldNoteTitles),
      }];
    }),
    note: asText(parsed.note) || undefined,
  };
}

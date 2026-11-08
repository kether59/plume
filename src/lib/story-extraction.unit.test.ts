import { describe, expect, it } from "vitest";
import { parseStoryExtraction } from "./story-extraction";

describe("parseStoryExtraction", () => {
  it("parses fenced JSON and normalizes missing character fields", () => {
    const result = parseStoryExtraction('```json\n{"characters":[{"name":"Mina"}]}\n```');

    expect(result.characters).toEqual([{
      name: "Mina",
      role: "Secondaire",
      consciousDesire: "",
      unconsciousNeed: "",
      lieOrFlaw: "",
      distinguishingFeatures: "",
      notes: "",
    }]);
  });

  it("keeps only requested extraction categories", () => {
    const result = parseStoryExtraction(JSON.stringify({
      characters: [{ name: "Mina" }],
      places: [{ title: "La gare", content: "Lieu" }],
      timelineEvents: [{ title: "Départ", characterNames: ["Mina"] }],
      generalInfo: [{ title: "Règle", content: "La magie a un prix" }],
    }), ["places"]);

    expect(result.places).toHaveLength(1);
    expect(result.characters).toEqual([]);
    expect(result.timelineEvents).toEqual([]);
    expect(result.generalInfo).toEqual([]);
  });

  it("supports the legacy extraction shape", () => {
    const result = parseStoryExtraction(JSON.stringify({
      charactersFound: ["Mina"],
      worldNotes: [
        { title: "Port", category: "lieux", evidence: "Au bord de mer" },
        { title: "Règle", category: "lore", content: "La magie a un prix" },
      ],
    }));

    expect(result.characters[0]?.name).toBe("Mina");
    expect(result.places[0]?.title).toBe("Port");
    expect(result.generalInfo[0]?.title).toBe("Règle");
  });

  it("rejects malformed JSON", () => {
    expect(() => parseStoryExtraction("{")).toThrow();
  });
});

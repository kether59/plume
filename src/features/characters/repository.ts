import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, projects } from "@/db/schema";

type CharacterInsert = typeof characters.$inferInsert;
export type CreateCharacterInput = Pick<CharacterInsert, "projectId" | "name"> &
  Partial<Pick<CharacterInsert,
    "role" | "consciousDesire" | "unconsciousNeed" | "lieOrFlaw" | "eyeColor" | "hairColor" |
    "height" | "physicalParticularity" | "age" | "birthDate" | "externalObstacles" |
    "internalObstacles" | "characterArc" | "distinguishingFeatures" | "relationships" | "notes" | "color"
  >>;
export type UpdateCharacterInput = Partial<Pick<CharacterInsert,
  "name" | "role" | "consciousDesire" | "unconsciousNeed" | "lieOrFlaw" | "eyeColor" | "hairColor" |
  "height" | "physicalParticularity" | "age" | "birthDate" | "externalObstacles" |
  "internalObstacles" | "characterArc" | "distinguishingFeatures" | "relationships" | "notes" | "color"
>>;

export async function createCharacter(input: CreateCharacterInput) {
  const [character] = await db.insert(characters).values({
    projectId: input.projectId,
    name: input.name,
    role: input.role || "Secondaire",
    consciousDesire: input.consciousDesire || "",
    unconsciousNeed: input.unconsciousNeed || "",
    lieOrFlaw: input.lieOrFlaw || "",
    eyeColor: input.eyeColor || "",
    hairColor: input.hairColor || "",
    height: input.height || "",
    physicalParticularity: input.physicalParticularity || "",
    age: input.age || "",
    birthDate: input.birthDate || "",
    externalObstacles: input.externalObstacles || "",
    internalObstacles: input.internalObstacles || "",
    characterArc: input.characterArc || "",
    distinguishingFeatures: input.distinguishingFeatures || "",
    relationships: input.relationships || "",
    notes: input.notes || "",
    color: input.color || "#0ea5e9",
  }).returning();
  await db.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, input.projectId));
  return character;
}

export async function updateCharacter(id: number, input: UpdateCharacterInput) {
  const [character] = await db.update(characters).set({ ...input, updatedAt: new Date() })
    .where(eq(characters.id, id)).returning();
  if (character) {
    await db.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, character.projectId));
  }
  return character;
}

export async function deleteCharacter(id: number) {
  const [character] = await db.delete(characters).where(eq(characters.id, id)).returning();
  if (character) {
    await db.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, character.projectId));
  }
  return character;
}

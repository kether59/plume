import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { characterRelations, characters, projects } from "@/db/schema";

async function touchProject(projectId: number) {
  await db.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, projectId));
}

export const characterRelationTypes = [
  "friend",
  "enemy",
  "married",
  "lover",
  "family",
  "ally",
  "mentor",
  "rival",
  "other",
] as const;

export type CharacterRelationType = typeof characterRelationTypes[number];

export async function listCharacterRelations(projectId: number) {
  return db.select().from(characterRelations).where(eq(characterRelations.projectId, projectId));
}

export async function createCharacterRelation(input: {
  projectId: number;
  sourceCharacterId: number;
  targetCharacterId: number;
  relationType: CharacterRelationType;
  description?: string;
}) {
  if (input.sourceCharacterId === input.targetCharacterId) {
    return { error: "Un personnage ne peut pas être relié à lui-même." } as const;
  }

  const [source, target] = await Promise.all([
    db.select({ id: characters.id }).from(characters).where(and(
      eq(characters.id, input.sourceCharacterId),
      eq(characters.projectId, input.projectId),
    )),
    db.select({ id: characters.id }).from(characters).where(and(
      eq(characters.id, input.targetCharacterId),
      eq(characters.projectId, input.projectId),
    )),
  ]);
  if (!source.length || !target.length) return { error: "Les deux personnages doivent appartenir à ce roman." } as const;

  const [relation] = await db.insert(characterRelations).values({
    projectId: input.projectId,
    sourceCharacterId: input.sourceCharacterId,
    targetCharacterId: input.targetCharacterId,
    relationType: input.relationType,
    description: input.description || "",
  }).returning();
  await touchProject(input.projectId);
  return { relation } as const;
}

export async function deleteCharacterRelation(id: number) {
  const [relation] = await db.delete(characterRelations)
    .where(eq(characterRelations.id, id)).returning();
  if (relation) await touchProject(relation.projectId);
  return relation;
}

export async function updateCharacterRelation(
  id: number,
  input: { relationType?: CharacterRelationType; description?: string },
) {
  const [relation] = await db.update(characterRelations).set({
    ...input,
    updatedAt: new Date(),
  }).where(eq(characterRelations.id, id)).returning();
  if (relation) await touchProject(relation.projectId);
  return relation;
}

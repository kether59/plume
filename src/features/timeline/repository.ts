import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { chapters, characters, projects, timelineEvents, worldNotes } from "@/db/schema";

export async function listTimelineEvents(projectId: number) {
  return db.select().from(timelineEvents)
    .where(eq(timelineEvents.projectId, projectId))
    .orderBy(asc(timelineEvents.orderIndex), asc(timelineEvents.id));
}

export async function findTimelineEvent(id: number) {
  const [event] = await db.select().from(timelineEvents).where(eq(timelineEvents.id, id));
  return event;
}

export async function findTimelineEventProject(id: number) {
  const [event] = await db.select({ id: timelineEvents.id, projectId: timelineEvents.projectId })
    .from(timelineEvents).where(eq(timelineEvents.id, id));
  return event;
}

export async function projectExists(id: number) {
  const [project] = await db.select({ id: projects.id }).from(projects).where(eq(projects.id, id));
  return Boolean(project);
}

export async function nextTimelineOrder(projectId: number) {
  const [lastEvent] = await db.select({ orderIndex: timelineEvents.orderIndex })
    .from(timelineEvents)
    .where(eq(timelineEvents.projectId, projectId))
    .orderBy(desc(timelineEvents.orderIndex))
    .limit(1);
  return (lastEvent?.orderIndex || 0) + 1;
}

export async function insertTimelineEvent(input: typeof timelineEvents.$inferInsert) {
  const [event] = await db.insert(timelineEvents).values(input).returning();
  return event;
}

export async function saveTimelineEvent(
  id: number,
  input: Partial<typeof timelineEvents.$inferInsert>,
) {
  const [event] = await db.update(timelineEvents).set(input)
    .where(eq(timelineEvents.id, id)).returning();
  return event;
}

export async function removeTimelineEvent(id: number) {
  const [event] = await db.delete(timelineEvents).where(eq(timelineEvents.id, id))
    .returning({ id: timelineEvents.id, projectId: timelineEvents.projectId });
  return event;
}

export async function touchProject(projectId: number) {
  await db.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, projectId));
}

export async function cleanTimelineLinks(projectId: number, characterIds: number[], worldNoteIds: number[]) {
  const [projectCharacters, projectNotes] = await Promise.all([
    characterIds.length
      ? db.select({ id: characters.id }).from(characters)
        .where(and(eq(characters.projectId, projectId), inArray(characters.id, characterIds)))
      : Promise.resolve([]),
    worldNoteIds.length
      ? db.select({ id: worldNotes.id }).from(worldNotes)
        .where(and(eq(worldNotes.projectId, projectId), inArray(worldNotes.id, worldNoteIds)))
      : Promise.resolve([]),
  ]);
  return {
    characterIds: projectCharacters.map((item) => item.id),
    worldNoteIds: projectNotes.map((item) => item.id),
  };
}

export async function validateTimelineLinks(
  projectId: number,
  chapterId: number | null,
  characterIds: number[],
  worldNoteIds: number[],
): Promise<string | null> {
  if (chapterId !== null) {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, chapterId));
    if (!chapter) return "Chapitre introuvable.";
    if (chapter.projectId !== projectId) return "Le chapitre doit appartenir à ce roman.";
  }
  if (characterIds.length > 0) {
    const linkedCharacters = await db.select({ id: characters.id, projectId: characters.projectId })
      .from(characters).where(inArray(characters.id, characterIds));
    if (linkedCharacters.length !== characterIds.length) return "Un personnage sélectionné est introuvable.";
    if (linkedCharacters.some((character) => character.projectId !== projectId)) {
      return "Les personnages doivent appartenir à ce roman.";
    }
  }
  if (worldNoteIds.length > 0) {
    const linkedNotes = await db.select({ id: worldNotes.id, projectId: worldNotes.projectId })
      .from(worldNotes).where(inArray(worldNotes.id, worldNoteIds));
    if (linkedNotes.length !== worldNoteIds.length) return "Une fiche sélectionnée est introuvable.";
    if (linkedNotes.some((note) => note.projectId !== projectId)) {
      return "Les fiches doivent appartenir à ce roman.";
    }
  }
  return null;
}

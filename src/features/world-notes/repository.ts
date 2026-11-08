import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, worldNotes } from "@/db/schema";

type WorldNoteInsert = typeof worldNotes.$inferInsert;
export type CreateWorldNoteInput = Pick<WorldNoteInsert, "projectId" | "title"> &
  Partial<Pick<WorldNoteInsert, "category" | "content" | "tags">>;
export type UpdateWorldNoteInput = Partial<Pick<WorldNoteInsert, "title" | "category" | "content" | "tags">>;

export async function createWorldNote(input: CreateWorldNoteInput) {
  const [note] = await db.insert(worldNotes).values({
    projectId: input.projectId,
    title: input.title,
    category: input.category || "lore",
    content: input.content || "",
    tags: input.tags || "",
  }).returning();
  await db.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, input.projectId));
  return note;
}

export async function updateWorldNote(id: number, input: UpdateWorldNoteInput) {
  const [note] = await db.update(worldNotes).set({ ...input, updatedAt: new Date() })
    .where(eq(worldNotes.id, id)).returning();
  if (note) {
    await db.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, note.projectId));
  }
  return note;
}

export async function deleteWorldNote(id: number) {
  const [note] = await db.delete(worldNotes).where(eq(worldNotes.id, id)).returning();
  if (note) {
    await db.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, note.projectId));
  }
  return note;
}

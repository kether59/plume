import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { chapters, projects } from "@/db/schema";

type ChapterInsert = typeof chapters.$inferInsert;
export type CreateChapterInput = Pick<ChapterInsert, "projectId"> &
  Partial<Pick<ChapterInsert, "title" | "orderIndex" | "act" | "synopsis" | "povCharacter" | "location" | "content" | "status">>;
export type UpdateChapterInput = Partial<
  Pick<ChapterInsert, "title" | "orderIndex" | "act" | "synopsis" | "povCharacter" | "location" | "content" | "status" | "aiNotes">
>;

function countWords(content: string | null | undefined): number {
  const normalized = content || "";
  return normalized.trim() ? normalized.trim().split(/\s+/).length : 0;
}

export async function createChapter(input: CreateChapterInput) {
  const [lastChapter] = await db.select({ orderIndex: chapters.orderIndex })
    .from(chapters)
    .where(eq(chapters.projectId, input.projectId))
    .orderBy(desc(chapters.orderIndex))
    .limit(1);
  const nextOrder = (lastChapter?.orderIndex || 0) + 1;
  const content = input.content || "";
  const [chapter] = await db.insert(chapters).values({
    projectId: input.projectId,
    title: input.title || `Chapitre ${nextOrder}`,
    orderIndex: input.orderIndex ?? nextOrder,
    act: input.act || "Acte 1 : Exposition",
    synopsis: input.synopsis || "",
    povCharacter: input.povCharacter || "",
    location: input.location || "",
    content,
    wordCount: countWords(content),
    status: input.status || "outline",
  }).returning();
  await db.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, input.projectId));
  return chapter;
}

export async function updateChapter(id: number, input: UpdateChapterInput) {
  const [chapter] = await db.update(chapters).set({
    ...input,
    ...(input.content !== undefined ? { wordCount: countWords(input.content) } : {}),
    updatedAt: new Date(),
  }).where(eq(chapters.id, id)).returning();
  if (chapter) {
    await db.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, chapter.projectId));
  }
  return chapter;
}

export async function deleteChapter(id: number) {
  const [chapter] = await db.delete(chapters).where(eq(chapters.id, id)).returning();
  if (chapter) {
    await db.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, chapter.projectId));
  }
  return chapter;
}

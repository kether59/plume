import { eq } from "drizzle-orm";
import { db } from "@/db";
import { aiConfig, chapters, characters, projects, worldNotes } from "@/db/schema";
import type { NovelContext } from "@/lib/ai-service";

export async function loadNovelContext(
  projectId?: number,
  chapterId?: number,
): Promise<NovelContext> {
  const context: NovelContext = { title: "Mon Roman" };
  if (projectId === undefined) return context;

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (project) {
    context.title = project.title;
    context.genre = project.genre || "";
    context.tone = project.tone || "";
    context.synopsis = project.synopsis || "";
  }

  const projectCharacters = await db.select().from(characters).where(eq(characters.projectId, projectId));
  context.characters = projectCharacters.map((character) => ({
    name: character.name,
    role: character.role || undefined,
    consciousDesire: character.consciousDesire || undefined,
    unconsciousNeed: character.unconsciousNeed || undefined,
    lieOrFlaw: character.lieOrFlaw || undefined,
  }));

  const notes = await db.select().from(worldNotes).where(eq(worldNotes.projectId, projectId));
  context.worldNotes = notes.map((note) => ({
    title: note.title,
    category: note.category || undefined,
    content: note.content,
  }));

  if (chapterId !== undefined) {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, chapterId));
    if (chapter) {
      context.currentChapterTitle = chapter.title;
      context.povCharacter = chapter.povCharacter || undefined;
      context.location = chapter.location || undefined;
    }
  }

  return context;
}

export async function loadStoredAiConfig() {
  const [config] = await db.select().from(aiConfig).limit(1);
  return config;
}

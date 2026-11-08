import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { writingSessions } from "@/db/schema";

type SessionInsert = typeof writingSessions.$inferInsert;
export type CreateWritingSessionInput = Pick<SessionInsert, "projectId"> &
  Partial<Pick<SessionInsert, "wordsWritten" | "durationMinutes" | "mood" | "antiSelfCensorshipUsed" | "notes">>;

export async function createWritingSession(input: CreateWritingSessionInput) {
  const [session] = await db.insert(writingSessions).values({
    projectId: input.projectId,
    wordsWritten: input.wordsWritten || 0,
    durationMinutes: input.durationMinutes || 0,
    mood: input.mood || "good",
    antiSelfCensorshipUsed: Boolean(input.antiSelfCensorshipUsed),
    notes: input.notes || "",
  }).returning();
  return session;
}

export async function listWritingSessions(projectId: number) {
  return db.select().from(writingSessions)
    .where(eq(writingSessions.projectId, projectId))
    .orderBy(desc(writingSessions.sessionDate));
}

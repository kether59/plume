import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { betaFeedbacks } from "@/db/schema";

type FeedbackInsert = typeof betaFeedbacks.$inferInsert;
export type CreateBetaFeedbackInput = Pick<FeedbackInsert, "projectId" | "readerName"> &
  Partial<Pick<FeedbackInsert,
    "chapterId" | "readerEmail" | "overallImpression" | "hookRating" | "paceRating" |
    "dropOffMoment" | "favoriteCharacter" | "plotQuestions" | "generalAdvice"
  >>;
export type UpdateBetaFeedbackInput = Partial<Pick<FeedbackInsert,
  "chapterId" | "readerName" | "readerEmail" | "overallImpression" | "hookRating" | "paceRating" |
  "dropOffMoment" | "favoriteCharacter" | "plotQuestions" | "generalAdvice" | "status"
>>;

export async function createBetaFeedback(input: CreateBetaFeedbackInput) {
  const [feedback] = await db.insert(betaFeedbacks).values({
    projectId: input.projectId,
    chapterId: input.chapterId ?? null,
    readerName: input.readerName,
    readerEmail: input.readerEmail || "",
    overallImpression: input.overallImpression || "",
    hookRating: input.hookRating || 4,
    paceRating: input.paceRating || 4,
    dropOffMoment: input.dropOffMoment || "",
    favoriteCharacter: input.favoriteCharacter || "",
    plotQuestions: input.plotQuestions || "",
    generalAdvice: input.generalAdvice || "",
    status: "new",
  }).returning();
  return feedback;
}

export async function listBetaFeedback(projectId: number) {
  return db.select().from(betaFeedbacks)
    .where(eq(betaFeedbacks.projectId, projectId))
    .orderBy(desc(betaFeedbacks.createdAt));
}

export async function updateBetaFeedback(id: number, input: UpdateBetaFeedbackInput) {
  const [feedback] = await db.update(betaFeedbacks).set(input)
    .where(eq(betaFeedbacks.id, id)).returning();
  return feedback;
}

export async function deleteBetaFeedback(id: number) {
  const [feedback] = await db.delete(betaFeedbacks).where(eq(betaFeedbacks.id, id)).returning();
  return feedback;
}

import {
  cleanTimelineLinks,
  findTimelineEvent,
  insertTimelineEvent,
  listTimelineEvents,
  nextTimelineOrder,
  projectExists,
  removeTimelineEvent,
  saveTimelineEvent,
  touchProject,
  validateTimelineLinks,
} from "@/features/timeline/repository";

export type TimelineResult<T> =
  | { ok: true; value: T }
  | { ok: false; status: number; error: string };

function failure<T>(status: number, error: string): TimelineResult<T> {
  return { ok: false, status, error };
}

function parseIdList(value: unknown): number[] | null {
  if (!Array.isArray(value) || value.some((id) => !Number.isInteger(id) || id <= 0)) return null;
  return [...new Set(value as number[])];
}

export async function getTimelineEvents(projectId: number) {
  return listTimelineEvents(projectId);
}

export async function createTimelineEvent(body: Record<string, unknown>): Promise<TimelineResult<unknown>> {
  const projectId = Number(body.projectId);
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const characterIds = body.characterIds === undefined ? [] : parseIdList(body.characterIds);
  const worldNoteIds = body.worldNoteIds === undefined ? [] : parseIdList(body.worldNoteIds);
  const chapterId = body.chapterId === undefined || body.chapterId === null || body.chapterId === ""
    ? null
    : Number(body.chapterId);

  if (!Number.isInteger(projectId) || projectId <= 0 || !title) {
    return failure(400, "projectId et title sont requis.");
  }
  if (!characterIds || !worldNoteIds || (chapterId !== null && (!Number.isInteger(chapterId) || chapterId <= 0))) {
    return failure(400, "Les liens de l’événement ne sont pas valides.");
  }
  if (!await projectExists(projectId)) return failure(404, "Roman introuvable.");

  const linkError = await validateTimelineLinks(projectId, chapterId, characterIds, worldNoteIds);
  if (linkError) return failure(400, linkError);

  const requestedOrder = Number(body.orderIndex);
  const orderIndex = Number.isInteger(requestedOrder) && requestedOrder > 0
    ? requestedOrder
    : await nextTimelineOrder(projectId);
  const event = await insertTimelineEvent({
    projectId,
    chapterId,
    title,
    description: typeof body.description === "string" ? body.description.trim() : "",
    timeLabel: typeof body.timeLabel === "string" ? body.timeLabel.trim() : "",
    orderIndex,
    characterIds,
    worldNoteIds,
  });
  await touchProject(projectId);
  return { ok: true, value: event };
}

export async function updateTimelineEvent(
  id: number,
  body: Record<string, unknown>,
): Promise<TimelineResult<unknown>> {
  const existing = await findTimelineEvent(id);
  if (!existing) return failure(404, "Événement introuvable.");

  const title = body.title === undefined
    ? existing.title
    : (typeof body.title === "string" ? body.title.trim() : "");
  const cleanedLinks = await cleanTimelineLinks(
    existing.projectId,
    existing.characterIds || [],
    existing.worldNoteIds || [],
  );
  const characterIds = body.characterIds === undefined ? cleanedLinks.characterIds : parseIdList(body.characterIds);
  const worldNoteIds = body.worldNoteIds === undefined ? cleanedLinks.worldNoteIds : parseIdList(body.worldNoteIds);
  const chapterId = body.chapterId === undefined
    ? existing.chapterId
    : (body.chapterId === null || body.chapterId === "" ? null : Number(body.chapterId));
  const orderIndex = body.orderIndex === undefined ? existing.orderIndex : Number(body.orderIndex);

  if (!title) return failure(400, "Le titre est requis.");
  if (
    !characterIds ||
    !worldNoteIds ||
    (chapterId !== null && (!Number.isInteger(chapterId) || chapterId <= 0)) ||
    !Number.isInteger(orderIndex) ||
    orderIndex <= 0
  ) {
    return failure(400, "Les informations de l’événement ne sont pas valides.");
  }

  const linkError = await validateTimelineLinks(existing.projectId, chapterId, characterIds, worldNoteIds);
  if (linkError) return failure(400, linkError);

  const event = await saveTimelineEvent(id, {
    title,
    chapterId,
    orderIndex,
    characterIds,
    worldNoteIds,
    ...(typeof body.description === "string" ? { description: body.description.trim() } : {}),
    ...(typeof body.timeLabel === "string" ? { timeLabel: body.timeLabel.trim() } : {}),
    updatedAt: new Date(),
  });
  await touchProject(existing.projectId);
  return { ok: true, value: event };
}

export async function deleteTimelineEvent(id: number): Promise<TimelineResult<{ success: true }>> {
  const removed = await removeTimelineEvent(id);
  if (!removed) return failure(404, "Événement introuvable.");
  await touchProject(removed.projectId);
  return { ok: true, value: { success: true } };
}

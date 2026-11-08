export const AI_TASKS = [
  "continue",
  "unblock",
  "rewrite",
  "extract",
  "coherence",
  "character_help",
  "structure_help",
  "world_brainstorm",
] as const;

export type AiTask = (typeof AI_TASKS)[number];

export const CHARACTER_SUGGESTION_FIELDS = [
  "consciousDesire",
  "unconsciousNeed",
  "lieOrFlaw",
  "internalObstacles",
  "externalObstacles",
  "characterArc",
  "eyeColor",
  "hairColor",
  "height",
  "physicalParticularity",
  "age",
  "birthDate",
  "distinguishingFeatures",
] as const;

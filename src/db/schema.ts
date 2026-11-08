import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  synopsis: text("synopsis"),
  genre: text("genre").default("Roman"),
  tone: text("tone").default("Réaliste et immersif"),
  targetWordCount: integer("target_word_count").default(50000),
  currentWordCount: integer("current_word_count").default(0),
  dailyGoalWords: integer("daily_goal_words").default(500),
  dailyGoalMinutes: integer("daily_goal_minutes").default(30),
  currentStage: text("current_stage").default("draft"), // 'research', 'structure', 'characters', 'draft', 'timeline', 'revision', 'beta'
  workflowOrder: text("workflow_order").default("prepare_first").notNull(),
  narrativeStructure: text("narrative_structure").default("three_acts"), // 'three_acts', 'heros_journey', 'save_the_cat', 'free'
  restingSince: timestamp("resting_since"), // for text-resting incubation phase
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  orderIndex: integer("order_index").notNull().default(1),
  act: text("act").default("Acte 1"), // "Acte 1: Exposition", "Acte 2: Confrontation", "Acte 3: Résolution", etc.
  synopsis: text("synopsis"),
  povCharacter: text("pov_character"),
  location: text("location"),
  content: text("content").default(""),
  wordCount: integer("word_count").default(0),
  status: text("status").default("draft"), // 'idea', 'outline', 'drafting', 'first_draft_done', 'revised', 'final'
  aiNotes: text("ai_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role").default("Protagoniste"), // Protagoniste, Antagoniste, Allié, Mentor, Déclencheur, Secondaire
  // Beginner-friendly core psychology fields:
  consciousDesire: text("conscious_desire"), // Ce qu'il croit vouloir (Désir extérieur)
  unconsciousNeed: text("unconscious_need"), // Ce dont il a réellement besoin pour s'accomplir
  lieOrFlaw: text("lie_or_flaw"), // Le mensonge ou la faille intérieure
  externalObstacles: text("external_obstacles"), // Les obstacles concrets dans le monde
  internalObstacles: text("internal_obstacles"), // Ses doutes, ses peurs, ses traumatismes
  characterArc: text("character_arc"), // Évolution prévue (Positif, Tragique, Plat)
  distinguishingFeatures: text("distinguishing_features"), // Voix, tics, apparence saillante
  relationships: text("relationships"), // Liens avec les autres personnages
  notes: text("notes"),
  color: text("color").default("#3b82f6"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const worldNotes = pgTable("world_notes", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").default("lore"), // 'lore', 'lieux', 'epoque', 'magie_techno', 'societe', 'inspiration', 'regles'
  content: text("content").notNull(),
  tags: text("tags"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const timelineEvents = pgTable("timeline_events", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  chapterId: integer("chapter_id").references(() => chapters.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  timeLabel: text("time_label").notNull().default(""),
  orderIndex: integer("order_index").notNull().default(1),
  characterIds: jsonb("character_ids").$type<number[]>().notNull().default([]),
  worldNoteIds: jsonb("world_note_ids").$type<number[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const writingSessions = pgTable("writing_sessions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  wordsWritten: integer("words_written").default(0),
  durationMinutes: integer("duration_minutes").default(0),
  sessionDate: timestamp("session_date").defaultNow().notNull(),
  mood: text("mood").default("good"), // 'inspired', 'good', 'hard_won', 'blocked'
  antiSelfCensorshipUsed: boolean("anti_self_censorship_used").default(false),
  notes: text("notes"),
});

export const betaFeedbacks = pgTable("beta_feedbacks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  chapterId: integer("chapter_id"),
  readerName: text("reader_name").notNull(),
  readerEmail: text("reader_email"),
  overallImpression: text("overall_impression"),
  hookRating: integer("hook_rating").default(4), // 1-5
  paceRating: integer("pace_rating").default(4), // 1-5
  dropOffMoment: text("drop_off_moment"), // Où as-tu eu envie de lâcher ?
  favoriteCharacter: text("favorite_character"),
  plotQuestions: text("plot_questions"), // Incompréhensions / incohérences ressenties
  generalAdvice: text("general_advice"),
  status: text("status").default("new"), // 'new', 'processed', 'applied'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiConfig = pgTable("ai_config", {
  id: serial("id").primaryKey(),
  provider: text("provider").default("builtin"), // 'builtin', 'ollama', 'openai', 'lmstudio', 'custom'
  endpoint: text("endpoint").default("http://localhost:11434"),
  model: text("model").default("llama3"),
  apiKey: text("api_key"),
  temperature: integer("temperature").default(70), // scaled x100 (0.7)
  toneDirective: text("tone_directive").default("Bienveillant, encourageant, stimulant pour un auteur débutant"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

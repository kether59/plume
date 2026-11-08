import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  betaFeedbacks,
  chapters,
  characterRelations,
  characters,
  projects,
  timelineEvents,
  worldNotes,
  writingSessions,
} from "@/db/schema";

type ProjectInsert = typeof projects.$inferInsert;
export type CreateProjectInput = Partial<Pick<ProjectInsert,
  "title" | "subtitle" | "synopsis" | "genre" | "tone" | "targetWordCount" |
  "dailyGoalWords" | "dailyGoalMinutes" | "workflowOrder" | "narrativeStructure"
>>;
export type UpdateProjectInput = Partial<Pick<ProjectInsert,
  "title" | "subtitle" | "synopsis" | "genre" | "tone" | "targetWordCount" |
  "currentWordCount" | "dailyGoalWords" | "dailyGoalMinutes" | "currentStage" |
  "workflowOrder" | "narrativeStructure" | "restingSince"
>>;

async function seedDemoProject() {
  const [project] = await db.insert(projects).values({
    title: "L'Ombre du Sablier",
    subtitle: "Mon tout premier roman de fantasy urbaine",
    synopsis: "Dans un Paris où les horloges dérobent les souvenirs des vivants, Éléonore, restauratrice d'objets anciens rongée par la peur d'oublier son frère disparu, découvre un mécanisme capable d'inverser le cours du temps... au prix d'une vie.",
    genre: "Fantasy Urbaine & Mystère",
    tone: "Mélancolique, poétique et haletant",
    targetWordCount: 45000,
    currentWordCount: 4210,
    dailyGoalWords: 500,
    dailyGoalMinutes: 30,
    currentStage: "draft",
    narrativeStructure: "three_acts",
  }).returning();

  await db.insert(chapters).values([
    {
      projectId: project.id,
      title: "Chapitre 1 : L'Écho dans les rouages",
      orderIndex: 1,
      act: "Acte 1 : Exposition",
      synopsis: "Éléonore répare une vieille horloge de poche dans son atelier du Marais et perçoit un tic-tac anormal.",
      povCharacter: "Éléonore",
      location: "Atelier du Marais, Paris",
      content: `L'odeur d'huile de lin et de laiton froid enveloppait l'atelier comme un vieux manteau usé mais réconfortant. Éléonore ajusta sa loupe d'horloger au-dessus de son œil droit, retenant son souffle pour ne pas dévier le geste précis de sa pince.\n\nLe balancier oscillait avec une régularité presque insolente. Pourtant, entre chaque tic-tac, un battement fantôme s'insinuait, pareil à une respiration prise sous l'eau.\n\n— Tu n'es pas une simple montre de cheminée, murmura-t-elle à voix basse.\n\nSon frère Thomas lui disait toujours que les mécanismes avaient une mémoire. Depuis sa disparition il y a deux ans, elle cherchait cette mémoire dans chaque ressort détendu. Soudain, le ressort principal vibra d'un éclat bleuté et une chaleur anormale irradia contre la paume de ses doigts.`,
      wordCount: 135,
      status: "first_draft_done",
    },
    {
      projectId: project.id,
      title: "Chapitre 2 : La visite de minuit",
      orderIndex: 2,
      act: "Acte 1 : Incident Déclencheur",
      synopsis: "Un étrange collectionneur nommé Silas frappe à la porte et exige de récupérer l'horloge.",
      povCharacter: "Éléonore",
      location: "Atelier du Marais",
      content: `La clochette de l'entrée tinta d'un son sec et métallique, rompant le silence de minuit passée.\n\nÉléonore sursauta, sa pince manquant d'échapper une vis minuscule sur l'établi. Personne ne venait à cette heure dans la ruelle déserte. À travers la vitre dépolie, la silhouette d'un homme de haute stature se découpait dans la brume de pluie.\n\nElle hésita, le cœur battant la chamade, avant de s'approcher du loquet en bois.\n\n— C'est fermé, monsieur, dit-elle en tentant d'assurer sa voix.\n\n— Je ne viens pas pour acheter l'heure, mademoiselle Vaneau, répondit une voix grave et posée de l'autre côté du battant. Je viens pour l'horloge de votre frère Thomas. Et le temps presse plus que vous ne le croyez.`,
      wordCount: 128,
      status: "drafting",
    },
    {
      projectId: project.id,
      title: "Chapitre 3 : Le pacte sous les toits",
      orderIndex: 3,
      act: "Acte 2 : Passage du Seuil",
      synopsis: "Éléonore décide de suivre Silas dans les coursives oubliées de l'Hôtel-Dieu.",
      povCharacter: "Éléonore",
      location: "Les toits de Paris",
      content: "",
      wordCount: 0,
      status: "outline",
    },
  ]);

  await db.insert(characters).values([
    {
      projectId: project.id,
      name: "Éléonore Vaneau",
      role: "Protagoniste",
      consciousDesire: "Retrouver son frère disparu ou une preuve irréfutable de ce qui lui est arrivé.",
      unconsciousNeed: "Accepter l'incertitude et lâcher prise sur le passé pour recommencer à vivre dans le présent.",
      lieOrFlaw: "Croire que si elle ne contrôle pas chaque seconde et chaque souvenir, tout finira par disparaître.",
      externalObstacles: "Les Gardiens du Cadran, une confrérie secrète qui traque les détenteurs des objets anachroniques.",
      internalObstacles: "Une anxiété paralysante et le remords de ne pas avoir répondu au dernier appel de son frère.",
      characterArc: "D'une recluse obsessionnelle et craintive à une femme courageuse qui embrasse l'imperfection du temps.",
      distinguishingFeatures: "Porte toujours une montre arrêtée à 17h12 au poignet gauche ; voix douce mais gestes très précis.",
      relationships: "Méfiance immédiate envers Silas, mais dépendance envers ses révélations.",
      color: "#0284c7",
    },
    {
      projectId: project.id,
      name: "Silas Thorne",
      role: "Allié ambigu / Catalyseur",
      consciousDesire: "Récupérer le noyau du Sablier avant que les Ombres ne s'en emparent.",
      unconsciousNeed: "Racheter une faute impardonnable commise contre la famille Vaneau des années plus tôt.",
      lieOrFlaw: "Pense que la fin justifie toujours les moyens et que cacher la vérité protège les autres.",
      externalObstacles: "Ses anciens collègues de l'Ordre qui le considèrent comme un traître en fuite.",
      internalObstacles: "Une culpabilité écrasante qui le pousse à s'isoler et à paraître froid et cynique.",
      characterArc: "Apprendre à être transparent et vulnérable avec autrui.",
      distinguishingFeatures: "Manteau de laine sombre élimé, cicatrice fine sur la tempe, odeur de café noir et de pluie.",
      relationships: "Protège Éléonore tout en lui cachant la véritable nature de la disparition de Thomas.",
      color: "#7c3aed",
    },
  ]);

  await db.insert(worldNotes).values([
    {
      projectId: project.id,
      title: "Les Horloges Mémorielles",
      category: "magie_techno",
      content: "Mécanismes forgés au XIXe siècle capables d'emprisonner une émotion ou un fragment de souvenir lors d'un trauma. Chaque remontage libère une brume sensorielle observable.",
      tags: "horloges, magie, règles",
    },
    {
      projectId: project.id,
      title: "L'Ordre du Cadran Boréal",
      category: "societe",
      content: "Organisation clandestine d'archivistes et d'érudits chargée de maintenir la linéarité temporelle dans la capitale. Ils traquent toute personne modifiant les flux temporels sans autorisation papale.",
      tags: "antagonistes, factions",
    },
    {
      projectId: project.id,
      title: "Ambiance du Paris d'automne 1898",
      category: "inspiration",
      content: "Rues pavées mouillées par la bruine, réverbères au gaz diffusant un halo jaune pâle, vapeur des bouches de métro en construction, calèches tardives.",
      tags: "ambiance, décor, immersion",
    },
  ]);

  await db.insert(betaFeedbacks).values({
    projectId: project.id,
    chapterId: 1,
    readerName: "Camille (Bêta-lectrice)",
    readerEmail: "camille.lectrice@example.com",
    overallImpression: "Le début est très immersif ! On sent tout de suite l'amour de l'artisanat et la minutie d'Éléonore.",
    hookRating: 5,
    paceRating: 4,
    dropOffMoment: "Aucun, le mystère du frère disparu dès le premier chapitre donne très envie de lire la suite !",
    favoriteCharacter: "Éléonore",
    plotQuestions: "Comment sait-elle que la montre n'est pas normale dès la première minute ? Peut-être accentuer un indice visuel ou sonore encore plus frappant.",
    generalAdvice: "Très prometteur ! Ne change pas le ton intimiste, c'est ce qui fait ta force.",
    status: "processed",
  });

  await db.insert(writingSessions).values({
    projectId: project.id,
    wordsWritten: 520,
    durationMinutes: 25,
    mood: "inspired",
    antiSelfCensorshipUsed: true,
    notes: "Sprint de 25 minutes sans effacer. Très libérateur pour vaincre le blocage initial !",
  });

  return db.select().from(projects).where(eq(projects.id, project.id));
}

export async function listProjects() {
  const allProjects = await db.select().from(projects).orderBy(desc(projects.updatedAt));
  return allProjects.length === 0 ? seedDemoProject() : allProjects;
}

export async function createProject(input: CreateProjectInput) {
  const [project] = await db.insert(projects).values({
    title: input.title || "Nouveau Roman",
    subtitle: input.subtitle || "",
    synopsis: input.synopsis || "",
    genre: input.genre || "Fiction",
    tone: input.tone || "Équilibré",
    targetWordCount: input.targetWordCount || 50000,
    dailyGoalWords: input.dailyGoalWords || 500,
    dailyGoalMinutes: input.dailyGoalMinutes || 30,
    currentStage: input.workflowOrder === "write_first" ? "draft" : "research",
    workflowOrder: input.workflowOrder === "write_first" ? "write_first" : "prepare_first",
    narrativeStructure: input.narrativeStructure || "three_acts",
  }).returning();
  await db.insert(chapters).values({
    projectId: project.id,
    title: "Chapitre 1 : L'Incipit",
    orderIndex: 1,
    act: "Acte 1 : Exposition",
    synopsis: "Première scène : présentation de l'univers et du protagoniste dans son quotidien.",
    content: "",
    status: "outline",
  });
  return project;
}

export async function getProjectDetail(projectId: number) {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (!project) return null;

  const [projectChapters, projectCharacters, projectWorldNotes, projectSessions, projectFeedbacks, projectTimeline, relations] =
    await Promise.all([
      db.select().from(chapters).where(eq(chapters.projectId, projectId)).orderBy(asc(chapters.orderIndex)),
      db.select().from(characters).where(eq(characters.projectId, projectId)).orderBy(asc(characters.name)),
      db.select().from(worldNotes).where(eq(worldNotes.projectId, projectId)).orderBy(desc(worldNotes.createdAt)),
      db.select().from(writingSessions).where(eq(writingSessions.projectId, projectId)).orderBy(desc(writingSessions.sessionDate)),
      db.select().from(betaFeedbacks).where(eq(betaFeedbacks.projectId, projectId)).orderBy(desc(betaFeedbacks.createdAt)),
      db.select().from(timelineEvents).where(eq(timelineEvents.projectId, projectId))
        .orderBy(asc(timelineEvents.orderIndex), asc(timelineEvents.id)),
      db.select().from(characterRelations).where(eq(characterRelations.projectId, projectId)),
    ]);

  const characterIds = new Set(projectCharacters.map((character) => character.id));
  const worldNoteIds = new Set(projectWorldNotes.map((note) => note.id));
  return {
    project: {
      ...project,
      currentWordCount: projectChapters.reduce((total, chapter) => total + (chapter.wordCount || 0), 0),
    },
    chapters: projectChapters,
    characters: projectCharacters,
    characterRelations: relations,
    worldNotes: projectWorldNotes,
    writingSessions: projectSessions,
    betaFeedbacks: projectFeedbacks,
    timelineEvents: projectTimeline.map((event) => ({
      ...event,
      characterIds: (event.characterIds || []).filter((id) => characterIds.has(id)),
      worldNoteIds: (event.worldNoteIds || []).filter((id) => worldNoteIds.has(id)),
    })),
  };
}

export async function updateProject(projectId: number, input: UpdateProjectInput) {
  const [project] = await db.update(projects).set({ ...input, updatedAt: new Date() })
    .where(eq(projects.id, projectId)).returning();
  return project;
}

export async function deleteProject(projectId: number) {
  await db.delete(projects).where(eq(projects.id, projectId));
}

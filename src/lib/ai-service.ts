import { cloudProviders } from "@/lib/ai-providers";

export interface NovelContext {
  title: string;
  genre?: string;
  tone?: string;
  synopsis?: string;
  currentChapterTitle?: string;
  povCharacter?: string;
  location?: string;
  characters?: Array<{
    name: string;
    role?: string;
    consciousDesire?: string;
    unconsciousNeed?: string;
    lieOrFlaw?: string;
  }>;
  worldNotes?: Array<{
    title: string;
    category?: string;
    content: string;
  }>;
}

export interface AiRequestOptions {
  provider?: string;
  endpoint?: string;
  model?: string;
  apiKey?: string;
  toneDirective?: string;
  timeoutMs?: number; // Timeout en millisecondes pour les fournisseurs distants ; les fournisseurs locaux n'expirent pas.
}

// Built-in intelligent generation when external API isn't configured
export function generateContextualBuiltin(
  task: "continue" | "unblock" | "rewrite" | "extract" | "coherence" | "character_help" | "structure_help",
  text: string,
  context: NovelContext,
  extraParams?: Record<string, any>
): string {
  const charNames = (context.characters || []).map((c) => c.name).join(", ") || "les protagonistes";
  const pov = context.povCharacter || (context.characters?.[0]?.name ?? "le héros");
  const povChar = context.characters?.find((c) => c.name.toLowerCase() === pov.toLowerCase()) || context.characters?.[0];
  const desire = povChar?.consciousDesire || "atteindre la vérité";
  const flaw = povChar?.lieOrFlaw || "la peur de faire confiance";

  if (task === "continue") {
    const cleanDraft = text.trim();
    const lastWords = cleanDraft.slice(-200);

    return `Un silence pesant s'installa, rompu seulement par le bruissement ténu de l'air frais. ${pov} ferma un instant les yeux, sentant ce vieux tiraillement familier au creux de l'estomac — ce même réflexe qui le poussait d'ordinaire à fuir plutôt que d'affronter ${flaw}.

Pourtant, cette fois, renoncer n'était plus une option. Il fallait avancer vers ${desire}.

— Attends, souffla une voix à quelques pas. Tu as entendu ça ?

Un froissement métallique résonna contre la pierre. En se retournant brusquement, ${pov} distingua une ombre furtive glisser entre les piliers. L'instant d'après, la décision n'était plus théorique : le piège venait de se refermer d'un cran supplémentaire.`;
  }

  if (task === "unblock") {
    return JSON.stringify([
      {
        type: "Tension extérieure / Rupture",
        title: "L'intrusion imprévue",
        description: `Un bruit suspect ou un messager inattendu fait irruption dans la pièce. Ce nouvel arrivant apporte un élément qui contredit ce que ${pov} croyait acquis à propos de sa quête.`,
        starter: `La porte grinça soudain, trop lentement pour que ce fût un coup de vent...`
      },
      {
        type: "Dilemme intérieur / Révélation",
        title: "La faille se réveille",
        description: `Un mot ou un geste d'un allié touche directement la blessure de ${pov} (${flaw}). Au lieu de répondre calmement, la tension monte et révèle un secret enfoui.`,
        starter: `— Tu crois vraiment que je ne vois pas ton jeu ? lança-t-il, la voix altérée par un sanglot retenu.`
      },
      {
        type: "Délai & Menace",
        title: "Le sablier qui s'accélère",
        description: `Une découverte sensorielle (odeur de brûlé, cloche qui retentit au loin, symbole gravé) indique que l'ennemi ou l'obstacle a déjà une longueur d'avance.`,
        starter: `Le cadran n'indiquait pas l'heure habituelle. Les aiguilles avaient été brisées, et un message à la craie tachait le linteau.`
      }
    ]);
  }

  if (task === "rewrite") {
    const mode = extraParams?.mode || "show_dont_tell";
    if (mode === "show_dont_tell") {
      return `Ses doigts tremblaient lorsqu'il tenta d'ajuster le pan de son manteau. Il avala sa salive, le fond de la gorge sec comme de la cendre, les yeux rivés sur le battement irrégulier de sa propre veine au poignet. Il ne disait rien, mais chacun de ses muscles refusait d'obéir.`;
    }
    if (mode === "tighten") {
      return text
        .replace(/très\s+|vraiment\s+|absolument\s+|en fait,\s*|soudainement\s+/gi, "")
        .replace(/il semblait que|on aurait dit que/gi, "")
        .trim();
    }
    if (mode === "emotional") {
      return `L'impact ne fut pas physique, mais quelque chose se brisa net derrière ses côtes. Le souvenir de ce qu'il avait juré de protéger refit surface, brûlant et impitoyable, tandis que chaque regard alentour pesait comme un verdict sans appel.`;
    }
    return text;
  }

  if (task === "extract") {
    const textLower = text.toLocaleLowerCase();
    const characters = (context.characters || [])
      .filter((character) => textLower.includes(character.name.toLocaleLowerCase()))
      .map((character) => ({
        name: character.name,
        role: character.role || "Secondaire",
        consciousDesire: character.consciousDesire || "",
        unconsciousNeed: character.unconsciousNeed || "",
        lieOrFlaw: character.lieOrFlaw || "",
        distinguishingFeatures: "",
        notes: "Personnage déjà connu, mentionné dans le chapitre.",
      }));

    return JSON.stringify({
      characters,
      worldNotes: [],
      timelineEvents: [],
      note: "Le moteur intégré repère uniquement les personnages déjà connus. Pour extraire de nouveaux éléments et des événements, configurez un fournisseur IA.",
    });
  }

  if (task === "coherence") {
    return JSON.stringify({
      score: 82,
      strengths: [
        `Voix narrative cohérente pour ${pov}.`,
        "Sensibilité sensorielle présente et bon ancrage dans la scène.",
        "Le désir d'action du personnage est perceptible."
      ],
      warnings: [
        {
          type: "Attention débutant : Show Don't Tell",
          message: "Plusieurs passages expliquent l'émotion au lieu de la faire ressentir par les sensations physiques et les gestes."
        },
        {
          type: "Cohérence psychologique",
          message: `Rappelez-vous que ${pov} souffre de '${flaw}'. S'il accepte trop facilement l'aide d'autrui ici, cela peut affaiblir son conflit intérieur.`
        },
        {
          type: "Rythme des dialogues",
          message: "Alternez les répliques avec de micro-actions du quotidien (boire une gorgée, regarder par la fenêtre, hésiter) pour ancrer le texte dans le réel."
        }
      ],
      beginnerTip: "Ne cherchez pas à tout corriger maintenant si vous êtes en phase de premier jet ! Notez ces points dans votre carnet et gardez votre élan d'écriture."
    });
  }

  if (task === "character_help") {
    return JSON.stringify({
      consciousDesire: "Prouver sa légitimité aux yeux de ses pairs en accomplissant une mission impossible.",
      unconsciousNeed: "Accepter ses faiblesses et comprendre que la vulnérabilité n'est pas une défaite.",
      lieOrFlaw: "Croire qu'on ne peut compter que sur soi-même pour survivre.",
      internalObstacles: "Un syndrome de l'imposteur féroce et la terreur d'être rejeté s'il échoue.",
      externalObstacles: "Des rivaux sans scrupules, une hiérarchie corrompue et une montre qui tourne.",
      firstActScene: "Une scène où il refuse une aide évidente par fierté, ce qui aggrave immédiatement la situation."
    });
  }

  if (task === "structure_help") {
    return JSON.stringify({
      incitingIncident: "La découverte d'un manuscrit interdit qui bouleverse sa compréhension du monde.",
      firstPlotPoint: "L'obligation de quitter le foyer familial sous la menace d'une arrestation arbitraire.",
      midpoint: "Une fausse victoire : il atteint le sanctuaire mais découvre que son allié le plus cher lui a menti.",
      allHopeLost: "Prisonnier, sans ressources, alors que l'ultimatum approche à grands pas.",
      climax: "Il doit choisir entre sauver sa réputation ou sauver la vie d'un innocent en révélant sa propre vérité.",
      resolution: "Un retour transformé : le monde n'est plus le même, mais lui non plus."
    });
  }

  return "Analyse complétée avec succès.";
}

export async function callAiService(params: {
  task: "continue" | "unblock" | "rewrite" | "extract" | "coherence" | "character_help" | "structure_help";
  text?: string;
  context: NovelContext;
  extraParams?: Record<string, any>;
  config?: AiRequestOptions;
}): Promise<string> {
  const { task, text = "", context, extraParams, config } = params;
  const systemPrompt = `Tu es le mentor d'écriture bienveillant pour un écrivain débutant travaillant sur son roman "${context.title}".
${config?.toneDirective || "Ton rôle est de stimuler son imagination, le déculpabiliser du premier jet, lui donner confiance et enrichir son récit sans écrire tout à sa place."}`;
  const userPrompt = buildPromptForTask(task, text, context, extraParams);

  if (config?.provider === "builtin" || !config?.provider) {
    return generateContextualBuiltin(task, text, context, extraParams);
  }

  const defaultTimeoutMs = config?.timeoutMs || 30000;

  if (config.provider === "ollama") {
    const endpoint = config.endpoint || "http://localhost:11434";
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.model || "llama3",
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama a répondu ${response.status} : ${await response.text()}`);
    }
    const data = await response.json();
    if (typeof data.response !== "string" || !data.response.trim()) {
      throw new Error("Ollama n’a renvoyé aucune réponse.");
    }
    return data.response.trim();
  }

  const endpoint = config?.provider === "lmstudio"
    ? config.endpoint || "http://localhost:1234/v1"
    : config?.provider === "custom"
      ? config.endpoint
      : config?.provider && config.provider in cloudProviders
        ? cloudProviders[config.provider as keyof typeof cloudProviders].endpoint
        : undefined;
  const apiKey = config?.apiKey || (config?.provider === "openai" ? process.env.OPENAI_API_KEY : "");

  if (config?.provider === "claude") {
    if (!apiKey) throw new Error("Ajoutez votre clé API Anthropic dans les réglages IA.");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.model || "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
      signal: AbortSignal.timeout(defaultTimeoutMs),
    });
    if (!response.ok) {
      throw new Error(`Anthropic a répondu ${response.status} : ${await response.text()}`);
    }
    const data = await response.json();
    const content = data.content
      ?.filter((block: { type?: string }) => block.type === "text")
      .map((block: { text?: string }) => block.text || "")
      .join("");
    if (!content?.trim()) throw new Error("Anthropic n’a renvoyé aucune réponse.");
    return content.trim();
  }

  if (!endpoint) throw new Error(`Fournisseur IA non pris en charge : ${config?.provider}.`);
  if (config?.provider === "custom" && !endpoint) {
    throw new Error("Renseignez l’URL de l’API personnalisée dans les réglages IA.");
  }
  if (config?.provider !== "custom" && config?.provider !== "lmstudio" && !apiKey) {
    throw new Error("Ajoutez la clé API du fournisseur sélectionné dans les réglages IA.");
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  if (config?.provider === "openrouter") {
    headers["HTTP-Referer"] = "http://localhost:3000";
    headers["X-Title"] = "Plume & Premier Jet";
  }
  const response = await fetch(`${endpoint.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config?.model || (config?.provider === "lmstudio" ? "local-model" : ""),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    }),
    ...(config?.provider === "lmstudio"
      ? {}
      : { signal: AbortSignal.timeout(defaultTimeoutMs) }),
  });
  if (!response.ok) {
    throw new Error(`${config?.provider} a répondu ${response.status} : ${await response.text()}`);
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error(`${config?.provider} n’a renvoyé aucune réponse.`);
  }
  return content.trim();
}

function buildPromptForTask(
  task: string,
  text: string,
  ctx: NovelContext,
  extraParams?: Record<string, any>
): string {
  const charactersStr = ctx.characters?.map((c) => `${c.name} (${c.role || "personnage"}, désir: ${c.consciousDesire || "non défini"}, faille: ${c.lieOrFlaw || "non définie"})`).join("; ") || "Non spécifié";
  const pov = ctx.povCharacter || "Point de vue principal";

  switch (task) {
    case "continue":
      return `Roman: "${ctx.title}" (Genre: ${ctx.genre || "Fiction"}).
Personnages: ${charactersStr}.
Point de vue: ${pov}.
Chapitre actuel: "${ctx.currentChapterTitle || "En cours"}".
Dernier extrait rédigé:
"""
${text.slice(-1000)}
"""
Continue la scène de manière immersive et fluide en 2 à 3 paragraphes courts. Privilégie l'action sensorielle et le sous-texte. Encourage le premier jet.`;

    case "unblock":
      return `Roman: "${ctx.title}". Point de vue: ${pov}.
Extrait où l'auteur est bloqué:
"""
${text.slice(-800)}
"""
Propose 3 directions narratives distinctes (format JSON: [{ type, title, description, starter }]) pour relancer immédiatement l'histoire : 1) Une perturbation externe, 2) Une tension intime liée à la faille du personnage, 3) Une urgence temporelle.`;

    case "rewrite":
      return `Mode: ${extraParams?.mode || "show_dont_tell"}.
Texte à réécrire avec bienveillance:
"""
${text}
"""
Applique le principe "Montrer plutôt que dire" ou allège le style selon le mode demandé, en conservant la voix sincère de l'auteur.`;

    case "extract":
      {
      const requestedTypes = Array.isArray(extraParams?.types)
        ? extraParams.types.filter((type): type is string => typeof type === "string")
        : ["characters", "places", "events", "generalInfo"];
      const categoryLabels: Record<string, string> = {
        characters: "personnages",
        places: "lieux",
        events: "événements",
        generalInfo: "informations générales de l’univers",
      };
      const requestedLabels = requestedTypes.map((type) => categoryLabels[type]).filter(Boolean);
      return `Analyse uniquement le chapitre fourni pour proposer des éléments à ajouter au carnet du roman "${ctx.title}".
Chapitre : "${ctx.currentChapterTitle || "Chapitre en cours"}".
Types demandés : ${requestedLabels.join(", ") || "aucun"}.
Personnages déjà connus : ${(ctx.characters || []).map((character) => character.name).join(", ") || "aucun"}.
Fiches déjà connues : ${(ctx.worldNotes || []).map((note) => note.title).join(", ") || "aucune"}.
Texte du chapitre :
"""
${text.slice(0, 18000)}
"""
N'invente aucun fait. Concentre l'analyse sur les types demandés et laisse leurs tableaux vides pour tout type non demandé. Ne mélange pas les catégories :
- Personnages : nouveaux personnages ou faits nouveaux explicitement établis sur un personnage connu. Remplis uniquement les champs étayés par le chapitre.
- Lieux : lieux nommés ou décrits qui comptent pour l'histoire, avec des détails établis par le texte.
- Événements : actions ou changements importants de ce chapitre, dans leur ordre d'apparition.
- Informations générales : faits de l'univers, règles, objets importants, époque ou société; ne répète pas les lieux ni les événements.
Évite les doublons avec les personnages et fiches déjà connus. Pour chaque proposition, donne des indices concrets du chapitre dans le champ notes/description/contenu.
Réponds uniquement avec un JSON valide, sans bloc Markdown, de cette forme :
{"characters":[{"name":"...","role":"...","consciousDesire":"","unconsciousNeed":"","lieOrFlaw":"","distinguishingFeatures":"","notes":"..."}],"places":[{"title":"...","category":"lieux","content":"..."}],"timelineEvents":[{"title":"...","description":"...","timeLabel":"...","characterNames":["..."],"worldNoteTitles":["..."]}],"generalInfo":[{"title":"...","category":"lore|regles|magie_techno|societe|epoque","content":"..."}]}
Si aucun élément pertinent n'est détecté, renvoie des tableaux vides pour les quatre catégories.`;
      }

    case "coherence":
      return `Analyse bienveillante de cohérence pour ce passage de premier jet:
Roman: "${ctx.title}". Personnage: ${pov}.
Texte:
"""
${text.slice(0, 2000)}
"""
Fournis un retour constructif sous format JSON ({ score, strengths: string[], warnings: {type, message}[], beginnerTip: string }). Ne sois pas blessant, valorise les efforts.`;

    case "character_help":
      return `Aide à construire un personnage pour le roman "${ctx.title}" (Genre: ${ctx.genre}).
Nom/Idée: "${text || extraParams?.name || "Personnage"}".
Génère en JSON: { consciousDesire, unconsciousNeed, lieOrFlaw, internalObstacles, externalObstacles, firstActScene }.`;

    case "structure_help":
      return `Aide à la structure narrative pour le roman "${ctx.title}".
Pitch: "${ctx.synopsis || text}".
Propose les jalons essentiels en JSON ({ incitingIncident, firstPlotPoint, midpoint, allHopeLost, climax, resolution }).`;

    default:
      return `Aide à l'écriture pour le roman "${ctx.title}": ${text}`;
  }
}

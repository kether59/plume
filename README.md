# Plume & Premier Jet

Application locale d’accompagnement à l’écriture de romans. Elle rassemble la préparation d’un projet, la rédaction, le
suivi des objectifs et les outils de relecture dans un atelier privé, accessible depuis un navigateur.

## Fonctionnalités disponibles

- **Projets de roman** : création, sélection, résumé, genre, tonalité, objectifs de mots et étape de travail. Une base
  vierge reçoit automatiquement un projet de démonstration.
- **Recherche et grimoire** : fiches d’univers, règles, lieux et inspirations, avec catégories et étiquettes.
  Les contenus acceptent les listes, titres et tableaux Markdown ; une catégorie dédiée « Lexiques & Annexes » permet
  de ranger les dictionnaires, listes de noms et nomenclatures.
- **Structure** : chapitres ordonnés, actes, synopsis, lieu et personnage de point de vue ; raccourci vers le studio
  d’écriture.
- **Personnages** : rôle, désir conscient, besoin profond, faille, obstacles, arc, détails physiques (yeux, cheveux,
  taille, particularité, âge/date de naissance) et relations structurées visualisées en graphe.
- **Premier jet** : éditeur de chapitre, sauvegarde, modes sprint et anti-autocensure, suivi du temps et des mots,
  cartes de déblocage, proposition de reformulation et extraction IA filtrable par personnages, lieux, événements et
  informations générales.
- **Relecture** : aide à la cohérence et annotations liées au projet.
- **Bêta-lecture et exports** : retours de lecteurs, gestion de leur statut, export du manuscrit en TXT ou Markdown et
  export d’un dossier de présentation.
- **Objectifs d’écriture** : objectif quotidien, progression du manuscrit et historique des sessions.
- **Assistant IA configurable** : mode intégré, Ollama, LM Studio, API personnalisée, OpenAI/ChatGPT, Gemini, xAI
  Grok, Anthropic Claude ou OpenRouter. Des modèles sont suggérés par fournisseur, avec saisie libre d’autres
  identifiants ; OpenRouter propose aussi `openrouter/auto`. Les modèles locaux évitent d’envoyer le manuscrit à un
  service distant.
- **Aides intégrées** : boussole pour débutants, vision et architecture, et réglages de l’assistant IA.
- **Connexion privée** : page de connexion mono-utilisateur, cookie HTTP-only signé, expiration après 12 heures et
  déconnexion. Les pages et API métier sont protégées.

## Technologies et organisation

- Next.js 16 (App Router), React 19, TypeScript et Tailwind CSS 4.
- PostgreSQL avec `pg` et Drizzle ORM. Le schéma des tables est dans `src/db/schema.ts`.
- L’organisation suit des fonctionnalités : `src/app` contient les points d’entrée Next.js, `src/features` les cas
  d’usage et les écrans par domaine, `src/components` les composants d’interface, `src/lib` les intégrations et
  utilitaires partagés, et `src/db` l’accès à PostgreSQL et le schéma Drizzle.
- La base contient les projets, chapitres, personnages, fiches d’univers, sessions, retours bêta et réglages IA.
- `proxy.ts` protège l’application et les API avec la session. `/login`, les routes de connexion/déconnexion et
  `/api/health` restent accessibles sans session.

## Prérequis

- Node.js 20.9 ou plus récent et npm.
- Docker Desktop sur Windows, ou Docker Engine avec le plugin Compose sur Linux/Raspberry Pi.
- Une connexion Internet pour installer les dépendances. Le mode d’écriture et la base locale n’exigent pas de service
  hébergé.

## Installation locale (Windows)

Depuis le dossier du projet, dans PowerShell :

```powershell
npm ci
Copy-Item .env.example .env
```

Modifiez ensuite `.env` :

1. Remplacez `POSTGRES_PASSWORD` par un mot de passe de base distinct.
2. Reportez exactement ce mot de passe dans la partie correspondante de `DATABASE_URL` (encodez les caractères spéciaux
   d’une URL).
3. Remplacez `APP_EMAIL` par votre adresse e-mail de connexion et `APP_PASSWORD` par un mot de passe personnel d’au
   moins 12 caractères.
4. Remplacez `AUTH_SECRET` par un secret aléatoire unique d’au moins 32 caractères. Vous pouvez en créer un avec
   `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`.

Démarrez la base et créez/actualisez les tables :

```powershell
docker compose up -d database
npm run db:push
```

Puis lancez l’application :

```powershell
npm run dev
```

Ouvrez <http://localhost:3000> et connectez-vous avec l’adresse `APP_EMAIL` et le mot de passe `APP_PASSWORD`. Pour
l’arrêter, faites `Ctrl+C`; la base reste disponible. `docker compose down` arrête PostgreSQL sans effacer ses données.
Ne faites pas `docker compose down -v` si vous souhaitez conserver la base.

## Démarrage en production

Après configuration de `.env` et initialisation de la base comme ci-dessus :

```powershell
npm run build
npm start
```

Le script `start` écoute sur toutes les interfaces réseau afin de permettre l’accès depuis d’autres appareils du réseau
local. Le serveur utilise le port 3000 par défaut. En développement, `npm run dev` reste destiné à la machine locale.

### Démarrage complet avec Docker

Après avoir copié `.env.example` vers `.env` et renseigné les mots de passe/secrets comme décrit plus haut, une seule
commande démarre PostgreSQL, attend sa disponibilité, applique le schéma Drizzle puis lance l’application :

```powershell
docker compose up --build -d
```

Ouvrez <http://localhost:3000>. L’application n’est publiée que sur l’interface locale, et les services se connectent
à PostgreSQL via le réseau Docker. Utilisez des caractères alphanumériques pour `POSTGRES_PASSWORD` afin d’éviter les
caractères à encoder dans l’URL interne. `docker compose down` arrête les conteneurs en conservant les données du
volume `postgres-data`.

Pour exécuter les tests d’intégration sur une base séparée et jetable :

```powershell
docker compose --profile test run --build --rm integration-tests
```

Cette commande applique le schéma à `novel_writer_test` et ne touche pas à la base de l’application.

### Tests

`npm run test:unit` exécute les tests unitaires sans base de données. Pour lancer les tests d’intégration depuis Node,
démarrez une base dédiée, définissez `DATABASE_URL` vers cette base, exécutez `npm run db:push`, puis lancez
`npm run test:integration`. Ne pointez pas ces tests vers une base contenant des données à conserver.

### Installation sur Raspberry Pi

Le projet peut être installé sur un Raspberry Pi 64 bits récent avec une version de Node compatible et Docker/Compose.
Copiez le projet sur le Pi, créez un `.env` local, puis lancez `npm ci`, `docker compose up -d database`,
`npm run db:push`, `npm run build` et `npm start`. Depuis un autre appareil du réseau privé, ouvrez
`http://ADRESSE_DU_PI:3000`.

Réservez une adresse IP locale au Pi, limitez l’accès réseau au LAN et prévoyez des sauvegardes régulières. Pour un
accès à distance, placez un reverse proxy HTTPS devant Next.js et n’exposez pas directement le port de l’application ou
de PostgreSQL à Internet. En production, le cookie de connexion est `Secure` : l’accès doit donc passer par HTTPS.

## Configuration

| Variable            | Obligatoire      | Description                                                                             |
|---------------------|------------------|-----------------------------------------------------------------------------------------|
| `DATABASE_URL`      | Oui              | URL de connexion PostgreSQL utilisée par l’application et Drizzle.                      |
| `POSTGRES_PASSWORD` | Oui pour Compose | Mot de passe du compte PostgreSQL local.                                                |
| `APP_EMAIL`         | Oui              | Adresse e-mail unique utilisée pour se connecter.                                       |
| `APP_PASSWORD`      | Oui              | Mot de passe unique d’au moins 12 caractères.                                           |
| `AUTH_SECRET`       | Oui              | Secret aléatoire d’au moins 32 caractères pour signer la session.                       |
| `OPENAI_API_KEY`    | Non              | Clé facultative pour utiliser OpenAI lorsqu’elle n’est pas saisie dans les réglages IA. |

Les fichiers `.env` et `.env.local` ne doivent jamais être commités. `.env.example` ne contient que des valeurs à
remplacer. Les identifiants de l’exemple ne sont pas destinés à une installation accessible sur un réseau.

## Assistant IA

Ouvrez les réglages IA, choisissez le fournisseur, renseignez sa clé API et sélectionnez ou saisissez l’identifiant du
modèle. Avec OpenRouter, utilisez `openrouter/auto` pour laisser le service choisir le modèle. Pour Ollama ou LM
Studio, l’URL doit être joignable depuis la machine qui exécute Next.js (sur Pi, `localhost` désigne le Pi, pas le
navigateur). Les requêtes cloud transmettent au fournisseur sélectionné le prompt et le texte nécessaire à la
fonctionnalité ; vérifiez ses conditions de confidentialité avant d’y transmettre un texte de roman. Une erreur distante
est signalée au lieu d’être remplacée silencieusement par une réponse de démonstration. Le fonctionnement sans service
IA externe reste possible avec le moteur intégré.

Les appels passent par `src/app/api/ai/route.ts`, puis le cas d’usage
`src/features/ai/generate-novel-content.ts`. La liste partagée des actions autorisées est définie dans
`src/features/ai/types.ts`. `src/lib/ai-service.ts` contient le persona global de Plume, les consignes et le format de
sortie propres à chaque action, ainsi que la validation à l’exécution des réponses structurées (JSON). Chaque requête
contient l’action, la sous-action éventuelle, le texte cible, le contexte du roman, la langue et le format de sortie
attendu. Les formats texte (continuation et réécriture) restent du texte brut ; les extractions, analyses, fiches et
propositions structurées sont validées avant d’être transmises à l’interface.
Le moteur intégré est un mode de démonstration déterministe : les propositions contextualisées de fiche personnage,
« Show, Don’t Tell » et paraphrase nécessitent Ollama, LM Studio ou un fournisseur cloud configuré.

Dans le studio, « Reformuler la sélection » et « M’aider à exprimer cette idée » s’appliquent à une sélection active.
La deuxième action demande une interprétation prudente et jusqu’à trois formulations de remplacement ; aucune n’est
insérée sans validation de l’auteur.

## API principale

Toutes les routes métier exigent une session valide. Les routes d’authentification sont `POST /api/auth/login` et
`POST /api/auth/logout`; `GET /api/health` vérifie la disponibilité de la base.

| Routes                                          | Rôle                                                         |
|-------------------------------------------------|--------------------------------------------------------------|
| `/api/projects`, `/api/projects/[id]`           | Lister, créer, consulter, modifier et supprimer des projets. |
| `/api/chapters`, `/api/chapters/[id]`           | Créer, modifier et supprimer des chapitres.                  |
| `/api/characters`, `/api/characters/[id]`       | Gérer les personnages.                                       |
| `/api/character-relations`, `/api/character-relations/[id]` | Gérer les relations entre personnages.                       |
| `/api/world-notes`, `/api/world-notes/[id]`     | Gérer le grimoire.                                           |
| `/api/sessions`                                 | Enregistrer et consulter les sessions d’écriture.            |
| `/api/beta-feedback`, `/api/beta-feedback/[id]` | Gérer les retours bêta-lecteurs.                             |
| `/api/ai`, `/api/ai/config`                     | Demander une aide IA et enregistrer ses réglages.            |

## Architecture du code

`src/app` est la couche d’entrée Next.js : les noms `page.tsx` et `route.ts` sont imposés par l’App Router et les
dossiers définissent les URL. La page d’accueil délègue à `src/features/workspace/Workspace.tsx`. Les cas d’usage et
l’accès aux données sont regroupés par domaine dans `src/features` : l’IA, les projets, les chapitres, les personnages,
le grimoire, les sessions d’écriture, les retours bêta et la frise chronologique. Les adaptateurs `route.ts` valident
les requêtes HTTP, appellent la fonctionnalité concernée et convertissent son résultat en réponse HTTP.

Pour une nouvelle fonctionnalité, garder les règles métier et l’orchestration dans `src/features/<domaine>`, l’accès
aux données dans un dépôt de ce domaine ou dans `src/db` pour l’infrastructure commune, et les routes Next.js comme
adaptateurs HTTP. Éviter de placer la logique métier dans un composant React ou d’importer des composants dans les
services serveur.

## Sauvegarde et maintenance

Les données persistantes sont dans le volume Docker `postgres-data`, pas dans le dossier `.next`. Pour créer une
sauvegarde depuis PowerShell :

```powershell
docker compose exec -T database pg_dump -U novel_writer novel_writer > sauvegarde.sql
```

Conservez les sauvegardes hors du Raspberry et restaurez-les avec :

```powershell
Get-Content sauvegarde.sql | docker compose exec -T database psql -U novel_writer -d novel_writer
```

Après une modification de `src/db/schema.ts`, exécutez `npm run db:push` pour appliquer les changements de schéma
(notamment les champs physiques et la table `character_relations`) et sauvegardez la base avant toute évolution qui
peut supprimer ou transformer des données. Vérifiez l’état de l’application avec `GET /api/health`.

### Dépannage : « Failed query » en ouvrant les projets

Vérifiez d’abord <http://localhost:3000/api/health>. Si PostgreSQL ne répond pas, démarrez Docker Desktop puis lancez
`docker compose up -d database`. Vérifiez ensuite que `DATABASE_URL` dans `.env` pointe vers
`127.0.0.1:5432/novel_writer` avec le même mot de passe que `POSTGRES_PASSWORD`, puis redémarrez Next.js. Si le serveur
indique que les tables manquent, exécutez `npm run db:push`.

## Limites connues

- La connexion est volontairement **mono-utilisateur** : une adresse e-mail et un mot de passe communs à cette
  installation, sans gestion de comptes, récupération de mot de passe, MFA ni limitation de tentatives.
- Le cookie protège l’application, mais ne remplace pas HTTPS, les mises à jour système, une bonne gestion des secrets
  ni les sauvegardes.
- Les paramètres IA peuvent contenir une clé API en base. Gardez l’installation privée et protégez également les
  sauvegardes.
- Le projet ne fournit pas de reverse proxy/TLS intégré ni de pipeline de déploiement automatique. Ces éléments sont
  à ajouter avant une exposition publique.

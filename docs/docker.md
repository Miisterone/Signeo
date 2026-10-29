## Table des matières

0. [Démarage](#0-démarage)
1. [Dépendances](#1-dépendances)
2. [Manipulation sur l’OS](#2-manipulation-sur-los)
3. [Explication des arguments](#3-explication-des-arguments)
4. [Explications sur les entrypoints](#4-explications-sur-les-entrypoints)
5. [Limitation des ressources](#5-limitation-des-ressources)
6. [Signaux SIGTERM](#6-signaux-sigterm)
7. [Communication](#7-communication)
8. [Lancer le projet](#8-lancer-le-projet)
9. [CI : lint et tests](#9-ci--lint-et-tests)
<br/><br/>

# 0. Démarage

Voici le processus de démarrage des conteneurs. On démarre le backend en premier car il exécute les processus les plus longs. Le frontend attend que le backend soit `healthy`, puis Nginx attend que le frontend soit démarré (`service_started`) avant d'exposer l'application. Nginx n'a pas besoin d'attendre le backend lui-même : le frontend l'attend déjà.

### Architecture Stack

Mon parti pris d'être actuellement dépendant de Supabase a été fait pour accélérer le temps de développement, en utilisant ses services d'auth, le stockage S3 pour les signatures ainsi que la base de données PostgreSQL.

![App Screenshot](./images/archi.png)

# 1. Dépendances

Comme dépendance commune à tous les services Node, on retrouve **PNPM** qui installe les packages de chaque service à partir du lockfile partagé du mono-repo

- **Images Alpine** : choisi sa taille très legère.
- **Backend** : Prisma a besoin de son schéma avant l'installation car le client Prisma est généré (`prisma generate`) à partir de celui-ci.
- **Frontend** : aucune dépendance
- **Nginx** : aucune dépendance
- **Externe** : Supabase (Auth, Storage, PostgreSQL) est hébergé hors Docker et joint en HTTPS

# 2. Manipulation sur l’OS

Les manipulations sur le système de l'image sont minimales.

Pour les services frontend et backend, on crée un dossier de travail `/app` qui reproduit la racine du mono-repo.Ensuite on active PNPM avec `corepack enable`.

Pour le backend, on exécute en plus `pnpm exec prisma generate` afin de générer le client Prisma dans l'image sinon l'api ne peut marcher.

Pour Nginx, on copie notre `nginx.conf` à la place de la conf par défaut (`default.conf`), ce qui installe le reverse proxy.

Le `.dockerignore` à la racine du repo (le `context` du build) exclut `node_modules/`, `dist/` et `.git` afin de ne pas copier les fichiers de l'host dans l'image. Il exclut aussi `apps/backend/.env` : les secrets du backend sont injectés au démarrage via `env_file` dans `compose.yml` au lieu d'être figés dans l'image. Le `.env` du frontend reste copié car Vite intègre les variables `VITE_*` au moment du build.

# 3. Explication des arguments

### Dockerfiles

`pnpm install --frozen-lockfile` installe exactement les versions du `pnpm-lock.yaml` et échoue si le lockfile n'est pas à jour. Ca permet de rendre les builds reproductibles.
Le frontend est buildé (`pnpm run build`) pendant la construction de l'image, puis servi par `vite preview` sur `0.0.0.0:5173`. Le port est forcé avec `--port 5173` car Vite utilise 4173 par défaut, alors que Nginx et le healthcheck visent 5173.

`EXPOSE <port>` = le port écouté par le conteneur
`STOPSIGNAL SIGTERM` définit le signal envoyé lors d'un `docker stop`

### Compose

- `build.context: .` : Docker construit l'image depuis la racine du repo
- `build.dockerfile` : chemin relatif du Dockerfile
- `depends_on` : `service_healthy` attend que le service soit bien lancé "en bonne santé"
`service_started` attend seulement qu'il soit lancé.
- `healthcheck` : une commande lancée régulièrement pour vérifier que le service fonctionne.
  - Backend : `nc -z 127.0.0.1 3000` teste que le port est ouvert.
  - Frontend : `wget --spider` teste que la page répond.
  - `interval: 5s` : un test toutes les 5 secondes.
  - `start_period: 30s` : pendant le démarrage du backend (Prisma, connexion DB), les échecs ne comptent pas.
- `init: true` : kill tous les processes enfant.
- `ports: 8080` : seul Nginx est accessible depuis l'hôte.

# 4. Explications sur les entrypoints

En termes d'entrypoint, on recrée la même structure que dans le mono-repo. Chaque Dockerfile Node :

1. Crée un workspace `/app`.
2. Copie `pnpm-lock.yaml`, `pnpm-workspace.yaml` et le `package.json` racine pour garder les mêmes versions de packages que le mono-repo.
3. Copie uniquement le `package.json` du service cible (et le schéma Prisma pour le backend).
4. Installe les dépendances (`pnpm install --frozen-lockfile`).
5. Copie le code source du service.
6. Build le service, puis le lance via `CMD`.

Le backend est compilé pendant le build de l'image (`pnpm run build`), puis démarre avec `pnpm run prod` (`node dist/src/main`). Le frontend démarre avec `pnpm run preview --host 0.0.0.0 --port 5173`, qui sert le build déjà généré.

# 5. Limitation des ressources

Voici les différentes limites que j'ai choisies pour mes services :

- Frontend et backend : 1 CPU et 512M de mémoire chacun.
- Nginx : 0.5 CPU et 128M, car il ne fait que du proxy.

Ces limites empêchent un service de monopoliser la machine. Si un conteneur dépasse sa limite mémoire, il est arrêté. La consommation réelle se vérifie avec `docker stats`.

# 6. Signaux SIGTERM

Lors d'un `docker stop` ou `docker compose down`, Docker envoie un **SIGTERM** au conteneur, puis un **SIGKILL** après 10 secondes s'il est toujours actif. Le but est que chaque service s'arrête proprement (requêtes en cours terminées, connexions à la DB fermées).

Mise en place :

- **`STOPSIGNAL SIGTERM`** (Dockerfile) : fixe le signal d'arrêt de l'image.
- **`init: true`** : kill tous les processes enfant (node)
- **`app.enableShutdownHooks()`** (backend, `main.ts`) : NestJS réagit au SIGTERM, par exemple pour fermer la connexion Prisma.
- **Nginx** : gère SIGTERM nativement.

Vérification :

```bash
docker compose stop backend
docker compose logs backend 
```

# 7. Communication

![App Screenshot](./images/docker.png)

Docker Compose crée un réseau commun : chaque conteneur est joignable par son nom de service (`backend`, `frontend`, `nginx`).

Seul Nginx est exposé sur l'hôte (`8080`) et sert de point d'entrée unique. Il redirige `/api/*` vers le backend (le préfixe `/api` est retiré : `/api/users` → `/users`) et le reste vers le frontend. Il autorise aussi les uploads jusqu'à 20 Mo (`client_max_body_size 20m`) pour sécuriser le S3.

Le Swagger du backend est servi sur `/swagger` (donc `/api/swagger` via Nginx), uniquement si `SWAGGER=DEV`.

Le backend et le frontend ne sont accessibles que via Nginx. Les appels vers Supabase sortent directement des conteneurs vers Internet.

# 8. Lancer le projet

Prérequis : un fichier `.env` dans chaque services (voir les `.env.example`).

```bash
docker compose up --build -d   # build et démarre tous les services
docker compose ps              # état et healthchecks
docker compose logs -f backend # logs d'un service
docker compose down            # arrêt
```

# 9. CI : lint et tests

J'ai ajouté deux conteneurs pour vérifier le code : `lint` et `test`. Ils ne se lancent pas avec l'application, seulement quand on le demande (grâce à `profiles: ["ci"]`).

Le conteneur `lint` vérifie que le code est bien écrit (erreurs, mauvaises pratiques). Il lance `pnpm -r run lint`.

Le conteneur `test` lance les tests automatiques du backend avec `pnpm run test`.

Les deux images utilisent `node:24-alpine` : une version légère de Node 24, la version demandée par le backend. `corepack enable` active PNPM.

`COPY . .` copie tout le projet dans l'image. Le fichier `.dockerignore` évite de copier les dossiers inutiles ou lourds (`node_modules`, `dist`, `.git`, l'app mobile) et le fichier secret `.env` du backend.

La ligne `RUN` installe les paquets, puis génère le client Prisma. Car le lint comme les tests en ont besoin.

Le conteneur `test` attend que `lint` se termine sans erreur avant de démarrer (`service_completed_successfully`). Si le lint échoue, les tests ne se lancent pas.

Chaque conteneur a droit à 1 CPU et 1G de mémoire maximum. Le lint demande un peu plus de mémoire que l'application.

Pas de signal SIGTERM, ces conteneurs s'arrêtent tout seuls quand ils ont fini.

```bash
docker compose --profile ci run --rm test   # lance le lint, puis les tests
```

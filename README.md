# Signeo

Monorepo Turborepo.

## Stack

- **Frontend** — React + Vite
- **Backend** — NestJS + Prisma
- **Mobile** — React Native (Expo)
- **Base de données** — PostgreSQL (Supabase)
- **Conteneurisation** — Docker Compose + Nginx

## Prérequis

Avant de lancer le projet, créer les fichiers `.env` à partir des `.env.example` et les remplir :

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

## Démarrage

```bash
pnpm install    # installer les dépendances
pnpm dev        # lancer toutes les apps
```

## Commandes

```bash
pnpm build                    # build tout le monorepo
pnpm --filter frontend dev    # web uniquement
pnpm --filter backend dev     # backend uniquement
pnpm --filter mobile dev      # mobile uniquement
```

## Docker

L'architecture Docker est détaillée dans [docs/docker.md](docs/docker.md) (voir le dossier [docs/](docs/)).

```bash
docker compose up --build                       # lancer tous les services (http://localhost:8080)
docker compose --profile ci run --build test    # lint + tests
docker compose down                             # stop les conteneurs
```
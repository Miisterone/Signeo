# Signeo

Monorepo Turborepo.

## Stack

- **Frontend** — React + Vite
- **Backend** — NestJS + Prisma
- **Mobile** — React Native (Expo)
- **Base de données** — PostgreSQL (Supabase)

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
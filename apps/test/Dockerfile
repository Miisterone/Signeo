FROM node:24-alpine

WORKDIR /app

RUN corepack enable

COPY . .

# Les tests ont besoin du client Prisma généré
RUN pnpm install --frozen-lockfile && pnpm --filter backend exec prisma generate

WORKDIR /app/apps/backend

CMD ["pnpm", "run", "test"]
FROM node:22-alpine

# Entrypoint to install PNPM
WORKDIR /app

RUN corepack enable

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/backend/prisma apps/backend/prisma

RUN pnpm install --frozen-lockfile

COPY apps/backend apps/backend

# Entrypoint for app
WORKDIR /app/apps/backend

RUN pnpm exec prisma generate

EXPOSE 3000

STOPSIGNAL SIGTERM

CMD ["pnpm", "run", "dev"]
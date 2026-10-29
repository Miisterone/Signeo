FROM node:24-alpine

WORKDIR /app

RUN corepack enable

COPY . .

# Le lint a besoin du client Prisma généré
RUN pnpm install --frozen-lockfile && pnpm --filter backend exec prisma generate

# -r = récursif pour front et back
CMD ["pnpm", "-r", "run", "lint"]

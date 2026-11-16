FROM node:24-alpine

WORKDIR /app

RUN corepack enable

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/frontend/package.json apps/frontend/

RUN pnpm install --frozen-lockfile

COPY apps/frontend apps/frontend

WORKDIR ./apps/frontend

EXPOSE 5173

STOPSIGNAL SIGTERM

CMD ["pnpm", "run", "dev", "--port", "5173"]

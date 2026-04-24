FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable


FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json

RUN pnpm install --filter api... --frozen-lockfile


FROM deps AS build

WORKDIR /app

COPY apps/api ./apps/api

RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build


FROM base AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json

RUN pnpm install --filter api... --prod --frozen-lockfile

COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/src/main.js"]

FROM node:18-alpine AS base

RUN apk update && apk add --no-cache yt-dlp ffmpeg
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

WORKDIR /app

# ── Install dependencies ──────────────────────────────────────────────
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
RUN pnpm install --frozen-lockfile

# ── Build the worker ──────────────────────────────────────────────────
FROM deps AS build

RUN pnpm --filter @repo/train-ai-worker... build

# ── Production image ──────────────────────────────────────────────────
FROM base AS runner

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=build /app/packages/train-ai-worker/dist ./packages/train-ai-worker/dist
COPY --from=deps /app/package.json ./

EXPOSE ${PORT:-8001}

CMD ["node", "packages/train-ai-worker/dist/main.js"]

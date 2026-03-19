FROM node:18-alpine

WORKDIR /app

RUN apk update && apk add --no-cache yt-dlp ffmpeg

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages

RUN pnpm install --no-frozen-lockfile

RUN pnpm --filter @repo/train-ai-worker... build

EXPOSE ${PORT:-8001}

CMD ["node", "packages/train-ai-worker/dist/main.js"]

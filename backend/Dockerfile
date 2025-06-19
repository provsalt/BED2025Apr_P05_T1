FROM node:lts-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

WORKDIR /app

COPY . ./

FROM base AS deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

FROM base

COPY --from=deps /app/node_modules /app/node_modules

EXPOSE 3001
ENV NODE_ENV=production
CMD ["pnpm", "start"]

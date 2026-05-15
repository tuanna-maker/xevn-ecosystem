FROM node:22-alpine

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/hrm-api/package.json apps/api/hrm-api/package.json
COPY apps/api/hrm-api/tsconfig*.json apps/api/hrm-api/
RUN pnpm install --frozen-lockfile --filter hrm-api...

COPY apps/api/hrm-api apps/api/hrm-api
RUN pnpm --filter hrm-api build

EXPOSE 3001
CMD ["pnpm", "--filter", "hrm-api", "start:prod"]

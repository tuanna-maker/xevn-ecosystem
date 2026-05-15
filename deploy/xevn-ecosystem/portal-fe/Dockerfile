FROM node:22-alpine AS build

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/web-portal/package.json apps/web/web-portal/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN pnpm install --frozen-lockfile --filter web-portal...

COPY apps/web/web-portal apps/web/web-portal
COPY packages/ui packages/ui
RUN pnpm --filter web-portal build

FROM nginx:1.27-alpine
COPY deploy/xevn-ecosystem/nginx/web-portal.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/web-portal/dist /usr/share/nginx/html
EXPOSE 80

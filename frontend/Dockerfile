FROM node:22-alpine AS build
WORKDIR /workspace/frontend

RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY frontend/ ./
RUN pnpm exec nx build transformation-console --configuration=production

FROM nginx:1.27-alpine AS runtime
COPY frontend/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/frontend/dist/apps/transformation-console/browser /usr/share/nginx/html

EXPOSE 80

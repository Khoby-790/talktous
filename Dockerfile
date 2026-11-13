# Static SPA build (react-router.config.ts: ssr: false) served by nginx.
# VITE_* values are baked in at build time:
#   docker build --build-arg VITE_APOLLO_URI=https://api.example.com/graphql -t talktous-web .
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_APOLLO_URI=http://localhost:8001/graphql
ARG VITE_APP_NAME="Talk To Us"
ARG VITE_SENTRY_DSN=
ENV VITE_APOLLO_URI=$VITE_APOLLO_URI VITE_APP_NAME=$VITE_APP_NAME VITE_SENTRY_DSN=$VITE_SENTRY_DSN
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build/client /usr/share/nginx/html
EXPOSE 80

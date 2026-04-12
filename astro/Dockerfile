# Stage 1: build
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build

# Stage 2: runtime
FROM node:24-slim AS runtime
WORKDIR /app
COPY --from=build --chown=astro:astro /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build --chown=astro:astro /app/dist ./dist
USER astro
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]

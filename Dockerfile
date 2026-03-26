# Stage 1: Install dependencies
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build the application
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Payload requires a live DB connection during next build for migrations.
# CI provides a PostgreSQL service container on localhost:5432.
# Real values are injected at runtime via k8s secrets.
ENV DATABASE_URI=postgresql://ci:ci@localhost:5432/bibbunited_ci
ENV PAYLOAD_SECRET=build-time-secret-replaced-at-runtime

RUN pnpm build

# Stage 3: Production runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy sharp native binaries per D-09
COPY --from=builder /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder /app/node_modules/@img ./node_modules/@img

# Create writable directories for media and Next.js cache
# Use Alpine's built-in nobody user (UID 65534) per D-08
RUN mkdir -p /app/media /app/.next/cache && \
    chown -R nobody:nobody /app/media /app/.next/cache

USER nobody

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

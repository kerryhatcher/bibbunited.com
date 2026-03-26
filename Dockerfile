# Runtime-only image — CI builds the app, this just packages it.
# Expects .next/standalone, .next/static, and public/ to exist.
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_SHARP_PATH=/app/node_modules/sharp

# Copy pre-built standalone output from CI
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

# Install sharp with Alpine-native (musl) binaries and all its dependencies.
# Copy everything from the fresh install into app node_modules.
# Then create symlinks for all Turbopack hashed external modules
# (Turbopack bundles require() calls as "<name>-<16hex>").
COPY docker-fix-modules.sh /tmp/
RUN chmod +x /tmp/docker-fix-modules.sh && /tmp/docker-fix-modules.sh && rm /tmp/docker-fix-modules.sh

# Create writable directories for media uploads and Next.js cache
# Use Alpine's built-in nobody user (UID 65534)
RUN mkdir -p /app/media /app/.next/cache && \
    chown -R nobody:nobody /app/media /app/.next/cache

USER nobody

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

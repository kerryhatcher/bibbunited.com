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

# Replace sharp with Alpine-native (musl) binaries and resolve all
# Turbopack hashed external modules (e.g. "pg-<hash>" -> "pg").
# Turbopack bundles require() calls as "<name>-<16hex>" — we create
# symlinks from the hashed name to the real package in node_modules.
RUN rm -rf node_modules/sharp node_modules/.pnpm/*sharp* node_modules/.pnpm/*@img* && \
    cd /tmp && npm init -y > /dev/null 2>&1 && \
    npm install --os=linux --cpu=x64 --libc=musl sharp@0.34.2 > /dev/null 2>&1 && \
    cp -r node_modules/sharp /app/node_modules/sharp && \
    cp -r node_modules/@img /app/node_modules/@img 2>/dev/null || true && \
    rm -rf /tmp/node_modules /tmp/package.json /tmp/package-lock.json && \
    cd /app/node_modules && \
    for entry in $(grep -roh '[a-z_-]*-[0-9a-f]\{16\}' /app/.next/server/ 2>/dev/null | sort -u); do \
      pkg=$(echo "$entry" | sed 's/-[0-9a-f]\{16\}$//'); \
      if [ -d "/app/node_modules/.pnpm/${pkg}@"*/node_modules/"${pkg}" ] || [ -d "/app/node_modules/${pkg}" ]; then \
        real=$(ls -d /app/node_modules/.pnpm/${pkg}@*/node_modules/${pkg} 2>/dev/null | head -1); \
        [ -z "$real" ] && real="/app/node_modules/${pkg}"; \
        ln -sf "$real" "/app/node_modules/${entry}"; \
      fi; \
    done

# Create writable directories for media uploads and Next.js cache
# Use Alpine's built-in nobody user (UID 65534)
RUN mkdir -p /app/media /app/.next/cache && \
    chown -R nobody:nobody /app/media /app/.next/cache

USER nobody

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

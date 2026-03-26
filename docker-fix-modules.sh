#!/bin/sh
set -e

# 1. Install sharp with Alpine-native binaries in a clean directory
rm -rf /app/node_modules/sharp /app/node_modules/@img /app/node_modules/detect-libc
rm -rf /app/node_modules/.pnpm/*sharp* /app/node_modules/.pnpm/*@img*

cd /tmp
npm init -y > /dev/null 2>&1
npm install --os=linux --cpu=x64 --libc=musl sharp@0.34.2 > /dev/null 2>&1

# Copy sharp and all its dependencies
for pkg in sharp @img detect-libc color semver; do
  if [ -d "/tmp/node_modules/$pkg" ]; then
    rm -rf "/app/node_modules/$pkg"
    cp -r "/tmp/node_modules/$pkg" "/app/node_modules/$pkg"
  fi
done

rm -rf /tmp/node_modules /tmp/package.json /tmp/package-lock.json

# 1b. Install drizzle-kit (needed by Payload admin panel at runtime)
cd /tmp
npm init -y > /dev/null 2>&1
npm install drizzle-kit > /dev/null 2>&1
if [ -d "/tmp/node_modules/drizzle-kit" ]; then
  cp -r "/tmp/node_modules/drizzle-kit" "/app/node_modules/drizzle-kit"
fi
rm -rf /tmp/node_modules /tmp/package.json /tmp/package-lock.json

# 2. Create symlinks for Turbopack hashed external modules
# Turbopack references modules as "<name>-<16hex>" (e.g. "sharp-03c9e6d01f648d5d")
cd /app/node_modules
for entry in $(grep -roh '[a-z_-]*-[0-9a-f]\{16\}' /app/.next/server/ 2>/dev/null | sort -u); do
  # Extract the real package name by removing the hash suffix
  pkg=$(echo "$entry" | sed 's/-[0-9a-f]\{16\}$//')

  # Find the real package in node_modules or .pnpm
  real=""
  if [ -d "/app/node_modules/${pkg}" ]; then
    real="/app/node_modules/${pkg}"
  else
    real=$(ls -d /app/node_modules/.pnpm/${pkg}@*/node_modules/${pkg} 2>/dev/null | head -1)
  fi

  if [ -n "$real" ] && [ -d "$real" ]; then
    ln -sf "$real" "/app/node_modules/${entry}"
    echo "Linked: ${entry} -> ${real}"
  else
    echo "WARN: No package found for ${entry} (pkg=${pkg})"
  fi
done

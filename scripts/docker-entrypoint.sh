#!/bin/sh
set -e

mkdir -p /data /app/public/assets/work
if [ -d /app/asset-seed ]; then
  cp -an /app/asset-seed/. /app/public/assets/work/ || true
fi
chown -R nextjs:nodejs /data /app/public/assets/work

su-exec nextjs node /app/node_modules/prisma/build/index.js migrate deploy

# Seed only on first boot or when SEED_FORCE=1 (keeps restarts fast).
if [ "$SEED_FORCE" = "1" ] || [ "$SEED_FORCE" = "true" ] || [ ! -f /data/.seeded ]; then
  su-exec nextjs node /app/node_modules/tsx/dist/cli.mjs /app/prisma/seed.ts
  su-exec nextjs touch /data/.seeded
fi

exec su-exec nextjs node server.js

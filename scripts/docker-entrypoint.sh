#!/bin/sh
set -e

mkdir -p /data /app/public/assets/work
if [ -d /app/asset-seed ]; then
  cp -an /app/asset-seed/. /app/public/assets/work/ || true
fi
chown -R nextjs:nodejs /data /app/public/assets/work

su-exec nextjs node /app/node_modules/prisma/build/index.js migrate deploy
su-exec nextjs node /app/node_modules/tsx/dist/cli.mjs /app/prisma/seed.ts
exec su-exec nextjs node server.js

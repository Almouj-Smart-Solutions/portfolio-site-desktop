# Production image. Built on GitHub Actions; the VM only pulls and runs it.
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:./portfolio.db"
ENV AUTH_SECRET="build-placeholder"
ENV NEXTAUTH_SECRET="build-placeholder"
ENV AUTH_TRUST_HOST="true"
RUN npm run build

FROM node:22-alpine AS tools
RUN apk add --no-cache libc6-compat openssl
WORKDIR /tools
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts \
  && npm install --no-save --ignore-scripts tsx \
  && mkdir -p /prisma-tools/node_modules \
  && for pkg in prisma tsx esbuild effect c12 deepmerge-ts empathic citty confbox consola defu destr dotenv exsolve giget jiti node-fetch-native nypm ohash pathe perfect-debounce pkg-types rc9 tinyexec chokidar readdirp @standard-schema/spec fast-check pure-rand; do \
       if [ -d "node_modules/$pkg" ]; then cp -a "node_modules/$pkg" /prisma-tools/node_modules/; fi; \
     done \
  && cp -a node_modules/@prisma /prisma-tools/node_modules/ \
  && cp -a node_modules/@esbuild /prisma-tools/node_modules/ \
  && cp -a node_modules/.prisma /prisma-tools/node_modules/ 2>/dev/null || true

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URL="file:/data/portfolio.db"

RUN apk add --no-cache openssl libc6-compat su-exec \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/public/assets/work ./asset-seed
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/lib/data.ts ./lib/data.ts
COPY --from=tools --chown=nextjs:nodejs /prisma-tools/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --chown=nextjs:nodejs scripts/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh \
  && mkdir -p /data /app/public/assets/work \
  && chown -R nextjs:nodejs /data /app/public/assets/work

EXPOSE 3000
CMD ["./docker-entrypoint.sh"]

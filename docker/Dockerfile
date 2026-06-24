# =============================================================================
# PRODUCTION DOCKERFILE - Next.js standalone multi-stage build
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: deps - Install all dependencies (incl. devDeps needed to build)
# -----------------------------------------------------------------------------
FROM node:22-alpine AS deps

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
# Stage 2: build - Compile the Next.js app to a standalone server bundle
# -----------------------------------------------------------------------------
FROM deps AS build

WORKDIR /app

# NEXT_PUBLIC_* values are inlined into the client bundle at BUILD time, so they
# must be present here (passed via docker-compose build args). They are public
# by design (browser-exposed), not secrets.
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_TELEMETRY_DISABLED=1

COPY . .

RUN pnpm run build

# -----------------------------------------------------------------------------
# Stage 3: run - Minimal production image (no pnpm, no full node_modules)
# -----------------------------------------------------------------------------
FROM node:22-alpine AS run

LABEL org.opencontainers.image.description="MBA Interview Prep Frontend - Production"
LABEL org.opencontainers.image.licenses=MIT

WORKDIR /app

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# The standalone output bundles the minimal runtime node_modules itself.
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/web/package.json ./apps/web/

# Create stubs for other workspaces referenced by root package.json
RUN mkdir -p apps/backend apps/mobile packages/design_system packages/ia_research && \
    echo '{"name":"@city-hero/backend","private":true}' > apps/backend/package.json && \
    echo '{"name":"@city-hero/mobile","private":true}' > apps/mobile/package.json && \
    echo '{"name":"@city-hero/design-system","private":true}' > packages/design_system/package.json && \
    echo '{"name":"@city-hero/ia-research","private":true}' > packages/ia_research/package.json

RUN npm install --ignore-scripts

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy entire deps stage to avoid missing node_modules issues
COPY --from=deps /app ./

COPY packages/types ./packages/types
COPY apps/web ./apps/web

ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build --workspace=apps/web

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

CMD ["node", "apps/web/server.js"]

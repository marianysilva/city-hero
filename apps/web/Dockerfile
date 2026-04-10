FROM node:20-alpine

WORKDIR /app

# Copy workspace config files
COPY package.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/web/package.json ./apps/web/

# Create stubs for other workspaces referenced by root package.json
RUN mkdir -p apps/backend apps/mobile packages/design_system packages/ia_research && \
    echo '{"name":"@city-hero/backend","private":true}' > apps/backend/package.json && \
    echo '{"name":"@city-hero/mobile","private":true}' > apps/mobile/package.json && \
    echo '{"name":"@city-hero/design-system","private":true}' > packages/design_system/package.json && \
    echo '{"name":"@city-hero/ia-research","private":true}' > packages/ia_research/package.json

# Install deps
RUN npm install

# Copy actual source code
COPY packages/types ./packages/types
COPY apps/web ./apps/web

# Next.js bakes NEXT_PUBLIC_* at build time
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

CMD ["npm", "run", "dev", "--workspace=apps/web"]

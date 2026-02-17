# CityHero Cursor Rules

## Project Context
CityHero is a GovTech monorepo.
- /apps/web: Next.js Dashboard for managers.
- /apps/mobile: Expo/React Native for citizens.
- /apps/backend: FastAPI for AI and data orchestration.
- /packages/design_system: Shared UI components.

## Technical Standards
- **General:** Use TypeScript for all JS/TS code. Prefer functional components and hooks.
- **GIS/Location:** Always use [longitude, latitude] for coordinates (GeoJSON standard). Use PostGIS functions for spatial queries (e.g., `ST_DWithin`).
- **UI/UX:** Use Tailwind CSS. Components must follow the shared 'design_system'.
- **Backend:** FastAPI with Pydantic v2. Use dependency injection for DB sessions.

## Business Logic Guardrails
- **Privacy:** Before saving photos, ensure a blurring utility is called for faces/license plates.
- **Deduplication:** Check for existing reports within a 20-meter radius before creating a new ticket.
- **Interoperability:** Align API responses with Open311 (GeoReport v2) specs where possible.

## Interaction Style
- Be concise. 
- If a change affects multiple apps, explain the impact on the monorepo.
- Always check if a component already exists in `packages/design_system` before creating a new one.
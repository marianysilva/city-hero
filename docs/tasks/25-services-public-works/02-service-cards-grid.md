# Services & Public Works · Service cards grid

> **Type:** Screen feature · UI + data\
> **Screen:** SCREEN 25 · Services & Public Works\
> **Effort:** M (1-2 days)\
> **Dependencies:** `25-services-public-works/01-render-services-ui-base.md`,
> `00-foundation/05-api-client.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `backend`, `screen`

## Context

A 2-column grid of large cards covering city services. Each card: emoji, label, subtitle, and a
color-themed background. The catalog is per-city; for Pôrto Belo:

- 🚧 Obras em Andamento (→ SCREEN 26)
- 📋 Solicitar Serviço (deep link to prefecture's portal)
- 🩺 UBS Mais Próximas (city's health unit map)
- 🎓 Escolas (education portal)
- 🚌 Transporte (transport portal)
- 💧 Água & Esgoto
- 🗑️ Coleta de Lixo
- 📜 Documentos / Protocolos

## Acceptance Criteria

### Scenario · Default render

**Given** the catalog is loaded\
**When** the grid renders\
**Then** cards appear in a 2-column grid sorted by relevance\
**And** each card has its emoji, label, subtitle, and themed background

### Scenario · Tap a card

**Given** the user taps "Obras em Andamento"\
**When** the action runs\
**Then** the app navigates to SCREEN 26

### Scenario · External link cards

**Given** a card links to the prefecture's external portal\
**When** tapped\
**Then** the browser opens the URL\
**And** UTM parameters track the source

### Scenario · In-app deep link cards

**Given** a card links to a future in-app section\
**When** tapped (and the section exists)\
**Then** the app navigates internally\
**And** if the section is not yet built, a soft "Em breve" sheet appears

### Scenario · Per-city catalog

**Given** different cities have different services\
**When** the catalog loads\
**Then** only the active city's services appear

### Scenario · Real-time updates

**Given** the prefecture adds a new service\
**When** the change syncs\
**Then** the card appears on next screen open

### Scenario · Localization

**Given** en-US\
**When** rendered\
**Then** labels translate where applicable

### Scenario · Accessibility

**Given** SR is on\
**When** the grid is navigated\
**Then** each card is a button with its label and subtitle

## Frontend

```
apps/city-hero/src/screens/ServicesPublicWorks/
├── components/
│   ├── ServiceCardsGrid.tsx
│   └── ServiceCard.tsx
└── hooks/
    └── useServiceCatalog.ts
```

## Backend

| Method | Path                           | Purpose                       |
| ------ | ------------------------------ | ----------------------------- |
| GET    | `/api/v1/cities/{id}/services` | Services catalog for the city |

Returns each service: key, label, emoji, subtitle, theme_color, destination (in-app route or
external URL).

## Database

`city_services` table with the fields above. Per-city configuration.

## Edge Cases

- **External URL broken**: soft fallback informs user.
- **In-app destination not yet built**: "Em breve" sheet.

## Privacy / LGPD

Catalog is public; no PII.

## Analytics

| Event                     | When          | Props         |
| ------------------------- | ------------- | ------------- |
| `services.catalog_loaded` | Grid rendered | `count`       |
| `services.card_pressed`   | User tapped   | `service_key` |

## Tests

- **Unit**: card variants; tap navigation (in-app vs external).
- **Snapshot**: each card variant.
- **A11y**: cards as buttons.

## Definition of Done

- [ ] ServiceCardsGrid + ServiceCard
- [ ] useServiceCatalog hook
- [ ] Backend services endpoint
- [ ] In-app + external routing
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Render UI base: `01-render-services-ui-base.md`
- Public Works (destination): `docs/tasks/26-public-works-list/`
- `CLAUDE.md`

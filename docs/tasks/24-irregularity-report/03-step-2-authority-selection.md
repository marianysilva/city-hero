# Irregularity Report · Step 2 · Authority selection

> **Type:** Screen feature · UI + state
> **Screen:** SCREEN 24 · Irregularity Report
> **Effort:** M (1-2 days)
> **Dependencies:** `24-irregularity-report/01-render-irregularity-ui-base.md`, `24-irregularity-report/02-step-1-program-selection.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `backend`, `screen`

## Context

Step 2: the user picks **which authority** they want to file with. Based on the program/area chosen in step 1, the screen recommends the most relevant authorities first:

- **CGU** (federal · Bolsa Família, BPC, etc.) — Controladoria-Geral da União.
- **Ministério Público** (federal/state · serious irregularities).
- **Ouvidoria da Prefeitura** (city services).
- **TCU / TCE** (federal/state audit).

Each card shows the authority's logo (emoji), name, scope (federal/state/municipal), short description, and accepted channels (email, web form, in-app).

## Acceptance Criteria

### Scenario · Default render with recommendations

**Given** the user picked a federal program in step 1
**When** step 2 renders
**Then** CGU is recommended first ("Recomendado para essa área")
**And** Ministério Público + TCU follow as also-relevant
**And** less-relevant options appear below the fold

### Scenario · Default render with municipal context

**Given** the user picked a municipal service
**When** step 2 renders
**Then** Ouvidoria da Prefeitura is recommended first
**And** Ministério Público (state) follows
**And** federal authorities are softer

### Scenario · Tap an authority

**Given** the user picks an authority
**When** the action runs
**Then** the card highlights
**And** Continuar enables

### Scenario · Authority detail expand

**Given** the user wants more info on an authority
**When** they tap the "Saber mais" link
**Then** a sheet expands explaining the authority's mandate, response time, and process

### Scenario · Filtering

**Given** the user is overwhelmed
**When** they use a filter (e.g., "Federal", "Municipal")
**Then** the cards filter accordingly

### Scenario · Localization

**Given** en-US
**When** rendered
**Then** authority names stay in Portuguese (they're proper nouns)
**And** descriptions translate

### Scenario · Accessibility

**Given** SR is on
**When** the user navigates the cards
**Then** each is announced with name, scope, and recommendation status

## Frontend

```
apps/mobile/src/screens/IrregularityReport/
├── steps/
│   └── Step2AuthoritySelection.tsx
└── hooks/
    └── useIrregularityAuthorities.ts
```

The hook fetches the authorities catalog and computes recommendations based on the program from step 1.

## Backend

| Method | Path                                                      | Purpose                              |
|--------|-----------------------------------------------------------|---------------------------------------|
| GET    | `/api/v1/authorities?program=&jurisdiction=`              | List authorities with recommendations|

The endpoint returns each authority's metadata + supported channels (email address, web form URL, etc.).

## Database

A small `authorities` table with: id, name, scope (federal/state/municipal), description, channels (jsonb), recommended_programs (jsonb).

## Edge Cases

- **No authority matches the program** (very rare): "Outro" fallback to a generic web form for Ouvidoria-Geral.
- **Channel URLs change**: catalog updates server-side; clients pick up on next refresh.

## Privacy / LGPD

No PII collected at this step.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `irregularity.authority_selected`  | User picked an authority                   | `authority_id`, `scope`              |
| `irregularity.authority_info_opened` | User expanded an authority's info       | `authority_id`                        |

## Tests

- **Unit**: recommendation logic; filter; info expansion.
- **Snapshot**: each authority variant.
- **A11y**: cards labeled.

## Definition of Done

- [ ] Step2AuthoritySelection screen
- [ ] useIrregularityAuthorities hook
- [ ] Backend authorities endpoint with catalog
- [ ] Recommendation logic
- [ ] Filter + info sheets
- [ ] Localized labels
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Render UI base: `01-render-irregularity-ui-base.md`
- `CLAUDE.md`

# Tasks · CityHero

End-to-end implementation catalog for the CityHero Citizen App MVP. Each `.md` file represents an
atomic task that can be imported as a GitHub Project issue and assigned to Claude Code (or a human).

## How to read

Every task follows the same skeleton:

- **Header** (type, screen, effort, dependencies, labels)
- **Context** — the why and where it fits
- **User Story** (As a / I want / In order to)
- **Acceptance Criteria** in Gherkin (Given-When-Then)
- **Frontend** (React Native + components + state + navigation + a11y)
- **Backend** (FastAPI + endpoints + Open311 mapping)
- **Database** (PostgreSQL + PostGIS + Alembic)
- **Edge Cases & Error States**
- **Privacy / LGPD** (when applicable)
- **Analytics**
- **Tests**
- **Definition of Done**

## Folder structure

```
docs/tasks/
├── README.md                        ← this file
├── 00-foundation/                   ← infra + shared components
│   ├── _README.md
│   ├── 01-monorepo-setup.md
│   ├── 02-design-tokens.md
│   ├── 03-bottom-nav-component.md
│   ├── 04-status-bar-component.md
│   ├── 05-api-client.md
│   ├── 06-auth-system.md
│   ├── 07-photo-upload-pipeline.md
│   ├── 08-anonymization-pipeline.md
│   ├── 09-offline-queue.md
│   ├── 10-leaflet-map-wrapper.md
│   ├── 11-push-notification-handler.md
│   ├── 12-deep-link-handler.md
│   ├── 13-i18n.md
│   ├── 14-analytics-tracking.md
│   ├── 15-error-boundary.md
│   ├── 16-yolov8-inference-service.md
│   ├── 17-docker-dev-environment.md
│   └── 20-observability-package.md
├── 01-splash/                       ← SCREEN 01 · Splash / Welcome
│   ├── _README.md
│   ├── 01-render-splash-ui.md
│   ├── 02-app-initialization.md
│   ├── 03-routing-decision.md
│   ├── 04-force-update-flow.md
│   └── 05-cold-start-offline.md
├── 02-city-select/                  ← SCREEN 02
├── 03-onboarding-camera/            ← SCREEN 03
├── 04-onboarding-gamification/      ← SCREEN 04
├── 04b-onboarding-community-pact/   ← SCREEN 04b · Pacto Cidadão
├── 05-onboarding-neighborhood/      ← SCREEN 05
├── 06-home-map/                     ← SCREEN 06
├── 07-civic-feed/                   ← SCREEN 07
├── 08-camera-live/                  ← SCREEN 08
├── 09-manual-report/                ← SCREEN 09
├── 10-report-confirm/               ← SCREEN 10
├── 11-anonymous-send/               ← SCREEN 11
├── 12-heroes-league/                ← SCREEN 12
├── 13-detail-in-progress/           ← SCREEN 13
├── 14-detail-ticket/                ← SCREEN 14
├── 15-nps-feedback/                 ← SCREEN 15
├── 16-my-reports/                   ← SCREEN 16
├── 17-detail-merged/                ← SCREEN 17
├── 18-sync-queue/                   ← SCREEN 18
├── 19-notifications/                ← SCREEN 19
├── 20-city-profile/                 ← SCREEN 20
├── 21-prefecture-news/              ← SCREEN 21 · Prefecture announcements
├── 21b-elected-officials/           ← SCREEN 21b · Políticos eleitos da cidade
├── 22-programs-transparency/        ← SCREEN 22
├── 23-bolsa-familia-detail/         ← SCREEN 23
├── 24-irregularity-report/          ← SCREEN 24
├── 25-services-public-works/        ← SCREEN 25
├── 26-public-works-list/            ← SCREEN 26
├── 27-public-work-detail/           ← SCREEN 27
├── 28-citizen-profile/              ← SCREEN 28
├── 29-achievements-badges/          ← SCREEN 29
└── 30-neighborhood-ranking/         ← SCREEN 30
```

## Out-of-MVP tasks

Tasks whose Acceptance Criteria hard-depend on infrastructure outside `apps/backend` and
`apps/city-hero` (the Operational Panel `apps/web`, the Field Team App, or the analytics stack —
Airflow, dbt, Superset) live in a sibling folder, not here — even when the task's own header labels
it `backend`:

```
docs/out-of-mvp/
├── 21b-elected-officials/
│   └── 05-data-ingestion-pipeline.md   ← requires Airflow (analytics/pipelines) + dbt (analytics/transformations)
└── 20-city-profile/
    └── 04-insights-card.md             ← backend endpoint requires dbt-materialized fact tables (analytics/transformations)
```

Each moved file keeps its own Acceptance Criteria untouched; only its path and any now-broken
cross-references were updated.

## Conventions

- **Suggested labels** (in each task header): `mobile`, `backend`, `database`, `foundation`,
  `screen`, `lgpd`, `gamification`, `offline`, `ai`, `accessibility`
- **Effort:** S (≤1 day) · M (1-3 days) · L (3-5 days) · XL (1+ week)
- **Dependencies:** referenced by relative path (e.g., `00-foundation/03-bottom-nav-component.md`)
- **Status in header:** `⬜ Not started` / `🟡 In progress` / `✅ Done`

## Frontend component placement (binding)

Every UI component — atom, molecule, organism, template — lives in **`packages/design_system`** and
has a **Storybook story**. Screen folders compose design-system pieces; they don't define generic UI
primitives. See:

- [`docs/engineering/design-system.md`](../engineering/design-system.md) — the canonical rules
  (atomic tiers, location, React patterns, Storybook requirement).
- [`docs/engineering/component-inventory.md`](../engineering/component-inventory.md) — the catalog
  of every shared component with the screens that consume it.

Where a task spec's "Where it lives" section mentions a generic component in a screen folder (e.g.,
`apps/city-hero/src/screens/Foo/components/Bar.tsx`), that path is the task's draft starting point.
If `Bar` is used by 2+ screens (or fits an existing atom/molecule from the inventory), the inventory
and the design-system rules win: `Bar` moves to `packages/design_system/` with a story and is
imported by screens via the package's public API. Conflicts resolve in favor of `design-system.md`.

## How to use with Claude Code

1. Pick a task from `docs/tasks/<folder>/`
2. Confirm dependencies are resolved (header → Dependencies)
3. Read the standards docs referenced in the task's `Standards & References` section, especially
   `design-system.md` for any UI work
4. Paste the content into a Claude Code session with the instruction:
   > "Implement this task end-to-end following the Acceptance Criteria. Use TDD where applicable.
   > Pause if anything is ambiguous."

## How to import into GitHub Projects

Each file is plain Markdown. To create an issue:

1. `gh issue create --title "<task title>" --body-file docs/tasks/00-foundation/03-bottom-nav-component.md`
2. Add labels via `--label "<labels from header>"`
3. Add to project: `gh project item-add 1 --owner marianysilva --url <issue url>`

Or via UI: New issue → paste content → add labels → assign to Project.

## Coverage by features.md section

| features.md section                          | Coverage                                                                                                                                                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Citizen App                               | 32 screens (30 numeradas + 04b Pacto Cidadão + 21b Políticos eleitos) + foundation                                                                                                                                             |
| 2. Field Team App                            | ❌ out of MVP scope (planned for a follow-up after the citizen app)                                                                                                                                                            |
| 3. Operational Management Panel (`apps/web`) | ❌ out of MVP scope — the Next.js admin panel mentioned in `CLAUDE.md` has no task specs yet and is paused per product decision (2026-06-19). The `architecture-patterns.md` section on Next.js is kept for when this resumes. |
| 4. Data Intelligence & BI                    | partial (NPS) — elected-officials ingestion and the city-profile insights card moved to `docs/out-of-mvp/` (hard Airflow/dbt dependency)                                                                                       |
| 5. Platform Core & Integrations              | ✅ foundation (Open311, multi-tenant, RBAC)                                                                                                                                                                                    |
| 6. Citizen ++                                | partial (anonymous, i18n, a11y)                                                                                                                                                                                                |
| 11. Scope Expansion                          | ❌ v2                                                                                                                                                                                                                          |

> **Dev-only workaround for no login flow yet:** while real auth is on hold (see
> `docs/engineering/open-questions.md` Q2), the **profile switcher** in
> `28-citizen-profile/07-profile-switcher.md` lets QA swap between persona types (citizen,
> prefecture manager, field team) to exercise role-specific UI in dev and staging builds.

---

_Last updated: 2026-07-15 · 32 screens (30 numeradas + 04b Pacto Cidadão + 21b Políticos eleitos) +
18 foundation tasks · 2 tasks moved to `docs/out-of-mvp/`_

# SCREEN 21b · Politicians of the City

> **Group:** 02 · App Core
> **Prototype screen:** `design/src/screens/21b-elected-officials.js` (title: `'Políticos da Cidade'`)
> **Position in navigation:** Opened from a new card in SCREEN 21 (Programs & Transparency), section **"Transparência estrutural"**

## Overview

A factual roster of every politician who represents the city —
municipal executive (mayor + vice), city council, state assembly
members with relevant local vote share, and federal deputies +
senators with relevant local vote share. The screen exists to make
the **representative chain visible** to the citizen: who was elected,
by whom, for which mandate, and where to find their public
spending.

Each official card surfaces basic public data (name, party, role,
level, mandate, votes received in the city) and a primary CTA that
opens the **Portal da Transparência** in an external browser, pre-
filled with the official's cross-referenced ID. CityHero does **not**
publish opinions, scores, or rankings about any politician — the
screen is a thin, neutral aggregator of public data sources.

Data feeds (all public):

- **TSE** (Tribunal Superior Eleitoral) — elected officials + per-
  municipality vote counts (`https://divulgacandcontas.tse.jus.br/`).
- **Câmara dos Deputados** open data (`https://dadosabertos.camara.leg.br/`).
- **Senado Federal** open data (`https://legis.senado.leg.br/dadosabertos/`).
- **Câmara Municipal** of the active city (per-city integration; varies).
- **Portal da Transparência** ID cross-referenced via CPF + full name
  (`https://portaldatransparencia.gov.br/pessoa/{id}`).

Refresh cadence: **monthly** (mandates rarely change mid-term; vote
totals are immutable post-election).

## Features (5 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI base · header, KPI hero, search slot, chip slot, group slots, sources card, disclaimer](./01-render-officials-ui-base.md) | S | `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md` |
| 02 | [Officials list · fetching, grouping by level, in-group pagination, loading + error](./02-officials-list-and-grouping.md) | M | task 01, `00-foundation/05-api-client.md` |
| 03 | [Search + filter chips · name search and level filter wired to the list](./03-search-and-filter.md) | S | task 01, task 02 |
| 04 | [Transparency deeplink · "Portal da Transparência" external open + missing-ID handling](./04-transparency-deeplink.md) | S | task 02, `00-foundation/12-deep-link-handler.md`, `00-foundation/14-analytics-tracking.md` |
| 05 | [Data ingestion pipeline · TSE + Câmara + Senado + local council scrapers/APIs → `elected_officials` table](./05-data-ingestion-pipeline.md) | L | task 02 (schema contract) |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (list + grouping) ──┬─→ 03 (search + filter)
          │                          └─→ 04 (transparency deeplink)
          └────────────────────────────────────────────────────→ 05 (backend pipeline runs in parallel; task 02 stubs the data while 05 lands)
```

## Product notes

- **Apartidarismo (non-partisanship)**: the app does **not** issue
  editorial opinion, does not favor or disfavor any party, does not
  rank or score politicians, and does not insert sentiment markers
  (no thumbs, no stars, no colored "performance" pills). Content is
  purely factual aggregation of public sources. Every contributor to
  this screen must defend this rule against scope creep.
- **Official sources only**: TSE for election results, Câmara dos
  Deputados / Senado / local council for mandate data, Portal da
  Transparência for spending. The "Fonte dos dados" card at the
  bottom of the screen is mandatory and must name every active
  source.
- **Constitutional basis**: Brazilian Constitution **art. 37**
  (principle of publicity of public administration) + **Lei de
  Acesso à Informação** (LAI, Lei 12.527/2011) make nominal data
  about elected officials public. The disclaimer card on the screen
  cites this explicitly.
- **LGPD boundary**: name + party + role + mandate + per-city vote
  count = public (LAI/art.37). **CPF is never exposed in the UI or
  API responses** — it is used internally only to cross-reference
  the Portal da Transparência ID, and is stored as a salted hash
  (`cpf_hash`) so the raw CPF never lives in the database.
- **Link leaves the app**: the Portal da Transparência CTA opens the
  external browser (or in-app browser tab if the platform supports
  it). The "Fonte dos dados" card warns the user.
- **Monthly refresh**: the pipeline (task 05) is scheduled monthly
  via Airflow. Election years (October) trigger an additional
  post-result refresh. The roster is otherwise stable.
- **Multi-tenant**: every query is scoped by `city_id`. State and
  federal officials appear in a city's list only when their votes
  in that city exceed a configurable threshold (default: ≥ 1% of
  the city's valid votes for that office).
- **Missing transparency ID**: not every official has a resolved
  Portal da Transparência ID (newly-elected, name collisions, CPF
  mismatch). The CTA degrades gracefully — see task 04.
- **Scraping ethics**: each upstream portal has its own ToS and
  rate-limit posture. The pipeline (task 05) must honor robots.txt,
  set a descriptive User-Agent that identifies CityHero, throttle
  requests, and prefer official open-data APIs over HTML scraping
  wherever both exist.

## Standards & References

- Design system overview: `docs/engineering/design-system.md`
- Component inventory (SearchBar, FilterChipRow, Badge): `docs/engineering/component-inventory.md`
- Security baseline (PII, hashing, external links): `docs/engineering/security-baseline.md`
- Open questions log: `docs/engineering/open-questions.md`
- Parent screen entry point: `docs/tasks/22-programs-transparency/` (entry card lives in "Transparência estrutural" — coordinate with that screen's card list)
- `CLAUDE.md`

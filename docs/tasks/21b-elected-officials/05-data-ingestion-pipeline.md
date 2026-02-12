# Elected Officials · Data ingestion pipeline

> **Type:** Backend feature · ETL + data
> **Screen:** SCREEN 21b · Politicians of the City
> **Effort:** L (3-5 days)
> **Dependencies:** `21b-elected-officials/02-officials-list-and-grouping.md` (schema contract), `analytics/pipelines/` (Airflow setup from foundation), `analytics/transformations/` (dbt setup from foundation)
> **Status:** ⬜ Not started
> **Labels:** `backend`, `data`, `etl`, `airflow`, `dbt`

## Context

The end-to-end pipeline that populates `elected_officials` for every
tenant city. Pulls from four public sources, normalizes them, joins
on `(cpf_hash, full_name, mandate_window)`, cross-references the
Portal da Transparência person ID, and writes the result to the
transactional table consumed by tasks 02–04.

Runs **monthly** via Airflow (mandates and per-municipality vote
counts barely change). After every Brazilian general election
(every 2 years in October), an additional ad-hoc DAG run reconciles
the new roster within 7 days.

### Sources

| Source                    | Kind                | Endpoint / URL                                                                  | Covers                                                  |
|---------------------------|---------------------|---------------------------------------------------------------------------------|---------------------------------------------------------|
| TSE                       | open data + scraping| `https://divulgacandcontas.tse.jus.br/`                                         | Elected officials + per-municipality votes (all offices)|
| Câmara dos Deputados      | open data API       | `https://dadosabertos.camara.leg.br/`                                           | Federal lower-house mandates, photos, current status    |
| Senado Federal            | open data API       | `https://legis.senado.leg.br/dadosabertos/`                                     | Senate mandates, photos, current status                 |
| Câmara Municipal (per city)| variable           | Each city integration (HTML scraping or local open-data feed)                   | City council mandates, council president flag           |
| Portal da Transparência   | open data API + HTML| `https://portaldatransparencia.gov.br/`                                         | Person IDs to cross-reference                           |

## User Story

**As a** Backend operator,
**I want** a scheduled pipeline that keeps the elected-officials roster fresh and consistent,
**In order to** keep the citizen-facing screen accurate without manual edits.

## Acceptance Criteria

### Scenario · Monthly DAG run

**Given** the first day of the month at 03:00 BRT
**When** the Airflow DAG `elected_officials_monthly` starts
**Then** it runs in the following stages in order: extract → normalize → cross-reference → load → notify
**And** each stage is an independent Airflow task with retries (3 attempts, exponential backoff)
**And** the whole DAG completes successfully when every supported tenant city has a fresh `last_synced_at` newer than the run's start time

### Scenario · Extract per source

**Given** the extract stage
**When** the extractors run
**Then** each upstream has its own extractor with rate limits respected:
  - TSE: ≤ 1 req/sec per IP
  - Câmara dos Deputados: per `dadosabertos.camara.leg.br` docs (≤ 5 req/sec)
  - Senado: per `legis.senado.leg.br/dadosabertos` docs (≤ 2 req/sec)
  - Local council: per city's stated rate limit (conservative default: 1 req/sec)
  - Portal da Transparência: per portal docs; **prefer the open-data API**, fall back to HTML only when the data is not available via API
**And** the User-Agent is `CityHero-Pipeline/{version} (+contact@cityhero.app)` for every request — never a generic browser UA
**And** robots.txt is honored: if a path is disallowed, the extractor logs a warning and skips, never bypasses
**And** raw responses are cached in object storage (`s3://cityhero-raw/elected_officials/{source}/{run_date}/...`) for reproducibility and to satisfy any "where did this number come from" question later

### Scenario · Normalize via dbt

**Given** raw payloads loaded into staging tables
**When** dbt models in `analytics/transformations/models/elected_officials/` run
**Then** the pipeline produces typed, deduplicated staging tables per source (e.g., `stg_tse_elected`, `stg_camara_mandates`, `stg_senado_mandates`, `stg_local_council_{city_slug}`)
**And** each staging row carries `source`, `raw_payload_pointer`, and `extracted_at`
**And** name normalization (uppercase, strip accents, trim) lives in a shared dbt macro — never copied across models

### Scenario · Cross-reference Portal da Transparência

**Given** normalized staging rows
**When** the cross-reference stage runs
**Then** for each elected official it attempts to resolve the Portal da Transparência person ID using:
  - exact match on (CPF hash, full name) when CPF is available from TSE
  - fallback match on (normalized name, birth year, state) when CPF is missing
  - last-resort fuzzy match on normalized name within the official's state, with a confidence score
**And** a resolution row is written to `elected_officials_transparency_xref` with: `official_id`, `transparency_id`, `match_method`, `confidence` (0..1), `matched_at`
**And** only resolutions with `confidence >= 0.85` are promoted to `elected_officials.transparency_id`; below threshold remains `NULL` and the disabled-CTA path in task 04 takes over
**And** unresolved officials are logged to a dashboard for manual review by a city admin (out of scope for the MVP, but the data is captured so the workflow exists)

### Scenario · Load into transactional table

**Given** cross-referenced rows
**When** the load stage runs
**Then** `elected_officials` is upserted by `(city_id, cpf_hash, mandate_start)` unique key
**And** rows that disappeared from the upstream sources (e.g., a vereador resigned) have their `mandate_end` updated to the resignation date when reported; otherwise are left untouched and filtered out client-side (see task 02 edge cases)
**And** `last_synced_at` is set to the run timestamp
**And** the load is transactional per tenant: a failure for one city does not poison another city's data

### Scenario · CPF handling (LGPD)

**Given** TSE provides CPFs in clear text
**When** the pipeline ingests them
**Then** CPFs are **immediately hashed** with HMAC-SHA-256 using a per-environment salt stored in the secrets manager (never in code, never in a committed file)
**And** the raw CPF is **never** written to any persistent storage (not staging, not the raw bucket, not logs)
**And** the raw CPF lives only in transient memory inside the extractor process and is overwritten before the process exits
**And** the hash is stored in `elected_officials.cpf_hash` for cross-reference; never exposed by any public API (asserted in task 02 tests)

### Scenario · Per-city vote threshold

**Given** state and federal officials with votes spread across many municipalities
**When** the load stage assigns them to tenant cities
**Then** an official appears in city X's roster only when `votes_in_city / valid_votes_for_office_in_city >= configurable_threshold` (default: 0.01, i.e., 1%)
**And** the threshold is stored in the city's tenant config (overridable per city)
**And** mayors, vice-mayors, and vereadores ignore the threshold (they always belong to their city)

### Scenario · Idempotency

**Given** the pipeline is re-run for the same date
**When** the load stage runs
**Then** it produces the same final state in `elected_officials` (no duplicates, no churn on `last_synced_at` unless data actually changed)
**And** `last_synced_at` is only bumped on rows that meaningfully changed

### Scenario · Failure of one source

**Given** one upstream is down (e.g., Senado open data returns 5xx for the whole run)
**When** the extract task fails after all retries
**Then** the DAG marks that source as degraded but continues the run for the remaining sources
**And** rows fed by the degraded source keep their previous `last_synced_at` and `transparency_id`
**And** a `pipeline_degraded` alert is emitted (see Observability)

### Scenario · Election-year reconciliation

**Given** a Brazilian general election just happened (October, every 2 years)
**When** an operator triggers the `elected_officials_post_election` DAG
**Then** the pipeline runs with a `mandate_start > today` filter so newly elected officials are loaded with future `mandate_start` dates
**And** the client (task 02) hides those rows until `mandate_start <= today` (e.g., Jan 1 of the following year)

### Scenario · Observability

**Given** the DAG is running
**When** stages emit metrics
**Then** the following are recorded:
  - per-source: `extracted_rows`, `extraction_duration_seconds`, `rate_limit_hits`, `http_errors`
  - cross-reference: `resolved_count`, `unresolved_count`, `confidence_histogram`
  - load: `inserted`, `updated`, `unchanged`, `per_tenant_rowcount`
**And** alerts fire when:
  - cross-reference resolution rate drops below 70% (likely upstream schema change)
  - any source's rate-limit hits exceed 5% of requests (tighten throttle)
  - any tenant has zero officials after a run (likely tenant misconfig)

### Scenario · ToS compliance

**Given** each upstream has its own Terms of Service
**When** the pipeline launches a new source extractor
**Then** the source's ToS reference is recorded in `docs/engineering/open-questions.md` (or a successor doc) with: portal name, ToS URL, last reviewed date, summary of constraints
**And** any ToS change since the last review blocks the deploy until reviewed

## Backend (FastAPI)

No new public endpoints. The summary + list endpoints from task 02
are the consumers. The admin endpoint from task 04
(`/api/v1/admin/elected-officials/{id}/transparency-link`) reads the
`elected_officials_transparency_xref` table populated here.

## Database (PostgreSQL)

### `elected_officials` — same schema as task 02

Re-stated here so the pipeline owner has a single reference.

| Column            | Type             | Notes                                          |
|-------------------|------------------|------------------------------------------------|
| `id`              | uuid PK          |                                                |
| `city_id`         | uuid FK          | Multi-tenant scope; indexed                   |
| `full_name`       | text             | Public                                         |
| `cpf_hash`        | text             | HMAC-SHA-256 of CPF; **never returned by API** |
| `party_acronym`   | text             |                                                |
| `party_name`      | text             |                                                |
| `role`            | text             |                                                |
| `level`           | text             | enum (see task 02)                             |
| `mandate_start`   | date             |                                                |
| `mandate_end`     | date             |                                                |
| `votes_in_city`   | integer          |                                                |
| `transparency_id` | text NULL        | Only set when xref confidence ≥ 0.85           |
| `photo_url`       | text NULL        |                                                |
| `source`          | text             | "tse", "camara", "senado", "city_council"      |
| `last_synced_at`  | timestamptz      |                                                |

Indexes:

- `(city_id, level, votes_in_city desc)` — list endpoint
- Unique `(city_id, cpf_hash, mandate_start)` — upsert key
- Functional `unaccent_lower(full_name)` — task 03 search

### `elected_officials_transparency_xref` (new)

| Column            | Type             | Notes                                          |
|-------------------|------------------|------------------------------------------------|
| `official_id`     | uuid FK          | references `elected_officials.id`             |
| `transparency_id` | text             |                                                |
| `match_method`    | text             | "cpf_exact" \| "name_birth_state" \| "name_fuzzy" |
| `confidence`      | numeric(4,3)     | 0..1                                           |
| `matched_at`      | timestamptz      |                                                |

Indexes:

- `(official_id, matched_at desc)` — most recent attempt
- `(confidence)` — admin dashboard

### Staging tables (dbt-managed)

Tree-style overview of the dbt model layout:

```
analytics/transformations/models/elected_officials/
├── staging/
│   ├── stg_tse_elected.sql
│   ├── stg_tse_votes_by_municipality.sql
│   ├── stg_camara_mandates.sql
│   ├── stg_senado_mandates.sql
│   └── stg_local_council__porto_belo.sql
├── intermediate/
│   ├── int_officials_normalized.sql
│   └── int_officials_with_xref.sql
└── marts/
    └── mart_elected_officials.sql           (upserted into transactional table by the load stage)
```

## Edge Cases

- **TSE re-publishes corrected vote counts months later**: the upsert
  picks up the new numbers; analytics shows the change in
  `votes_in_city`.
- **A politician changes party mid-mandate**: the pipeline updates
  `party_acronym` / `party_name`; the unique key stays stable
  because `(city_id, cpf_hash, mandate_start)` does not include
  party.
- **CPF collision (extremely rare, basically impossible)**: the
  upsert fails loudly; an operator investigates.
- **Source returns malformed payload (schema drift)**: the
  extractor's contract test catches it before normalization; the DAG
  fails on that source while others continue.
- **Photo URL hot-links to an upstream that 403s our UA**: the
  pipeline caches the photo to our CDN when allowed by the source's
  ToS; otherwise leaves `photo_url` empty and the client uses the
  `Avatar` fallback (per task 02).

## Privacy / LGPD

- CPFs never persist in plaintext. See "CPF handling" scenario.
- Raw upstream payloads in `s3://cityhero-raw/...` are scrubbed of
  CPFs before being written (regex strip + manual review on each
  new extractor).
- `cpf_hash` is HMAC, not plain SHA-256 — a leaked database alone
  cannot brute-force CPF space because the salt is in the secrets
  manager.

## Analytics

Pipeline-level metrics are described in the Observability scenario;
they flow to the standard observability package
(`docs/tasks/00-foundation/20-observability-package.md`).

## Tests

- **Unit (extractors)**: fixture-based parsing for each source's
  current payload shape; contract test that fails when fields move.
- **Unit (cross-reference)**: scoring fixtures for cpf_exact,
  name_birth_state, name_fuzzy; threshold boundary cases.
- **Unit (CPF handling)**: assertion that no raw CPF reaches any
  persistence layer (search any text emitted by extractors).
- **Integration (dbt)**: dbt tests on staging models (not_null on
  required fields, unique on natural keys) and on marts (referential
  integrity to `cities`).
- **End-to-end (small fixture run)**: feed canned upstream payloads
  for a 2-city tenant set and assert the final transactional table
  matches a golden file.
- **Compliance test**: list endpoint response schema must not
  include `cpf_hash` (also asserted in task 02 — duplicated
  intentionally here because this task owns the table).

## Definition of Done

- [ ] Airflow DAG `elected_officials_monthly` deployed and scheduled
- [ ] Ad-hoc DAG `elected_officials_post_election` available
- [ ] Per-source extractors with rate limits + User-Agent + raw caching
- [ ] dbt models (staging → intermediate → mart)
- [ ] Cross-reference + threshold (0.85) + xref table
- [ ] CPF HMAC-SHA-256 with secrets-managed salt
- [ ] Per-tenant vote threshold (default 1%, overridable)
- [ ] Idempotent load with per-tenant transactions
- [ ] Observability + alerts
- [ ] ToS review log entry for every source
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Architecture (multi-tenant, ETL): `docs/engineering/architecture-patterns.md`
- Security baseline (CPF, secrets, allowlists): `docs/engineering/security-baseline.md`
- Open questions (ToS reviews land here): `docs/engineering/open-questions.md`
- Observability foundation: `docs/tasks/00-foundation/20-observability-package.md`
- List + grouping (consumer): `02-officials-list-and-grouping.md`
- Transparency CTA (consumer of `transparency_id`): `04-transparency-deeplink.md`
- TSE open data: `https://divulgacandcontas.tse.jus.br/`
- Câmara dos Deputados open data: `https://dadosabertos.camara.leg.br/`
- Senado Federal open data: `https://legis.senado.leg.br/dadosabertos/`
- Portal da Transparência open data: `https://portaldatransparencia.gov.br/swagger-ui.html`
- `CLAUDE.md`

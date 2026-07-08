# Open Questions & Audit Findings

Result of a documentation audit across the 30 screen folders, foundation
tasks, and engineering standards. Each item is classified:

- **Resolved** — fixed in-place; documented here for traceability.
- **Open** — still pending; requires product / design / engineering input.

When an open item is resolved, move it under "Resolved" with a one-line
note about the chosen direction and the date.

---

## Resolved

### R1 · `DetailShell` lived in two places — 2026-06-19

**Where:** `13-detail-in-progress/01`, `14-detail-ticket/01`.

**Problem:** Two task specs disagreed on where the shared shell lived.

**Fix applied:** Both task files now point to
`packages/design_system/src/templates/DetailShell/` (the canonical
templates tier). Screen folders only hold screen-specific composition.

---

### R2 · "+80 XP" on resolved reports was an undefined value — 2026-06-19

**Where:** `16-my-reports/_README.md`, `16-my-reports/04-reports-list.md`, `19-notifications/_README.md`.

**Direction:** Mariany accepted the suggestion of a future "prefecture
resolved your report" bonus (likely +30 on top of the +50 base) but
decided gamification rules are out of MVP scope — there will be a web
admin panel later to configure every score value.

**Fix applied:** Removed the literal "+80 XP" from the spec; the row
now displays whatever XP value the backend returns. Notification
example copy is left as a sample without committing to a specific
value. The XP catalog will be settled when the score-admin panel is
designed.

**Next when revisiting:** spec the score-admin panel (web), add a
small `00-foundation/*` task for the catalog endpoint + the actual XP
bonuses (`new_report`, `first_report_bonus`, `apoiar`, `tag_marked`,
`nps_submitted`, `enrich`, `share`, `prefecture_resolved`).

---

### R3 · No Login/Signup screen task — 2026-06-19

**Direction:** Login is out of MVP scope; auth comes later. A dev-only
profile switcher unblocks role-specific QA in the meantime.

**Fix applied:** Created `28-citizen-profile/07-profile-switcher.md`.
The switcher is gated behind a build flag (invisible in production),
seeds mock JWTs per persona (citizen levels + prefecture manager +
field team), and triggers an app reload on switch. Persona persists
across cold starts. CI test asserts the dev tree is excluded from
production bundles.

**Next when revisiting:** delete the switcher when real Login + Gov.br
OAuth screens land.

---

### R4 · `archived` status was referenced but never defined — 2026-06-19

**Direction:** Mariany said `archived` was a design-mock artifact, not
a product requirement.

**Fix applied:** Removed every mention of `Arquivado` / `archived`
from `16-my-reports/_README.md`, `16-my-reports/04-reports-list.md`,
and `17-detail-merged/03-comparison-cards.md`. The `reports.status`
enum is now: `triage` · `open` (in progress) · `resolved` · `merged`.

---

### R5 · Notification preferences task was redundant — 2026-06-19

**Direction:** Mariany decided the notification catalog isn't defined
yet; preferences UX is premature.

**Fix applied:**

- `21-prefecture-news/06-notification-preferences.md` was overwritten
  with a tombstone (file kept for old links; explicit "Removed from
  scope").
- `21-prefecture-news/_README.md` updated: 6 tasks → 5 tasks; diagram
  redrawn; "bell icon" wording removed from the screen header.
- `00-foundation/11-push-notification-handler.md` simplified: the
  `notification_preferences` table, the GET/PATCH preferences
  endpoints, quiet hours, muted categories, and the 5/hour rate limit
  are all gone. The dispatch worker uses only the user's language.

**Next when revisiting:** when product defines the notification
catalog, preferences will live exclusively in
`28-citizen-profile/06-settings-and-logout.md` (single entry — see
R6).

---

### R6 · Settings was fragmented across screens — 2026-06-19

**Direction:** A single Settings entry under **Mais → Configurações**.
Other screens lose their local settings affordances.

**Fix applied:**

- `28-citizen-profile/06-settings-and-logout.md` updated: framed as
  _the_ single entry point; the notification row is reserved but
  disabled ("Em breve") until the catalog is defined.
- `07-civic-feed/01-render-feed-ui-base.md` updated: the settings ⚙️
  button removed from the feed header; only the search 🔍 icon remains.
- `00-foundation/03-bottom-nav-component.md` already lists
  "Settings" in the More sheet — no change needed.

---

### R7 · `AnonymizationBadge` was one name for two different things — 2026-06-19

**Direction (from Q6 sub-discussion):** Mariany prefers a single
`Badge` atom with simple visual props (color, size) and **children**
carrying the actual content — same pattern as Ant Design and React
Bootstrap.

**Fix applied:**

- `component-inventory.md` updated: every "label-shaped surface"
  (`StatusBadge`, `CategoryChip`, `ConfidenceBadge`, `XpMedalPill`,
  `AnonymizationBadge`, the old `Pill` and `Chip` atoms) is now a
  composition of one canonical `<Badge>` atom. The doc shows the
  composition pattern for each former component.
- `08-camera-live/07-anonymization-indicator.md` updated: the
  "ANONIMIZAÇÃO ATIVA" indicator is a `<Badge color="brand" pulse>`
  composition, not a screen-local component.
- `10-report-confirm/02-photo-preview-anonymization.md` updated: the
  result indicator is `<Badge color="info" size="sm">…</Badge>`; the
  processing and failed states use different `<Badge>` compositions
  via the existing hook.
- `FilterChipRow` (molecule) remains — but its chips are `<Badge
onPress selected>` compositions, not a separate `Chip` atom.

---

### R8 · Cooldowns / rate limits had no canonical home — 2026-06-19

**Direction:** Mariany said the cooldowns were design noise, not real
requirements; remove them.

**Fix applied:**

- `14-detail-ticket/05-avaliar-cta.md`: removed the "Re-rate cooldown"
  scenario (default 30 days), the "Anti-fraud rate limit" scenario,
  and `nps.can_resubmit_at` field. Re-rating is always allowed; XP is
  not re-granted.
- `11-anonymous-send/06-reversibility.md`: removed the "Cooldown for
  repeated flips (5 flips/hour)" scenario, the "rate limited per user
  per report" line, and the cooldown-bypass edge case.
- `28-citizen-profile/06-settings-and-logout.md`: removed the "30-day
  grace period" wording from account deletion (LGPD-driven decisions
  about grace period will revisit when the deletion flow is
  implemented).

---

### R9 · Reuse principle reinforced — 2026-06-19

**Direction:** Mariany said: "Sempre que tiver código parecido /
reconstruindo códigos existentes devemos avaliar a viabilidade de criar
algo centralizado pra reaproveitar / reutilizar! Se for possível nunca
duplicar código nem lógica, nem componente, nem documentação."

**Fix applied:** Saved a feedback memory
(`feedback-reuse-principle`) that applies broadly: UI, hooks, services,
schemas, copy, configs, and even documentation. Pattern is already
codified in `tasks/README.md` (component binding rule),
`design-system.md`, and now in this open-questions log.

---

### R10 · FilterChips reinvented per screen — 2026-06-19

**Direction:** Use the shared `FilterChipRow` from the design system
everywhere; eliminate ambiguity.

**Fix applied:** All 8 task specs that defined a local filter-chips
component (`06`, `07/04`, `16/02`, `19/02`, `21/02`, `22/01`, `26/03`,
`29/02`) now consume `FilterChipRow` from `@cityhero/design-system`.
Each screen owns only the chip list definition + filter callback.

**Note:** the inventory already showed `FilterChipRow` as the
canonical molecule; this fix closed the loop in the task specs
themselves.

---

### R11 · Real-time strategy was ambiguous (push vs WebSocket vs polling) — 2026-06-19

**Direction:** Mariany picked **only Push (FCM/APNs)** as the single
channel, accepting the 5-30s lag for on-screen lists when the app is
open.

**Fix applied:** Added a "Real-time updates (Push-only strategy)"
section in `architecture-patterns.md` that explicitly excludes
WebSocket, polling, SSE, and any other long-lived connection. Every
"live" surface consumes the foundation 11 push handler — no per-screen
real-time channel. One short-lived exception is documented: the photo
anonymization status (10/02) polls for up to 30s because the user is
explicitly waiting on a single piece of content — switched from
"WebSocket can replace polling later" to "see push-only policy".

---

### R12 · `packages/observability` was referenced but had no foundation task — 2026-06-19

**Direction:** Mariany wants infra minimal — only essential tools, no
OpenTelemetry / Grafana / APM at this stage. Sentry-level errors are
enough; she'll use Claude to debug critical issues when they happen.

**Fix applied:**

- Created `00-foundation/20-observability-package.md` with a
  deliberately small scope: Sentry (RN + Next + Python), structured
  logs (`structlog` + JS logger wrapper), trace ID propagation via
  `X-Trace-Id` header (no W3C `traceparent`, no OTel).
- The task explicitly lists what is **out of scope** for the MVP:
  OpenTelemetry, metrics, APM, self-hosted LGTM, session replay,
  profiling. These can be added later — the doc names the upgrade
  path.
- Research source preserved at
  `docs/engineering/observability-package-research.md` for the future
  upgrade path.
- `00-foundation/_README.md` and `tasks/README.md` updated to include
  task 20.

---

## Open

(none — all 12 audit items resolved on 2026-06-19. New items go below
as they're discovered.)

---

## Triaging convention

Every item added here in the future follows the same skeleton:
**Where**, **Direction / Problem**, **Fix applied** (when resolved) or
**Sub-questions**. Resolved items get a date stamp and a one-line note
about the direction.

This file is meant to be reviewed alongside `tasks/README.md` and the
engineering standards — it's the **uncertainty log**, not a feature
list.

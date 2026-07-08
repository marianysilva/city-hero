# Elected Officials · Portal da Transparência deeplink

> **Type:** Screen feature · UI + integration
> **Screen:** SCREEN 21b · Politicians of the City
> **Effort:** S (≤1 day)
> **Dependencies:** `21b-elected-officials/02-officials-list-and-grouping.md`, `00-foundation/12-deep-link-handler.md`, `00-foundation/14-analytics-tracking.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `integration`

## Context

Wires the primary CTA on each `OfficialCard` — **"🔍 Portal da
Transparência →"** — to open the external URL
`https://portaldatransparencia.gov.br/pessoa/{transparency_id}` in
the system browser (or in-app browser tab when the platform offers
it). The button degrades gracefully when the cross-referenced ID is
not yet available (newly elected, name collision, CPF mismatch from
the pipeline in task 05): it renders disabled with an explanatory
tooltip ("Sem ID cruzado ainda") and a quiet "Por que?" link to a
short bottom-sheet explanation.

The secondary share button on the card is also defined here (it
shares the politician's name + Portal da Transparência URL via the
OS share sheet).

## User Story

**As a** Citizen,
**I want** one tap to see how my representative is spending public money,
**In order to** make informed decisions without learning portal URLs.

## Acceptance Criteria

### Scenario · Transparency ID available

**Given** an `OfficialCard` for an official whose `has_transparency_id = true`
**When** the user taps the "Portal da Transparência" CTA
**Then** the app opens `https://portaldatransparencia.gov.br/pessoa/{id}` externally
**And** on iOS it uses `SFSafariViewController` (in-app browser); on Android it uses Custom Tabs when available, falling back to the system browser
**And** before opening, the URL host is validated against an allowlist of `portaldatransparencia.gov.br` (defensive — the ID comes from our backend, but the allowlist guards against malformed pipeline output)
**And** opening the link does **not** navigate inside the app

### Scenario · Transparency ID missing

**Given** an `OfficialCard` for an official whose `has_transparency_id = false`
**When** the card renders
**Then** the CTA renders in a disabled visual state (muted slate-100 background, slate-400 text, no chevron animation)
**And** a small "?" affordance is visible next to the CTA, tappable
**And** the CTA itself is not interactive
**And** the CTA's accessible label is "Portal da Transparência indisponível"

### Scenario · "Why?" affordance

**Given** the CTA is disabled and the user taps the "?"
**When** the bottom sheet opens
**Then** it shows a short explanation: "O cruzamento entre o nome do político e o ID do Portal da Transparência ainda não foi confirmado. A próxima atualização mensal pode resolver."
**And** it includes the source disclaimer (LAI / art. 37) link
**And** it includes a "Ir mesmo assim ao Portal da Transparência" secondary action that opens `https://portaldatransparencia.gov.br/` (root) externally so the user can search manually

### Scenario · Share button

**Given** the user taps the secondary share button on a card
**When** the OS share sheet opens
**Then** the share payload includes:
  - title: "{name} — {role}, {level}"
  - body: a short sentence ("Veja os gastos públicos de {name} no Portal da Transparência:") plus the Portal URL when available, or the Portal root URL when not
**And** if the URL is missing, the share copy omits the "no Portal da Transparência" phrase and just shares name + role
**And** the share text **does not include any CityHero promo** on this screen (the screen is purposefully neutral)

### Scenario · External-link warning (first time)

**Given** this is the user's first tap on a Portal CTA in the session
**When** the external browser is about to open
**Then** a short bottom-sheet confirms: "Você vai sair do CityHero para o Portal da Transparência (gov.br)." with primary action "Continuar" and secondary "Cancelar"
**And** subsequent taps in the same session skip the bottom sheet
**And** a "Não mostrar de novo" checkbox persists the skip across sessions

### Scenario · No connectivity

**Given** the device is offline
**When** the user taps an enabled CTA
**Then** a `Toast` (atom, variant `warning`) shows "Sem conexão — o Portal da Transparência precisa de internet."
**And** the external browser is not opened

### Scenario · Accessibility

**Given** SR is on
**When** the CTA is focused
**Then** the enabled state is announced as "Portal da Transparência, abre fora do app"
**And** the disabled state is announced as "Portal da Transparência indisponível, toque '?' para entender"
**And** the share button is announced as "Compartilhar {name}"

## Frontend (React Native)

```
apps/city-hero/src/screens/ElectedOfficials/
├── components/
│   ├── TransparencyCta.tsx
│   ├── TransparencyDisabledBottomSheet.tsx
│   └── TransparencyExitBottomSheet.tsx
└── services/
    └── transparency-link.ts          (URL builder + host allowlist)
```

- `TransparencyCta` accepts `{ transparencyId | null, officialName, role, level }` and renders the enabled or disabled visual based on `transparencyId`.
- `transparency-link.ts` exports a pure builder + an allowlist
  validator; reused by the share sheet and the CTA. Never duplicate
  the URL pattern across components.
- Opening the link uses the existing in-app browser wrapper from
  `00-foundation/12-deep-link-handler.md` (no new browser dependency
  introduced).

## Backend (FastAPI)

The list endpoint (task 02) already includes `transparency_id` as a
nullable field on each item, plus `has_transparency_id` as a derived
boolean. No new endpoint is required for this task.

- For audit, the backend exposes (admin-only)
  `GET /api/v1/admin/elected-officials/{id}/transparency-link`
  returning the same URL the client would build, plus the most
  recent cross-reference confidence score. Used by city
  administrators to spot-check resolution quality. Not consumed by
  the mobile app.

## Database

No new tables. The `transparency_id` column on `elected_officials`
(defined in task 02 / created in task 05) feeds this CTA.

## Edge Cases

- **Stale ID (Portal returns 404)**: the in-app browser shows the
  404; the client can't reliably detect this. Surfaced indirectly
  via the next pipeline run (task 05) — confidence drops and the ID
  flips to `null` if the resolver can no longer match.
- **Politician with multiple roles** (e.g., a vereador who was also
  briefly a vice-prefeito): one row per active mandate, each with
  its own card and CTA. Both link to the same Portal page.
- **Politician's profile is restricted on Portal** (uncommon but
  possible): the in-app browser shows the restricted page; nothing
  for CityHero to do.
- **Custom Tabs unavailable on Android (very old device)**: falls
  back to system browser.
- **URL allowlist mismatch** (pipeline bug pushed a malformed ID
  containing path traversal): the CTA refuses to open, shows a Toast
  ("Link inválido — reportado para revisão"), and logs an error
  event for monitoring.

## Privacy / LGPD

- The Portal da Transparência URL contains only a public person ID
  — no CPF, no internal IDs.
- The share copy never includes CPF or any internal data.
- Opening the external link does **not** pass any CityHero session
  token or user identifier to the Portal.

## Analytics

| Event                                            | When                                       | Props                                 |
|--------------------------------------------------|--------------------------------------------|---------------------------------------|
| `elected_officials.transparency_cta_pressed`     | User tapped an enabled CTA                 | `level`, `role`, `had_warning_sheet`  |
| `elected_officials.transparency_cta_disabled_viewed`| Disabled CTA rendered in a card           | `level`, `role`                       |
| `elected_officials.transparency_help_opened`     | User tapped "?" on a disabled CTA          | `level`, `role`                       |
| `elected_officials.transparency_share_pressed`   | User tapped the card share button          | `level`, `role`, `had_transparency_id`|
| `elected_officials.transparency_exit_sheet_shown`| First-time exit warning displayed          | —                                     |
| `elected_officials.transparency_exit_confirmed`  | User confirmed exit                        | `dont_show_again`                     |
| `elected_officials.transparency_link_invalid`    | Allowlist or URL builder rejected the ID   | `official_id`                         |

## Tests

- **Unit**: URL builder; allowlist validator (accept legit hosts,
  reject everything else, including subdomains it doesn't know);
  enabled-vs-disabled visual variants; share payload shape.
- **Integration**: first-tap exit sheet shows then suppresses;
  offline path; share with and without ID.
- **A11y**: enabled and disabled CTA labels; share button labeled.

## Definition of Done

- [ ] `TransparencyCta` + disabled bottom sheet + exit bottom sheet
- [ ] `transparency-link.ts` (single source for URL + allowlist)
- [ ] Share integration
- [ ] First-time exit warning + persistence
- [ ] Offline path
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Security baseline (URL allowlist, external links): `docs/engineering/security-baseline.md`
- Deep-link / browser wrapper: `docs/tasks/00-foundation/12-deep-link-handler.md`
- Analytics tracking foundation: `docs/tasks/00-foundation/14-analytics-tracking.md`
- List + grouping (consumes the CTA): `02-officials-list-and-grouping.md`
- Data pipeline (sets `transparency_id`): `05-data-ingestion-pipeline.md`
- `CLAUDE.md`

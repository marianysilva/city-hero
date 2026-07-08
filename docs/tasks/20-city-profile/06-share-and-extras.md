# City Profile · Share + extras

> **Type:** Screen feature · UI + integrations
> **Screen:** SCREEN 20 · City Profile
> **Effort:** S (≤1 day)
> **Dependencies:** `20-city-profile/02-hero-identity.md`, `00-foundation/12-deep-link-handler.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `growth`

## Context

Wraps the screen's secondary affordances:

- **Share button** in the hero's top-right (already declared in task
  02 but wired here): opens the share sheet with a campaign-friendly
  message including the city's universal link
  (`https://cityhero.app/c/porto-belo`).
- **Last update timestamp** at the very bottom of the scroll area
  showing when the data was last refreshed.
- **Bridge to SCREEN 22 (Programs & Transparency)**: a card or button
  inviting the user to "Ver programas em execução" connects the
  numbers overview to specific programs.
- **City switcher** (subtle footer link): "Trocar cidade · Você está
  em Pôrto Belo" — opens SCREEN 02 (Choose City) for the user to
  switch active tenant. Out of MVP for most cities; visible for
  multi-city pilots.

## User Story

**As a** Citizen excited about my city's progress,
**I want** to share the dashboard with neighbors and explore programs,
**In order to** amplify the message and dig deeper.

## Acceptance Criteria

### Scenario · Share button render

**Given** the hero is rendered (task 02)
**When** the share button appears
**Then** it's a circular button with a 📤 icon in the top-right of the hero
**And** the button has a 48dp touch target with white-tinted background over the gradient

### Scenario · Tap share

**Given** the user taps share
**When** the action runs
**Then** the OS share sheet opens with a pre-formatted message:

> "🏛️ Pôrto Belo tá 23% melhor este ano · Veja o painel completo no CityHero · https://cityhero.app/c/porto-belo?utm_source=share&utm_medium=app"
> **And** the universal link points to the web fallback for the city profile
> **And** UTM parameters track the share source

### Scenario · Recipient with the app

**Given** the recipient has the app installed and taps the shared link
**When** they open
**Then** the app deep-links to City Profile for that city
**And** if they're in a different tenant, the cross-tenant flow from `00-foundation/12` runs

### Scenario · Recipient without the app

**Given** the recipient doesn't have the app
**When** they tap the link
**Then** a web fallback page renders the city profile (responsive)
**And** offers install CTAs

### Scenario · Programs bridge

**Given** the user wants to dig into specifics
**When** they tap the "Ver programas em execução" affordance
**Then** the app navigates to SCREEN 22 (Programs & Transparency)

### Scenario · Last update timestamp

**Given** the data was refreshed
**When** the timestamp renders at the bottom
**Then** it shows "Atualizado {relative_time}" (e.g., "Atualizado há 12 min")
**And** an info icon tap explains the refresh cadence (server-cached snapshot updated every N minutes)

### Scenario · City switcher

**Given** the user wants to view a different city
**When** they tap the "Trocar cidade · Você está em Pôrto Belo" footer link
**Then** SCREEN 02 (Choose City) opens with the current city pre-selected
**And** picking a different city changes the active tenant per `02-city-select/05`

### Scenario · Localization

**Given** the user's language is en-US
**When** the affordances render
**Then** copy is in English ("View programs in progress", "Updated {time} ago", "Switch city · You're in Pôrto Belo")

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the bottom affordances
**Then** each is labeled with its action and destination
**And** the timestamp is announced as informational, not interactive

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/CityProfile/
└── components/
    ├── ShareCityButton.tsx
    ├── ProgramsBridge.tsx
    ├── LastUpdateLabel.tsx
    └── CitySwitcherLink.tsx
```

### Component behavior

- `ShareCityButton` uses the shared share service from `07-civic-feed/07` with a city-specific payload composer.
- `ProgramsBridge` is a small CTA card that navigates to SCREEN 22.
- `LastUpdateLabel` reads the data's freshness from the profile hook.
- `CitySwitcherLink` opens SCREEN 02 with a pre-selected city.

## Backend

### Web fallback page

The web fallback at `https://cityhero.app/c/{slug}` renders the city profile (the same data) for unauthenticated visitors. OG tags include the city's hero stats.

## Database

No new schema. The data is sourced from the city profile and analytics endpoints.

## Edge Cases

- **Share target without preview support** (e.g., Telegram): the link still works; the preview just isn't rich.
- **City switcher unavailable for single-city deployment**: hide the link.
- **Last update label shows "agora"**: when the data is fresh (< 1 min).

## Privacy / LGPD

- Shared content is public-safe (no PII).
- UTM parameters are non-identifying.

## Analytics

| Event                                  | When                        | Props               |
| -------------------------------------- | --------------------------- | ------------------- |
| `city_profile.share_pressed`           | User tapped share           | `city_id`           |
| `city_profile.share_completed`         | OS confirmed share          | `city_id`, `target` |
| `city_profile.programs_bridge_pressed` | User tapped Programs bridge | —                   |
| `city_profile.switcher_pressed`        | User tapped city switcher   | —                   |

## Tests

- **Unit**: share payload composition; tap navigations.
- **Integration**: web fallback renders OG correctly.
- **A11y**: all affordances labeled.

## Definition of Done

- [ ] ShareCityButton + sharer integration
- [ ] ProgramsBridge component
- [ ] LastUpdateLabel
- [ ] CitySwitcherLink
- [ ] Web fallback page for city profile
- [ ] UTM tagging
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Architecture: `docs/engineering/architecture-patterns.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context

- Share service: `07-civic-feed/07-compartilhar-action.md`
- Deep link handler: `00-foundation/12-deep-link-handler.md`
- City Select (switcher destination): `02-city-select/`
- Programs (bridge destination): `docs/tasks/22-programs-transparency/`
- `CLAUDE.md`

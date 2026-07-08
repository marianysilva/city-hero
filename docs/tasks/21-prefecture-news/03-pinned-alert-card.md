# Prefecture News · Pinned alert card

> **Type:** Screen feature · UI + urgency
> **Screen:** SCREEN 21 · Prefecture News
> **Effort:** M (1-2 days)
> **Dependencies:** `21-prefecture-news/01-render-news-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `urgency`, `safety`

## Context

A prominent gradient card at the top of the content area for **active
emergency alerts** (Defesa Civil notices like "Chuva forte nas próximas
48h"). The card uses a red→amber gradient, includes "📌 Fixado" and
"Alerta · Defesa Civil" pills, the headline, supporting copy, and
two CTAs: "Áreas de risco" (deep-link to map view) + "Compartilhar"
(urgent share to amplify the warning).

Only alerts marked **priority=critical** by the prefecture appear here.
Routine announcements use the standard news card (task 04).

## User Story

**As a** Citizen in danger,
**I want** an unmistakable alert at the top,
**In order to** see and act on urgent prefecture information.

## Acceptance Criteria

### Scenario · Default render (alert active)

**Given** there is an active critical alert
**When** the card renders
**Then** a red→amber gradient card is shown at the top of the content area
**And** "📌 Fixado" and "Alerta · {Source}" pills appear at the top
**And** a bold headline in white (e.g., "Chuva forte nas próximas 48h")
**And** supporting copy explains the situation and gives action info ("Estado de atenção. Evite áreas de risco no Perequê Velho e Santa Luzia. Apoio: 199 · Defesa Civil.")
**And** two CTAs: "Áreas de risco" (white pill) + "Compartilhar" (translucent white pill)

### Scenario · No active alert

**Given** no active critical alert exists
**When** the screen renders
**Then** the pinned card slot is empty (no placeholder)
**And** the news list takes the space immediately below the filter chips

### Scenario · Tap "Áreas de risco"

**Given** the alert references a map view
**When** the user taps the CTA
**Then** the app opens a map (Home or a dedicated map view) with the risk area highlighted
**And** if no map view exists yet, falls back to the announcement's detail (task 05)

### Scenario · Tap "Compartilhar"

**Given** the user wants to amplify the warning
**When** they tap share
**Then** the share sheet opens with urgent copy: "🚨 Defesa Civil de {City}: Chuva forte nas próximas 48h. Evite áreas de risco. {link}"
**And** the universal link points to the announcement's web fallback
**And** UTM tracks `share_alert`

### Scenario · Multiple active alerts

**Given** more than one critical alert is active (rare)
**When** the cards render
**Then** the most recent (or most critical) is shown first
**And** subsequent ones stack vertically with smaller emphasis or a "Ver outros alertas" link

### Scenario · Alert expires

**Given** an alert's `expires_at` passes
**When** the screen refetches
**Then** the alert disappears
**And** if it was the only alert, the section becomes empty

### Scenario · Real-time push

**Given** a new critical alert is published
**When** the WS pushes it
**Then** the card animates in at the top
**And** a haptic feedback fires (subtle but noticeable)
**And** the screen scrolls to top automatically (or shows a "Novo alerta ↑" indicator if scrolled)

### Scenario · Localization

**Given** the user's language is en-US
**When** the card renders
**Then** the pills and CTAs are in English ("📌 Pinned", "Alert · {Source}", "Risk areas", "Share")
**And** the headline and body use the alert's locale-specific text

### Scenario · Accessibility

**Given** screen reader is on
**When** the card is read
**Then** the alert state is clearly announced as a critical region ("Critical alert from Defesa Civil")
**And** the headline is a heading
**And** CTAs are clearly labeled

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/PrefectureNews/
└── components/
    ├── PinnedAlertCard.tsx
    └── AlertShareAction.tsx
```

### Component behavior

- `PinnedAlertCard` accepts the alert data (severity, source, title, body, expires_at, link_target).
- `AlertShareAction` is a small wrapper around the share service with alert-specific message composition.
- Real-time integration via the prefecture news WebSocket subscription.

## Backend (FastAPI)

The prefecture news endpoint returns the alert pinned at the top when applicable:

| Field         | Description                                        |
|---------------|----------------------------------------------------|
| `is_pinned`   | true                                               |
| `severity`    | `critical` / `warning` / `info`                    |
| `source`      | `Defesa Civil` / `Saúde` / `Prefeitura` / etc.   |
| `expires_at`  | When the alert auto-deactivates                   |
| `link_target` | Optional deep-link target (e.g., risk area map)    |

The endpoint sorts pinned alerts first.

### Push priority

Critical alerts also dispatch high-priority push notifications (per `00-foundation/11`) — bypass quiet hours, sound alert.

## Database

The `prefecture_news` table has `is_pinned`, `severity`, `expires_at`, `link_target` fields. Indexes on `(city_id, is_pinned, severity, expires_at)` support fast queries.

## Edge Cases

- **Alert with no expiry**: stays pinned until manually dismissed by the prefecture.
- **Alert pinned by mistake**: prefecture can un-pin via the admin panel (out of MVP).
- **Citizen muted alerts category**: the bell preferences (task 06) doesn't suppress critical alerts; muting only affects non-critical announcements.

## Privacy / LGPD

Alerts are public announcements; no PII.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `prefecture_news.alert_shown`      | Card rendered                              | `severity`, `source`                  |
| `prefecture_news.alert_cta_pressed`| User tapped a CTA                          | `cta: risk_map|share`                |
| `prefecture_news.alert_share_completed` | Share confirmed                       | —                                     |

## Tests

- **Unit**: render variants by severity; CTA actions fire correctly.
- **Integration**: real-time alert arrival animates in.
- **A11y**: critical announcement role used; CTAs labeled.

## Definition of Done

- [ ] PinnedAlertCard component
- [ ] AlertShareAction integration
- [ ] Real-time WS integration with auto-scroll-to-top
- [ ] Multi-alert stacking
- [ ] Localized copy
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture (urgency, real-time): `docs/engineering/architecture-patterns.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Render UI base: `01-render-news-ui-base.md`
- Push handler (critical priority): `00-foundation/11-push-notification-handler.md`
- Real-time pattern: `06-home-map/08-realtime-pin-updates.md`
- `CLAUDE.md`

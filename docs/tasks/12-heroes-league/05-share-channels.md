# Heroes League · Share channel buttons

> **Type:** Screen feature · UI + integrations\
> **Screen:** SCREEN 12 · Heroes League\
> **Effort:** M (1-2 days)\
> **Dependencies:** `12-heroes-league/01-render-league-ui-base.md`,
> `07-civic-feed/07-compartilhar-action.md`, `00-foundation/12-deep-link-handler.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `growth`

## Context

A 5-column grid of circular share channel buttons: **WhatsApp** (primary, green icon), **Stories**
(Instagram/Facebook gradient), **X / Threads** (black square), **Copiar link** (chain icon), and
**Mais** (system share sheet icon). Each opens the appropriate share target with the pre-formatted
message (task 06) and the universal link to the report.

WhatsApp gets visual priority because it's where 95%+ of Brazilian sharing happens.

## User Story

**As a** Citizen ready to share,\
**I want** one-tap channels in the order I actually use,\
**In order to** amplify without friction.

## Acceptance Criteria

### Scenario · Default render

**Given** the user is on the screen\
**When** the channels render\
**Then** a small label "Onde compartilhar" appears above\
**And** 5 circular buttons appear in a single row\
**And** the order from left to right is: WhatsApp · Stories · X/Threads · Copiar link · Mais\
**And** each button has its icon and small label below

### Scenario · Tap WhatsApp

**Given** the user taps WhatsApp\
**When** the action runs\
**Then** WhatsApp opens with the message (task 06) and the universal link pre-filled\
**And** if WhatsApp isn't installed, the OS share sheet opens as fallback\
**And** the universal link includes `utm_source=share_whatsapp&utm_medium=app`

### Scenario · Tap Stories (Instagram / Facebook)

**Given** the user taps Stories\
**When** the action runs\
**Then** the OS share sheet opens with image + text, prioritizing Stories-capable apps\
**And** the image is the OG preview composed by the server (or a static fallback)\
**And** the UTM is `share_stories`

### Scenario · Tap X / Threads

**Given** the user taps X / Threads\
**When** the action runs\
**Then** the share intent opens X (or Threads if X isn't installed) with the message + link\
**And** the message is shortened to fit the platform's character limits\
**And** the UTM is `share_x_threads`

### Scenario · Tap Copiar link

**Given** the user taps copy link\
**When** the action runs\
**Then** the universal link is copied to the system clipboard\
**And** a toast confirms ("Link copiado")\
**And** light haptic feedback fires\
**And** the UTM is `share_copy_link`

### Scenario · Tap Mais

**Given** the user taps Mais\
**When** the action runs\
**Then** the OS share sheet opens with the full message + link + image\
**And** the user picks any target the OS supports\
**And** the UTM is `share_more`

### Scenario · Achievement progress

**Given** the user has the "Formador de Liga" achievement in progress\
**When** they successfully share (any channel)\
**Then** the achievement progress increments per the rules in task 07\
**And** if the channel results in someone installing the app and reporting, the user earns full
credit

### Scenario · Rate limiting

**Given** the user shares many times in quick succession\
**When** the rate exceeds a threshold (e.g., 30/min)\
**Then** subsequent shares show a soft warning ("Calma · você tá compartilhando muito")\
**And** the action isn't hard-blocked

### Scenario · Anti-spam reflection

**Given** a single user shares the same report many times\
**When** the backend tracks (via the universal link's resolution)\
**Then** the achievement progress doesn't reward duplicate shares to the same recipient (heuristics;
not foolproof)\
**And** the user sees only the legitimate count

### Scenario · Offline

**Given** the device is offline\
**When** the user taps a channel\
**Then** Copiar link still works (clipboard is local)\
**And** WhatsApp / Stories / X / Mais open with the cached message, but the link's resolution will
only work when the recipient is online\
**And** the user is informed transparently

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user navigates the row\
**Then** each button is labeled with its name (e.g., "Share to WhatsApp")\
**And** activating each announces the action\
**And** the layout uses 48dp minimum touch targets

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/HeroesLeague/
└── components/
    ├── ShareChannelsRow.tsx
    └── ShareChannelButton.tsx
```

### Component behavior

- `ShareChannelsRow` arranges 5 channel buttons.
- `ShareChannelButton` is a reusable circular icon button with label.
- Each channel calls the shared `shareReport` service from `07-civic-feed/07` with channel-specific
  UTM and any platform-specific formatting (e.g., shortened text for X).

### Channel configuration

A small static config maps each channel to:

- Icon and label.
- Target intent (e.g., WhatsApp deep link, Instagram Stories intent, X tweet intent).
- Fallback strategy (e.g., OS share sheet if target not installed).
- UTM parameters.

## Backend (FastAPI)

The backend supplies the universal link, OG image, and resolves clicks back to the app (via deep
link handler). The achievement engine (task 07) ties referral installs back to the original sharer
using the UTM.

## Database

No new schema. The shares are anonymous to the report (the backend doesn't store who shared); the
achievement system tracks aggregated counts on the user.

## Edge Cases

- **WhatsApp deep link format changes**: keep the integration loose (use the OS share sheet as
  universal fallback).
- **Stories intent on iOS vs Android**: each platform has its own; both are documented.
- **Achievement progress lost on app reinstall**: the server is authoritative; reinstall doesn't
  reset progress.

## Privacy / LGPD

- Share intents do not transmit identifying data unless the user explicitly authorizes (the message
  text the user crafted).
- UTM parameters are non-identifying.
- The universal link points to a public report — recipients see what's already public.

## Analytics

| Event                          | When                          | Props              |
| ------------------------------ | ----------------------------- | ------------------ |
| `league.share_channel_pressed` | User taps a channel           | `channel: whatsapp | stories | x   | copy | more` |
| `league.share_completed`       | OS reported a confirmed share | `channel`          |
| `league.share_throttled`       | Rate limit reached            | —                  |

## Tests

- **Unit**: each channel constructs the right payload; UTM tags correct; fallbacks fire when target
  missing.
- **Integration**: WhatsApp deep link opens (sandbox); copy clipboard test.
- **E2E**: share to WhatsApp sandbox; verify preview.

## Definition of Done

- [ ] ShareChannelsRow + ShareChannelButton components
- [ ] Channel config with fallbacks
- [ ] UTM parameters per channel
- [ ] Shared `shareReport` service integration
- [ ] Achievement progress hooks (task 07)
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Architecture: `docs/engineering/architecture-patterns.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- expo-clipboard: https://docs.expo.dev/versions/latest/sdk/clipboard/
- WhatsApp deep linking: https://faq.whatsapp.com/5913398998672934
- Instagram Stories intent: https://developers.facebook.com/docs/instagram/sharing-to-stories/
- X intent: https://developer.x.com/en/docs/x-for-websites/tweet-button/overview

### Project context

- Render UI base: `01-render-league-ui-base.md`
- Shared share service: `07-civic-feed/07-compartilhar-action.md`
- Achievement teaser (Formador de Liga): `07-formador-liga-achievement.md`
- Universal links: `00-foundation/12-deep-link-handler.md`
- `CLAUDE.md`

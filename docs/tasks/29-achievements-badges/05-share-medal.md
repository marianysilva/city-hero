# Achievements · Share unlocked medal

> **Type:** Screen feature · UI + growth
> **Screen:** SCREEN 29 · Achievements & Badges
> **Effort:** S (≤1 day)
> **Dependencies:** `29-achievements-badges/04-detail-sheet.md`, `00-foundation/12-deep-link-handler.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `growth`

## Context

Tapping Share on an unlocked medal generates a sharable card (image + text) with the user's name (when not anonymous), the medal, level, and a universal link back to a public web page introducing CityHero. Channels: WhatsApp, Stories, X/Threads, Copy.

## Acceptance Criteria

### Scenario · Default render (share sheet open)

**Given** the user tapped Share on an unlocked medal
**When** the action runs
**Then** the OS share sheet opens with a pre-formatted message + a generated image card
**And** the image card includes the medal art, the user's name (or anonymous), level, and a small CityHero brand
**And** the universal link is appended

### Scenario · Image card generation

**Given** the share is about to fire
**When** the card is generated
**Then** a small image is composed on-device (or fetched from a backend image renderer)
**And** the image dimensions match social sharing best practices (e.g., 1080×1080 for Stories)

### Scenario · Channel-specific payloads

**Given** the user picks a channel
**When** the payload runs
**Then** for WhatsApp: text + link; for Stories: image + caption; for Copy: text only

### Scenario · Anonymous user

**Given** the user is anonymous by default (set in Settings)
**When** the share is built
**Then** the user's name is omitted; replaced with "Um Herói de {City}"

### Scenario · Web fallback

**Given** the recipient doesn't have the app
**When** they tap the link
**Then** a web page introduces CityHero + invites install

### Scenario · Localization

**Given** en-US
**When** the share runs
**Then** the text translates

### Scenario · Accessibility

**Given** SR is on
**When** the share action runs
**Then** announced; OS share sheet takes over

## Frontend

```
apps/city-hero/src/screens/AchievementsBadges/
└── components/
    └── ShareMedalAction.tsx
```

Reuses the shared share service with medal-specific message composition + image card generation.

## Backend

Optional image-rendering endpoint for high-quality cards. For MVP, on-device composition (Skia / SVG → PNG) is sufficient.

## Database

No new schema.

## Edge Cases

- **Locked medal**: share is disabled.
- **Image generation fails**: text-only share as fallback.

## Privacy / LGPD

The user's name appears only when not anonymous; respects user choice.

## Analytics

| Event                          | When               | Props                |
| ------------------------------ | ------------------ | -------------------- |
| `achievements.share_intent`    | User tapped Share  | `medal_id`           |
| `achievements.share_completed` | OS confirmed share | `medal_id`, `target` |

## Tests

- **Unit**: payload composition; anonymous variant.
- **Integration**: share sheet opens.
- **A11y**: action labeled.

## Definition of Done

- [ ] ShareMedalAction component
- [ ] On-device image card composition
- [ ] Anonymous + identified variants
- [ ] Web fallback page
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Deep link handler: `00-foundation/12-deep-link-handler.md`
- Share service (shared): `07-civic-feed/07-compartilhar-action.md`
- `CLAUDE.md`

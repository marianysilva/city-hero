# Heroes League · "Formador de Liga" achievement teaser

> **Type:** Screen feature · UI + gamification + growth
> **Screen:** SCREEN 12 · Heroes League
> **Effort:** M (1-2 days)
> **Dependencies:** `12-heroes-league/01-render-league-ui-base.md`, `12-heroes-league/05-share-channels.md`, `00-foundation/06-auth-system.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `database`, `screen`, `gamification`, `growth`

## Context

A small card near the bottom of the scroll area showing the user's
progress toward the "Formador de Liga" achievement: a 🦸 emoji on a
violet→amber gradient, the achievement name, and a counter (0/3
friends). The achievement rewards the user with +20 XP per share that
results in an install, and unlocks a medal when 3 friends install via
their links.

This converts the share UX from a one-off action into a measurable
goal — and turns the user into a CAC engine.

## User Story

**As a** Citizen sharing my report,
**I want** to see clear progress toward a meaningful achievement,
**In order to** be motivated by a tangible goal beyond a single share.

## Acceptance Criteria

### Scenario · Default render

**Given** the user has the achievement in progress
**When** the card renders
**Then** a 12dp gradient square with a 🦸 emoji shows on the left
**And** a small ring/bubble overlays the bottom-right of the square with the counter (e.g., "0/3")
**And** to the right: the achievement name "Formador de Liga" in extrabold
**And** below: "+20 XP por compartilhamento · 3 amigos que baixarem o app destravam a medalha"

### Scenario · Progress updates after share

**Given** the user shared via a channel
**When** a recipient installs the app via the universal link's UTM
**Then** the backend increments the user's achievement progress (with deduplication so the same recipient counts once)
**And** the counter updates in real time on this screen if the user is still on it
**And** the user's overall XP gains +20

### Scenario · Achievement unlocked

**Given** 3 friends have installed via the user's links
**When** the threshold is reached
**Then** the medal is granted server-side
**And** the next time the user opens the app (or sees a relevant screen), an "unlocked" notification fires
**And** the achievement card here updates to show "Conquistada · ★"

### Scenario · Tap the achievement card

**Given** the user taps the card
**When** the action runs
**Then** a small sheet expands explaining:

- The achievement's full rules.
- Their current progress.
- The XP earned so far via shares.
- A simple referral pseudo-URL with their referral ID baked into the universal link.

### Scenario · Referral attribution

**Given** the user shares the universal link
**When** the link is clicked
**Then** the recipient's first install attribution carries the sharer's referral ID
**And** the install + first-report event credits the sharer's achievement progress
**And** the sharer earns +20 XP

### Scenario · Anti-fraud · self-referrals

**Given** a user attempts to install on a second device to count themselves as a referral
**When** the backend evaluates
**Then** the system detects the same identity (Gov.br CPF hash, payment match, etc.) and skips the credit
**And** no error is shown to discourage gaming

### Scenario · Anti-fraud · install farms

**Given** rapid installs from the same network/device cluster
**When** the backend evaluates
**Then** progress credit is throttled or paused with manual review
**And** legitimate users aren't affected

### Scenario · Localization

**Given** the user's language is en-US
**When** the card renders
**Then** the achievement is "League Builder" with English copy

### Scenario · No achievement state (already unlocked)

**Given** the user already unlocked "Formador de Liga"
**When** the card renders
**Then** it shows a "Conquistada" state with a small ★ and a "Próxima conquista" hint pointing to the next league-related achievement (e.g., "Líder de Liga" at 10 friends)

### Scenario · Accessibility

**Given** screen reader is on
**When** the section is read
**Then** the card is announced as a group with the achievement name, progress, and reward
**And** activating the card announces the sheet's content

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/HeroesLeague/
├── components/
│   ├── AchievementTeaserCard.tsx
│   └── AchievementDetailSheet.tsx
└── hooks/
    └── useFormadorLigaProgress.ts
```

### Component behavior

- `useFormadorLigaProgress` reads the user's current progress from the gamification store and subscribes to real-time updates (per `06-home-map/08` pattern).
- `AchievementTeaserCard` renders the progress visualization.
- `AchievementDetailSheet` is the explanation modal.

### Real-time updates

When a recipient installs, the backend emits an event that the client subscribes to. The counter updates with a small celebratory animation when it increments.

## Backend (FastAPI)

### Endpoints

| Method | Path                                          | Purpose                               |
| ------ | --------------------------------------------- | ------------------------------------- |
| GET    | `/api/v1/achievements/formador-liga/progress` | Current count + unlocked status       |
| POST   | `/api/v1/referrals/track-install`             | Internal — called by attribution flow |

The `/track-install` endpoint is called by the backend's install attribution flow when a new user signs up with a referral parameter from the universal link. It credits the sharer and emits an event.

### Attribution mechanism

The universal link includes the sharer's referral ID (`utm_content=ref_<userid>`). On signup, the referral ID is captured in the new user's record. When the new user completes the first report (proof of activation), the referral is credited.

### Anti-fraud (server)

- Same Gov.br CPF hash: skip credit.
- Same device fingerprint across multiple referrals: throttle.
- Inactive accounts (signed up but never reported): don't count.
- Manual moderation queue for suspicious patterns.

## Database (PostgreSQL)

### `referrals` table

| Column             | Type        | Notes                                            |
| ------------------ | ----------- | ------------------------------------------------ |
| `id`               | UUID PK     |                                                  |
| `sharer_user_id`   | UUID FK     |                                                  |
| `referred_user_id` | UUID FK     | Set when a referred user signs up                |
| `report_id`        | UUID FK     | The original report that was shared (when known) |
| `utm_content`      | text        | The referral parameter from the universal link   |
| `created_at`       | timestamptz | When the install was tracked                     |
| `credited_at`      | timestamptz | When the referral was credited (first report)    |
| `flagged_fraud`    | boolean     | Manual moderation outcome                        |

A unique constraint on `(referred_user_id)` ensures one credit per referred user. A non-unique index on `sharer_user_id` enables fast progress reads.

### Achievement progress

The user record gains a `formador_liga_credited_count` field that increments on credited referrals. The achievements / medals tables (owned by the gamification flow) track the unlock state.

## Edge Cases

- **Referred user signs up but never reports**: not credited.
- **Referred user reports anonymously**: credited (the credit is for activation, not specifically identified reports).
- **Sharer deletes their account before credit**: the referral is preserved but the credit is moot.
- **Universal link clicked by an existing user**: no referral attribution.

## Privacy / LGPD

- Referrals don't expose the referred user's identity to the sharer (only the count).
- The sharer's name is not shared with the recipient unless the message contains it.
- All attribution logs are part of the audit trail.

## Analytics

| Event                            | When                           | Props                         |
| -------------------------------- | ------------------------------ | ----------------------------- |
| `league.achievement_rendered`    | Card mounted                   | `progress`, `unlocked: bool`  |
| `league.achievement_card_tapped` | User opened detail sheet       | —                             |
| `referral.install_tracked`       | New referred install           | `sharer_user_id`, `report_id` |
| `referral.credit_granted`        | Sharer credited (first report) | `sharer_user_id`              |

## Tests

- **Unit (frontend)**: card renders progress correctly; unlocked state; real-time update.
- **Unit (backend)**: attribution credits correctly; deduplication; anti-fraud paths.
- **Integration**: end-to-end: share → install → first report → credit.
- **E2E**: simulate the referral flow; observe progress increment.

## Definition of Done

- [ ] AchievementTeaserCard + AchievementDetailSheet
- [ ] `useFormadorLigaProgress` hook with real-time updates
- [ ] Backend progress endpoint
- [ ] Attribution flow on signup + first report
- [ ] `referrals` table + Alembic migration
- [ ] Anti-fraud rules in attribution
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Architecture (gamification, real-time): `docs/engineering/architecture-patterns.md`
- Security (anti-fraud): `docs/engineering/security-baseline.md`
- Observability: `docs/engineering/observability.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- UTM parameters: https://en.wikipedia.org/wiki/UTM_parameters
- Universal Links + deferred deep linking: https://branch.io/glossary/deferred-deep-linking/ (concept reference)

### Project context

- Render UI base: `01-render-league-ui-base.md`
- Share channels (sources): `05-share-channels.md`
- Auth system: `00-foundation/06-auth-system.md`
- Universal links: `00-foundation/12-deep-link-handler.md`
- `CLAUDE.md`

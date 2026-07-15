# Civic Feed · Item card (shared component, anonymous variant)

> **Type:** Screen feature · UI component\
> **Screen:** SCREEN 07 · Civic Feed (also reusable elsewhere)\
> **Effort:** M (1-2 days)\
> **Dependencies:** `00-foundation/02-design-tokens.md`,
> `00-foundation/08-anonymization-pipeline.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ui`, `lgpd`

## Context

The card that renders a single feed item: avatar + name + distance + time header, photo with
category chip overlay, description text, and the action buttons (Apoiar 🔥, Comentar 💬,
Compartilhar, Enriquecer 📷). Two variants:

- **Identified**: real avatar (initial-based) and reporter name.
- **Anonymous**: 🥷 avatar with a slate gradient and "Herói Anônimo" label plus a small "ANÔNIMO"
  pill.

This card is also reused on other screens (My Reports, search results, deep-linked previews), so
it's designed as a shared component with prop-driven variants.

## User Story

**As a** Citizen scrolling the feed,\
**I want** each report rendered as a clear, scannable card,\
**In order to** decide quickly whether to engage.

## Acceptance Criteria

### Scenario · Identified report card

**Given** a feed item from a non-anonymous reporter\
**When** the card renders\
**Then** the avatar shows the reporter's initial on a brand-colored gradient\
**And** the reporter's first name is displayed\
**And** the distance from the user (e.g., "180m") and time-ago (e.g., "há 12 min") appear below the
name\
**And** the photo (anonymized variant) appears with a category chip overlay (emoji + label)\
**And** the description text appears below the photo\
**And** four action buttons sit at the bottom: support, comment, share, enrich

### Scenario · Anonymous report card

**Given** a feed item from an anonymous reporter\
**When** the card renders\
**Then** the avatar shows 🥷 on a slate gradient (`from-slate-700 to-slate-900`)\
**And** the displayed name is "Herói Anônimo"\
**And** a small purple pill "ANÔNIMO" appears next to the name\
**And** the rest of the card (photo, description, actions) renders identically to the identified
variant

### Scenario · Status badge

**Given** a feed item has a status (e.g., "EM ANDAMENTO" or "RESOLVIDO")\
**When** the card renders\
**Then** a small colored badge appears in the header area, right-aligned\
**And** the color reflects the status (amber for in-progress, emerald for resolved)\
**And** if the status is the default (open / new), no badge appears

### Scenario · Photo states

**Given** the report's photo is not yet anonymized (still in the pipeline)\
**When** the card renders\
**Then** a category emoji placeholder fills the photo area (e.g., a large 🕳️ on a soft brand
background)\
**And** a small "Verificando…" hint replaces the chip overlay

### Scenario · Photo loading

**Given** the photo URL is valid and the photo is anonymized\
**When** the card mounts\
**Then** the photo loads lazily (blur placeholder while loading)\
**And** uses an appropriate-size variant (thumbnail) for performance

### Scenario · Description truncation

**Given** the description is long\
**When** the card renders\
**Then** the description shows up to 3 lines with ellipsis on overflow\
**And** tapping the card body opens the report's detail screen (where the full description is
visible)

### Scenario · Action buttons

**Given** the card renders\
**When** the user views the action row\
**Then** four buttons are visible: 🔥 with the support count, 💬 with the comment count, share icon,
📷 Enriquecer\
**And** each button has a distinct tap target and accessibility label\
**And** tapping each button delegates to its own task (06, 14 or detail screen, 07, 08)

### Scenario · Card body tap

**Given** the user taps the card body (not on action buttons)\
**When** the action runs\
**Then** the app navigates to the appropriate detail screen based on the report's status:

- `open` / `in_progress` → SCREEN 13 · Detalhe · Em andamento
- `resolved` → SCREEN 14 · Detalhe do Ticket
- `merged` → SCREEN 17 · Detalhe · Reporte Mesclado

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user navigates a card\
**Then** the entire card is announced as a group (avatar, name, distance, category, description,
action counts)\
**And** action buttons are individually focusable with their own labels\
**And** the anonymous variant is announced ("Herói Anônimo, anonymous report")

### Scenario · Responsive

**Given** various device widths (small phone to large tablet)\
**When** the card renders\
**Then** the layout adapts gracefully (photo aspect ratio preserved, text reflows)

## Frontend (React Native)

### Component location

```
packages/design_system/src/components/FeedCard/
├── FeedCard.tsx
├── FeedCard.types.ts
├── FeedCard.stories.tsx
└── FeedCard.test.tsx
```

The component lives in the shared design system package because it's used in multiple screens.

### Props

| Prop                  | Description                                         |
| --------------------- | --------------------------------------------------- |
| `report`              | The feed item data (id, reporter info, photo, etc.) |
| `isAnonymous`         | Boolean derived from the report                     |
| `onSupportPress`      | Callback for the support action                     |
| `onCommentPress`      | Callback for opening the detail's comment section   |
| `onSharePress`        | Callback for share                                  |
| `onEnrichPress`       | Callback for adding a photo (Enriquecer)            |
| `onCardPress`         | Callback for the card body                          |
| `currentUserSupports` | Whether the current user has supported (toggle UI)  |

### Variants

The component renders the appropriate avatar, name, and pill based on `isAnonymous`. All other
styling is shared.

### Performance

- Pure component (`React.memo`) with stable callbacks (parent uses `useCallback`).
- Photo uses lazy loading + blur placeholder.

### Theming

Uses design tokens for all colors. In dark mode, the card surface switches to dark with subtle
borders.

## Backend

This task doesn't define backend endpoints. The card consumes data from task 02.

The status badge values come from the report's `status` field (defined in the reports schema).

## Database

Not applicable directly.

## Edge Cases

- **Reporter deleted their account**: the report is still visible but the avatar/name shows "Cidadão
  removido" (and remains anonymous-styled).
- **Photo URL expired** (signed URL): the card uses a stable photo URL or refreshes on error.
- **Distance computation fails** (e.g., no user location): show the report's address-area instead of
  distance ("R. Central").
- **Very old report**: time-ago shows in a more abstract form ("há 3 dias", "há 2 semanas") or
  absolute date for very old.
- **Status changes after card mount** (real-time): the card re-renders with the new badge.

## Privacy / LGPD

- Anonymous reports must **never** leak the reporter's identity through the card. The component
  masks all identifying fields when `isAnonymous` is true.
- Photos shown are anonymized only.
- The reporter's name (when not anonymous) is just the first name; surname and CPF are never
  exposed.

## Analytics

| Event                          | When                       | Props                             |
| ------------------------------ | -------------------------- | --------------------------------- |
| `feed.card_pressed`            | User taps the card body    | `report_id`, `category`, `status` |
| `feed.card_action_pressed`     | User taps an action button | `report_id`, `action`             |
| `feed.card_anonymous_rendered` | Anonymous variant shown    | `report_id` (sampled)             |

## Tests

- **Unit**: identified vs anonymous variants render correctly; status badge respects the value;
  truncation works.
- **Snapshot**: light + dark; identified + anonymous; with/without status badge; photo placeholder.
- **A11y**: card group announced; action buttons individually labeled.
- **Visual regression** (Chromatic): all variants captured.

## Definition of Done

- [ ] FeedCard component in `packages/design_system`
- [ ] Identified and anonymous variants
- [ ] Status badge logic
- [ ] Photo states (loading, placeholder, anonymized)
- [ ] Action buttons with stable callbacks
- [ ] Card body tap navigates correctly per status
- [ ] Storybook stories for all states
- [ ] Tests passing
- [ ] Used by SCREEN 07 (and prepared for reuse in My Reports, search, etc.)

## Standards & References

### Cross-cutting standards

- Privacy / LGPD (anonymous masking): `docs/engineering/security-baseline.md`
- Coding: `docs/engineering/coding-standards.md`
- Architecture (component patterns): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- expo-image (lazy loading + blur placeholder): https://docs.expo.dev/versions/latest/sdk/image/
- React.memo + useCallback for performance: https://react.dev/reference/react/memo

### Project context

- Anonymization pipeline: `00-foundation/08-anonymization-pipeline.md`
- Feed list: `02-feed-list-and-pagination.md`
- Apoiar action: `06-apoiar-action.md`
- Compartilhar action: `07-compartilhar-action.md`
- Enriquecer action: `08-enriquecer-action.md`
- `CLAUDE.md`

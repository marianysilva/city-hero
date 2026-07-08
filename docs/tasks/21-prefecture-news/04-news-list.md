# Prefecture News · News list

> **Type:** Screen feature · UI + data
> **Screen:** SCREEN 21 · Prefecture News
> **Effort:** M (1-2 days)
> **Dependencies:** `21-prefecture-news/01-render-news-ui-base.md`, `00-foundation/05-api-client.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `screen`

## Context

The paginated list of routine prefecture announcements below the pinned
alert. Each row is a card with a category-color icon square on the
left (🩺 emerald for Saúde, 🚧 amber for Obras, 🎓 sky for Educação,
🎉 rose for Eventos, 🏛️ violet for Transparência), small category
label + relative time, the title, and a short snippet. Some
announcements include a "Ver no mapa" CTA when relevant (e.g.,
construction works).

Tap any item to open the full detail (task 05).

## User Story

**As a** Citizen,
**I want** a scannable list of recent prefecture announcements,
**In order to** stay informed about my city.

## Acceptance Criteria

### Scenario · Default render

**Given** the user is on the screen with no active filter
**When** the list renders
**Then** each item shows the category-color icon square + category small caps + time + bold title + snippet
**And** items are sorted by `published_at desc` (most recent first)

### Scenario · CTAs inside cards

**Given** a card has an associated link target (e.g., a construction work)
**When** the card renders
**Then** a small in-card CTA appears ("Ver obra no mapa →" with brand color)
**And** tapping the CTA navigates to the linked screen (SCREEN 27 for works)

### Scenario · Filter applied

**Given** the user picked a category filter (task 02)
**When** the list renders
**Then** only matching items show
**And** the pinned alert (task 03) follows the filter

### Scenario · Pagination

**Given** the list has many items
**When** the user scrolls
**Then** the next page fetches via cursor-based pagination
**And** loading indicators appear during fetch
**And** the end marker shows ("Você chegou ao fim")

### Scenario · Pull-to-refresh

**Given** the user pulls down
**When** the gesture completes
**Then** the list refetches from page 1
**And** new items merge cleanly

### Scenario · Real-time additions

**Given** the prefecture publishes a new item
**When** the WS pushes it
**Then** the item appears at the top with a small slide-down animation

### Scenario · Tap a card

**Given** the user taps a card body (not the inline CTA)
**When** the action runs
**Then** the detail sheet (task 05) opens with the full announcement

### Scenario · Empty state

**Given** the active filter yields zero items
**When** the empty state renders
**Then** a friendly message appears ("Nada em {category} agora")

### Scenario · Localization

**Given** the user's language is en-US
**When** items render
**Then** category labels are in English; titles and snippets use each announcement's locale-specific text
**And** time formats use the user's locale

### Scenario · Performance

**Given** many items load
**When** scrolling
**Then** virtualization keeps performance smooth
**And** icons + emojis don't bottleneck rendering

### Scenario · Accessibility

**Given** screen reader is on
**When** items are navigated
**Then** each is announced as a group with category, time, title, snippet
**And** in-card CTAs are individually focusable

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/PrefectureNews/
├── components/
│   ├── NewsList.tsx
│   └── NewsCard.tsx
└── hooks/
    └── useNewsItems.ts
```

### Component behavior

- `useNewsItems` is a TanStack `useInfiniteQuery` keyed on city + filter.
- `NewsList` is virtualized.
- `NewsCard` is presentational with category color tokens.

## Backend (FastAPI)

### Endpoint

| Method | Path                                                          | Purpose                              |
|--------|---------------------------------------------------------------|---------------------------------------|
| GET    | `/api/v1/prefecture-news?category=&cursor=&limit=`            | Paginated announcements              |

Multi-tenant scoping. Sorted by `published_at desc`. Returns pinned items separately (or with a flag).

## Database

The `prefecture_news` table has fields: id, city_id, category, title_key/body_key + body_params (i18n), snippet, link_target (json), is_pinned, severity, source, published_at, expires_at. Indexes on `(city_id, category, published_at desc)`.

## Edge Cases

- **Item published_at in the future** (scheduled): hidden until the time arrives.
- **Item with no snippet**: title only shows.
- **Long titles**: truncate after 2 lines with ellipsis.

## Privacy / LGPD

Public announcements; no PII.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `prefecture_news.list_loaded`      | First page rendered                        | `count`, `filter`                     |
| `prefecture_news.card_pressed`     | User tapped a card                         | `category`                            |
| `prefecture_news.inline_cta_pressed`| User tapped the in-card CTA               | `target_kind`                         |
| `prefecture_news.pull_to_refresh`  | User pulled                                | —                                     |

## Tests

- **Unit**: card variants per category; inline CTA renders when present; tap routes correctly.
- **Integration**: filter change refetches; real-time additions merge.
- **A11y**: card groups announced.

## Definition of Done

- [ ] NewsList + NewsCard components
- [ ] useNewsItems hook with pagination + real-time
- [ ] Backend endpoint with filtering
- [ ] Localized labels
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture (REST, multi-tenant): `docs/engineering/architecture-patterns.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- TanStack Query infinite: https://tanstack.com/query/latest/docs/react/guides/infinite-queries
- FlashList: https://shopify.github.io/flash-list/

### Project context
- Render UI base: `01-render-news-ui-base.md`
- Detail sheet: `05-detail-bottom-sheet.md`
- `CLAUDE.md`

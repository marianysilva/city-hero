# Notifications · Time-grouped list

> **Type:** Screen feature · UI + data\
> **Screen:** SCREEN 19 · Notifications\
> **Effort:** M (1-2 days)\
> **Dependencies:** `19-notifications/01-render-notifications-ui-base.md`,
> `00-foundation/05-api-client.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `backend`, `screen`, `ux`

## Context

The scrollable list of notifications grouped by **time** with section headers: **Hoje**, **Ontem**,
**Essa semana**, **Mais antigas**. Each section's notifications are sorted within (newest first).
The list supports infinite scroll for very long histories, pull-to-refresh, real-time updates (a new
notification appears at the top with a small animation), and an empty state per filter.

## User Story

**As a** Citizen,\
**I want** notifications grouped by time,\
**In order to** quickly find what's recent vs older.

## Acceptance Criteria

### Scenario · Default render

**Given** the user has notifications across multiple days\
**When** the list renders\
**Then** sections appear in order: Hoje, Ontem, Essa semana, Mais antigas (only sections with items
are rendered)\
**And** each section starts with a small uppercase header\
**And** within each section, notifications are sorted most-recent-first

### Scenario · Section header styling

**Given** a section renders\
**When** the header appears\
**Then** small uppercase slate-400 text labels the section ("HOJE", "ONTEM", etc.)\
**And** the header is sticky while scrolling within its section

### Scenario · Real-time new notification

**Given** the user is on the screen\
**When** a push notification arrives\
**Then** the new entry appears at the top of "Hoje" with a small slide-down animation\
**And** the title's unread count updates

### Scenario · Pull-to-refresh

**Given** the user pulls down\
**When** the gesture completes\
**Then** the list refetches the first page\
**And** new items merge cleanly

### Scenario · Infinite scroll

**Given** the user has a long history (>50 notifications)\
**When** they scroll to the end\
**Then** the next page is fetched\
**And** loading indicators show during fetch\
**And** the end marker ("Você chegou ao fim") appears when no more items

### Scenario · Empty state per filter

**Given** the active filter yields zero items\
**When** the empty state renders\
**Then** a friendly message specific to the filter shows ("Nada em Conquistas agora · Continue
reportando!")\
**And** offers a contextual CTA (e.g., open the Camera) when applicable

### Scenario · Time formatting

**Given** a notification was received at a specific time\
**When** the relative time appears in the row\
**Then** "Hoje" notifications show "2m", "1h", "3h"\
**And** "Ontem" notifications show "ontem"\
**And** "Essa semana" notifications show "2 dias", "3 dias"\
**And** "Mais antigas" notifications show absolute date ("12/03")

### Scenario · Group reassignment at day boundaries

**Given** a notification was "Hoje" yesterday and is now "Ontem"\
**When** the screen refreshes\
**Then** the notification appears in the correct section automatically

### Scenario · Performance

**Given** the user has 100+ notifications\
**When** the list renders\
**Then** virtualization (FlashList) keeps performance smooth\
**And** offscreen rows are unmounted

### Scenario · Multi-tenant scoping

**Given** the user changed cities\
**When** the list loads\
**Then** only the current city's notifications are shown\
**And** previous-city notifications are not mixed in

### Scenario · Accessibility

**Given** screen reader is on\
**When** the list is navigated\
**Then** section headers are announced as headings\
**And** each notification is announced as a group with its title, description, and time\
**And** unread notifications are announced as "unread"

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/Notifications/
├── components/
│   ├── NotificationList.tsx
│   └── SectionHeader.tsx
└── hooks/
    └── useNotifications.ts
```

### Component behavior

- `useNotifications` is a TanStack `useInfiniteQuery` keyed on the user, city, and active filter. It
  returns paginated notifications.
- The hook groups items into time-sections on the client (cheap operation).
- `NotificationList` uses FlashList with section headers (or SectionList for native section
  support).
- The hook subscribes to real-time notification events (via WebSocket from `00-foundation/11`) and
  inserts new items at the top.

## Backend (FastAPI)

### Endpoint

| Method | Path                                                   | Purpose                         |
| ------ | ------------------------------------------------------ | ------------------------------- |
| GET    | `/api/v1/notifications?category_group=&cursor=&limit=` | Paginated list of notifications |

Sorted by `created_at desc`. Multi-tenant scoping enforced. Returns the unread flag per item.

## Database

The `notifications` table (defined in `00-foundation/11`) is the source. Indexes on
`(user_id, created_at desc)` and `(user_id, category, created_at desc)` support fast queries.

## Edge Cases

- **Multi-day silent**: missing days are simply omitted (e.g., no "Ontem" section if nothing
  happened yesterday).
- **Notification deleted server-side** (rare moderator action): the next refetch reflects the
  deletion.

## Privacy / LGPD

The list is per-user; no cross-user data leakage.

## Analytics

| Event                             | When                    | Props                   |
| --------------------------------- | ----------------------- | ----------------------- |
| `notifications.list_loaded`       | First page rendered     | `count`, `unread_count` |
| `notifications.next_page_loaded`  | Subsequent page         | `count`                 |
| `notifications.realtime_received` | New notification pushed | `category`              |
| `notifications.pull_to_refresh`   | User pulled to refresh  | —                       |

## Tests

- **Unit**: time grouping logic; section ordering; infinite scroll boundary.
- **Integration**: filter change reloads; real-time event inserts at top.
- **A11y**: section headers and rows announced.

## Definition of Done

- [ ] NotificationList + SectionHeader components
- [ ] useNotifications hook with infinite scroll
- [ ] Backend endpoint with category filter and pagination
- [ ] Time grouping logic
- [ ] Real-time push integration
- [ ] Empty state per filter
- [ ] Pull-to-refresh
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Architecture (REST, multi-tenant, pagination): `docs/engineering/architecture-patterns.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- TanStack Query infinite queries:
  https://tanstack.com/query/latest/docs/react/guides/infinite-queries
- Shopify FlashList: https://shopify.github.io/flash-list/

### Project context

- Render UI base: `01-render-notifications-ui-base.md`
- Filter chips (drives filter): `02-filter-chips.md`
- Push handler (data source): `00-foundation/11-push-notification-handler.md`
- `CLAUDE.md`

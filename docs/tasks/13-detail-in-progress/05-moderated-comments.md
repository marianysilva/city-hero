# Detail · In Progress · Moderated comments (tags)

> **Type:** Screen feature · UI + engagement\
> **Screen:** SCREEN 13 · Detail · In Progress (also reused on SCREEN 14 Detail · Ticket and SCREEN
> 17 Detail · Merged)\
> **Effort:** M (1-2 days)\
> **Dependencies:** `13-detail-in-progress/01-render-detail-ui-base.md`,
> `00-foundation/05-api-client.md`, `00-foundation/09-offline-queue.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `backend`, `database`, `screen`, `moderation`, `gamification`

## Context

The **moderated comments** system from `features.md` § 1 — citizens "comment" by tapping pre-defined
tags rather than typing free text. Each tag has an emoji, a short label, a count of citizens who
marked it, and mini-avatars of recent supporters. Tapping a tag either marks/unmarks it (toggle) or,
if collected from a "+ Ver mais X tags" button, opens a sheet of additional categories.

The design eliminates toxicity, doxxing, and bad-faith arguments while still capturing the nuance
citizens want to express. Marking a tag earns the user +2 XP (small but cumulative).

## User Story

**As a** Citizen,\
**I want** to add my voice to a report without typing free text,\
**In order to** support nuance without participating in toxic comment culture.

## Acceptance Criteria

### Scenario · Default render

**Given** the report has some tags marked by other citizens\
**When** the comments section renders\
**Then** the label "COMENTÁRIOS" appears, with a "+2 XP · cada" reward pill on the right\
**And** a soft explanation reads "Toque pra concordar. Sem texto livre — evita ataque pessoal e fake
news"\
**And** below: a list of tag rows showing emoji, label, mini-avatar stack of supporters, count, and
(if marked by the user) a "VOCÊ · N" badge\
**And** at the bottom: a "+ Ver mais X tags" button to reveal additional categories

### Scenario · Mark a tag

**Given** the user taps an unmarked tag\
**When** the action runs\
**Then** the row animates to the marked state (rose background, "VOCÊ" badge appears)\
**And** the count increments by 1 (optimistic)\
**And** the user's avatar (or initial) joins the mini-avatar stack\
**And** +2 XP is granted (a small toast confirms)\
**And** the backend persists the mark; on failure, rollback with a toast

### Scenario · Unmark a tag

**Given** the user taps a tag they previously marked\
**When** the action runs\
**Then** the row animates to unmarked\
**And** the count decrements by 1\
**And** the XP is **not revoked** (XP is sticky to discourage gaming)

### Scenario · Open more tags

**Given** the user taps "+ Ver mais X tags"\
**When** the action runs\
**Then** a bottom sheet opens with the full catalog of available tags\
**And** each can be searched/filtered\
**And** marking from the sheet behaves the same as marking from the row

### Scenario · Tag catalog per category

**Given** the report's category is "Iluminação"\
**When** the available tags are loaded\
**Then** the catalog shows tags relevant to lighting reports (e.g., "Perigoso à noite", "Perto de
escola", "4+ postes apagados", "Já reportei antes")\
**And** the catalog has both per-category and global tags\
**And** the catalog is hot-reloadable (config) without app updates

### Scenario · Anti-fraud · rate limiting

**Given** the user marks many tags rapidly\
**When** the rate exceeds a threshold (e.g., 60 marks/minute across all reports)\
**Then** the backend returns 429\
**And** subsequent marks show a soft warning\
**And** XP grants pause

### Scenario · Anti-fraud · same tag re-marked

**Given** the user marks → unmarks → marks the same tag\
**When** the backend evaluates\
**Then** only one XP grant happens (the first); subsequent marks don't earn XP

### Scenario · Offline marking

**Given** the device is offline\
**When** the user marks a tag\
**Then** the action is queued via the offline queue\
**And** the optimistic UI persists\
**And** the action syncs when connectivity returns

### Scenario · Real-time updates

**Given** another user marks/unmarks a tag\
**When** the WebSocket pushes the change\
**Then** the count and avatar stack update inline\
**And** if the user is currently marking, their state is preserved (no race)

### Scenario · Empty state

**Given** no tags have been marked yet\
**When** the section renders\
**Then** a friendly empty state encourages the first mark ("Seja o primeiro a comentar")\
**And** the "+ Ver mais X tags" button is the primary affordance

### Scenario · Anonymous reporters can mark too

**Given** the user is logged in (even if their report is anonymous)\
**When** they mark a tag on another report\
**Then** the mark is associated with their identity (for anti-fraud / XP)\
**And** the mini-avatar stack shows their initials (the report's anonymity doesn't affect their
interactions on other reports)

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user navigates the section\
**Then** each tag row is announced with its label, count, and selected state\
**And** the "+ Ver mais X tags" button is clearly labeled\
**And** the "+2 XP · cada" reward pill is announced

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/DetailInProgress/
├── components/
│   ├── CommentsSection.tsx
│   ├── TagRow.tsx
│   └── MoreTagsSheet.tsx
└── hooks/
    └── useTagToggle.ts
```

### Component behavior

- `CommentsSection` renders the section label, explanation, and the list of currently-loaded tags.
- `TagRow` is a presentational item with emoji, label, mini-avatar stack, count, and selection
  state.
- `MoreTagsSheet` is a bottom sheet loaded lazily, listing the full catalog (with search/filter).
- `useTagToggle` is a TanStack mutation with optimistic update and offline queueing.

### Avatar stack

The mini-avatars show up to 3 recent supporters (initials, gradient backgrounds). For larger counts,
the user just sees the count.

## Backend (FastAPI)

### Endpoints

| Method | Path                                  | Purpose                                   |
| ------ | ------------------------------------- | ----------------------------------------- |
| GET    | `/api/v1/reports/{id}/tags`           | List of tag marks (with counts + avatars) |
| POST   | `/api/v1/reports/{id}/tags/{tag_key}` | Mark (idempotent)                         |
| DELETE | `/api/v1/reports/{id}/tags/{tag_key}` | Unmark                                    |
| GET    | `/api/v1/tag-catalog?category=...`    | Tag catalog per category (cached)         |

The mark endpoints:

- Are idempotent.
- Enforce multi-tenant scoping.
- Rate limit per user (60/min).
- Credit XP on first mark per `(user, report, tag)` (no double-credit on toggle).
- Run server-side moderation: a denylist + ML-classifier (future) can reject tags with abusive
  labels — for MVP, tags are admin-curated and the denylist is small.

## Database (PostgreSQL)

### `report_tag_marks` table

| Column       | Type        | Notes                                     |
| ------------ | ----------- | ----------------------------------------- |
| `id`         | UUID PK     |                                           |
| `report_id`  | UUID FK     |                                           |
| `user_id`    | UUID FK     |                                           |
| `tag_key`    | varchar(50) | E.g., `dangerous_at_night`, `near_school` |
| `created_at` | timestamptz |                                           |

Unique constraint on `(report_id, user_id, tag_key)` (allowing rapid toggle without conflicts
because we hard-delete on unmark).

### `tag_catalog` table (or static config)

For MVP, a static configuration file lists available tags per category. Future: a database-backed
catalog with admin tools for cities to curate per-city tags.

| Column         | Type           | Notes                                      |
| -------------- | -------------- | ------------------------------------------ |
| `key`          | varchar(50) PK | Stable machine key                         |
| `label_key_pt` | varchar(120)   | i18n key for pt-BR                         |
| `label_key_en` | varchar(120)   | i18n key for en-US                         |
| `emoji`        | varchar(10)    |                                            |
| `categories`   | jsonb          | Array of category keys this tag applies to |

## Edge Cases

- **Tag removed from the catalog later**: existing marks still display gracefully (the catalog
  config keeps deprecated entries for read).
- **Many simultaneous marks** (real-time burst on a viral report): the counts batch on the client to
  avoid render storms.
- **User on a slow device**: optimistic UI keeps the experience responsive even if the backend is
  slow.

## Privacy / LGPD

- Marks are visible to all citizens (count + avatars). The individual mark is recorded against the
  user's identity for anti-fraud and XP.
- For anonymous reports, the reporter's mini-avatar would never appear here (they don't have a
  public identity in this context).

## Analytics

| Event                                | When                            | Props                  |
| ------------------------------------ | ------------------------------- | ---------------------- |
| `comments.tag_marked`                | User marked a tag               | `report_id`, `tag_key` |
| `comments.tag_unmarked`              | User unmarked a tag             | `report_id`, `tag_key` |
| `comments.more_tags_opened`          | User opened the more-tags sheet | —                      |
| `comments.tag_marked_offline_queued` | Mark queued offline             | `report_id`, `tag_key` |

## Tests

- **Unit (frontend)**: optimistic update + rollback; XP grant logic; offline queueing; real-time
  merge.
- **Unit (backend)**: idempotency; rate limit; XP credit once per (user, report, tag); multi-tenant.
- **Integration**: end-to-end mark → toggle → catalog browse.
- **E2E**: tap a tag → count increments → toast XP → mark again same session → no extra XP.

## Definition of Done

- [ ] CommentsSection, TagRow, MoreTagsSheet components
- [ ] `useTagToggle` hook with optimistic + offline support
- [ ] Backend endpoints + idempotency + rate limit
- [ ] `report_tag_marks` table + Alembic migration
- [ ] Tag catalog (static config or db) with categories
- [ ] XP credit policy enforced
- [ ] Telemetry events
- [ ] Tests passing
- [ ] Reused on SCREEN 14 and SCREEN 17 (designed for reuse)

## Standards & References

### Cross-cutting standards

- Architecture (multi-tenant, idempotency, REST): `docs/engineering/architecture-patterns.md`
- Security (rate limit, anti-fraud, moderation): `docs/engineering/security-baseline.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- TanStack Query mutations + optimistic updates:
  https://tanstack.com/query/latest/docs/react/guides/optimistic-updates

### Project context

- Render UI base: `01-render-detail-ui-base.md`
- Apoiar action (XP credit pattern): `07-civic-feed/06-apoiar-action.md`
- Offline queue: `00-foundation/09-offline-queue.md`
- `features.md` § 1 (Moderated Comments)
- `CLAUDE.md`

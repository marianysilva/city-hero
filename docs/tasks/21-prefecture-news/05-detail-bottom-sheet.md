# Prefecture News · Detail bottom sheet

> **Type:** Screen feature · UI
> **Screen:** SCREEN 21 · Prefecture News
> **Effort:** M (1-2 days)
> **Dependencies:** `21-prefecture-news/04-news-list.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

When the user taps a news card, a large bottom sheet opens showing
the full announcement: category and source header, title, full body
(rich text — paragraphs, bold, links), optional image gallery, the
publication time, the prefecture's source / department, and CTAs
(share, save, link-to-related-resource when applicable).

## User Story

**As a** Citizen,
**I want** to read the full announcement,
**In order to** understand context and act.

## Acceptance Criteria

### Scenario · Open the sheet

**Given** the user taps a card
**When** the sheet opens
**Then** it slides up with a backdrop dim
**And** can be dismissed by swipe-down or tap-outside

### Scenario · Sheet content render

**Given** the announcement has full content
**When** the sheet renders
**Then** the header shows the category icon, category label, publication time, and source ("Secretaria de Obras")
**And** the title appears in extrabold
**And** the body renders as rich text (paragraphs, bold, italics, links)
**And** optional images appear in a horizontal carousel below the title
**And** below the body: contextual CTAs (Share, Save, View related resource)

### Scenario · Rich-text rendering

**Given** the body has markdown-like formatting
**When** rendered
**Then** paragraphs are spaced; bold and italic apply; links are tappable and styled with brand color
**And** dangerous formatting (e.g., raw HTML) is sanitized server-side

### Scenario · Image gallery

**Given** the announcement has images
**When** the carousel renders
**Then** users can swipe between images
**And** tapping opens a full-screen viewer
**And** images are loaded lazily

### Scenario · Share

**Given** the user wants to share
**When** they tap Share
**Then** the share sheet opens with the announcement's universal link
**And** the shared message uses the title + a short excerpt

### Scenario · Save

**Given** the user wants to keep the announcement for later
**When** they tap Save
**Then** the announcement is added to their saved list (a small "Salvos" submenu accessible from Notifications or Profile in a future iteration)
**And** for MVP, the action surfaces a "Salvo · em breve em Salvos"

### Scenario · Link to related resource

**Given** the announcement is about a specific construction work
**When** the sheet renders the "Ver obra" CTA
**Then** tapping navigates to SCREEN 27 (Public Work Detail)

### Scenario · Dismissal

**Given** the user dismisses (swipe / tap-outside / back)
**When** the sheet closes
**Then** focus returns to the underlying list
**And** the read state is updated (the item is marked as seen, mirroring email patterns)

### Scenario · Localization

**Given** the user's language is en-US
**When** the sheet renders
**Then** CTAs are in English ("Share", "Save", "View related")
**And** the body uses the announcement's locale-specific content

### Scenario · Accessibility

**Given** screen reader is on
**When** the sheet opens
**Then** focus moves into the sheet
**And** the title is announced as a heading
**And** the body and CTAs are read in order
**And** Esc / Back closes the sheet

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/PrefectureNews/
└── components/
    ├── NewsDetailSheet.tsx
    ├── RichTextRenderer.tsx
    └── NewsImageGallery.tsx
```

### Component behavior

- `NewsDetailSheet` is a `@gorhom/bottom-sheet` with snap points at 70% and 95%.
- `RichTextRenderer` parses the announcement's body (markdown or sanitized HTML).
- `NewsImageGallery` renders the carousel using `react-native-reanimated-carousel` or similar.

### Read tracking

When the sheet opens, the read state is updated (similar to email "opened" tracking) so analytics measure engagement.

## Backend (FastAPI)

The announcement detail endpoint returns full content:

| Method | Path                           | Purpose           |
| ------ | ------------------------------ | ----------------- |
| GET    | `/api/v1/prefecture-news/{id}` | Full announcement |

Returns: title, body (sanitized), images array, source, link_target, related resources.

## Database

`prefecture_news` table has rich text body in `body_md` or `body_html` (sanitized). Images are stored as URLs in an array column or a related `prefecture_news_images` table.

## Edge Cases

- **Body parse failure**: fallback to plain text rendering.
- **Very long body**: the sheet scrolls; the snap-point at 95% accommodates.
- **Images fail to load**: placeholders with a category emoji.

## Privacy / LGPD

Public content. No PII handling.

## Analytics

| Event                                 | When                              | Props               |
| ------------------------------------- | --------------------------------- | ------------------- |
| `prefecture_news.detail_opened`       | Sheet opened                      | `category`          |
| `prefecture_news.detail_dismissed`    | Sheet closed                      | `time_open_seconds` |
| `prefecture_news.detail_link_pressed` | User tapped a link in the body    | `url`               |
| `prefecture_news.detail_image_viewed` | User opened the full-screen image | `index`             |

## Tests

- **Unit**: sheet open/close; rich text renders; image carousel works; CTAs fire correctly.
- **Integration**: link-to-related resources navigates correctly.
- **A11y**: focus management; reading order.

## Definition of Done

- [ ] NewsDetailSheet component with snap points
- [ ] RichTextRenderer with sanitization
- [ ] NewsImageGallery
- [ ] CTAs (share, save, related)
- [ ] Read tracking
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Architecture: `docs/engineering/architecture-patterns.md`
- Security (sanitization): `docs/engineering/security-baseline.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- @gorhom/bottom-sheet: https://gorhom.dev/react-native-bottom-sheet
- react-native-render-html (for rich text): https://meliorence.github.io/react-native-render-html/

### Project context

- News list (entry): `04-news-list.md`
- `CLAUDE.md`

# Sync Queue · Queue list + item card

> **Type:** Screen feature · UI
> **Screen:** SCREEN 18 · Sync Queue
> **Effort:** M (1-2 days)
> **Dependencies:** `18-sync-queue/01-render-sync-ui-base.md`, `00-foundation/09-offline-queue.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `offline`

## Context

The scrollable list of queue items rendered as cards. Each card shows
the anonymized thumbnail (or category emoji placeholder), the
category, the address (truncated), the capture timestamp + file size,
and a state badge in the top-right. Three state variants:

- **AGUARDANDO** (amber badge): the item is queued, no upload attempt
  yet or paused while offline.
- **ENVIANDO · N%** (sky badge): mid-upload with a slim progress bar
  below the text.
- **FALHOU · Tentar de novo** (rose badge): final failure with an
  inline error reason and a retry affordance.

The list is sorted by most-recent-attempt first (or queue order if
none attempted). Cards animate state transitions (waiting → syncing →
synced disappears from this list).

## User Story

**As a** Citizen,
**I want** to see each pending item with its state,
**In order to** track what's happening and intervene if needed.

## Acceptance Criteria

### Scenario · Default render

**Given** the queue has items
**When** the list renders
**Then** each item shows as a card with the structure above
**And** items are sorted (failed first, then in-flight, then waiting)
**And** the list scrolls vertically

### Scenario · Card · AGUARDANDO state

**Given** an item is queued and not yet attempted
**When** it renders
**Then** the badge is amber "AGUARDANDO"
**And** no progress bar is shown
**And** the timestamp shows "Hoje · 14:32"

### Scenario · Card · ENVIANDO state

**Given** an item is mid-upload
**When** it renders
**Then** the badge is sky "ENVIANDO · 64%" with the live percentage
**And** a slim progress bar appears below the text rows
**And** the progress updates in real time

### Scenario · Card · FALHOU state

**Given** an item failed permanently
**When** it renders
**Then** the badge is rose "FALHOU · Tentar de novo"
**And** below the address, the error reason shows ("Timeout na autenticação")
**And** an inline "Tentar de novo" button is shown
**And** a "Detalhes" tap target opens task 05's action sheet

### Scenario · Synced item disappears

**Given** an item successfully syncs
**When** the queue store updates
**Then** the card animates out (slide + fade)
**And** the report appears in My Reports' list naturally

### Scenario · Real-time state updates

**Given** the queue state changes (any item's progress, status)
**When** the change happens
**Then** the relevant card updates inline without re-rendering the entire list
**And** the FlashList virtualization preserves performance

### Scenario · Photo thumbnail handling

**Given** an item has a photo
**When** the card renders the thumbnail
**Then** the local file path renders (since the photo hasn't been uploaded yet, only the local URI is available)
**And** for size budget, a smaller thumbnail variant is used
**And** if no photo (rare manual-only path), a category emoji placeholder is shown

### Scenario · File size shown

**Given** the item's photo(s) have a known size
**When** the card renders
**Then** the size is shown ("1 foto · 2.4MB") to help the user understand bandwidth needs
**And** multi-photo items show "2 fotos · 5.1MB"

### Scenario · Tap on card body

**Given** the user taps the card body (not on action buttons)
**When** the action runs
**Then** task 05's action sheet opens with all available actions (Retry, Discard, Details)

### Scenario · Localization

**Given** the user's language is en-US
**When** the cards render
**Then** badges and labels are in English ("WAITING", "UPLOADING · 64%", "FAILED · Retry")

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the list
**Then** each card is announced as a group with category, address, time, and state
**And** the progress on syncing items is announced as a live region (debounced)

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/SyncQueue/
├── components/
│   ├── QueueList.tsx
│   └── QueueItemCard.tsx
└── hooks/
    └── useQueueItems.ts
```

### Component behavior

- `useQueueItems` reads from the queue store and returns the sorted list with real-time updates.
- `QueueList` is a virtualized list (FlashList) of cards.
- `QueueItemCard` is presentational with the three state variants.

### Sort logic

- Failed items first (need user attention).
- In-flight items next (user can watch progress).
- Waiting items last (no action needed).
- Within each group, sort by most-recent-attempt or capture time.

### Performance

Items are memoized; updates only re-render the affected card. Image thumbnails use `expo-image` with a small target resolution.

## Backend

Not applicable to this task. The list data is entirely local.

## Database

Reads from the local WatermelonDB queue (per `00-foundation/09`).

## Edge Cases

- **Item progress reports 100% but state hasn't transitioned to synced yet**: the card stays in syncing state briefly until the queue store confirms.
- **Photo file deleted from the local file system** (user cleared storage): the card shows a placeholder and a failed state with a specific error.
- **Item in the queue points to a deleted report locally** (rare): the orchestrator handles cleanup; the card may briefly appear and then disappear.

## Privacy / LGPD

- Thumbnails show the **raw photo** (anonymization happens server-side after upload). The thumbnail is local and only visible to the user.
- The queue store and thumbnails are protected by OS-level sandbox encryption.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `sync_queue.list_rendered`         | Initial render                             | `item_count`, `failed_count`          |
| `sync_queue.item_state_updated`    | State transitioned                         | `item_id`, `from`, `to`               |
| `sync_queue.item_card_pressed`     | User tapped card body                      | `item_id`, `state`                    |

## Tests

- **Unit**: card variants render; sort order; thumbnail rendering; progress bar.
- **Integration**: queue state changes update the card live.
- **A11y**: card groups announced; progress live region.

## Definition of Done

- [ ] QueueList + QueueItemCard components
- [ ] useQueueItems hook
- [ ] Sort logic
- [ ] State variants with real-time updates
- [ ] Animations on enter/exit
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- Shopify FlashList: https://shopify.github.io/flash-list/
- expo-image: https://docs.expo.dev/versions/latest/sdk/image/

### Project context
- Render UI base: `01-render-sync-ui-base.md`
- Offline queue store: `00-foundation/09-offline-queue.md`
- Item actions: `05-item-actions.md`
- `CLAUDE.md`

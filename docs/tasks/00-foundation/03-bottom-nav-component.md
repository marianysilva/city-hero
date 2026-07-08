# Bottom Nav Menu · Shared main navigation component

> **Type:** Foundation · Shared component
> **Screen(s):** Home (06), Civic Feed (07), Camera (08), My Reports (16), Citizen Profile (28), More (drawer)
> **Effort:** M (2 days)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/13-i18n.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `component`, `foundation`, `accessibility`

## Context

Fixed bottom navigation bar with 5 tabs: **Map**, **Feed**, **Camera (center FAB)**,
**Profile**, **More**. Present in all root screens and on detail screens that
belong to the same "navigation universe". It's the app's primary IA (see
`design/navigation.html` § 01).

The Camera tab is visually differentiated as a FAB (elevated above the bar)
because taking a photo of an issue is the product's anchor action.

The More tab opens a bottom sheet (not a full-screen page) with secondary items:
Notifications, Prefecture News, City Profile, Programs & Transparency, Services
& Public Works, Sync Queue (when items pending), Settings, Logout.

## User Story

**As a** Citizen,
**I want** a consistent bottom nav across all main screens,
**In order to** switch quickly between Map, Feed, Camera, Profile, and secondary features without getting lost.

## Acceptance Criteria

### Scenario · Default render

**Given** the user is on any root screen (Home, Feed, Profile, My Reports)
**When** the screen renders
**Then** the bottom nav appears fixed at the footer with 4 icons + 1 center FAB
**And** the active tab icon is highlighted (brand primary color, bold weight)
**And** other icons appear in neutral gray
**And** the Camera FAB is elevated with a soft shadow and the brand-to-civic-purple gradient

### Scenario · Tap on a different tab

**Given** the user is on Home
**When** the user taps "Feed"
**Then** the app navigates to SCREEN 07 · Civic Feed
**And** Home's scroll position is preserved (returning to the same place)
**And** light haptic feedback fires
**And** the transition is instant (no slide animation between tabs)

### Scenario · Tap on the Camera FAB

**Given** the user is on any screen
**When** the user taps the Camera FAB
**Then** the app opens SCREEN 08 · Camera with AI as a full-screen modal
**And** medium haptic feedback fires
**And** when closing the camera, return to the screen the user was on

### Scenario · Tap on More

**Given** the user is on any root screen
**When** the user taps "More"
**Then** a bottom sheet opens (not a stack navigation push)
**And** the sheet shows secondary items ordered by relevance
**And** if there are items in the offline queue, a red badge with the count appears next to "Sync Queue"
**And** if there are unread notifications, a badge appears next to "Notifications"

### Scenario · Tap on the active tab

**Given** the user is on Home
**When** the user taps the already-active "Map" tab
**Then** Home performs a smooth scroll-to-top (if scrolled)
**And** the map recenters on the user's location
**And** if not scrolled, only fire light haptic feedback

### Scenario · Accessibility

**Given** screen reader is enabled (TalkBack/VoiceOver)
**When** the user focuses on a nav item
**Then** the reader announces the translated name and selection state ("Map, tab 1 of 5, selected")
**And** every tappable area is at least 48×48dp
**And** active vs inactive contrast meets WCAG AA (≥ 4.5:1)

### Scenario · Offline mode

**Given** the user has no internet connection
**When** the bottom nav renders
**Then** all tabs remain functional (Home cached, Feed cached, Camera saves locally)
**And** the "Sync Queue" item shows a badge with the pending items count

### Scenario · Hide on scroll (optional · feature flag)

**Given** the user is on a long-list screen
**When** the user scrolls down
**Then** if the `nav.auto_hide_on_scroll` flag is enabled, the bar slides out
**And** scrolling up makes it reappear
**And** if the flag is disabled (default), the bar always stays visible

## Frontend (React Native / Expo)

### Component location

```
packages/design_system/src/components/BottomNav/
├── BottomNav.tsx           ← container
├── BottomNavTab.tsx        ← each tab (non-FAB)
├── BottomNavFab.tsx        ← center FAB (Camera)
├── BottomNavMoreSheet.tsx  ← bottom sheet for "More"
├── BottomNav.types.ts
├── BottomNav.stories.tsx
└── BottomNav.test.tsx
```

### Component behavior

- The container `BottomNav` receives the active tab key and a tap callback. It does not own state — active tab is derived from the current route.
- Each `BottomNavTab` is presentational: receives icon, label, active state, press callback, and accessibility label.
- `BottomNavFab` is a visually-elevated button that always opens the Camera modal.
- `BottomNavMoreSheet` is a bottom-sheet UI showing the "More" items, with badges per item.
- Badges (offline queue count, unread notifications count) are read from global app state hooks; they are not stored inside the nav.

### Navigation integration

The nav plugs into the React Navigation bottom-tab navigator as a custom `tabBar` renderer. The Camera tab's button is intercepted to push a modal instead of switching tabs.

### Route → active tab mapping

| Route                                       | Active tab                   |
| ------------------------------------------- | ---------------------------- |
| Home                                        | `home`                       |
| Feed                                        | `feed`                       |
| Profile                                     | `profile`                    |
| MyReports                                   | `more` (subitem highlighted) |
| Notifications, CityNews, Programs, Services | `more`                       |
| Camera (modal)                              | none (overlaid modal)        |

### Accessibility

- Tab role on each tab; selected state on the active one.
- Button role on the FAB.
- Min touch area 48×48dp.
- Translated labels via i18n (see `00-foundation/13-i18n.md`).

### Haptics

- Light selection feedback on tab switch.
- Medium impact feedback on FAB press.
- Soft success feedback when opening the More sheet.

### Animation

- Active tab: color transition (~150ms).
- FAB: subtle scale on press in/out.
- More sheet: standard spring slide-up.

## Backend (FastAPI)

The component itself doesn't call backend, but two endpoints feed its badges:

| Endpoint                                 | Purpose                                                 |
| ---------------------------------------- | ------------------------------------------------------- |
| `GET /api/v1/sync-queue/count`           | Pending offline queue items (locally cached, syncable). |
| `GET /api/v1/notifications/unread-count` | Unread notifications count.                             |

Both follow the standard error response shape and respect multi-tenant scoping.

## Database

No new schema.

## Edge Cases

- **Camera modal open**: bottom nav hides (camera is full-screen).
- **Detail screens without nav**: screens like Ticket Detail use a non-overlay variant of the nav (or no nav at all). Each screen decides.
- **Notch / safe area**: nav respects the device's bottom safe area.
- **Landscape mode**: the app is portrait-only by design; nav doesn't render in landscape.
- **Splash above nav**: no nav before the app initializes.
- **Unknown route**: if the active route doesn't match any tab, no icon is highlighted.
- **Performance**: re-renders should be limited to the active tab change; other tabs are memoized.

## Privacy / LGPD

Not applicable — the component holds no personal data.

## Analytics

| Event                     | When                              | Props                |
| ------------------------- | --------------------------------- | -------------------- |
| `nav.tab_pressed`         | Tap on any tab                    | `from_tab`, `to_tab` |
| `nav.fab_camera_pressed`  | Tap on Camera FAB                 | `from_tab`           |
| `nav.more_sheet_opened`   | Opens the More sheet              | —                    |
| `nav.more_item_pressed`   | Tap on item inside the More sheet | `item_key`           |
| `nav.same_tab_double_tap` | Tap on already-active tab         | `tab_key`            |

## Tests

- **Unit**: renders 4 tabs + 1 FAB; correct active state; tap callbacks fire with the right key; badges show/hide based on count.
- **Integration**: switching tabs via tap changes the route correctly; the More sheet opens and closes; closing on tap-outside works.
- **E2E**: after login, the nav appears on all 5 root screens; tap on Camera opens the camera modal; tap on More opens the sheet with the correct item list; Home scroll state is preserved when returning from another tab.
- **Visual regression**: snapshots per state (each tab active, with/without badges, with/without sheet open).

## Definition of Done

- [ ] BottomNav, BottomNavTab, BottomNavFab, and BottomNavMoreSheet implemented in `packages/design_system`
- [ ] Custom tab bar wired into React Navigation
- [ ] Storybook with all states
- [ ] A11y verified (TalkBack + VoiceOver, WCAG AA contrast)
- [ ] Haptics on the three feedback points
- [ ] Tests: unit (≥80% coverage), 1 E2E happy path
- [ ] Storybook docs and prop documentation
- [ ] Code review approved
- [ ] Applied across all 5 root screens

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture (component patterns): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- React Navigation Bottom Tabs: https://reactnavigation.org/docs/bottom-tab-navigator
- Bottom Sheet (`@gorhom/bottom-sheet`): https://gorhom.dev/react-native-bottom-sheet
- Expo Haptics: https://docs.expo.dev/versions/latest/sdk/haptics/

### Project context

- Prototype: `design/index.html` (helper `bottomNav` / `staticBottomNav`)
- IA: `design/navigation.html` § 01
- Features: `docs/features.md` § 1
- `CLAUDE.md`

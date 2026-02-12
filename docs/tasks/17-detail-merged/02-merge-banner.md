# Detail · Merged · Merge banner

> **Type:** Screen feature · UI + transparency
> **Screen:** SCREEN 17 · Detail · Merged Report
> **Effort:** S (≤1 day)
> **Dependencies:** `17-detail-merged/01-render-merged-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `transparency`

## Context

A friendly amber banner at the top of the scroll area explaining the
merge decision concretely: "Juntamos ao reporte #4821 · A IA
identificou que esse buraco já tinha sido reportado a 80m daqui, há
3 dias. Em vez de criar duplicata, seu reporte virou apoio." Two
small pills below confirm the user's outcome: "+50 XP creditado"
(emerald) and "Notificações ativadas" (with border).

The transparency about **what triggered the merge** (distance + time +
category) builds trust. The user can verify the AI made a reasonable
decision.

## User Story

**As a** Citizen seeing my report was merged,
**I want** a clear explanation of why,
**In order to** trust the system worked correctly and feel rewarded.

## Acceptance Criteria

### Scenario · Default render

**Given** the screen renders
**When** the banner appears
**Then** an amber-tinted card with a soft border is shown
**And** a 🔗 icon on the left
**And** the headline "Juntamos ao reporte #N" with the parent protocol
**And** the body text explains concretely: "A IA identificou que esse {category} já tinha sido reportado a {distance}m daqui, há {time}. Em vez de criar duplicata, seu reporte virou apoio."
**And** below: two pills — "+N XP creditado" (emerald) and "Notificações ativadas" (white with border)

### Scenario · Variable distance, time, category

**Given** the merge details vary per case
**When** the banner renders
**Then** the placeholders substitute correctly
**And** time uses relative formatting ("há 3 dias", "há 2 semanas")
**And** distance uses meters (rounded to the nearest 10m for readability)

### Scenario · Tap "Notificações ativadas" pill

**Given** the user wants to manage notifications
**When** they tap the pill
**Then** a small sheet expands explaining the notifications they'll receive
**And** offers a "Mute" option (per `13-detail-in-progress/07-overflow-menu.md`'s mute)

### Scenario · XP credit verification

**Given** the user wants to see their XP details
**When** they tap the "+N XP creditado" pill
**Then** a small toast or popover shows the XP source ("Reporte enviado · +50 XP") and confirms it's in their balance
**And** the user can navigate to Citizen Profile for the full XP breakdown

### Scenario · Localization

**Given** the user's language is en-US
**When** the banner renders
**Then** copy is in English ("We merged with report #N", "The AI detected that this {category} was already reported {distance}m away, {time} ago. Instead of creating a duplicate, your report became a support.")

### Scenario · Anonymous reporter

**Given** the user submitted anonymously
**When** the banner renders
**Then** the wording is identical (anonymity doesn't change the merge logic)
**And** the user's identity to the prefecture is still preserved

### Scenario · Merge details unavailable (data missing)

**Given** the merge metadata is incomplete (rare)
**When** the banner renders
**Then** fallback copy is used ("Seu reporte virou apoio a um reporte existente")
**And** the basic message still lands

### Scenario · Accessibility

**Given** screen reader is on
**When** the banner is read
**Then** the headline is announced as a heading
**And** the body is read in order
**And** the pills are announced as buttons with their actions

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/DetailMerged/
└── components/
    ├── MergeBanner.tsx
    └── NotificationsExplainerSheet.tsx
```

### Component behavior

- `MergeBanner` accepts the merge metadata (parent protocol, distance, time, category) and renders the templated copy.
- `NotificationsExplainerSheet` is shown on pill tap.
- The XP pill tap opens a small toast or navigates to the profile.

## Backend

This task doesn't introduce new endpoints. The merge metadata is part of the merged report's record (the merge service writes it at deduplication time).

## Database

The `reports` table has fields like `merged_into_id`, `merge_distance_m`, `merge_age_seconds`, `merge_decided_at`. Schema is owned by the deduplication service (per `features.md` § 3 Manager Panel · Duplicate Detection — out of MVP for the panel, but the data fields needed for this screen are in scope here).

## Edge Cases

- **Parent ticket was deleted after the merge**: the banner adapts ("Esse reporte ficou ligado a um ticket que foi fechado · seu apoio foi registrado").
- **Merge happened long ago and the user is just viewing now**: the relative time still works.

## Privacy / LGPD

The parent ticket's reporter identity is not exposed here (the user sees only the protocol and the public-safe summary).

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `detail_merged.banner_rendered`    | Banner mounted                             | `distance_m`, `age_days`              |
| `detail_merged.notifications_explainer_opened` | User tapped the pill           | —                                     |
| `detail_merged.xp_pill_pressed`    | User tapped the XP pill                    | —                                     |

## Tests

- **Unit**: copy substitution; pill taps fire callbacks; fallback copy when metadata missing.
- **Snapshot**: with and without metadata; localized variants.
- **A11y**: announcements verified.

## Definition of Done

- [ ] MergeBanner component
- [ ] NotificationsExplainerSheet
- [ ] Time + distance formatters
- [ ] Localized copy
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Render UI base: `01-render-merged-ui-base.md`
- Overflow menu (mute action): `13-detail-in-progress/07-overflow-menu.md`
- `features.md` § 3 Manager Panel · Duplicate Detection
- `CLAUDE.md`

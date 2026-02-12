# SCREEN 17 · Detail · Merged Report

> **Group:** 02 · App Core
> **Prototype screen:** `design/index.html` (search for `title: 'Detalhe · Reporte Mesclado'`)
> **Position in navigation:** Reached when the user opens a report that was auto-merged into a parent ticket (from My Reports, push, or share)

## Overview

When the AI detects that a citizen's new report is a **duplicate** of
an already-open ticket nearby (within X meters, same category), the
system merges them: the citizen's report becomes a **support** of the
parent ticket rather than a separate duplicate. The user still earns
the XP for reporting (no penalty), gets notifications for the parent
ticket, and is shown this screen explaining what happened.

The screen has four key pieces:

1. A header showing the merge state ("✓ Apoiando ticket #4821").
2. A friendly **merge banner** explaining the deduplication decision +
   the XP credited + the notifications activation.
3. A **"Seu reporte" card** showing what the user submitted.
4. A **"Ticket principal" card** linking to the parent ticket (SCREEN
   13 or 14 depending on parent state).

## Features (4 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI base + header with merge badge](./01-render-merged-ui-base.md) | S | `00-foundation/02-design-tokens.md` |
| 02 | [Merge banner · explanation + XP credit indicator](./02-merge-banner.md) | S | task 01 |
| 03 | [Comparison cards · "Seu reporte" + "Ticket principal"](./03-comparison-cards.md) | M | task 01 |
| 04 | [Bottom CTA · "Ver ticket principal" → SCREEN 13/14](./04-bottom-cta-navigate.md) | S | task 01, task 03 |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (banner) ─────┐
          ├─→ 03 (comparison) ─┼─→ 04 (CTA)
          └─────────────────────┘
```

## Product notes

- **No penalty for the citizen**: this is critical. The user earned
  their XP fairly; what changed is the backend's deduplication logic.
  The screen reinforces "no harm done" through tone.
- **The merge decision is explained transparently**: the banner says
  "a IA identificou que esse buraco já tinha sido reportado a 80m
  daqui, há 3 dias" — concrete, falsifiable claims build trust.
- **Notifications activate automatically**: the user is opted into
  parent-ticket updates because they care about resolution. They can
  mute via the overflow menu later.
- **From here, "Ver ticket principal" is the primary action**: it
  takes the user to the parent (SCREEN 13 if open, SCREEN 14 if
  resolved). Their own report shows in the parent's "supporters" view.
- **Merge can be reversed** (rare, owner action via overflow): if the
  user disagrees, they can mark "Não é o mesmo problema" — moderation
  reviews and may un-merge. This is out of MVP scope.

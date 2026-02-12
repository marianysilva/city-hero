# SCREEN 27 · Public Work Detail

> **Group:** 02 · App Core
> **Prototype screen:** `design/index.html` (search for `title: 'Detalhe da Obra'`)
> **Position in navigation:** From SCREEN 26 list/map; from Prefecture News inline CTA; from share links

## Overview

The detail view of a single public work. Hero photo at the top with the
current status pill + days-since-start pill. Summary card with the
work's title, address, contractor, budget, dates, progress %. Timeline
of milestones (planejamento → bidding → execution → conclusion).
Optional gallery of construction photos posted by the prefecture.
Below: links to bidding documents, ata, and a "Denunciar irregularidade"
CTA at the bottom.

## Features (5 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI base · header, hero, scroll, slots](./01-render-work-detail-ui-base.md) | S | `00-foundation/02-design-tokens.md` |
| 02 | [Summary card · title, address, contractor, dates, progress](./02-summary-card.md) | S | task 01 |
| 03 | [Milestones timeline](./03-milestones-timeline.md) | M | task 01 |
| 04 | [Construction photo gallery](./04-photo-gallery.md) | M | task 01 |
| 05 | [Documents links + Denunciar CTA](./05-documents-and-denunciar.md) | S | task 01 |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (summary) ──┐
          ├─→ 03 (timeline) ─┼─→ 05 (docs + CTA)
          └─→ 04 (gallery) ──┘
```

## Product notes

- **Hero photo defaults to the latest construction photo** posted by the prefecture; falls back to a category emoji on a soft brand background when no photos exist.
- **Milestones are timestamped** and include external links to the bidding/audit documents.
- **Photos go through the same anonymization pipeline** as citizen photos (any face/plate captured incidentally is blurred).
- **The Denunciar CTA pre-fills** the irregularity-report flow with the work's identifier.

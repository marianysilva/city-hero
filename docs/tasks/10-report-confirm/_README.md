# SCREEN 10 · Report Confirmation

> **Group:** 02 · App Core
> **Prototype screen:** `design/index.html` (search for `title: 'Confirmação do Reporte'`)
> **Position in navigation:** After camera capture (SCREEN 08) or after manual report (SCREEN 09)

## Overview

The pre-submit review screen — where the user inspects what the AI
already filled in (category, severity, location) and tweaks anything
that's off. The photo preview shows the **anonymization status** ("2
plates blurred · 0 faces") reinforcing trust. An optional comment
field lets users add context. The **"Como se identificar"** toggle is
the bifurcation moment: Identified routes to the Liga de Heróis
celebration screen (viral share); Anonymous routes to the Envio Anônimo
private confirmation. Both grant the same XP — anonymity isn't penalized.

This is also where the **actual report is created** server-side. The
upload pipeline, anonymization handoff, and gamification credit all
happen as a result of this screen's submit.

## Features (8 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI base · header, layout, sticky CTA](./01-render-confirm-ui-base.md) | S | `00-foundation/02-design-tokens.md` |
| 02 | [Photo preview + anonymization status](./02-photo-preview-anonymization.md) | M | task 01, `00-foundation/08-anonymization-pipeline.md` |
| 03 | [AI suggestions panel · category + severity](./03-ai-suggestions-panel.md) | M | task 01, `00-foundation/16-yolov8-inference-service.md` |
| 04 | [Location confirm + adjust](./04-location-confirm-adjust.md) | S | task 01, `09-manual-report/04-mini-map-location.md` |
| 05 | [Description input · optional comment](./05-description-input.md) | S | task 01 |
| 06 | [Identification toggle · anonymous vs identified](./06-identification-toggle.md) | M | task 01, `00-foundation/06-auth-system.md` |
| 07 | [XP / medal preview](./07-xp-medal-preview.md) | S | task 01 |
| 08 | [Submit · report creation + bifurcation routing](./08-submit-and-bifurcate.md) | L | tasks 02-07, `00-foundation/07`, `00-foundation/08`, `00-foundation/09` |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (photo) ──────────────┐
          ├─→ 03 (AI suggestions) ─────┤
          ├─→ 04 (location) ───────────┼─→ 08 (submit + bifurcate)
          ├─→ 05 (description) ────────┤
          ├─→ 06 (anon toggle) ────────┤
          └─→ 07 (XP preview) ─────────┘
```

01 first; 02–07 in parallel; 08 closes the flow by orchestrating all of them into the report-create endpoint and the post-submit bifurcation.

## Product notes

- **Bifurcation is the key UX moment**: Identified → Liga de Heróis (viral, "share + recruit"); Anonymous → Envio Anônimo (private, "your XP and tracking remain, your identity doesn't").
- **AI does the work, user confirms**: the form is mostly pre-filled. The verbs are "Trocar" (swap) rather than "Selecionar" (pick) — implying the AI made a guess that the user can override.
- **Anonymization status is honest**: the badge shows the actual counts ("2 plates blurred · 0 faces"). When the pipeline hasn't completed yet, a "Anonimizando…" state is shown instead.
- **Severity** is suggested by AI but the user has the last word; the manager panel uses this for prioritization.
- **XP/medal preview** anchors the action emotionally — "you'll earn 50 XP and the 🏅 Olho Vivo badge".
- **No-photo path** (from manual report when permission denied): the screen renders without the photo preview slot; submit still works.

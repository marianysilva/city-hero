---
name: task-batch-alignment
description: Align a batch of docs/tasks/<NN-screen>/ folders (a funnel, a group of related screens, or all of docs/tasks) to the skeleton template in docs/tasks/README.md, checking cross-screen sequential consistency, design-system component sourcing, and Dependencies validity. Use whenever the user asks to align, review, or reconcile a set of task-doc folders — not a single file (see the implement-task skill for that) and not a targeted find-and-fix sweep for one known stale claim (see docs-consistency-sweep for that).
---

# Task Batch Alignment

For reconciling a *group* of screen folders against the template and against each other — the
kind of pass that catches bugs no single file's own review would find, because they only show up
when you compare siblings in the same flow.

## Procedure

1. **Read `docs/tasks/README.md` first** — it's the ground truth for the skeleton (Header /
   Context / User Story / Acceptance Criteria in Gherkin / Frontend / Backend / Database / Edge
   Cases & Error States / Privacy-LGPD / Analytics / Tests / Definition of Done) and for the
   component-placement rule (a UI piece used by 2+ screens belongs in `packages/design_system`, not
   a screen folder).

2. **Per file, confirm the skeleton is complete and filled** — not just present as headings. A
   section that exists but says "N/A" for something that clearly applies is still a gap.

3. **Cross-file consistency within the batch** — this is the check a single-file review can't do.
   For a multi-screen flow, verify across all sibling files:
   - Step/position numbering agrees everywhere it's stated (a step indicator, a `_README.md`
     position note, and a sibling screen's "back returns to step N" must all agree — a mismatch
     here is a real bug, not a style nit; this project shipped a `"Step 2 of 5"` vs `"Passo 1 de
     5"` contradiction and a stale `PaginationDots total=4` left over from before a step was added,
     both only visible by comparing files side by side).
   - Route/state naming is identical everywhere the same concept is referenced (a state-machine
     step key, a route name, a persisted field name).
   - "Skip"/"back" rules are stated the same way in every file that touches them.

4. **Cross-check `docs/engineering/component-inventory.md` and `design-system.md`** for every UI
   piece a task describes locally. If the inventory already lists it as shared (used by 2+ screens)
   but a task still describes it as a screen-local file, that's a sourcing bug — fix the task to
   import from `@city-hero/design-system` instead of redefining it (this project had exactly this
   gap with `BadgeIllustration` and `XpProgressBar`).

5. **Check the real codebase, don't assume the docs are current.** Spawn an Explore agent (or grep
   directly for smaller batches) to check whether the screens/routes/components the tasks describe
   actually exist yet, and at what version of the underlying libraries (Expo SDK, NativeWind,
   Storybook). A greenfield or partially-built repo is common — reconcile paths/APIs against what's
   real, per the project's global context7 rule for anything library-specific.

6. **Verify every `Dependencies` path in every file's header resolves to a file that exists** —
   including dependencies on files inside the batch itself, not just on files outside it.

7. **If a `_README.md` lists numbered tasks that don't have corresponding files**, that's a
   dependency trap waiting for whoever reads it next — write the missing files following the
   skeleton, using the `_README.md`'s own description as the seed content, and reconcile them
   against the same cross-file consistency checks in step 3.

8. **Confirm documentation language**: prose in English; Portuguese only inside quoted strings that
   represent actual in-app UI copy (this project's product language is pt-BR) — don't "fix" those
   quotes to English, and don't leave prose explanations in Portuguese.

9. **Scope check before committing**: `git status` should show changes only inside the folders the
   user actually asked to align. Run `npm run format:check` (fix with `npx prettier --write`) before
   committing.

## What NOT to do

- Don't treat this as license to also fix unrelated files outside the requested batch — if you spot
  a real problem elsewhere, mention it and ask, don't fix it silently in the same commit.
- Don't invent new product decisions to fill a gap you find — if a `_README.md`'s description is
  genuinely ambiguous about what a missing task should contain, ask rather than guess a scope.
- Don't skip the cross-file consistency pass to save time — it's the part a fast per-file skim
  reliably misses, and it's where the real bugs were in this project's own alignment passes.

---
name: docs-consistency-sweep
description: Sweep docs/tasks/ and docs/engineering/ for stale claims after a cross-cutting infrastructure or tooling decision changes (e.g. "we're using Maestro instead of Detox now", "AsyncStorage is now expo-sqlite/kv-store", "visual regression was descoped"). Use this whenever the user asks to sweep, align, verify, or check consistency of the task docs against a new decision, discovery, or finding — especially after a /goal session that changed how something is built or tested. Prevents copy-pasting the same explanatory paragraph into every affected file.
---

# Docs Consistency Sweep

## The mistake this exists to prevent

When an infrastructure or tooling decision changes mid-project, the instinct is to find every
file that mentions the old thing and paste in an explanation of the new thing. Across
`docs/tasks/` (30+ screens, each with 2-8 task files) that produces the same paragraph duplicated
in a dozen places — expensive to keep in sync later, and it buries the one place that should
actually own the reasoning: the canonical doc in `docs/engineering/`.

Every task file already has a **Standards & References** section (part of the skeleton in
`docs/tasks/README.md`) that links to the relevant canonical doc — `testing-strategy.md`,
`design-system.md`, `architecture-patterns.md`, `security-baseline.md`, etc. That link already
exists in nearly every file. The fix for a stale claim almost never requires restating anything —
it requires either a one-line correction, or removing a line that's no longer true.

## Procedure

1. **Find every stale mention.** Grep `docs/tasks/` and `docs/engineering/` with several search
   terms per finding — the old tool/library name, close synonyms, and the generic feature name
   (e.g. for a testing-tool change: the old tool's name, `E2E`, `visual regression`, `screenshot`).
   Cast a wide net; a single regex often misses paraphrased mentions.

2. **Classify each hit** into exactly one of two buckets:
   - **(a) Implementation-detail mention** — a specific line names the old thing as part of a
     scenario, a hook, a storage mechanism, a component behavior (e.g. "backed by AsyncStorage",
     "per-install flag (AsyncStorage)"). This needs a **minimal, one-line swap** — replace the old
     name with the new one, matching the surrounding sentence's tone and tense. Don't add a
     justification here; the file didn't have one for the old choice either.
   - **(b) Restated reasoning** — a bullet or paragraph that explains *why* something is done a
     certain way, and that explanation now belongs to (or duplicates) a canonical doc. This is
     the case to watch for: it's tempting to "fix" it by rewriting the explanation in place, but
     that's how duplication starts.

3. **For (a):** make the swap in place. Nothing else changes.

4. **For (b):** don't write a new explanation into the task file.
   - First check whether the task's **Standards & References** section already links the
     relevant `docs/engineering/*.md` file. It almost always does — this is a required section of
     the skeleton (see `docs/tasks/README.md`). If it's missing, add the link there — that's the
     correct home for it, not the Tests/Frontend section.
   - Then look at what the stale bullet was doing in its own section (usually **Tests**). If it
     was asserting that something unbuilt/deferred *is* tested or *is* built, and the surrounding
     file follows the common convention of simply not listing untested layers at all (check a
     few sibling task files in the same folder to confirm this is the pattern), delete the bullet
     entirely rather than replacing it with an explanation. Absence of a line is the correct
     signal, not a footnote.
   - If a one-line pointer is genuinely warranted (e.g. the task's own scope makes a specific
     tradeoff worth flagging), keep it to a single short sentence that names the canonical doc —
     never reproduce its reasoning.

5. **Update the canonical `docs/engineering/*.md` doc itself, once**, with the actual decision and
   full reasoning, in whichever section already covers that topic. This is the only place the
   explanation should live in full.

6. **Format and verify.** Run `npm run format:check` (Prettier) after edits; fix anything flagged
   with `npx prettier --write <files>`. If the finding touched code (not just docs), also run the
   relevant `npx turbo run lint typecheck test` before committing.

7. **Report per file**, not just a total count: which files got a one-line swap (a), which had a
   duplicated explanation removed (b), and which canonical doc got the one authoritative update.
   Explicitly confirm the search terms used and that zero stale hits remain for each term.

## Worked example (from this project's own history)

Finding: "Playwright is for E2E, not screenshot diffing; Maestro replaces the
Playwright-plus-web-mode-hybrid idea for mobile E2E; visual regression via Playwright was
descoped."

- Grepped `docs/tasks/` and `docs/engineering/` for `Detox`, `Playwright`, `Chromatic`,
  `AsyncStorage`, `toHaveScreenshot`, `visual regression`, `E2E`.
- `docs/engineering/testing-strategy.md` and `design-system.md` got the full reasoning, once each
  (bucket b's canonical destination).
- Four task files (`00-foundation/03-bottom-nav-component.md`,
  `07-civic-feed/03-feed-item-card.md`, `09-manual-report/02-category-grid.md`,
  `10-report-confirm/02-photo-preview-anonymization.md`) had a `**Visual regression**: ...` Tests
  bullet asserting screenshot testing was active or planned — this is bucket (b). First pass
  mistakenly added a one-line pointer to each; corrected in a follow-up commit by simply deleting
  the bullet, since every sibling task in the catalog already omits bullets for untested layers,
  and the Standards & References section already linked `testing-strategy.md`.
- Four other files had a literal `AsyncStorage` implementation-detail mention (bucket a) —
  one-line swap to `expo-sqlite/kv-store` each, no added explanation.
- `docs/engineering/observability.md` named `Detox` as a mobile smoke-test option — one-line swap
  to `Maestro`, with a short pointer (not a restatement) to `testing-strategy.md` § E2E.

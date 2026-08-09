---
name: implement-task
description: Implement one docs/tasks/*.md task file end-to-end and mark it done accurately. Use this whenever the user asks to implement, build, or complete a specific task file (often via /goal targeting a path like docs/tasks/00-foundation/02-design-tokens.md), or says "pick the next task and implement it." Covers dependency checking, cross-app verification, honest Status/DoD updates, and branch discipline.
---

# Implement Task

`docs/tasks/README.md` describes the intended usage: pick a task, confirm dependencies, implement
against its Acceptance Criteria, pause if ambiguous. This skill fills in the parts that are easy to
skip under time pressure — each one caused a real problem in this project when skipped.

## Procedure

1. **Read the whole task file first**, not just the Acceptance Criteria. The Frontend/Backend/
   Database sections often encode decisions (file locations, which design-system component to
   reuse, which endpoint already exists) that the AC alone doesn't spell out.

2. **Check every `Dependencies` path in the header** — confirm the file exists, and open it to read
   its own `Status`. A dependency that's "✅ Done" is safe to build on; "🟡 Mostly done" usually is
   too, but read what's still open before assuming. A dependency that's "⬜ Not started" or has a
   documented gap the current task actually needs (e.g. an endpoint the task calls that doesn't
   exist yet) is a real blocker — surface it before writing code that will have nothing to call.

3. **Implement against the Acceptance Criteria.** If something in the task spec turns out to be
   wrong when checked against the real codebase or current library docs (a deprecated package, an
   API that changed, a path that doesn't exist) — this happens often enough in a fast-moving repo
   that it's not an edge case — reconcile it in the implementation and say so explicitly rather than
   building the wrong thing to match a stale spec. The task spec is the starting point, not scripture.
   Before writing any new UI component, check `packages/design_system/` for an existing
   atom/molecule that already covers it — even if the task spec doesn't explicitly say to reuse one.
   Extend a close-but-not-quite match rather than forking it locally; never duplicate a pattern that
   already exists in another screen.

4. **Verify beyond the package you touched.** Foundation-tier changes (design tokens, shared
   components, shared config) are consumed elsewhere — `apps/city-hero` and `apps/web` both pull
   from `packages/design_system`, for instance. Run the full cross-app check, not just the touched
   package's:

   ```
   npx turbo run lint typecheck test
   ```

   This is not a formality — the missing `nativewind-env.d.ts`/`expo-env.d.ts` files in
   `apps/city-hero` were only found this way, from a design-tokens task that looked unrelated to
   the mobile app on paper. If a consuming app breaks or was already broken, fix it as part of this
   task rather than leaving a known-broken `tsc`/lint/test run behind.

   "Tests pass" is not the bar — **exemplary coverage** is: the happy path from the task's own Tests
   section, AND the error/failure paths (invalid input, permission denial, timeout, offline), AND
   the documented edge cases (boundary values, empty/max states). A test suite that only exercises
   the success case is an incomplete implementation, not a follow-up.

5. **Review before considering it done.** Run the `code-reviewer` subagent against the diff — this
   is not optional for a non-trivial change, per `CLAUDE.md`'s Code Quality & Review Standards.
   Escalate to `code-reviewer-deep` and/or `security-reviewer` if the task touches auth, PII, GPS,
   migrations, or an unfamiliar/version-sensitive library. Address what it flags (or explicitly note
   why a finding doesn't apply) before moving on to committing — a review that ran but whose
   findings were ignored is equivalent to skipping it.

6. **Update the task file's own header `Status` and `Definition of Done`** to reflect exactly what
   shipped — not a rubber stamp. If something was deliberately descoped (see
   `docs-consistency-sweep` for how to handle that without duplicating explanations across other
   files), say so in one line and point to wherever the full reasoning lives, rather than leaving a
   checkbox checked for something that isn't real.

7. **Branch discipline before committing.** Check the current branch first:

   ```
   git branch --show-current
   ```

   If it's `main` (or another shared/default branch) — which can happen mid-session if a prior PR
   from the same branch merged and the working copy moved — create a new branch following
   `CLAUDE.md`'s convention (`feat/`, `fix/`, `chore/`) before committing. Don't commit new task
   work directly to the default branch.

8. **Format and commit.** Run `npm run format:check`, fix with `npx prettier --write` if flagged,
   then commit. Keep the commit message's "why" tied to the task file (which AC it satisfies, what
   was discovered along the way) rather than just restating the diff.

## What NOT to do

- Don't mark a `Definition of Done` item `[x]` for something you didn't actually verify runs — an
  unchecked, honestly-labeled gap is more useful to the next person than a false-green checklist.
- Don't skip the cross-app verification step because the task "looks" frontend-only or
  backend-only — foundation and design-system tasks especially tend to have consumers the task
  spec itself doesn't mention.
- Don't silently work around a blocked dependency by inventing a placeholder — flag it and ask, or
  stop and report, per the project's general escalation norms.
- Don't commit before the review step ran and its findings were addressed — "the code works" and
  "the code passed review" are different claims; only make the second one if it's true.
- Don't treat "the happy-path test passes" as sufficient coverage — an untested error path or edge
  case is a gap to close now, not a note for later.

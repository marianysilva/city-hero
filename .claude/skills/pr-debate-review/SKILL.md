---
name: pr-debate-review
description: Run a thorough, multi-agent debate-style review of a PR or branch diff — design patterns, architecture, implementation correctness, unit + E2E test coverage, data security, and information-leakage/security gaps. Use whenever the user asks for a deep/thorough code review, a "revisão com múltiplos agentes" or "revisão que debate padrões e segurança", wants a second opinion beyond a single-pass review, or names several of these dimensions together (patterns + architecture + tests + security) for a specific PR/branch. Not for a quick lint-and-typecheck check — this is the heavyweight option for a PR the team wants real scrutiny on before merging.
---

# PR Debate Review

## Why this exists

A single reviewer — human or agent — tends to anchor on whatever they notice first and stop
looking. A genuinely thorough review needs two things a single pass can't give you on its own:

1. **Independent specialists**, each looking through one lens only, so a security concern doesn't
   get lost under ten style nitpicks and a test-coverage gap doesn't get missed because the
   reviewer was busy checking architecture.
2. **Adversarial rebuttal**, so a finding survives because it's real, not because nobody pushed
   back on it. Half the value of a debate is in what gets *overruled* — a plausible-sounding
   concern that turns out to already be handled elsewhere, or doesn't actually apply.

This skill runs both stages via the `pr-debate-review` Workflow
(`.claude/workflows/pr-debate-review.js`): seven specialist reviews in parallel, each followed by an
independent skeptic re-checking that specialist's own findings against the real code, then one
synthesis pass that reconciles everything into a single report.

## The seven dimensions

| Dimension | What it checks | Agent type |
|---|---|---|
| Design patterns & conventions | Does new code match the closest existing analogue elsewhere in the codebase? | `code-reviewer` |
| Architecture & layering | Layering, authz-gate consistency, multi-tenant scoping, migration hygiene, shared-package boundaries | `code-reviewer` |
| Implementation correctness | Concrete bugs and edge cases — one scenario (input → wrong output) per finding, not hypotheticals | `code-reviewer` |
| Unit test coverage | Real gaps against `testing-strategy.md`'s coverage targets, not a percentage guess | `code-reviewer` |
| E2E test coverage | Whether the flow is covered by Playwright (`apps/web`) / Maestro (`apps/city-hero`), and whether that suite even runs in CI | `code-reviewer` |
| Data security & critical-path security | Authn/authz at both layers, input validation, migration blast radius, LGPD/GDPR | `security-reviewer` |
| Information leakage & missing security checks | Error-message/timing/logging leakage, rate limiting, IDOR, cookie sensitivity, hardcoded secrets | `security-reviewer` |

These map directly to this project's own canonical references — the workflow instructs every
agent to cite them, not restate them:

- `docs/engineering/architecture-patterns.md` — layering, DI, multi-tenant scoping, patterns to avoid
- `docs/engineering/coding-standards.md` — naming, migrations, error handling per language
- `docs/engineering/security-baseline.md` — authn/authz, OWASP top 10, LGPD/GDPR, photo anonymization
- `docs/engineering/testing-strategy.md` — test pyramid, coverage targets, per-platform E2E tooling
- `CLAUDE.md` — project-wide instructions

If you're ever unsure whether something is "the project's design pattern" or just this reviewer's
opinion, the answer is in one of those four docs — don't invent a convention that isn't written
down somewhere, and don't let a review finding contradict one without saying so explicitly.

## How to run it

1. **Identify the target and gather its context.** Don't guess — actually look:
   - PR number given or discoverable: `gh pr view <n> --repo <owner>/<repo> --json title,body,files`
     and `gh pr diff <n> --repo <owner>/<repo>` (or note the exact command for agents to run
     themselves — they'll fetch it independently, this step is just for YOUR context to build the
     prompt).
   - No PR, just a branch: `git diff main...HEAD --stat` for the file list, `git log
     main..HEAD --oneline` for the commit history to reconstruct intent.
   - Write a short (1 paragraph) `background`: what changed and why. Pull this from the PR
     description/commit messages if they explain it; don't fabricate motivation that isn't there.

2. **Decide if any dimension is plainly inapplicable.** E.g. a backend-only change with zero
   user-visible behavior difference doesn't need the `e2e-tests` dimension; a pure refactor with no
   new inputs doesn't need `data-security`. Default to running all seven — only skip one with a
   clear reason, and say so in your final summary to the user (never silently narrow scope).

3. **Invoke the workflow:**
   ```
   Workflow({
     name: 'pr-debate-review',
     args: {
       target: 'PR #45',                                    // human label
       fetchCommand: 'gh pr diff 45 --repo owner/repo',      // exact command agents should run
       background: '...',                                    // 1 paragraph, why this change exists
       changedFiles: ['apps/backend/app/schemas/user.py', …], // for orientation, not exhaustive
       skipDimensions: [],                                    // e.g. ['e2e-tests'] — only when justified
     },
   })
   ```
   This task explicitly asks for multi-agent orchestration by its nature (the whole point is
   independent specialists + adversarial debate) — invoking this skill IS the user's opt-in to run
   the workflow; you don't need to ask permission again before calling `Workflow`.

4. **Wait for the result**, then present the final markdown report to the user directly. Do not
   post it as a GitHub PR comment, push a commit, or take any other externally-visible action on
   the strength of this review alone — reviewing is not the same as acting on the review. If the
   user wants findings turned into actual fixes afterward, that's a separate, explicit next step.

## What "good" looks like when reading the output

- A report with zero overruled findings across seven dimensions is a signal to re-run with a
  stricter prompt, not a sign the PR is flawless — some rebuttal disagreement is expected and
  healthy; total agreement usually means the rebuttal agents didn't really try.
- Weight the **"Where the reviewers disagreed"** section highest — it's the densest, most
  information-rich part of a debate and the easiest part to skim past.
- A test-coverage or security finding that only surfaces in this review (not caught by CI) is the
  entire reason this skill exists — treat those as the highest-value output, not the design-pattern
  nitpicks.

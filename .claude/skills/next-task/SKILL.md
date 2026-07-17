---
name: next-task
description: Find the next implementable task in docs/tasks/ (dependency-aware, not just the next file number) and hand back a ready-to-paste /goal command for it. Use this whenever the user asks "qual a próxima task/tarefa", "what should we work on next", "what's next in the roadmap", "pick the next task", or asks for a /goal prompt for upcoming work without naming a specific task file. Don't use it when the user already named a specific task file — go straight to the implement-task skill for that.
---

# Next Task

Answers "what do we build next?" for `docs/tasks/`, then converts the answer into a `/goal`
command the user can paste as-is. Two outputs every time this skill runs: **which task, and
why**, then **the command**.

Picking "next" by file number alone is wrong here — `docs/tasks/README.md` numbers screens in
product-narrative order, not build order, and half the foundation tasks list dependencies on each
other. A task with the lowest number can still be blocked; a task several folders later can be the
one that's actually unblocked and unblocks the most other work.

## Procedure

### 1. Build the status map

Read `docs/tasks/README.md` first for the current folder list and the status legend (`⬜ Not
started` / `🟡 In progress` / `✅ Done`). Then grep the whole tree for the status line:

```
rg "Status.*(Not started|In progress|Done)" docs/tasks
```

Only `docs/tasks/`, not `docs/out-of-mvp/` — those are explicitly out of MVP scope per the
README's "Out-of-MVP tasks" section and aren't candidates here.

### 2. Filter to what's actually ready

For every task that isn't already `✅ Done`, open its header and check every path listed in
`Dependencies:`. Read *that* file's own `Status` line — don't infer it from the file existing.

- All dependencies `✅ Done` → ready.
- A dependency itself `⬜ Not started`, or `🟡 In progress` with a gap the current task actually
  needs → blocked. Note what it's blocked on; don't silently drop it from consideration.
- `Dependencies: none` → always ready (there's exactly one such task, but don't hardcode that
  assumption — check).

This mirrors what `implement-task` checks once a task is picked — doing it here first avoids
recommending something that turns out blocked the moment implementation starts.

### 3. Rank the ready tasks

Among tasks with all dependencies resolved:

1. **Leverage first.** Count how many other not-Done tasks list this task's path in their own
   `Dependencies:` header (a second grep pass, this time for the candidate's own path). A
   foundation piece that unblocks several downstream tasks outranks one nobody else needs yet —
   finishing it moves more of the tree forward per unit of work.
2. **Tie-break by catalog order.** `00-foundation/` before numbered screens, ascending folder
   number, ascending file number within a folder — this follows the MVP build sequence the README
   itself lays out (foundation → screen 01 → screen 02 → …).

**Special case — an already-`🟡 In progress` task exists:** call it out explicitly as an
alternative regardless of where it ranks by leverage. Finishing in-flight work before starting
something new is usually the better default, but don't auto-promote it to top pick if a
Not-started task clearly unblocks more — say both, let the user decide. This project currently has
`00-foundation/17-docker-dev-environment.md` in this state; check whether it still is before
assuming.

### 4. Present the pick

State the recommended task, one line on why (leverage — name what it unblocks — or catalog
position if it's a toss-up), and 1-2 runner-up alternatives with a one-line reason each (a smaller
isolated task for a quick win, or the in-progress task if there is one). Keep this short; the
value is the ranking, not a restated task summary — the task file itself has the detail.

### 5. Turn it into a `/goal` command

Compose the condition from these parts — this is the structure `/goal`'s own docs
(code.claude.com/docs/en/goal) call out as what makes a condition hold up across many turns,
because the evaluator (a small fast model, default Haiku) only judges what's already in the
conversation — it doesn't run commands or read files itself:

- **One measurable end state**: the task's package/files exist and its Acceptance Criteria are
  met — reference the task file path directly so Claude re-reads it rather than working from
  memory of this conversation.
- **A stated check**: a command whose output will land in the transcript for the evaluator to
  read. Prefer the project's own verification commands over inventing one — `CLAUDE.md`'s Workflow
  section lists `pytest`, `npm test`, `ruff check .`, `npx eslint .`, `npx tsc --noEmit`; for
  anything touching `packages/design_system` or foundation code consumed by multiple apps, use the
  cross-app command `implement-task` itself calls for: `npx turbo run lint typecheck test`.
- **Constraints that matter**: branch discipline (not committing to `main`), and updating the task
  file's own `Status`/`Definition of Done` to what was *actually* verified, not a rubber stamp —
  both are explicit steps in `implement-task`, so naming that skill in the condition pulls its
  rules in rather than restating them by hand.
- **A bound clause**: `/goal` conditions can run indefinitely if the condition never quite
  resolves; include something like "or stop after N turns" (20-30 is reasonable for an M-effort
  task, more for L/XL) so an ambiguous spec surfaces for a human decision instead of looping.

Output the command in a fenced code block, ready to paste — don't make the user assemble it from
prose. Example shape (fill in the real task path/effort/checks, don't reuse this verbatim):

```
/goal Implementar <task path> seguindo o skill implement-task: <package/files> existe(m) e cobre(m)
o Acceptance Criteria do arquivo; `<verification command(s)>` roda(m) limpo; o Status e a Definition
of Done no arquivo da task estão atualizados refletindo exatamente o que foi entregue; branch não é
main; commit feito. Parar após <N> turnos se não convergir.
```

Mention once, briefly, that `/goal` still asks for tool-call permission per the user's normal
permission mode unless paired with auto mode — don't bake that toggle into the command itself,
it's a separate setting the user turns on if they want unattended turns.

## What NOT to do

- Don't recommend a task whose dependencies aren't all `✅ Done` without saying so — "next" means
  buildable now, not just next in file order.
- Don't skip straight to drafting the `/goal` command without first stating which task and why —
  the ranking is the useful part; the command is mechanical once the task is picked.
- Don't invent a verification command that doesn't exist in this repo. Pull from `CLAUDE.md`'s
  Workflow section or the task file's own Tests section; if neither gives a concrete command, say
  so instead of guessing one.
- Don't fold `docs/out-of-mvp/` tasks into the ranking — they're explicitly parked, not "next."

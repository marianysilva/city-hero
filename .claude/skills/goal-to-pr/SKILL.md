---
name: goal-to-pr
description: Package the commits from a /goal session (or any recent branch work) into a pull request, correctly handling a branch that already has a merged PR from an earlier round. Use this whenever the user asks to open, create, or update a PR for work just completed — especially after a /goal run, and especially when the branch has been used for more than one round of work.
---

# Goal to PR

A branch used across multiple `/goal` sessions can already have a **merged** PR on it from an
earlier round, with new commits added after that merge. `gh pr view <branch>` (or `gh pr list
--head <branch>`) only shows the most recent PR associated with that branch by default — it's easy
to mistake "there's a PR here" for "these commits are covered," when the PR that exists actually
already shipped and the new commits are still un-PRed.

## Procedure

1. **Check branch state first:**

   ```
   git status
   git branch -vv
   git remote -v
   ```

   Confirm whether the branch is pushed and what it's tracking.

2. **Check for an existing PR on this branch, in any state:**

   ```
   gh pr list --head <branch> --state all
   ```

   Three outcomes:
   - **No PR at all** → standard new PR flow (step 4).
   - **An OPEN PR exists** → this is an update, not a new PR. Push (if not already) and confirm
     the open PR now includes the new commits; don't create a second PR for the same branch.
   - **The only PR is MERGED** → that PR covered commits up to its merge point. Anything after
     that merge is new, un-PRed work and needs its own PR. Confirm this explicitly:

     ```
     git merge-base main <branch>
     git log --oneline main..<branch>
     ```

     If `main`'s tip is an ancestor of the branch (the branch is properly based on current main,
     just with extra commits on top), proceed to open a new PR for just those extra commits — do
     not try to reference or "reopen" the merged one.

3. **Read the full commit range before drafting the PR body** — not just the latest commit:

   ```
   git log --format="%H%n%s%n%b%n---" main..HEAD
   git diff --stat main..HEAD
   ```

   Summarize what each commit actually changed, grounded in the real diff — a PR body written from
   memory of "what we were working on" tends to drift from what the commits actually contain,
   especially after several commits amending or reverting earlier ones in the same session (e.g. a
   feature added, then partially reverted, then re-documented — the PR body should describe the
   net result, not narrate the back-and-forth).

4. **Create the PR:**

   ```
   gh pr create --base main --head <branch> --title "..." --body "$(cat <<'EOF'
   ## Summary
   ...
   ## Test plan
   ...
   EOF
   )"
   ```

   Keep the title under ~70 characters; put detail in the body. Reference the prior PR number in
   the body if this is a continuation ("continues the work from #23") so reviewers have context.

5. **Report the PR URL and a one-line description of scope** (which commits, which files) so the
   user can tell at a glance whether it's the delta they expected.

## What NOT to do

- Don't assume a PR found via `gh pr view <branch>` is still open — check its `state` field.
- Don't force-push or rewrite history to "clean up" a branch before opening the PR unless the user
  asked for that; a PR with a few small follow-up commits (including ones that revert part of an
  earlier commit in the same PR) is normal and often clearer than a squashed rewrite.
- Don't open a PR against anything other than the project's actual base branch (check `CLAUDE.md`
  or the repo default) without confirming with the user first.

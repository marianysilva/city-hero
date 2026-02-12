---
name: fix-issue
description: Fix a GitHub issue end-to-end
disable-model-invocation: true
---

Analyze and fix the GitHub issue: $ARGUMENTS.

1. Use `gh issue view $ARGUMENTS` to get the issue details
2. Understand the problem described in the issue
3. Search the codebase for relevant files using Grep and Glob
4. Implement the necessary changes to fix the issue
5. Write and run tests to verify the fix:
   - Python: `pytest <test_file> -v`
   - TypeScript: `npm test -- <test_file>`
6. Run the relevant linter:
   - Python: `ruff check --fix .`
   - TypeScript: `npx eslint --fix .`
7. Ensure type checking passes (`npx tsc --noEmit` for TS)
8. Create a descriptive commit following conventional commits format
9. Push the branch and create a PR with `gh pr create`

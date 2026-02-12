# Engineering Standards

Cross-cutting practices that apply to **every** task in `docs/tasks/`.
Each task spec references the relevant docs here instead of repeating
guidance.

## Documents

- [Coding Standards](./coding-standards.md) — language-specific conventions for Python, TypeScript, SQL: naming, typing, linting, documentation.
- [Architecture Patterns](./architecture-patterns.md) — preferred patterns for backend (Repository / Service / Controller), frontend (container/presentational, hooks), API design (REST, multi-tenant scoping), and async behavior.
- [Design System](./design-system.md) — atomic-design tiers, location rules, Storybook requirements, and React patterns (composition, headless components, hooks-for-logic) that govern every UI component.
- [Component Inventory](./component-inventory.md) — canonical catalog of every shared component (tokens, atoms, molecules, organisms, templates) and the screens that consume each. Single source of truth for reuse.
- [Testing Strategy](./testing-strategy.md) — test pyramid, coverage targets, TDD guidance, mocking conventions, visual regression.
- [Security Baseline](./security-baseline.md) — OWASP top 10, input validation, SQL injection prevention, auth/authz, secrets management, LGPD compliance.
- [Observability](./observability.md) — structured logging, trace IDs, metrics, Sentry integration, health checks.
- [Open Questions](./open-questions.md) — running audit log of contradictions, gaps, and pending product/design decisions discovered while reviewing the task catalog.
- [Design Hygiene](./design-hygiene.md) — running log of prototype artifacts that turned out not to be product requirements (removed before implementation to avoid churn).

## How to use

When implementing a task, always read:

1. The task itself (`docs/tasks/<folder>/<task>.md`)
2. The standards docs referenced in the task's `Standards & References` section
3. Any task dependency listed in the header
4. `CLAUDE.md` (project context — product, stack, project-specific conventions)

The contract is: **standards here are normative**. If a task contradicts a
standard, the standard wins (and the task should be updated). If a standard is
missing for something a task needs, propose adding it as part of implementation.

## Updating these docs

Standards evolve as we learn. When updating:

- Open a PR with the change.
- If the change is significant (new pattern, new constraint), call out
  affected tasks in the PR description.
- After merge, audit task references to ensure no stale guidance.

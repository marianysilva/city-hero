# Testing Strategy

Test pyramid, coverage targets, and conventions across CityHero.

## Pyramid

Test fast and broad at the bottom, slow and narrow at the top.

| Layer       | Volume       | Speed        | Examples                                    |
| ----------- | ------------ | ------------ | ------------------------------------------- |
| Unit        | Most tests   | ms each      | pure functions, hooks, components, services |
| Integration | Fewer        | tens of ms   | API + DB, multi-component flows             |
| E2E         | Few          | seconds      | full user journeys (Detox, Playwright)      |
| Visual      | Per UI piece | per snapshot | Storybook + Chromatic                       |

Avoid an inverted pyramid (lots of E2E, few units) — it's slow and flaky.

## Coverage targets

- **New code**: ≥80% line coverage on all new modules.
- **Critical paths** (auth, payments, photo upload, anonymization): ≥95%.
- **Foundation packages** (`packages/design_system`, `packages/api_client`): ≥90%.

Coverage is a floor, not a ceiling. Numbers don't replace good test design — a 100%-covered module with bad assertions still has bugs.

## Backend (Python · pytest)

### Conventions

- Test files: `test_<module>.py`. Test classes (when used): `Test<ClassName>`. Test functions: `test_<scenario>`.
- One assertion concept per test. If a test has many `assert` lines, they should all support the same scenario.
- Use **fixtures** for setup; avoid setUp/tearDown classes.
- Async tests use `pytest-asyncio`.
- Database tests run against a test database (separate schema or in-memory if feasible). Reset between tests via transaction rollback.

### What to mock

- External HTTP calls (`httpx` mocked with `respx` or `pytest-httpx`).
- Time, randomness (use freezegun, `random.seed`).
- Filesystem (use `tmp_path` fixture or `pyfakefs`).
- AI inference (mocked with deterministic responses for unit tests; integration tests use real model).

### What NOT to mock

- The database in service-layer tests (use the test DB; mocks hide real query bugs).
- Internal services in integration tests.

## Frontend (TypeScript · Jest + RTL)

### Conventions

- Test files: `<Component>.test.tsx` co-located with the component.
- Use **React Testing Library** queries: `getByRole`, `getByLabelText`, etc. Avoid `getByTestId` unless there's no semantic alternative.
- Test user-visible behavior, not implementation details. "User clicks X, sees Y" — not "state.foo === bar".
- Mock external modules with `jest.mock`. Use **MSW** (Mock Service Worker) for HTTP.

### Component tests

Test what the user sees and does:

- Initial render shows expected elements.
- User interactions (click, type) produce expected output.
- Loading and error states render correctly.
- Accessibility props are present (role, label).

### Hook tests

`@testing-library/react-hooks` (or built-in `renderHook` from RTL v13+).

## Mobile E2E (Detox)

Used sparingly for **happy paths only** — the most-used flows. Detox is slow and flaky compared to unit/integration; reserve for high-value scenarios:

- Onboarding flow
- Report a pothole (Camera → Confirm → Liga de Heróis)
- Login + view My Reports
- NPS feedback after resolution

Do NOT use E2E for edge cases — those go to unit/integration.

## Web E2E (Playwright)

Same philosophy: happy paths and a small set of high-impact flows. The web admin is for managers; expect a small but critical user base.

## Visual regression (Storybook + Chromatic)

Every component in `packages/design_system` has Storybook stories covering its key states. Chromatic catches unintended visual changes on PRs.

## Snapshot tests

Use **sparingly** — they catch visual regressions but generate noisy diffs. Prefer Chromatic for visual checks. Snapshot only for stable, structural artifacts (tokens, generated code).

## TDD

Test-Driven Development is encouraged for **services and pure logic**. Less essential for UI (red-green-refactor with snapshots is awkward).

When TDD-ing:

1. Write a failing test that describes the desired behavior.
2. Implement the simplest thing that makes it pass.
3. Refactor without changing behavior.

## Performance and load tests

- Backend: **Locust** for synthetic load on critical endpoints (report creation, feed list, sync).
- Frontend: **Lighthouse CI** on web for performance budgets.
- Mobile: Flipper / React DevTools profiler for ad-hoc analysis.

Performance tests are not run on every PR — they run on a nightly job and on release candidates.

## Test data

- Use **factories** (factory_boy in Python, fishery in TS) instead of fixture JSON.
- Keep factories close to the model they create.
- Tests should not depend on a specific seed/data state — they create what they need.

## CI pipeline

- Every PR runs: lint, typecheck, unit, integration. Must all pass.
- E2E and visual run on PRs that touch UI or critical paths (path filters).
- Performance + Lighthouse run on `main` after merge.

## Flakiness policy

A flaky test is worse than no test — it teaches the team to ignore CI. When a test flakes:

1. **Quarantine** it immediately (skip + linked ticket).
2. Fix the root cause within a sprint, or delete the test.
3. Never paper over with retries unless the underlying flakiness is fundamentally external.

## References

- Test pyramid: https://martinfowler.com/articles/practical-test-pyramid.html
- pytest: https://docs.pytest.org/
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Detox: https://wix.github.io/Detox/
- Playwright: https://playwright.dev/
- Chromatic: https://www.chromatic.com/

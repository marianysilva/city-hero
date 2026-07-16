# Testing Strategy

Test pyramid, coverage targets, and conventions across CityHero.

## Pyramid

Test fast and broad at the bottom, slow and narrow at the top.

| Layer       | Volume     | Speed      | Examples                                                                                                   |
| ----------- | ---------- | ---------- | ---------------------------------------------------------------------------------------------------------- |
| Unit        | Most tests | ms each    | pure functions, hooks, components, services                                                                |
| Integration | Fewer      | tens of ms | API + DB, multi-component flows                                                                            |
| E2E         | Few        | seconds    | full user journeys — Playwright (browser: web app + mobile's web build), Detox/Maestro (native-only flows) |

Avoid an inverted pyramid (lots of E2E, few units) — it's slow and flaky.

**Visual regression is not currently part of the pyramid.** It was evaluated and deliberately
deferred — see the "Visual regression" section below for what it would look like and why it isn't
built yet.

## Coverage targets

- **New code**: ≥80% line coverage on all new modules.
- **Critical paths** (auth, payments, photo upload, anonymization): ≥95%.
- **Foundation packages** (`packages/design_system`, `packages/api_client`): ≥90%.

Coverage is a floor, not a ceiling. Numbers don't replace good test design — a 100%-covered module
with bad assertions still has bugs.

## Backend (Python · pytest)

### Conventions

- Test files: `test_<module>.py`. Test classes (when used): `Test<ClassName>`. Test functions:
  `test_<scenario>`.
- One assertion concept per test. If a test has many `assert` lines, they should all support the
  same scenario.
- Use **fixtures** for setup; avoid setUp/tearDown classes.
- Async tests use `pytest-asyncio`.
- Database tests run against a test database (separate schema or in-memory if feasible). Reset
  between tests via transaction rollback.

### What to mock

- External HTTP calls (`httpx` mocked with `respx` or `pytest-httpx`).
- Time, randomness (use freezegun, `random.seed`).
- Filesystem (use `tmp_path` fixture or `pyfakefs`).
- AI inference (mocked with deterministic responses for unit tests; integration tests use real
  model).

### What NOT to mock

- The database in service-layer tests (use the test DB; mocks hide real query bugs).
- Internal services in integration tests.

## Frontend (TypeScript · Jest or Vitest + RTL)

The runner is picked per package by what it actually renders through, not by preference — see
`docs/tasks/00-foundation/02-design-tokens.md` for the reasoning this was worked out against:

- **`apps/city-hero`**: Jest via `jest-expo`. This is the only test runner with real React Native
  native-module mocking (camera, location, gestures, fonts/assets); there's no mature Vitest
  equivalent for native RN.
- **`packages/design_system`** and **`apps/web`**: Vitest. Both render through `react-native-web` or
  plain web (never native RN), which is exactly what Vitest/jsdom supports — and both already share
  Vite tooling (Storybook's builder for the former, Next.js's own current Vitest guide for the
  latter).

### Conventions

- Test files: `<Component>.test.tsx` co-located with the component.
- Use **React Testing Library** queries: `getByRole`, `getByLabelText`, etc. Avoid `getByTestId`
  unless there's no semantic alternative.
- Test user-visible behavior, not implementation details. "User clicks X, sees Y" — not "state.foo
  === bar".
- Mock external modules with `jest.mock` (Jest) or `vi.mock` (Vitest). Use **MSW** (Mock Service
  Worker) for HTTP, either runner.

### Component tests

Test what the user sees and does:

- Initial render shows expected elements.
- User interactions (click, type) produce expected output.
- Loading and error states render correctly.
- Accessibility props are present (role, label).

### Hook tests

`@testing-library/react-hooks` (or built-in `renderHook` from RTL v13+).

## E2E: what Playwright is actually for here

**Playwright is a browser-automation / end-to-end tool — clicking, filling forms, navigating,
asserting on page state and network calls. It is not, in this project, a screenshot-diffing tool.**
`expect(page).toHaveScreenshot()` exists and was tried for design-system component snapshots (see
"Visual regression" below), but that's a narrow secondary feature, not what Playwright is for — the
primary use across this codebase is real user-flow automation, on both consuming apps:

- **`apps/web`** (Next.js Operational Panel): the full app is a real browser target. Playwright
  drives it directly — this is the standard case, already wired as `test:e2e`.
- **`apps/city-hero`** (Expo/React Native): Playwright **cannot** drive a native iOS/Android
  simulator — it only automates browsers. What it _can_ do is drive the app's web build
  (`expo start --web` / `expo export -p web`, which renders through `react-native-web` to real DOM),
  and it should — for every flow that's platform-agnostic (navigation, forms, most business logic,
  state), the same Playwright suite runs against both `apps/web` and `apps/city-hero`'s web build,
  maximizing coverage without native tooling.
  - **What Playwright can't cover on mobile**: anything that needs a real native module or sensor —
    the AI camera capture, GPS-based anti-fraud validation, haptics, native permission dialogs,
    biometric unlock. These either don't exist on web, or behave too differently from the real
    device to trust a web-mode test asserting on them.
  - **Those go to Detox or Maestro instead** — real simulator/device automation. Maestro in
    particular works directly against Expo Go with no native build step
    (`openLink: exp://127.0.0.1:19000`), which is a lower-friction starting point than Detox for an
    Expo-managed app; Detox remains the fallback if Maestro's coverage proves insufficient. Reserve
    either for the small set of flows that genuinely need native behavior:
    - Report a pothole (Camera → Confirm → Heroes League) — the camera/GPS-critical path
    - Onboarding's location-permission step
    - Anything else gated on a native permission or sensor
- Used sparingly for **happy paths only**, on both platforms — E2E (of any kind) is slow and flaky
  compared to unit/integration; it is not where edge cases get tested.

## Visual regression

**Evaluated for `packages/design_system` and deliberately not built.** The plan was a Playwright
spec asserting `expect(page).toHaveScreenshot()` against each Storybook story's built
`iframe.html?id=...` URL. Two things made it not worth it right now (see
`docs/tasks/00-foundation/02-design-tokens.md` for the full reasoning):

- Playwright's snapshot filenames are suffixed with `process.platform` — a baseline captured on a
  contributor's Windows/macOS machine never matches CI's `ubuntu-latest`, so correct baselines can
  only come from a dedicated CI job, not local development.
- The design system currently has two atoms, and its own tokens are still "first-pass, not yet
  validated against real screen designs" — baselines would need regenerating again almost
  immediately, for low near-term protection.

Vitest unit tests already cover "the right values reach the right components" (token snapshots,
`ThemeProvider` rendering, cross-app consumption, Tailwind-preset/token parity); pixel-level
rendering is the one gap that leaves open. Revisit once tokens are design-validated and there are
enough shared components to justify the upkeep.

## Snapshot tests

Use **sparingly** — they catch changes but generate noisy diffs if used for anything that changes
often. Snapshot only stable, structural artifacts (tokens, generated code) — see
`packages/design_system/src/tokens/tokens.test.ts` for the pattern. Not a substitute for pixel-level
visual regression (see above); it snapshots plain JS/TS values, not rendered pixels.

## TDD

Test-Driven Development is encouraged for **services and pure logic**. Less essential for UI
(red-green-refactor with snapshots is awkward).

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

- Backend: plain **pytest fixtures** that construct real ORM instances against the test database
  (see `admin_user` in `apps/backend/tests/conftest.py`) — not fixture JSON, and no `factory_boy`
  (not installed; a single fixture per entity is enough at this scale). Add a factory library only
  once enough tests need varied, randomized instances of the same model that hand-written fixtures
  become repetitive.
- Frontend: prefer building test data inline in the test file; reach for a factory library (e.g.,
  `fishery`) only if the same shape needs to vary across many test files.
- Keep fixtures/factories close to the model they create.
- Tests should not depend on a specific seed/data state — they create what they need. Reference
  (seed) tables like `roles`/`permissions` are the exception: they're migration-seeded once per test
  session and preserved between tests (see `_clean_tables` in `conftest.py`).

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
- Vitest: https://vitest.dev/
- Playwright (E2E, not just visual comparisons — see "E2E: what Playwright is actually for here"):
  https://playwright.dev/
- Detox: https://wix.github.io/Detox/
- Maestro (Expo Go support, no native build needed): https://docs.maestro.dev/
- Playwright visual comparisons (evaluated, not currently used — see "Visual regression" above):
  https://playwright.dev/docs/test-snapshots

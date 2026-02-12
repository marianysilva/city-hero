# Citizen Profile · Profile switcher (dev / staging only)

> **Type:** Screen feature · UI + dev tool
> **Screen:** SCREEN 28 · Citizen Profile (Settings section)
> **Effort:** S (≤1 day)
> **Dependencies:** `28-citizen-profile/06-settings-and-logout.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `screen`, `dev-tool`, `testing`

## Context

A **temporary** affordance to swap the active user persona during
development and staging while the project doesn't have a real login
flow yet. The MVP intentionally skips auth (see
`docs/engineering/open-questions.md` Q2), so testing role-specific
features — citizen with various levels, prefecture manager, field team
member — needs a low-friction switcher.

The switcher lives in Settings, gated behind a build flag so it is
**invisible in production builds**. Selecting a persona swaps the
mock JWT and triggers an app reload so the rest of the app re-renders
under the new identity.

> This task is explicitly scoped as a **bridge** between "no auth at
> all" and "real auth + login screen". When the real auth flow is
> introduced, this switcher and its hardcoded personas are deleted.

## User Story

**As a** Developer or QA tester,
**I want** to quickly swap between predefined user personas in the running app,
**In order to** test role-specific UI and behavior without building a real login flow yet.

## Acceptance Criteria

### Scenario · Visible in dev / staging builds only

**Given** a developer is using a `__DEV__` or `staging` build
**When** they open Mais → Configurações
**Then** a "MODO DEV" section is visible at the very bottom
**And** inside it, a "Trocar perfil" row is the first item
**And** a small "DEV MODE" badge is rendered globally (small chip on the Profile hero) so it's obvious the switcher is active

### Scenario · Hidden in production builds

**Given** the build is the production variant
**When** the user opens Settings
**Then** the entire "MODO DEV" section is absent from the render tree
**And** the global DEV MODE badge is also absent
**And** there is no code path from production UI to the switcher

### Scenario · List of personas

**Given** the user opens the "Trocar perfil" row
**When** the picker renders
**Then** a bottom sheet lists the available personas with a name + role chip:
  - **Cidadão Novo** (level 1, no medals)
  - **Vigilante** (mid-level)
  - **Guardião do Bairro** (high level, several medals)
  - **Líder da Liga** (top level)
  - **Anônimo Padrão** (defaults to anonymous reports)
  - **Gestor da Prefeitura** (`role: prefecture_manager`)
  - **Equipe de Campo** (`role: field_team`)
**And** each entry shows a short description of what's pre-seeded for that persona

### Scenario · Pick a persona

**Given** the user taps a persona
**When** the action runs
**Then** a confirmation appears: "Trocar para <persona>? O app vai reiniciar."
**And** confirming writes the persona's mock token + identity to local storage
**And** triggers an app reload (or full nav reset to Splash) so all queries and screens re-render under the new identity
**And** a toast confirms once Home loads: "Perfil ativo: <persona>"

### Scenario · Reset to fresh state

**Given** the user wants to wipe local state for the active persona
**When** they tap "Resetar dados do perfil" inside the picker
**Then** all local storage (cache, queue, AsyncStorage keys) for this persona is cleared
**And** the app reloads

### Scenario · Persona persists across cold starts

**Given** the user picked Guardião and closed the app
**When** they relaunch
**Then** Splash routes them straight into Guardião's session (no picker on launch)
**And** the badge "DEV MODE · Guardião" stays visible

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the picker
**Then** each persona is announced with name + role + short description

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/CitizenProfile/
└── components/
    └── ProfileSwitcherRow.tsx     ← rendered conditionally by SettingsList

apps/mobile/src/dev/
├── personas.ts                    ← hardcoded persona definitions + mock JWTs
├── DevModeBadge.tsx               ← global "DEV MODE" chip
└── useDevPersona.ts               ← hook + setter
```

### Component behavior

- `ProfileSwitcherRow` reads the build flag and renders nothing in production.
- `useDevPersona` exposes `{active, set, reset}` backed by AsyncStorage.
- Setting a new persona triggers a full app reload (Expo `DevSettings.reload()` in dev; navigation reset in staging).
- The set of personas + their mock identities is a single source of truth in `personas.ts` — never duplicated.

### Build gating

- The whole `apps/mobile/src/dev/` tree is excluded from the production bundle via the bundler's environment-based dead-code elimination.
- A unit test asserts that production builds do not include any string from `personas.ts`.

## Backend

For dev and staging, the backend accepts the mock JWTs the personas
ship with (signed with a non-production key the backend explicitly
trusts only when `ENV=dev|staging`). Production rejects these tokens.

## Database

Not applicable. Persona data is local.

## Edge Cases

- **Persona's mock JWT expires**: the picker refreshes the mock JWT on each persona switch so expiry doesn't bite during long QA sessions.
- **Picking the same persona twice**: no-op; the app does not reload.
- **Production build accidentally ships dev personas**: the unit test in `apps/mobile/__tests__/devModeAbsentInProd.test.ts` fails CI.

## Privacy / LGPD

Not applicable — the personas are fictional mock data.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `dev.persona_switched`             | User picks a persona                       | `from_persona`, `to_persona`         |
| `dev.persona_reset`                | User resets data                           | `persona`                            |

(These events are logged but never sent to production analytics — they exist only in dev/staging streams.)

## Tests

- **Unit**: persona picker renders only when build flag is on; persona switch reloads; reset clears storage.
- **CI gate**: a build of the production variant does not contain any persona names or mock JWTs (string scan).

## Definition of Done

- [ ] `apps/mobile/src/dev/` package with personas + hook
- [ ] `ProfileSwitcherRow` conditionally rendered in Settings
- [ ] Global `DevModeBadge` on the Profile hero
- [ ] Persona persistence across cold starts
- [ ] Reset action
- [ ] Production build excludes the entire dev tree (verified by test)
- [ ] Backend trust of mock JWTs gated to non-production envs

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Reuse principle: see `[[feedback-reuse-principle]]` in the auto-memory (single source of truth for persona definitions)

### Project context
- Settings section: `06-settings-and-logout.md`
- Auth system (where real auth will live): `00-foundation/06-auth-system.md`
- Open questions Q2 (no login screen yet): `docs/engineering/open-questions.md`
- `CLAUDE.md`

# Login · Render UI (form + layout)

> **Type:** Screen feature · UI\
> **Screen:** SCREEN 01a · Login\
> **Effort:** S (≤1 day)\
> **Dependencies:** `00-foundation/02-design-tokens.md`\
> **Status:** ✅ Done — `apps/city-hero/src/screens/Login` (`LoginScreen.tsx` +
> `components/LoginHeader.tsx`/`LoginForm.tsx`/`CreateAccountLink.tsx`), mounted at a new
> `app/login.tsx` route (registered in `app/_layout.tsx`'s Stack). Reached from Splash's "Entrar com
> e-mail" CTA — previously a `console.log` stub (`WelcomeActions.tsx`), now wired via an
> `onEmailLogin` prop threaded from `app/index.tsx`'s `router.push("/login")`, since this screen
> exists for it to hand off to. Two design-system atoms this task needed were catalogued in
> `docs/engineering/design-system.md`/`component-inventory.md` but never built — built them properly
> instead of forking screen-local copies: `TextInput` (`packages/design_system/src/atoms/TextInput`,
> composition-over-configuration — password visibility/search/validation are composed by callers via
> `rightElement`/`secureTextEntry`, not built in) and `LogoMark`
> (`packages/design_system/src/atoms/LogoMark`, `on-color`/`on-light` variants). `LogoMark` was
> extracted from Splash's `AnimatedLogo.tsx`, which duplicated the same frame/gradient/emoji JSX —
> `AnimatedLogo.tsx` now just wraps the shared atom in its entrance animation, no visual duplication
> left between the two screens. Also extracted `apps/city-hero/lib/telemetry.ts` from a
> `console.info` placeholder that used to be copy-pasted per-screen (Splash had its own copy).\
> **Known first-pass gaps** (both documented inline in `TextInput.tsx`): the focus "ring" AC is
> approximated with a colored shadow — the color only renders on iOS; Android gets a border-color
> change plus a plain `elevation` bump, not a colored ring (RN shadows don't carry color on
> Android). `textContentType` (iOS-only, per the AC) is paired with `autoComplete="email"` /
> `"current-password"` for Android's autofill equivalent. Reduce-motion doesn't apply to this screen
> — no animated elements. Snapshot tests: not built, same reasoning as Splash — no snapshot-testing
> convention exists in this repo yet (see Tests below for what covers dark mode instead). E2E: not
> built — no Maestro/e2e test infra exists anywhere in this repo yet, not specific to this task.\
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The visual rendering of the Login screen. No authentication logic — purely presentation. Email and
password fields, "Entrar" CTA, "Esqueci minha senha" link, and "Criar agora" link.

Appears after the user taps "Começar — sou cidadão" on Splash. Back button returns to Splash.

## User Story

**As a** Citizen who tapped "Começar — sou cidadão",\
**I want** to see a clean login form with clear fields and actions,\
**In order to** authenticate and start using the app.

## Acceptance Criteria

### Scenario · Default render

**Given** the user navigated from Splash\
**When** the Login screen renders\
**Then** the CityHero mini logo appears centered at the top (brand gradient icon)\
**And** the heading "Entrar no CityHero" appears below the logo\
**And** the subtitle "Faça login para reportar e acompanhar" appears below the heading\
**And** an email input field with label "E-mail" and placeholder "seu@email.com" is visible\
**And** a password input field with label "Senha" and placeholder "••••••••" is visible\
**And** a "VER" toggle button appears inside the password field\
**And** a "Esqueci minha senha" link appears below the password field\
**And** a primary "Entrar" button appears below the form\
**And** a "Não tem conta? Criar agora" link appears at the bottom\
**And** a back button (←) appears in the top-left corner

### Scenario · Back navigation

**Given** the Login screen is visible\
**When** the user taps the back button (←)\
**Then** the app navigates back to the Splash screen

### Scenario · Password visibility toggle

**Given** the password field contains text\
**When** the user taps "VER"\
**Then** the password becomes visible (plain text)\
**And** the toggle text changes to "OCULTAR"\
**When** the user taps "OCULTAR"\
**Then** the password is masked again

### Scenario · Input field focus states

**Given** an input field is not focused\
**When** the user taps on the email or password field\
**Then** the field border changes to `brand-400`\
**And** a subtle `brand-100` ring appears around the field\
**When** the user taps outside the field\
**Then** the field returns to its default border (`slate-200`)

### Scenario · Keyboard behavior

**Given** the login form is visible\
**When** the keyboard opens\
**Then** the form scrolls up so the active field is visible above the keyboard\
**And** the bottom "Criar agora" link is hidden behind the keyboard (acceptable)\
**When** the user taps "Next" on the email keyboard\
**Then** focus moves to the password field\
**When** the user taps "Go" on the password keyboard\
**Then** the form submits (same as tapping "Entrar")

### Scenario · System dark mode

**Given** the system is in dark mode\
**When** the Login screen renders\
**Then** the background follows dark theme tokens (deep slate gradient)\
**And** input fields use dark background with light text\
**And** the CityHero logo gradient remains unchanged (brand identity)

### Scenario · Accessibility

**Given** screen reader is enabled\
**When** the Login screen renders\
**Then** the reader announces "Entrar no CityHero. Faça login para reportar e acompanhar."\
**And** the email field is labeled "E-mail"\
**And** the password field is labeled "Senha"\
**And** the visibility toggle is labeled "Mostrar senha" / "Ocultar senha"\
**And** the back button is labeled "Voltar"\
**And** all interactive elements are reachable via tab/swipe navigation

## Frontend (React Native / Expo)

### Component location

```
apps/city-hero/src/screens/Login/
├── LoginScreen.tsx
├── LoginScreen.styles.ts
├── LoginScreen.test.tsx
└── components/
    ├── LoginHeader.tsx           ← logo + heading + subtitle
    ├── LoginForm.tsx             ← email + password fields + forgot link
    └── CreateAccountLink.tsx     ← bottom CTA
```

### Component behavior

- `LoginScreen` is a scroll view that adjusts for keyboard. It composes `LoginHeader`, `LoginForm`,
  and `CreateAccountLink`.
- `LoginForm` manages local state for email text, password text, and password visibility. It exposes
  callbacks: `onSubmit(email, password)`, `onForgotPassword()`.
- `CreateAccountLink` exposes callback: `onCreateAccount()`.
- All callbacks are no-ops in this task — wired in subsequent tasks.

### Design tokens used

| Token          | Usage                                     |
| -------------- | ----------------------------------------- |
| `brand-500`    | Primary button gradient start, focus ring |
| `brand-600`    | Primary button gradient end               |
| `brand-100`    | Focus ring outer glow                     |
| `brand-400`    | Focus border                              |
| `civic-purple` | Logo gradient end                         |
| `slate-200`    | Default input border                      |
| `slate-400`    | Input icons                               |
| `slate-500`    | Labels, subtitle                          |
| `slate-800`    | Input text                                |
| `slate-900`    | Heading text                              |

### Accessibility

- All form fields have explicit `accessibilityLabel`.
- Password toggle announces state change.
- Back button has `accessibilityLabel="Voltar"` and `accessibilityRole="button"`.
- Form fields use `textContentType` for autofill: `emailAddress` and `password`.

## Backend

Not applicable (UI only).

## Database

Not applicable.

## Edge Cases

- **Very long email address:** field truncates visually with horizontal scroll, no line break.
- **Paste into password field:** works normally, visibility toggle reflects the pasted content.
- **Orientation change:** app is portrait-only; ignore.
- **Font not loaded:** fallback to system sans-serif without flicker.
- **Deep link arrives while on login:** deferred until auth completes (handled by routing in
  `01-splash/03-routing-decision.md`).

## Privacy / LGPD

Not applicable (no data is sent in this task — purely UI).

## Analytics

| Event                 | When                      | Props                        |
| --------------------- | ------------------------- | ---------------------------- |
| `login.screen_viewed` | On mount                  | `source` (splash, deep_link) |
| `login.forgot_tapped` | "Esqueci minha senha" tap | —                            |
| `login.create_tapped` | "Criar agora" tap         | —                            |

## Tests

- **Unit**: renders all expected elements (logo, heading, fields, buttons, links); password
  visibility toggle works; back button triggers navigation; keyboard "Next" moves focus to password
  and "Go" submits; focus border color changes; long-email and empty-password edge cases; light/dark
  gradient colors (stands in for snapshot tests, per the repo not having that convention yet); the
  Splash → Login navigation wiring itself (`WelcomeActions.test.tsx`, `app/index.test.tsx`).
- **Snapshot**: not built — see Status.
- **E2E**: not built — see Status.

## Definition of Done

- [x] LoginScreen implemented matching the prototype layout
- [x] Email and password input fields with correct types and placeholders
- [x] Password visibility toggle functional
- [x] Focus states on input fields (see Status re: Android ring-color limitation)
- [x] Keyboard-aware scrolling
- [x] Back navigation to Splash
- [x] "Esqueci minha senha" and "Criar agora" links rendered (no-op callbacks)
- [x] Accessibility: labels, roles (reduce-motion N/A — no animated elements on this screen)
- [x] Dark mode functional
- [x] Unit tests
- [ ] Snapshot tests — not built, no snapshot-testing convention exists yet in this repo (see
      Status)
- [x] Code review approved

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture (component patterns): `docs/engineering/architecture-patterns.md`
- Design system: `docs/engineering/design-system.md`
- Testing: `docs/engineering/testing-strategy.md`
- Observability: `docs/engineering/observability.md`

### Library / framework references

- React Native TextInput: https://reactnative.dev/docs/textinput
- KeyboardAvoidingView: https://reactnative.dev/docs/keyboardavoidingview
- Expo SecureStore (for token storage in later tasks):
  https://docs.expo.dev/versions/latest/sdk/securestore/

### Project context

- Prototype: `design/index.html` (search `title: 'Login'`)
- Design tokens: `00-foundation/02-design-tokens.md`
- Auth system: `00-foundation/06-auth-system.md`
- `CLAUDE.md`

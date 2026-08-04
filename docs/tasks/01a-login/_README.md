# SCREEN 01a · Login

> **Group:** 01 · Entry & Onboarding\
> **Prototype screen:** `design/index.html` (search for `title: 'Login'`)\
> **Position in navigation:** After Splash ("Começar — sou cidadão") → before City Select

## Overview

Simple login screen with email + password, social login options (Google, Apple), and a "create
account" entry point. This screen gates the onboarding flow — the user authenticates here before
proceeding to city selection.

The screen is intentionally lightweight: no complex form wizards, no multi-step registration. The
goal is to get the citizen into the app with minimum friction. Gov.br login bypasses this screen
entirely (handled from Splash).

## Features (4 tasks)

| #   | Task                                                         | Effort | Depends on                                                                   |
| --- | ------------------------------------------------------------ | ------ | ---------------------------------------------------------------------------- |
| 01  | [Render Login UI (form + layout)](./01-render-login-ui.md)   | S      | `00-foundation/02-design-tokens.md`                                          |
| 02  | [Email/password authentication](./02-email-password-auth.md) | M      | task 01, `00-foundation/05-api-client.md`, `00-foundation/06-auth-system.md` |
| 03  | [Forgot password flow](./03-forgot-password-flow.md)         | S      | task 01, `00-foundation/05-api-client.md`                                    |
| 04  | [Create account flow](./04-create-account-flow.md)           | M      | task 01, `00-foundation/06-auth-system.md`                                   |

## Suggested implementation order

```
01 (UI) ──→ 02 (email/password)
              ├─→ 03 (forgot password)
              └─→ 04 (create account)
```

Task 01 (UI) is the foundation — all others depend on it. Tasks 02–04 can be parallelized once 01 is
complete, though 03–04 are independent of each other.

## Product notes

- **No mandatory login for browsing:** this screen appears only on the "Começar — sou cidadão" flow.
  Users who just want to look around can skip auth (future iteration). For MVP, login is required.
- **Gov.br users skip this screen** — they authenticate from the Splash via the Gov.br button and go
  straight to City Select.
- **Password rules:** minimum 8 characters, at least one letter and one number. No exotic
  requirements that frustrate users.
- **Social login (Google/Apple) deferred:** planned for a future iteration. When added, Apple
  Sign-In will be mandatory per App Store policy if any third-party social login is offered.
- **LGPD consent:** the Splash already shows the privacy policy link. No additional consent is
  needed here, but the "Criar agora" registration flow must include explicit opt-in.

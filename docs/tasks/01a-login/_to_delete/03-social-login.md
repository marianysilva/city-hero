# Login · Social Login (Google + Apple)

> **Type:** Screen feature · Integration\
> **Screen:** SCREEN 01a · Login\
> **Effort:** M (1–3 days)\
> **Dependencies:** `01a-login/01-render-login-ui.md`, `00-foundation/06-auth-system.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `backend`, `frontend`, `screen`, `auth`

## Context

Wires the Google and Apple social login buttons to their respective OAuth flows. On success, the
backend exchanges the provider token for a CityHero JWT, creating the user account if it doesn't
exist (auto-registration). This reduces onboarding friction significantly.

Apple Sign-In is **mandatory** per App Store Review Guidelines §4.8 whenever any third-party social
login is offered.

## User Story

**As a** Citizen who prefers not to create a new password,\
**I want** to log in with my Google or Apple account,\
**In order to** access the app with a single tap.

## Acceptance Criteria

### Scenario · Google login — success (existing account)

**Given** the user taps the "Google" button\
**When** the Google Sign-In sheet appears and the user selects an account\
**Then** the app sends the Google ID token to `POST /api/v1/auth/social`\
**And** the backend validates the token, finds the existing user, and returns a CityHero JWT\
**And** the user is navigated to City Select or Home

### Scenario · Google login — success (new account)

**Given** the user taps "Google" and has no CityHero account\
**When** the backend receives the Google ID token\
**Then** a new user is created with `displayName` and `email` from the Google profile\
**And** the user's `avatarUrl` is set from the Google profile picture\
**And** a CityHero JWT is returned\
**And** the user is navigated to City Select (first-time flow)

### Scenario · Apple login — success

**Given** the user taps the "Apple" button\
**When** the Apple Sign-In sheet appears and the user authenticates\
**Then** the app sends the Apple identity token to `POST /api/v1/auth/social`\
**And** the backend validates the token and returns a CityHero JWT\
**And** the user is navigated accordingly

### Scenario · Apple login — email hidden

**Given** the user chose "Hide My Email" during Apple Sign-In\
**When** the backend creates the account\
**Then** the user's email is stored as the Apple relay address\
**And** the app functions normally (email is never displayed to other users)

### Scenario · Provider sign-in cancelled

**Given** the user taps a social login button\
**When** the user dismisses the provider sheet without completing sign-in\
**Then** the app returns to the Login screen with no error message\
**And** no network request is sent to the backend

### Scenario · Provider token invalid

**Given** the social provider returned a token\
**When** the backend fails to validate it (expired, tampered)\
**Then** the backend returns `401 Unauthorized`\
**And** a toast appears: "Falha na autenticação. Tente novamente."\
**And** the user remains on the Login screen

### Scenario · Network error during social login

**Given** the device has no internet\
**When** the user taps a social login button\
**Then** a toast appears: "Sem conexão. Verifique sua internet."

### Scenario · Account merge conflict

**Given** the user logs in with Google but the email already exists as an email/password account\
**When** the backend detects the conflict\
**Then** the backend returns `409 Conflict` with `existing_method: "email"`\
**And** a toast appears: "Essa conta já existe com e-mail e senha. Faça login com sua senha ou
vincule as contas no perfil."

## Frontend (React Native / Expo)

### Libraries

- **Google:** `@react-native-google-signin/google-signin`
- **Apple:** `expo-apple-authentication` (iOS) — not available on Android

### Platform behavior

| Platform | Google | Apple     |
| -------- | ------ | --------- |
| iOS      | ✅     | ✅        |
| Android  | ✅     | ❌ hidden |

On Android, the Apple button is hidden. The layout adjusts: the Google button takes full width.

### Component changes

```
apps/city-hero/src/screens/Login/components/
└── SocialLoginButtons.tsx   ← update: wire callbacks, platform-conditional Apple button
```

## Backend (FastAPI)

### Endpoint

```
POST /api/v1/auth/social
```

**Request body:**

```json
{
  "provider": "google" | "apple",
  "idToken": "eyJ...",
  "nonce": "optional-for-apple"
}
```

**Success response (200 or 201):**

```json
{
  "accessToken": "jwt...",
  "refreshToken": "jwt...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "Maria",
    "cityId": "uuid | null",
    "role": "citizen",
    "authProvider": "google"
  },
  "isNewUser": true
}
```

**Status 201** is returned when a new account was created (auto-registration).

**Error responses:**

| Status | Code               | When                                      |
| ------ | ------------------ | ----------------------------------------- |
| 401    | `invalid_token`    | Provider token validation failed          |
| 409    | `account_conflict` | Email exists with a different auth method |
| 422    | `validation_error` | Missing or invalid fields                 |

### Token validation

- **Google:** verify ID token via Google's public keys (`googleapis.com/oauth2/v3/certs`). Check
  `aud` matches the app's client ID. Check `iss` is `accounts.google.com`.
- **Apple:** verify identity token via Apple's public keys (`appleid.apple.com/auth/keys`). Verify
  `nonce` matches. Check `aud` matches the app's bundle ID.

## Database

### Schema changes

Add `auth_provider` and `provider_id` columns to the `users` table (if not already present from
`00-foundation/06-auth-system.md`):

```sql
ALTER TABLE users
  ADD COLUMN auth_provider VARCHAR(20) DEFAULT 'email',
  ADD COLUMN provider_id VARCHAR(255),
  ADD UNIQUE (auth_provider, provider_id);
```

Alembic migration required.

## Edge Cases

- **Apple Sign-In on first use provides email; subsequent uses don't:** the backend must persist the
  email on first authentication. Apple only sends it once.
- **User revokes Google/Apple access externally:** next login attempt fails token validation →
  surface "Falha na autenticação" and let the user re-authorize.
- **Expo Go limitations:** Google Sign-In may require a development build. Document this in the
  project's dev setup guide.

## Privacy / LGPD

- Social provider tokens are used only for authentication exchange and are never persisted.
- The user's social profile data (name, email, avatar URL) is stored with the same LGPD protections
  as any other user data.
- Auto-registration via social login implies consent to the privacy policy shown on Splash. The
  registration event is logged for audit.

## Analytics

| Event                    | When                     | Props                           |
| ------------------------ | ------------------------ | ------------------------------- |
| `login.social_started`   | Provider sheet opened    | `provider`                      |
| `login.social_cancelled` | Provider sheet dismissed | `provider`                      |
| `login.social_success`   | Auth succeeded           | `provider`, `is_new_user: bool` |
| `login.social_failed`    | Auth failed              | `provider`, `error_code`        |
| `login.social_conflict`  | 409 account conflict     | `provider`, `existing_method`   |

## Tests

- **Unit**: Google button triggers Google Sign-In flow; Apple button triggers Apple Sign-In flow;
  cancelled flow returns to Login with no error; Apple button hidden on Android; loading state
  during token exchange.
- **Integration**: mock provider SDK + mock API — full social login flow including
  auto-registration.
- **E2E**: social login with test account → arrives at City Select.

## Definition of Done

- [ ] Google Sign-In integrated and functional on iOS and Android
- [ ] Apple Sign-In integrated and functional on iOS
- [ ] Apple button hidden on Android
- [ ] Auto-registration for new social users
- [ ] Account conflict handling (409)
- [ ] Token validation on backend (Google + Apple public keys)
- [ ] Provider tokens never persisted
- [ ] Alembic migration for `auth_provider` / `provider_id` columns
- [ ] Error handling for cancelled, invalid token, network errors
- [ ] Unit tests
- [ ] Integration tests
- [ ] Code review approved

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Security: `docs/engineering/security-baseline.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- Google Sign-In RN: https://github.com/react-native-google-signin/google-signin
- Expo Apple Authentication: https://docs.expo.dev/versions/latest/sdk/apple-authentication/
- Apple Sign-In REST API: https://developer.apple.com/documentation/sign_in_with_apple

### Project context

- Auth system: `00-foundation/06-auth-system.md`
- `CLAUDE.md`

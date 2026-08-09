# Login · Email/Password Authentication

> **Type:** Screen feature · Integration\
> **Screen:** SCREEN 01a · Login\
> **Effort:** M (1–3 days)\
> **Dependencies:** `01a-login/01-render-login-ui.md`, `00-foundation/05-api-client.md`,
> `00-foundation/06-auth-system.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `backend`, `frontend`, `screen`, `auth`

## Context

Wires the email/password form to the backend authentication endpoint. Handles validation, error
states, loading state, and token storage on success. On successful login, navigates to City Select
(or Home if the user already has a city configured).

## User Story

**As a** Citizen with an existing account,\
**I want** to enter my email and password to log in,\
**In order to** access my reports, profile, and gamification data.

## Acceptance Criteria

### Scenario · Successful login

**Given** the user entered a valid email and correct password\
**When** the user taps "Entrar"\
**Then** the button shows a loading spinner and becomes disabled\
**And** the app sends `POST /api/v1/auth/login` with `{ email, password }`\
**And** on success, the auth token is stored in SecureStore\
**And** the user is navigated to City Select (first login) or Home (returning user with city set)

### Scenario · Client-side validation — empty fields

**Given** the email or password field is empty\
**When** the user taps "Entrar"\
**Then** the empty field(s) show a red border (`rose-500`)\
**And** a helper text appears below: "Campo obrigatório"\
**And** no network request is made

### Scenario · Client-side validation — invalid email format

**Given** the email field contains text that is not a valid email\
**When** the user taps "Entrar"\
**Then** the email field shows a red border\
**And** a helper text appears: "E-mail inválido"\
**And** no network request is made

### Scenario · Server error — wrong credentials

**Given** the user entered an email that exists but the wrong password\
**When** the backend returns `401 Unauthorized`\
**Then** the loading spinner stops\
**And** a toast/snackbar appears: "E-mail ou senha incorretos"\
**And** the password field is cleared but the email remains\
**And** the password field receives focus

### Scenario · Server error — account not found

**Given** the user entered an email that doesn't exist\
**When** the backend returns `404 Not Found`\
**Then** a toast appears: "Conta não encontrada. Deseja criar uma?"\
**And** the toast includes a tappable "Criar agora" action that navigates to registration

### Scenario · Server error — too many attempts

**Given** the user failed login 5 times in a row\
**When** the backend returns `429 Too Many Requests`\
**Then** a toast appears: "Muitas tentativas. Tente novamente em X minutos."\
**And** the "Entrar" button is disabled until the cooldown expires\
**And** a countdown timer is visible on the button

### Scenario · Network error (offline)

**Given** the device has no internet connection\
**When** the user taps "Entrar"\
**Then** a toast appears: "Sem conexão. Verifique sua internet."\
**And** no request is queued (login cannot be offline)

### Scenario · Accessibility

**Given** screen reader is enabled\
**When** a validation error appears\
**Then** the screen reader announces the error message\
**And** focus moves to the first field with an error

## Frontend (React Native / Expo)

### State management

```typescript
interface LoginFormState {
  email: string;
  password: string;
  isLoading: boolean;
  errors: {
    email?: string;
    password?: string;
  };
  cooldownUntil?: number; // timestamp for rate-limit cooldown
}
```

### Validation rules

| Field    | Rule                                     | Message             |
| -------- | ---------------------------------------- | ------------------- |
| email    | Required                                 | "Campo obrigatório" |
| email    | Valid email format (RFC 5322 simplified) | "E-mail inválido"   |
| password | Required                                 | "Campo obrigatório" |

### Navigation on success

```
if (user.cityId) → navigate("HomeMap")
else             → navigate("CitySelect")
```

## Backend (FastAPI)

### Endpoint

```
POST /api/v1/auth/login
```

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Success response (200):**

```json
{
  "accessToken": "jwt...",
  "refreshToken": "jwt...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "Maria",
    "cityId": "uuid | null",
    "role": "citizen"
  }
}
```

**Error responses:**

| Status | Code                  | When                       |
| ------ | --------------------- | -------------------------- |
| 401    | `invalid_credentials` | Wrong email/password combo |
| 404    | `account_not_found`   | Email not registered       |
| 429    | `rate_limited`        | Too many failed attempts   |
| 422    | `validation_error`    | Malformed request body     |

### Rate limiting

- 5 failed attempts per email per 15-minute window.
- Uses Redis counter keyed by `login_attempts:{email_hash}`.
- Returns `Retry-After` header with seconds remaining.

## Database

Uses the `users` table defined in `00-foundation/06-auth-system.md`. No new migrations needed for
this task.

## Edge Cases

- **Email with leading/trailing whitespace:** trim before validation and submission.
- **Email case sensitivity:** normalize to lowercase before sending to backend.
- **Password manager autofill:** works naturally with `textContentType="password"`.
- **Biometric prompt interrupts login:** ignore — biometric login is a future iteration.
- **App goes to background during login request:** on return, if the request succeeded, navigate
  normally; if it failed or timed out, show the error.

## Privacy / LGPD

- Password is never logged, never stored in plaintext, never sent in query parameters.
- Failed login attempts are logged server-side with hashed email only (no password, no plaintext
  email in logs).
- The `404 account_not_found` response is a product decision for better UX. If this is considered an
  information leak risk in a future security review, collapse 401 and 404 into a generic "E-mail ou
  senha incorretos" message.

## Analytics

| Event                    | When                          | Props                                   |
| ------------------------ | ----------------------------- | --------------------------------------- |
| `login.submitted`        | "Entrar" tapped               | `method: "email"`                       |
| `login.success`          | Auth succeeded                | `method: "email"`, `is_returning: bool` |
| `login.failed`           | Auth failed                   | `method: "email"`, `error_code`         |
| `login.rate_limited`     | 429 received                  | `retry_after_seconds`                   |
| `login.validation_error` | Client-side validation failed | `fields: string[]`                      |

## Tests

- **Unit**: client-side validation catches empty fields and invalid email; loading state disables
  button and shows spinner; successful login stores token and navigates; 401/404/429 errors show
  correct messages; network error shows offline toast; cooldown timer counts down and re-enables
  button.
- **Integration**: mock API — full login flow from form fill to navigation.
- **E2E**: login with test credentials → arrives at City Select.

## Definition of Done

- [ ] Client-side validation (empty fields, invalid email)
- [ ] Loading state on submit (spinner, disabled button)
- [ ] Successful login stores token in SecureStore
- [ ] Navigation to City Select or Home based on user state
- [ ] Error handling for 401, 404, 429, network errors
- [ ] Rate limit cooldown UI
- [ ] Error fields accessible to screen reader
- [ ] Unit tests
- [ ] Integration tests with mocked API
- [ ] Code review approved

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Security: `docs/engineering/security-baseline.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- Expo SecureStore: https://docs.expo.dev/versions/latest/sdk/securestore/
- React Native Toast: project toast component (see component inventory)

### Project context

- Prototype: `design/index.html` (search `title: 'Login'`)
- Auth system: `00-foundation/06-auth-system.md`
- API client: `00-foundation/05-api-client.md`
- `CLAUDE.md`

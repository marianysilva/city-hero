# Login · Create Account Flow

> **Type:** Screen feature · Integration\
> **Screen:** SCREEN 01a · Login\
> **Effort:** M (1–3 days)\
> **Dependencies:** `01a-login/01-render-login-ui.md`, `00-foundation/06-auth-system.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `backend`, `frontend`, `screen`, `auth`, `lgpd`

## Context

When the user taps "Criar agora," a new screen (or multi-step bottom sheet) collects the minimum
information to create an account: display name, email, password, and LGPD consent. On success, the
user is automatically logged in and navigated to City Select.

The registration flow is intentionally minimal — no phone verification, no address, no ID. The goal
is zero-friction onboarding. Additional profile data is collected later in the onboarding flow and
in the citizen profile screen.

## User Story

**As a** new Citizen without an account,\
**I want** to create an account with my name, email, and a password,\
**In order to** start reporting problems in my city.

## Acceptance Criteria

### Scenario · Open create account screen

**Given** the user is on the Login screen\
**When** the user taps "Criar agora"\
**Then** a new screen slides in with:\
— back button (←)\
— heading "Criar conta"\
— subtitle "Leva menos de 1 minuto"\
— "Nome" input (display name)\
— "E-mail" input\
— "Senha" input with visibility toggle\
— "Confirmar senha" input with visibility toggle\
— LGPD consent checkbox: "Li e aceito a Política de Privacidade"\
— "Criar minha conta" primary button

### Scenario · Successful registration

**Given** the user filled all fields correctly and checked the consent box\
**When** the user taps "Criar minha conta"\
**Then** the button shows a loading spinner\
**And** the app sends `POST /api/v1/auth/register` with `{ displayName, email, password }`\
**And** on success (201), the auth token is stored in SecureStore\
**And** the user is navigated to City Select

### Scenario · Client-side validation

**Given** the user taps "Criar minha conta"\
**When** any of the following is true:\
— "Nome" is empty → "Campo obrigatório"\
— "Nome" is less than 2 characters → "Mínimo de 2 caracteres"\
— "E-mail" is empty → "Campo obrigatório"\
— "E-mail" is invalid → "E-mail inválido"\
— "Senha" is empty → "Campo obrigatório"\
— "Senha" is less than 8 characters → "Mínimo de 8 caracteres"\
— "Senha" has no letter → "Deve conter pelo menos uma letra"\
— "Senha" has no number → "Deve conter pelo menos um número"\
— "Confirmar senha" doesn't match "Senha" → "As senhas não coincidem"\
— LGPD checkbox is unchecked → "Aceite a Política de Privacidade para continuar"\
**Then** the first invalid field shows a red border with the helper text\
**And** no request is made

### Scenario · Password strength indicator

**Given** the user is typing in the "Senha" field\
**When** the password length and complexity change\
**Then** a strength indicator appears below the field:\
— < 8 chars or missing letter/number → red bar, "Fraca"\
— 8+ chars with letter + number → yellow bar, "Média"\
— 10+ chars with letter + number + special char → green bar, "Forte"

### Scenario · Server error — email already exists

**Given** the user entered an email that is already registered\
**When** the backend returns `409 Conflict`\
**Then** a toast appears: "Esse e-mail já está cadastrado. Deseja fazer login?"\
**And** the toast includes a tappable "Fazer login" action that navigates back to Login with the
email pre-filled

### Scenario · LGPD consent link

**Given** the consent checkbox is visible\
**When** the user taps "Política de Privacidade" (underlined)\
**Then** the full privacy policy opens in an in-app browser (WebView)\
**And** the user can return to the registration form without losing their input

### Scenario · Network error

**Given** the device has no internet\
**When** the user taps "Criar minha conta"\
**Then** a toast appears: "Sem conexão. Verifique sua internet."

## Frontend (React Native / Expo)

### Component location

```
apps/city-hero/src/screens/CreateAccount/
├── CreateAccountScreen.tsx
├── CreateAccountScreen.styles.ts
├── CreateAccountScreen.test.tsx
└── components/
    ├── RegistrationForm.tsx        ← all fields + validation
    ├── PasswordStrengthBar.tsx     ← visual strength indicator
    └── LgpdConsentCheckbox.tsx     ← checkbox + policy link
```

### State management

```typescript
interface RegistrationFormState {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  lgpdConsent: boolean;
  isLoading: boolean;
  errors: {
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    lgpdConsent?: string;
  };
}
```

### Navigation

- Registered as a stack screen within the onboarding navigator.
- On success: navigates to City Select and removes Create Account and Login from the back stack.
- On "Fazer login" (from 409 conflict): navigates back to Login with email param.

## Backend (FastAPI)

### Endpoint

```
POST /api/v1/auth/register
```

**Request body:**

```json
{
  "displayName": "Maria Silva",
  "email": "maria@example.com",
  "password": "securepassword1"
}
```

**Success response (201):**

```json
{
  "accessToken": "jwt...",
  "refreshToken": "jwt...",
  "user": {
    "id": "uuid",
    "email": "maria@example.com",
    "displayName": "Maria Silva",
    "cityId": null,
    "role": "citizen"
  }
}
```

**Error responses:**

| Status | Code               | When                       |
| ------ | ------------------ | -------------------------- |
| 409    | `email_exists`     | Email already registered   |
| 422    | `validation_error` | Malformed or weak password |

### Password hashing

- bcrypt with cost factor 12 (aligns with `00-foundation/06-auth-system.md`).

### Email verification (future)

- For MVP, email verification is **not** required to use the app. A `verified_at` column exists
  (nullable) for future use.
- A verification email can be sent asynchronously after registration (non-blocking).

## Database

Uses the `users` table from `00-foundation/06-auth-system.md`. Registration inserts a new row with
`auth_provider = 'email'`. No additional migration beyond what's already defined in the auth system
task.

## Edge Cases

- **Display name with special characters:** allow Unicode (accents, etc.), strip leading/trailing
  whitespace, collapse internal multiple spaces to one.
- **Display name with emojis:** allowed (citizens can be expressive).
- **User navigates back mid-registration:** form state is lost (acceptable for MVP).
- **Duplicate submission (double-tap):** debounce the submit button; the loading state also disables
  it.
- **Very slow network:** timeout after 15s with "Algo deu errado. Tente novamente."

## Privacy / LGPD

- **Explicit consent is mandatory.** The checkbox must be checked before registration proceeds. The
  consent timestamp is stored in the `users` table (`lgpd_consent_at TIMESTAMPTZ`).
- Password is hashed before storage, never logged.
- The privacy policy link must be functional and point to the current version.
- Right to deletion: the user can request account deletion from the citizen profile screen (task
  `28-citizen-profile/06-settings-and-logout.md`).

## Analytics

| Event                       | When                          | Props                       |
| --------------------------- | ----------------------------- | --------------------------- |
| `register.screen_viewed`    | On mount                      | `source` (login, deep_link) |
| `register.submitted`        | "Criar minha conta" tapped    | —                           |
| `register.success`          | Registration succeeded        | —                           |
| `register.failed`           | Registration failed           | `error_code`                |
| `register.email_conflict`   | 409 received                  | —                           |
| `register.validation_error` | Client-side validation failed | `fields: string[]`          |
| `register.policy_opened`    | Privacy policy link tapped    | —                           |

## Tests

- **Unit**: all fields render; client-side validation for every rule; password strength indicator
  shows correct level; consent checkbox blocks submit when unchecked; loading state; 409 shows
  conflict toast with action; policy link opens WebView.
- **Integration**: mock API — full registration flow from form fill to navigation.
- **Backend unit**: successful registration inserts user; password is hashed; duplicate email
  returns 409; weak password returns 422; `lgpd_consent_at` is set.
- **E2E**: register with new credentials → arrives at City Select.

## Definition of Done

- [ ] Create Account screen implemented matching prototype style
- [ ] All form fields with correct types, placeholders, and labels
- [ ] Client-side validation for all rules
- [ ] Password strength indicator
- [ ] LGPD consent checkbox with functional policy link
- [ ] Loading state on submit
- [ ] Successful registration stores token and navigates to City Select
- [ ] 409 conflict handling with "Fazer login" action
- [ ] Backend endpoint with bcrypt hashing
- [ ] `lgpd_consent_at` persisted on registration
- [ ] Accessibility: labels, focus management, error announcements
- [ ] Unit tests (frontend + backend)
- [ ] Integration tests
- [ ] Code review approved

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Security: `docs/engineering/security-baseline.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- Expo WebBrowser: https://docs.expo.dev/versions/latest/sdk/webbrowser/
- Expo SecureStore: https://docs.expo.dev/versions/latest/sdk/securestore/

### Project context

- Auth system: `00-foundation/06-auth-system.md`
- Citizen profile settings: `tasks/28-citizen-profile/06-settings-and-logout.md`
- `CLAUDE.md`

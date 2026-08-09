# Login · Forgot Password Flow

> **Type:** Screen feature · Integration\
> **Screen:** SCREEN 01a · Login\
> **Effort:** S (≤1 day)\
> **Dependencies:** `01a-login/01-render-login-ui.md`, `00-foundation/05-api-client.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `backend`, `frontend`, `screen`, `auth`

## Context

When the user taps "Esqueci minha senha," a bottom sheet collects their email and triggers a
password reset email. The actual reset happens via a link in the email (web-based), not inside the
app. The app's responsibility ends at sending the request and confirming it was sent.

## User Story

**As a** Citizen who forgot my password,\
**I want** to request a reset link via email,\
**In order to** regain access to my account.

## Acceptance Criteria

### Scenario · Open forgot password sheet

**Given** the user is on the Login screen\
**When** the user taps "Esqueci minha senha"\
**Then** a bottom sheet slides up with:\
— heading "Recuperar senha"\
— subtitle "Informe seu e-mail e enviaremos um link para redefinir sua senha."\
— email input (pre-filled if the user already typed an email on the Login form)\
— "Enviar link" button\
— "Cancelar" text button

### Scenario · Successful request

**Given** the user entered a valid email\
**When** the user taps "Enviar link"\
**Then** the button shows a loading spinner\
**And** the app sends `POST /api/v1/auth/forgot-password` with `{ email }`\
**And** on success, the bottom sheet content changes to a confirmation state:\
— ✅ icon\
— "Link enviado!"\
— "Verifique sua caixa de entrada e spam."\
— "Fechar" button that dismisses the sheet

### Scenario · Email not found (silent success)

**Given** the user entered an email that doesn't exist\
**When** the backend receives the request\
**Then** the backend returns `200 OK` (same as success — to prevent email enumeration)\
**And** the app shows the same confirmation state\
**And** no email is actually sent

### Scenario · Client-side validation

**Given** the email field is empty or invalid\
**When** the user taps "Enviar link"\
**Then** the email field shows a red border with helper text\
**And** no request is made

### Scenario · Rate limiting

**Given** the user already requested a reset within the last 60 seconds\
**When** the backend returns `429 Too Many Requests`\
**Then** a toast appears: "Aguarde X segundos antes de tentar novamente."

### Scenario · Cancel

**Given** the bottom sheet is open\
**When** the user taps "Cancelar" or swipes the sheet down\
**Then** the sheet dismisses and the Login screen is restored

## Frontend (React Native / Expo)

### Component location

```
apps/city-hero/src/screens/Login/components/
└── ForgotPasswordSheet.tsx   ← bottom sheet with form + confirmation states
```

### Component behavior

- Two internal states: `form` (default) and `confirmation`.
- Email is pre-filled from the Login form's email state (passed as prop).
- On successful request, transitions to `confirmation` state with animation.
- On dismiss, resets internal state to `form`.

## Backend (FastAPI)

### Endpoint

```
POST /api/v1/auth/forgot-password
```

**Request body:**

```json
{
  "email": "user@example.com"
}
```

**Response (always 200):**

```json
{
  "message": "If an account exists, a reset link has been sent."
}
```

### Email

- Uses the project's transactional email service.
- Reset token: random 64-char hex, hashed (SHA-256) before storage, expires in 1 hour.
- Reset link: `https://{domain}/reset-password?token={token}`
- The web-based reset page is out of scope for this task (backend-only concern).

### Rate limiting

- 1 request per email per 60 seconds.
- Uses Redis counter keyed by `reset_attempts:{email_hash}`.

## Database

### Schema

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reset_tokens_hash ON password_reset_tokens(token_hash);
```

Alembic migration required.

## Edge Cases

- **Social-only account requests reset:** backend returns 200 (silent), but no email is sent. The
  user doesn't have a password to reset. A future improvement could send a "you signed up with
  Google" email.
- **Multiple reset requests:** each new request invalidates previous tokens for that user.
- **Email delivery delay:** the confirmation UI says "Verifique sua caixa de entrada e spam" to set
  expectations.

## Privacy / LGPD

- The endpoint never reveals whether an email exists (always returns 200).
- Reset tokens are hashed before storage.
- Expired/used tokens are soft-deleted (kept for audit trail for 90 days, then purged).

## Analytics

| Event                 | When                 | Props             |
| --------------------- | -------------------- | ----------------- |
| `forgot.sheet_opened` | Sheet opens          | `email_prefilled` |
| `forgot.submitted`    | "Enviar link" tapped | —                 |
| `forgot.success`      | Confirmation shown   | —                 |
| `forgot.rate_limited` | 429 received         | —                 |
| `forgot.cancelled`    | Sheet dismissed      | —                 |

## Tests

- **Unit**: sheet opens on tap; email pre-fill works; client-side validation; loading state; success
  transitions to confirmation; cancel dismisses sheet; rate limit shows toast.
- **Integration**: mock API — full forgot password flow from sheet open to confirmation.
- **Backend unit**: endpoint always returns 200; token is hashed; email sent only for existing
  accounts; rate limiting enforced; previous tokens invalidated.

## Definition of Done

- [ ] Bottom sheet with email input and confirmation states
- [ ] Email pre-fill from Login form
- [ ] Client-side validation
- [ ] Loading state on submit
- [ ] Confirmation state with dismiss
- [ ] Backend endpoint (always 200, hashed tokens)
- [ ] Rate limiting (1/min per email)
- [ ] Alembic migration for `password_reset_tokens` table
- [ ] Accessibility: sheet announced, form labels, focus management
- [ ] Unit tests (frontend + backend)
- [ ] Code review approved

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Security: `docs/engineering/security-baseline.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- React Native Bottom Sheet: https://github.com/gorhom/react-native-bottom-sheet

### Project context

- Auth system: `00-foundation/06-auth-system.md`
- API client: `00-foundation/05-api-client.md`
- `CLAUDE.md`

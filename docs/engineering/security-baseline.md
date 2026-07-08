# Security Baseline

Minimum security expectations across CityHero. These are non-negotiable —
deviation requires explicit security review and an ADR.

## Secrets and credentials

- **Never** commit secrets to git. Use `.env` files (gitignored) and a secret manager in production (AWS Secrets Manager, Doppler, or similar).
- API keys, tokens, passwords, encryption keys: rotate periodically (90 days minimum).
- Pre-commit hook scans for accidentally staged secrets (e.g., `gitleaks`).
- CI fails the build if it detects secrets in the diff.
- Local development secrets are randomized; example values in `.env.example`.

## Authentication

- Passwords hashed with **bcrypt** (cost factor ≥12). Never SHA, never MD5.
- JWT access tokens are short-lived (≤60 min). Refresh tokens are long-lived (≤30 days) and **rotated on every use** (single-use refresh).
- Refresh token theft detection: if an old token is used after rotation, revoke the entire family and force logout.
- Sensitive operations (account deletion, password reset) require recent re-auth or email confirmation.

## Authorization

- **Role-based access control (RBAC)** with at least: `citizen`, `field_team`, `dispatcher`, `secretary`, `mayor`, `admin`.
- Authorization checks on **every endpoint**, even read endpoints. No "this is just a GET, who cares".
- Multi-tenant scoping: every query filters by `city_id` derived from the authenticated user. The frontend's `X-City-Id` header is for telemetry/routing only — it must match the JWT's `city_id` claim.
- "Forbidden" returns **404** rather than **403** when leakage of resource existence is a concern.

## Input validation

- All API inputs validated with **Pydantic** at the boundary. Never trust the client.
- Whitelisting over blacklisting: define allowed values explicitly.
- File uploads: validate MIME type by content (not just extension), enforce max size, scan for malware in production.
- Geographic coordinates: validate ranges (lat ∈ [-90,90], lng ∈ [-180,180]) and that they fall within the city's bounding box.

## Output encoding

- HTML output (web admin): React/Next escape by default. Avoid `dangerouslySetInnerHTML`. If unavoidable, sanitize with **DOMPurify**.
- JSON: encoded by FastAPI; never manually concatenate.
- SQL: parameterized queries only (SQLAlchemy ORM or core). **No string concatenation.**

## Common attack defenses

### SQL injection

Parameterized queries only. Static analysis (SQLAlchemy with `text()`) flagged in code review.

### XSS

React/Next escape; no innerHTML. CSP headers in production.

### CSRF

Web admin uses HttpOnly + SameSite=strict cookies. CSRF tokens for state-changing requests if cookies are used. Mobile uses Bearer tokens which are not cookie-based, so CSRF is not a concern there.

### Path traversal

Validate file paths server-side; never use user-supplied paths directly. Storage paths use UUIDs, not user-controlled names.

### SSRF

External URLs accepted by the backend (e.g., legacy webhook URLs configured by admins) are validated against an allowlist of domains. Block private IP ranges by default.

### IDOR

Every resource access checks that the authenticated user has permission for the specific instance, not just the resource type.

### Rate limiting

- Per-IP and per-user rate limits on auth endpoints (signup, login, refresh).
- Per-user rate limits on resource-creating endpoints (reports, comments, supports).
- Returns **429** with `Retry-After` header.

## Transport

- **HTTPS only** in production. Strict-Transport-Security header.
- Mobile: certificate pinning for the API host (in production builds).
- Database connections use TLS in production.

## Logging and audit

- Sensitive actions (login, logout, password reset, account deletion, role changes, ticket dispatch) are logged to an immutable audit table with: actor, action, target, timestamp, IP, user agent.
- PII is **never** logged in application logs. See `observability.md` for redaction rules.

## LGPD / GDPR compliance

CityHero is subject to **LGPD** (Lei nº 13.709/2018). Key obligations:

- **Lawful basis**: explicit consent collected at signup; documented.
- **Right of access**: users can request a JSON export of their data at any time.
- **Right of erasure**: users can request account deletion. We anonymize PII fields and detach reports (which stay for the city's record).
- **Right of portability**: data export must be machine-readable (JSON + photos).
- **Data minimization**: only collect what we use. CPF only required for Gov.br SSO users.
- **Retention**: define retention per data type. Default: 5 years for audit logs; 90 days for raw photos pre-anonymization; indefinite for anonymized photos and aggregated metrics.

### Photo anonymization

**Mandatory**: every photo uploaded by a citizen passes through the AI anonymization pipeline (face blur, license plate blur, other sensitive content blur) **before** becoming visible in the Civic Feed. Bypassing this step is a legal violation.

The original (pre-anonymization) photo is stored in a private bucket for 90 days for audit, then auto-deleted. Only anonymized versions persist long-term.

## Dependencies

- Run **dependabot** (or equivalent) on the repo. Auto-PR for security patches.
- `npm audit` and `pip-audit` run on CI. Critical vulns fail the build.
- New dependencies require a brief review: license, maintenance status, alternative options.

## Penetration testing

- Annual pentest on the production environment.
- Bug bounty program (eventually, post-MVP).

## Incident response

When a breach is detected or suspected:

1. **Contain** — revoke compromised credentials, rotate secrets.
2. **Investigate** — preserve logs, identify scope.
3. **Notify** — LGPD requires notifying the ANPD (Autoridade Nacional de Proteção de Dados) and affected users in reasonable time.
4. **Remediate** — patch the vulnerability, apply defense-in-depth.
5. **Postmortem** — blameless retro; share lessons.

## OWASP top 10 (2021) coverage

We explicitly defend against:

| Risk                          | Defense                                           |
| ----------------------------- | ------------------------------------------------- |
| A01 Broken Access Control     | RBAC + per-resource checks + multi-tenant scoping |
| A02 Cryptographic Failures    | TLS, bcrypt, secrets manager                      |
| A03 Injection                 | Parameterized queries, input validation           |
| A04 Insecure Design           | Threat modeling for new features                  |
| A05 Security Misconfiguration | Hardened Docker images, CIS benchmarks            |
| A06 Vulnerable Components     | Dependabot, npm/pip audit                         |
| A07 Authentication Failures   | Strong hashing, rate limit, MFA (admins)          |
| A08 Software/Data Integrity   | Signed releases, image scanning                   |
| A09 Logging Failures          | Structured logs, audit trail                      |
| A10 SSRF                      | Allowlist, block private ranges                   |

## References

- LGPD: https://www.gov.br/anpd/
- OWASP top 10: https://owasp.org/www-project-top-ten/
- OWASP cheat sheets: https://cheatsheetseries.owasp.org/
- CIS Benchmarks: https://www.cisecurity.org/cis-benchmarks

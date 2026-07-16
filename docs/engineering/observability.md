# Observability

How we know what's happening in production: logs, traces, errors.

> **Scope note:** this is deliberately a **small** observability layer for a 1-city MVP built and
> run by a solo developer — no OpenTelemetry, no distributed tracing backend, no Grafana/Datadog/
> New Relic APM. That tooling is real overhead (dashboards, alert routing, an extra service to
> operate) that only pays for itself once the project serves multiple cities and a team bigger than
> one person is on call. The concrete implementation is `00-foundation/20-observability-package.md`;
> the reasoning and the upgrade path for when it's time to add OTel/Grafana back in are in
> `observability-package-research.md`. This document describes what's actually built (or being
> built), not an aspirational full stack.

## Three pillars (MVP scope)

| Pillar | What it answers                                    | Tool                                                                                                   |
| ------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Logs   | What happened?                                     | Structured JSON logs → stdout (`structlog` on the backend, a console/pino-backed logger on mobile/web) |
| Traces | Which log lines/errors belong to the same request? | A custom `X-Trace-Id` header (UUIDv7), not OpenTelemetry — see "Distributed tracing" below             |
| Errors | What broke and where?                              | Sentry (backend, mobile, web)                                                                          |

Metrics (RED/USE, Prometheus-style dashboards) are explicitly **out of scope for the MVP** — see the
"Metrics" section below.

## Structured logging

### Format

All logs are **structured JSON** with at least these fields:

| Field         | Description                                                     |
| ------------- | --------------------------------------------------------------- |
| `timestamp`   | ISO 8601 UTC                                                    |
| `level`       | `debug` / `info` / `warning` / `error` / `critical`             |
| `service`     | `cityhero-backend` / `cityhero-mobile` / etc.                   |
| `version`     | Semantic version + build number                                 |
| `trace_id`    | The request's `X-Trace-Id` (UUIDv7) — see "Distributed tracing" |
| `user_id`     | Authenticated user UUID (never email or CPF)                    |
| `city_id`     | Tenant scope                                                    |
| `message`     | Human-readable summary                                          |
| `event`       | Machine-readable event name (e.g., `report.created`)            |
| Custom fields | Domain-specific (`report_id`, `duration_ms`, etc.)              |

### Log levels

- **debug**: Detailed diagnostic info. Off in production.
- **info**: Normal events worth recording (request received, job completed).
- **warning**: Unexpected but recoverable (retried request, deprecated API used).
- **error**: Exceptions that disrupt one user's request.
- **critical**: Failures that affect multiple users or the whole system.

### What NOT to log

- Passwords, tokens, refresh tokens (always)
- Email, CPF, phone numbers (PII)
- Full request bodies if they may contain PII
- Photo binary data

Use a **PII redactor** that scrubs known-sensitive keys before serialization. Same redactor used by
Sentry (see `00-foundation/15-error-boundary.md` and `00-foundation/20-observability-package.md`).

### Sampling

- All `error` and `critical` logs: 100%.
- `info`: 100% in dev, 100% in prod for production traffic, sampled at 10% if log volume is
  excessive.
- `debug`: never in prod.

## Metrics

**Out of scope for the MVP** (no Prometheus, no RED/USE dashboards, no operational metrics backend)
— the same call as OpenTelemetry, and for the same reason: it's infrastructure a solo developer
would have to build and stare at, with no team to divide the load. Sentry's own error-rate and
performance-transaction views cover the "is something badly wrong" signal for now.

**Business metrics** (reports created per day per city, photos anonymized per day, average
time-to-resolution, DAU/MAU, NPS responses per day) are a different thing entirely — those are
analytical questions answered by the dbt/Superset stack in `analytics/`, not by an operational
metrics backend. See `features.md` § 4.

When the project outgrows this (multiple cities, a team, or a specific incident pattern that
justifies the cost), see `observability-package-research.md` for the planned upgrade path
(OpenTelemetry + Grafana Cloud, RED/USE dashboards, metric naming conventions).

## Distributed tracing

Deliberately **not OpenTelemetry** — a plain correlation ID, per the observability package spec:

- All HTTP requests get a `trace_id` (UUIDv7) generated client-side (mobile/web) and attached as an
  `X-Trace-Id` header.
- The backend middleware reads that header (or generates one if absent), stores it in a
  `ContextVar`, and binds it to every log line and Sentry event for that request.
- The response echoes the trace ID back so client-side logs can be correlated too.
- No W3C `traceparent`, no spans, no OTel SDK — just a shared ID threaded through logs and Sentry on
  both sides of the request.

## Errors

See the dedicated foundation tasks `15-error-boundary.md` (React/React Native error boundaries +
crash reporting) and `20-observability-package.md` (the shared Sentry/logging package both consume)
for setup. Key principles:

- All exceptions reach Sentry; nothing fails silently.
- PII is scrubbed via the observability package's shared scrubber (`before_send` hook / log
  processor).
- Source maps uploaded per release.
- No PagerDuty/on-call rotation for the MVP (solo project) — Sentry's own email/Slack alerting on
  new issues and error-rate spikes is the notification path; escalate to a real on-call setup only
  once there's a team to escalate to.

## Health checks

- Backend exposes `GET /health` (liveness) and `GET /ready` (readiness, checks DB + Redis).
- AI service exposes `GET /health` (also returns model load status).
- Web exposes `GET /api/health` for uptime monitors.
- Used by Docker Compose, Kubernetes, and external uptime checks (Better Uptime, Pingdom).

## Synthetic monitoring

- Uptime checks every 60s on key endpoints from external probes (Better Uptime).
- Smoke E2E flow runs against production every 15 minutes from a CI cron — Playwright headless for
  `apps/web`, Maestro for `apps/city-hero` (see `docs/engineering/testing-strategy.md` § E2E for why
  Maestro, not Detox, is the mobile choice here).

## Mobile-specific observability

- **Cold start time**, **screen render time**, **interaction-to-next-paint**: collected via Sentry
  Performance + custom metrics.
- **Crash-free session rate** target: ≥99.5%.
- **ANR rate** (Android) target: <0.5%.

## Dashboards

No Grafana/Datadog dashboard for the MVP (see "Metrics" above). Sentry's built-in issue list and
performance views are the only dashboard for now — top exceptions and slow transactions are visible
there without standing up anything extra.

## Alerting

Alerts must be **actionable**. Rules:

- An alert that fires regularly without being looked at gets deleted.
- Severity is binary for a solo project: **notify** (Sentry → email/Slack, for anything worth
  looking at within a day) vs. **ignore** (not worth an alert at all). There's no PagerDuty/on-call
  tier until there's a team to page.

Initial alert set (configured as Sentry alert rules, not a separate APM):

- New issue type seen for the first time — `notify`
- Error rate for an issue spikes sharply vs. its own baseline — `notify`
- Mobile crash-free rate < 99% over 1 hour (Sentry Crash Free Sessions) — `notify`

## Privacy considerations

PII redaction in logs (see above) is **mandatory**. Logs may be retained for 30-90 days; ensure
that's compatible with retention obligations under LGPD.

Sentry data retention: 30 days (errors), 7 days (performance traces).

## References

- Sentry: https://docs.sentry.io/
- structlog: https://www.structlog.org/
- Upgrade path (OpenTelemetry, Grafana Cloud, RED/USE) when this MVP scope stops being enough:
  `observability-package-research.md`

# Observability

How we know what's happening in production: logs, metrics, traces, errors.

## Three pillars

| Pillar    | What it answers                          | Tool                          |
|-----------|------------------------------------------|-------------------------------|
| Logs      | What happened?                           | Structured JSON logs → cloud aggregator (Datadog, CloudWatch, Loki) |
| Metrics   | How much / how often / how fast?         | Prometheus + Grafana, or APM SaaS (Datadog, New Relic) |
| Traces    | Where did the time go in this request?   | OpenTelemetry → Datadog/Tempo |
| Errors    | What broke and where?                    | Sentry                        |

## Structured logging

### Format

All logs are **structured JSON** with at least these fields:

| Field         | Description                                         |
|---------------|-----------------------------------------------------|
| `timestamp`   | ISO 8601 UTC                                        |
| `level`       | `debug` / `info` / `warning` / `error` / `critical` |
| `service`     | `cityhero-backend` / `cityhero-mobile` / etc.       |
| `version`     | Semantic version + build number                     |
| `trace_id`    | Distributed trace identifier                        |
| `span_id`     | Current span (when applicable)                      |
| `user_id`     | Authenticated user UUID (never email or CPF)        |
| `city_id`     | Tenant scope                                        |
| `message`     | Human-readable summary                              |
| `event`       | Machine-readable event name (e.g., `report.created`) |
| Custom fields | Domain-specific (`report_id`, `duration_ms`, etc.)  |

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

Use a **PII redactor** that scrubs known-sensitive keys before serialization. Same redactor used by Sentry (see `error-boundary.md` task).

### Sampling

- All `error` and `critical` logs: 100%.
- `info`: 100% in dev, 100% in prod for production traffic, sampled at 10% if log volume is excessive.
- `debug`: never in prod.

## Metrics

### RED method (request-level)

Track for every API endpoint:

- **Rate**: requests per second.
- **Errors**: percentage of 5xx (and 4xx for auth-related).
- **Duration**: P50, P95, P99 latency.

### USE method (resource-level)

Track for every resource (DB, Redis, queue):

- **Utilization**: CPU, memory, connections in use.
- **Saturation**: queue depth, waiting requests.
- **Errors**: connection failures, timeouts.

### Business metrics

- Reports created per day per city
- Photos anonymized per day
- Average time-to-resolution per category
- Active users (DAU / MAU)
- NPS responses per day

These feed the BI dashboards in Superset, separately from operational metrics.

### Naming

Metric names: lowercase, dot-separated, namespaced by service.

Examples:
- `backend.api.request.duration_ms`
- `backend.db.connection.utilization`
- `mobile.app.cold_start_ms`
- `business.report.created_count`

## Distributed tracing

- All HTTP requests get a `trace_id` (UUID v4) generated at the entry point.
- The `trace_id` is propagated through:
  - HTTP headers (`X-Trace-Id` to internal services, W3C `traceparent` to external)
  - Background jobs (passed in job payload)
  - Logs (added to every log line)
  - Error reports (attached to Sentry events)
- **OpenTelemetry** instrumentation in the backend; surfaced in Datadog or similar APM.

## Errors

See the dedicated foundation task `15-error-boundary.md` for setup. Key principles:

- All exceptions reach Sentry; nothing fails silently.
- PII is scrubbed.
- Source maps uploaded per release.
- On-call paged when error rate exceeds threshold (e.g., 1% over 5 min).

## Health checks

- Backend exposes `GET /health` (liveness) and `GET /ready` (readiness, checks DB + Redis).
- AI service exposes `GET /health` (also returns model load status).
- Web exposes `GET /api/health` for uptime monitors.
- Used by Docker Compose, Kubernetes, and external uptime checks (Better Uptime, Pingdom).

## Synthetic monitoring

- Uptime checks every 60s on key endpoints from external probes (Better Uptime).
- Smoke E2E flow runs against production every 15 minutes from a CI cron (Detox or Playwright headless).

## Mobile-specific observability

- **Cold start time**, **screen render time**, **interaction-to-next-paint**: collected via Sentry Performance + custom metrics.
- **Crash-free session rate** target: ≥99.5%.
- **ANR rate** (Android) target: <0.5%.

## Dashboards

Each service has at least one dashboard in Grafana (or Datadog, etc.) showing:

- Request rate + error rate + p95 latency (RED)
- Resource utilization (USE for the host/container)
- Top failing endpoints
- Top exceptions

## Alerting

Alerts must be **actionable**. Rules:

- An alert that fires regularly without being looked at gets deleted.
- Alerts include a runbook link.
- Severity levels: `info` (Slack), `warning` (Slack + email), `critical` (PagerDuty).

Initial alert set:

- API error rate > 1% over 5 minutes — `warning`
- API p95 latency > 1s over 5 minutes — `warning`
- DB connection pool saturated — `critical`
- Photo anonymization queue depth > 1000 — `critical`
- Mobile crash-free rate < 99% over 1 hour — `warning`

## Privacy considerations

PII redaction in logs (see above) is **mandatory**. Logs may be retained for 30-90 days; ensure that's compatible with retention obligations under LGPD.

Sentry data retention: 30 days (errors), 7 days (performance traces).

Aggregated metrics can be retained indefinitely (no PII).

## References

- OpenTelemetry: https://opentelemetry.io/
- Grafana: https://grafana.com/
- Datadog: https://docs.datadoghq.com/
- Sentry: https://docs.sentry.io/
- RED method: https://thenewstack.io/monitoring-microservices-red-method/
- USE method: https://www.brendangregg.com/usemethod.html

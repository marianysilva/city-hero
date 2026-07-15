# Observability Package Research (2025-2026)

Research basis for `packages/observability/` — a shared layer across `apps/backend` (FastAPI),
`apps/city-hero` (React Native + Expo), and `apps/web` (Next.js).

> **This is upgrade-path research, not the current MVP implementation.** The actually-built package
> (`00-foundation/20-observability-package.md`) is deliberately smaller than what's outlined below:
> Sentry + structured logs + a plain `X-Trace-Id` header, no OpenTelemetry, no Grafana. See
> `observability.md` for what's live today and why. This document stays as the plan for when the
> project outgrows that — multiple cities, a team instead of a solo developer, or a specific
> incident pattern that justifies the operational cost of running OTel + a metrics/traces backend.

## TL;DR

- **OpenTelemetry is the substrate**; Sentry is the error/replay UX. Use Sentry SDKs configured in
  OTel-compatible mode so spans, errors and logs share one trace ID end-to-end.
- **Per-target adapters under one package root.** Sub-paths `python/`, `react/`, `react-native/`
  exporting a uniform contract (`init`, `logger`, `withSpan`, `captureException`, `setUser`,
  `scrub`).
- **W3C `traceparent` + `baggage` everywhere.** Mobile/web inject on outbound `fetch`; FastAPI
  extracts via `opentelemetry-instrumentation-fastapi`. Sentry's `sentry-trace`/`baggage`
  interoperate when OTel mode is enabled.
- **Scrub PII at two layers**: SDK `beforeSend` (client) for fast-fail, and Collector `redaction`
  processor (server) for centralized LGPD policy (CPF, e-mail, full name, geolocation precision).
- **Start on Sentry SaaS + Grafana Cloud free tier**; reassess self-hosted LGTM only when
  traces/logs exceed Grafana's 50 GB free cap.

## Recommended stack

| Layer            | Telemetry      | Main library                                                       | Notes                                                          |
| ---------------- | -------------- | ------------------------------------------------------------------ | -------------------------------------------------------------- |
| `apps/backend`   | Logs           | `structlog` + stdlib `ProcessorFormatter`                          | Async-safe (contextvars); Uvicorn logs share the JSON renderer |
| `apps/backend`   | Traces/Metrics | `opentelemetry-api/-sdk` + `opentelemetry-instrumentation-fastapi` | Contrib 0.62b; stable in production                            |
| `apps/backend`   | Errors         | `sentry-sdk` ≥ 2.45 with `OTLPIntegration`                         | Sentry natively consumes OTel spans                            |
| `apps/web`       | Traces/Errors  | `@sentry/nextjs` ≥ 8.28 + `instrumentation.ts`                     | `onRequestError` covers RSC/Server Actions/middleware          |
| `apps/web`       | OTel server    | `@vercel/otel` or `NodeSDK` in `register()`                        | Coexists with Sentry in OTel mode                              |
| `apps/city-hero` | Errors/Replay  | `@sentry/react-native` ≥ 5.16 (Expo plugin)                        | `sentry-expo` is deprecated                                    |
| `apps/city-hero` | Traces         | Embrace RN OTel SDK or Honeycomb RN                                | `sdk-trace-web` breaks in RN                                   |
| Collector        | Pipeline       | OpenTelemetry Collector (`attributes` + `redaction` + `filter`)    | Centralized PII policy                                         |

## Package structure

```
packages/observability/
  README.md
  contract.md                      # shared contract between adapters
  src/
    common/
      semconv.ts                   # span, metric, and attribute names
      redaction-rules.ts           # CPF/e-mail/phone regex; allowlist
      trace-context.ts             # traceparent/baggage parsing
    python/                        # published as an installable Python pkg
      __init__.py                  # init(service, env, sample_rate)
      logger.py                    # structlog config + bound logger factory
      tracing.py                   # OTel setup, FastAPI middleware extras
      sentry.py                    # OTLPIntegration wiring
      redaction.py                 # structlog processors + OTel SpanProcessor
    react/                         # @city-hero/observability/react
      init.ts                      # singleton; idempotent
      logger.ts                    # console + Sentry breadcrumb adapter
      error-boundary.tsx           # ErrorBoundary with captureException
      use-span.ts                  # hook for manual spans
      fetch-instrumentation.ts     # traceparent injection
    react-native/                  # @city-hero/observability/react-native
      init.ts                      # Sentry Expo + OTel exporter
      logger.ts                    # same as react, with offline-safe breadcrumbs
      navigation.ts                # per-route spans (Expo Router)
      fetch-instrumentation.ts
```

Responsibilities: `common/` is the single source of truth for naming and PII; `python/` and
`react*/` are thin adapters that respect the same contract (`init`, `getLogger(name)`,
`withSpan(name, attrs, fn)`, `captureException(err, ctx)`, `setUser({id})` — never raw PII).

## Usage pattern

**FastAPI** — `init()` is called at app startup before any route; it installs the OTel middleware
(extracts `traceparent`), and mounts a `BoundLogger` per request with `request_id`, `trace_id`,
`city_id`, `user_id` (hashed) via contextvars. Unhandled exceptions become
`sentry_sdk.capture_exception` automatically; the `HTTPException` handler adds
`http.response.status_code` to the active span.

**Next.js** — `instrumentation.ts` calls `init` server-side in `register()` and exports
`onRequestError` to report RSC/Server Actions errors. Client: an `<ObservabilityProvider>` in the
root layout calls `init` once, mounts an `ErrorBoundary` that captures render errors with the
current trace ID and renders a friendly fallback. Outbound `fetch` is wrapped to inject
`traceparent` + `baggage` before calling the backend.

**React Native (Expo)** — `init` runs in `app/_layout.tsx` before any navigation. A global
`ErrorBoundary` protects the root. Expo Router emits screen-change events → `navigation.<screen>`
spans. The HTTP client injects `traceparent`; in offline mode, breadcrumbs queue locally and upload
with the report sync (keeping the trace ID from the moment of capture).

## Key trade-offs

- **Sentry + OTel vs. pure OTel (LGTM):** Sentry delivers grouping, replay, source maps, and crons
  out of the box; LGTM gives full MELT but requires operating Tempo/Loki/Mimir, dashboards, and
  alerting from scratch. For CityHero (1 city in the MVP), Sentry SaaS + Grafana Cloud free tier
  covers 90% at no SRE cost.
- **Single monorepo package vs. three separate packages:** one package with sub-paths reduces
  naming/redaction drift, but requires publishing artifacts to two ecosystems (PyPI + npm).
  Acceptable: npm carries `react/` and `react-native/`; PyPI carries `python/`. `common/` is
  duplicated at build time (a build script) — not shared at runtime.
- **structlog vs. loguru:** structlog wins on async/contextvars and has a more mature processor
  ecosystem (essential for the LGPD redaction pipeline). Loguru is more ergonomic but its
  global-state model gets in the way of multi-tenancy.
- **Immature OTel on RN:** accept Sentry-only for mobile traces until
  `@opentelemetry/sdk-trace-react-native` stabilizes; document this as tech debt.

## References

- [OpenTelemetry Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/general/naming/)
- [OTel HTTP Spans semconv](https://opentelemetry.io/docs/specs/semconv/http/http-spans/)
- [OTel Handling Sensitive Data](https://opentelemetry.io/docs/security/handling-sensitive-data/)
- [opentelemetry-instrumentation-fastapi](https://opentelemetry-python-contrib.readthedocs.io/en/latest/instrumentation/fastapi/fastapi.html)
- [Sentry Next.js Manual Setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup)
- [Sentry React Native](https://docs.sentry.io/platforms/react-native/)
- [Sentry OTel ingestion](https://blog.sentry.io/send-your-existing-opentelemetry-traces/)
- [Sentry SDK OTel spec](https://develop.sentry.dev/sdk/telemetry/traces/opentelemetry/)
- [Next.js instrumentation.ts](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)
- [W3C Trace Context Recommendation](https://www.w3.org/TR/trace-context/)
- [Grafana Cloud Free Tier](https://grafana.com/products/cloud/free-tier/)

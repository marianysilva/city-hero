# Observability Package Research (2025-2026)

Research basis for `packages/observability/` — a shared layer across `apps/backend` (FastAPI), `apps/city-hero` (React Native + Expo), and `apps/web` (Next.js).

## TL;DR

- **OpenTelemetry is the substrate**; Sentry is the error/replay UX. Use Sentry SDKs configured in OTel-compatible mode so spans, errors and logs share one trace ID end-to-end.
- **Per-target adapters under one package root.** Sub-paths `python/`, `react/`, `react-native/` exporting a uniform contract (`init`, `logger`, `withSpan`, `captureException`, `setUser`, `scrub`).
- **W3C `traceparent` + `baggage` everywhere.** Mobile/web inject on outbound `fetch`; FastAPI extracts via `opentelemetry-instrumentation-fastapi`. Sentry's `sentry-trace`/`baggage` interoperate when OTel mode is enabled.
- **Scrub PII at two layers**: SDK `beforeSend` (client) for fast-fail, and Collector `redaction` processor (server) for centralized LGPD policy (CPF, e-mail, full name, geolocation precision).
- **Start on Sentry SaaS + Grafana Cloud free tier**; reassess self-hosted LGTM only when traces/logs exceed Grafana's 50 GB free cap.

## Stack Recomendada

| Camada | Telemetria | Library principal | Notas |
| --- | --- | --- | --- |
| `apps/backend` | Logs | `structlog` + stdlib `ProcessorFormatter` | Async-safe (contextvars); Uvicorn logs partilham o JSON renderer |
| `apps/backend` | Traces/Metrics | `opentelemetry-api/-sdk` + `opentelemetry-instrumentation-fastapi` | Contrib 0.62b; estável em produção |
| `apps/backend` | Errors | `sentry-sdk` ≥ 2.45 com `OTLPIntegration` | Sentry consome spans OTel nativamente |
| `apps/web` | Traces/Errors | `@sentry/nextjs` ≥ 8.28 + `instrumentation.ts` | `onRequestError` cobre RSC/Server Actions/middleware |
| `apps/web` | OTel server | `@vercel/otel` ou `NodeSDK` no `register()` | Convive com Sentry no modo OTel |
| `apps/city-hero` | Errors/Replay | `@sentry/react-native` ≥ 5.16 (Expo plugin) | `sentry-expo` está deprecated |
| `apps/city-hero` | Traces | Embrace RN OTel SDK ou Honeycomb RN | `sdk-trace-web` quebra em RN |
| Coletor | Pipeline | OpenTelemetry Collector (`attributes` + `redaction` + `filter`) | Policy de PII centralizada |

## Estrutura do Package

```
packages/observability/
  README.md
  contract.md                      # contrato compartilhado entre adapters
  src/
    common/
      semconv.ts                   # nomes de spans, métricas, atributos
      redaction-rules.ts           # regex CPF/e-mail/telefone; allowlist
      trace-context.ts             # parsing de traceparent/baggage
    python/                        # publicado como pkg Python instalável
      __init__.py                  # init(service, env, sample_rate)
      logger.py                    # structlog config + bound logger factory
      tracing.py                   # OTel setup, FastAPI middleware extras
      sentry.py                    # OTLPIntegration wiring
      redaction.py                 # processors structlog + OTel SpanProcessor
    react/                         # @cityhero/observability/react
      init.ts                      # singleton; idempotente
      logger.ts                    # console + Sentry breadcrumb adapter
      error-boundary.tsx           # ErrorBoundary com captureException
      use-span.ts                  # hook para spans manuais
      fetch-instrumentation.ts     # injeção de traceparent
    react-native/                  # @cityhero/observability/react-native
      init.ts                      # Sentry Expo + OTel exporter
      logger.ts                    # idem react, com breadcrumb offline-safe
      navigation.ts                # spans por rota (Expo Router)
      fetch-instrumentation.ts
```

Responsabilidades: `common/` é a única fonte de verdade para naming e PII; `python/` e `react*/` são adapters finos que respeitam o mesmo contrato (`init`, `getLogger(name)`, `withSpan(name, attrs, fn)`, `captureException(err, ctx)`, `setUser({id})` — nunca PII bruta).

## Padrão de Uso

**FastAPI** — `init()` é chamado no startup do app antes de qualquer rota; instala o middleware OTel (extrai `traceparent`), monta um `BoundLogger` por request com `request_id`, `trace_id`, `city_id`, `user_id` (hash) via contextvars. Exceções não tratadas viram `sentry_sdk.capture_exception` automaticamente; o handler de `HTTPException` adiciona `http.response.status_code` ao span ativo.

**Next.js** — `instrumentation.ts` chama o `init` server-side em `register()` e exporta `onRequestError` para reportar erros de RSC/Server Actions. Cliente: `<ObservabilityProvider>` no root layout chama `init` uma vez, monta um `ErrorBoundary` que captura render errors com o trace ID atual e renderiza fallback amigável. Outbound `fetch` é envolto para injetar `traceparent` + `baggage` antes de chamar o backend.

**React Native (Expo)** — `init` roda em `app/_layout.tsx` antes de qualquer navegação. `ErrorBoundary` global protege o root. Expo Router emite eventos de mudança de tela → spans `navigation.<screen>`. O cliente HTTP injeta `traceparent`; em modo offline, breadcrumbs vão pra fila local e sobem com o report sync (mantendo o trace ID do momento da captura).

## Trade-offs Principais

- **Sentry + OTel vs OTel puro (LGTM):** Sentry entrega grouping, replay, source maps e crons prontos; LGTM dá MELT completo mas exige operar Tempo/Loki/Mimir, dashboards e alerting do zero. Para CityHero (1 cidade no MVP), Sentry SaaS + Grafana Cloud free cobre 90% sem custo de SRE.
- **Monorepo único vs três pacotes:** um pacote com sub-paths reduz drift de naming/redação, mas obriga publicar artefatos em dois ecossistemas (PyPI + npm). Aceitável: o npm carrega `react/` e `react-native/`; o PyPI carrega `python/`. `common/` é duplicado por geração (script de build) — não compartilhado em runtime.
- **structlog vs loguru:** structlog vence em async/contextvars e tem ecosystem mais maduro de processors (essencial para o pipeline de redação LGPD). Loguru é mais ergonômico mas seu modelo global atrapalha multi-tenant.
- **OTel RN imaturo:** aceitar Sentry-only para traces no mobile até `@opentelemetry/sdk-trace-react-native` estabilizar; documentar como dívida.

## Referências

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

// Placeholder until the shared observability package
// (00-foundation/20-observability-package.md) ships — see
// docs/engineering/observability.md. Shared by every screen that logs
// telemetry events (Splash, Login, ...) so the placeholder isn't
// copy-pasted per screen ahead of that package landing.
export function logTelemetryEvent(event: string, props?: Record<string, unknown>) {
  if (__DEV__) {
    console.info(`[telemetry] ${event}`, props);
  }
}

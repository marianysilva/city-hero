# SCREEN 01 · Splash / Welcome

> **Group:** 01 · Entry & Onboarding
> **Prototype screen:** `design/index.html` (search for `title: 'Splash / Boas-vindas'`)
> **Position in navigation:** First screen after cold start (see `design/navigation.html` § 02)

## Overview

Splash is more than a screen — it's the **cold-start orchestrator**. It decides
where the user goes (onboarding · choose city · home · forced update), runs
parallel checks (auth, version, deep link, connectivity), and enforces a minimum
display time to avoid visual flashing.

For that reason, it's broken into 5 distinct features — each one is an
independent task that can be implemented by different people/sessions.

## Features (5 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI · logo + branding + min duration](./01-render-splash-ui.md) | S | `00-foundation/02-design-tokens.md` |
| 02 | [App initialization sequence (auth + version + city + deep link)](./02-app-initialization.md) | M | `00-foundation/05-api-client.md`, `06-auth-system.md`, `12-deep-link-handler.md` |
| 03 | [Routing decision (first-time vs returning vs has-deeplink)](./03-routing-decision.md) | S | task 02 |
| 04 | [Force update flow (modal + app store link)](./04-force-update-flow.md) | S | task 02 |
| 05 | [Cold start offline (skip backend checks, use cache)](./05-cold-start-offline.md) | M | task 02, `00-foundation/09-offline-queue.md` |

## Suggested implementation order

```
01 (UI) ──┐
          ├─→ 02 (init) ──→ 03 (routing)
          │                   ├─→ 04 (force update)
          │                   └─→ 05 (cold start offline)
```

Tasks 01 (UI) and 02 (init) can run in parallel. 03–05 depend on 02 being ready.

## Product notes

- **Minimum splash duration:** 800ms — enough for the user to register the
  CityHero brand visually. Above 1.5s feels slow.
- **Graceful failover:** any check failure (auth, version, etc.) must let the
  user continue — never block on the splash.
- **Don't request permissions here** (camera, location, push) — that's
  onboarding's job. Splash is purely routing.

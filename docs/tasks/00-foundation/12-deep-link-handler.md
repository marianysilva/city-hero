# Deep Link Handler · URL schemes + universal links

> **Type:** Foundation · Navigation\
> **Screen(s):** Splash (01), and any screen reachable via shared link or push tap\
> **Effort:** M (1-2 days)\
> **Dependencies:** `00-foundation/01-monorepo-setup.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `web`, `navigation`, `foundation`

## Context

Deep links connect external entry points (push notification taps, shared WhatsApp links, email CTA
buttons) to specific app screens. The handler parses incoming URLs, validates them, and routes to
the right screen — only after the app has finished cold-start initialization.

Two URL forms are supported:

- **Custom scheme**: `cityhero://...` — works on app-installed devices.
- **Universal links / App Links**: `https://cityhero.app/...` — opens the app if installed, falls
  back to a web page that prompts to install.

## User Story

**As a** Citizen receiving a notification or a shared link,\
**I want** the link to open the right place inside the app immediately,\
**In order to** save taps and not get lost looking for what I need.

## Acceptance Criteria

### Scenario · Cold start with deep link

**Given** the app is force-quit and a shared link is tapped\
**When** the OS launches the app with the link\
**Then** the splash runs init normally\
**And** after init finishes, navigation goes straight to the link's target screen (skipping Home)\
**And** if the user is not authenticated and the target requires auth, the login screen is shown
first; after login, the original target is opened

### Scenario · Warm start with deep link

**Given** the app is in foreground or background\
**When** a deep link is received\
**Then** navigation resolves and pushes the target screen\
**And** existing screen state (e.g., a half-typed comment) is preserved or cleanly replaced based on
the link's intent

### Scenario · URL parsing

**Given** an incoming URL\
**When** the handler parses it\
**Then** it validates the host (for universal links) and the path\
**And** extracts parameters into a typed shape\
**And** rejects malformed URLs without crashing

### Scenario · Unknown route

**Given** a URL with a path that doesn't match any known route\
**When** the handler processes it\
**Then** the app navigates to Home and shows a non-blocking toast (pt-BR user-facing copy, the app's
default locale): "Link inválido" ("Invalid link")\
**And** logs the unknown path to telemetry for review

### Scenario · Authentication-gated targets

**Given** a deep link points to a screen that requires authentication\
**When** the handler resolves the link and the user is not logged in\
**Then** the user is sent to login first\
**And** after successful login, the original target is opened automatically

### Scenario · Cross-tenant link

**Given** a deep link points to a resource in a different city than the user's current tenant\
**When** the handler processes it\
**Then** the app prompts to switch cities (with a clear confirmation), or rejects the link with an
explanation if switching isn't supported

### Scenario · Universal link first-tap (web fallback)

**Given** the user does not have the app installed\
**When** they tap a universal link\
**Then** the link opens a web page that previews the resource and prompts to install the app\
**And** after install, the same link opens directly into the app

### Scenario · Share content from app

**Given** the user shares a report from the app\
**When** the share sheet opens\
**Then** the URL produced uses the universal-link form (so it works for both app and web
recipients)\
**And** the URL includes the resource's canonical ID and a tracking parameter for attribution

## Frontend (React Native + Web)

### Where the handler lives

> **Verified against current expo-router docs (SDK 56, 2026-07):** `apps/city-hero` uses
> **expo-router**, not manually-configured React Navigation. Expo Router builds its `linking` config
> automatically from the file-based routes under `app/` (e.g., a future `app/report/[id].tsx`
> already resolves `cityhero://report/123` and, once the universal-link host is verified,
> `https://cityhero.app/r/123` too) — there is no separate linking-config file to hand-write. The
> code below is scoped to the behavior expo-router does **not** give for free: validating/rejecting
> unknown paths, buffering the intent until cold-start init completes, and auth-gating.

```
apps/city-hero/src/services/deep-links/
├── parser.ts            ← raw URL → typed intent (validates host/path, extracts params)
├── router.ts            ← intent → navigation action (calls expo-router's `router.push`/`replace`)
└── pendingLink.ts        ← buffer the intent until init completes
```

On the web, Next.js handles the parallel routes natively; the universal-link fallback page is a thin
Next.js route under `https://cityhero.app/r/...` that renders the resource preview and the install
CTA.

### Behavior

- Listens for incoming URLs from both the cold-start launch (`Linking.getInitialURL()` /
  expo-router's initial route) and warm-start events (`Linking.addEventListener('url', ...)`).
- Parses to a typed intent (e.g., "open report ID abc", "open city profile", "open share preview").
- Buffers the intent until app init (`02-app-initialization`) signals readiness, then routes via
  expo-router's `router.push()`/`router.replace()`.
- Falls back to Home with a toast for unknown paths (a path with no matching file under `app/`).
- Resolves auth gating by stashing the intent and re-running it after login.

### Routes

| URL pattern                   | Intent                                     |
| ----------------------------- | ------------------------------------------ |
| `cityhero://report/{id}`      | Open report detail                         |
| `cityhero://obras/{id}`       | Open public-work detail                    |
| `cityhero://city/{slug}`      | Open city profile                          |
| `cityhero://share/{id}`       | Open share-preview screen                  |
| `cityhero://auth/callback`    | OAuth callback (Gov.br)                    |
| `https://cityhero.app/r/{id}` | Universal link → report (or fallback page) |
| `https://cityhero.app/o/{id}` | Universal link → obra                      |

### Configuration

- `app.json`'s `expo.scheme` declares the `cityhero://` custom scheme;
  `expo.experiments.typedRoutes: true` gives compile-time safety for known routes (an unknown path
  used with `router.push()` is a TS error).
- expo-router derives the actual URL↔screen mapping from the `app/` file tree — this task does not
  write a manual linking config. `parser.ts`/`router.ts` only handle the cases expo-router can't:
  malformed URLs, truly unknown paths (no matching file), auth gating, and cross-tenant prompts.

### Native setup

- iOS: Associated Domains (`ios.associatedDomains: ["applinks:cityhero.app"]` in `app.json`) +
  apple-app-site-association file served from the universal-link host.
- Android: Digital Asset Links + assetlinks.json file served from the universal-link host. Expo
  config plugins generate the Activity intent filters at build time from `app.json` — no manual
  manifest editing.

## Backend

The backend hosts the `apple-app-site-association` and `assetlinks.json` files for universal-link
verification, plus the fallback HTML pages that render when the app isn't installed.

| Endpoint                                      | Purpose                            |
| --------------------------------------------- | ---------------------------------- |
| `GET /.well-known/apple-app-site-association` | iOS universal links manifest       |
| `GET /.well-known/assetlinks.json`            | Android App Links manifest         |
| `GET /r/{id}`                                 | Web fallback for report links      |
| `GET /o/{id}`                                 | Web fallback for public-work links |

## Database

Not applicable directly. The links reference existing resources by ID.

## Edge Cases

- **Expired or deleted resource**: the resolver detects a 404 and routes to Home with a toast (pt-BR
  user-facing copy, same convention as the Unknown-route scenario above): "Esse conteúdo não está
  mais disponível" ("This content is no longer available").
- **Link with future-only feature**: the app version check during init detects unsupported features
  and prompts to update.
- **User has no city set yet**: the link prompts to choose a city first, then opens the target.
- **Race during cold start**: the handler buffers the intent until init signals ready; never
  navigates before splash completes.
- **Multiple links in quick succession**: the most recent intent wins; older ones are discarded.
- **Inside-app share to social: WhatsApp link preview**: the share URL must include OpenGraph tags
  rendered by the fallback page so the preview looks good.

## Privacy / LGPD

- Link parameters can include a tracking param (e.g., `utm_source=share`); these are stored only in
  analytics, never in user records.
- Links to private resources (e.g., a draft report) require auth; the resolver rejects
  unauthenticated access.

## Analytics

| Event                    | When                      | Props                                       |
| ------------------------ | ------------------------- | ------------------------------------------- |
| `deeplink.received`      | Any URL arrives           | `cold_start: bool`, `target_kind`, `source` |
| `deeplink.resolved`      | Successfully routed       | `target_kind`, `target_id`                  |
| `deeplink.unknown`       | Unknown path              | `path`                                      |
| `deeplink.share_created` | App generates a share URL | `target_kind`                               |

## Tests

- **Unit**: parser handles all valid forms; rejects malformed; auth-gated intents stash and re-run
  after login.
- **Integration**: cold-start with a link; warm-start; unknown path goes to Home with toast;
  cross-tenant prompt.
- **E2E**: tap a notification with a target, confirm the right screen opens; tap a shared WhatsApp
  link, confirm the app opens to the right screen.

## Definition of Done

- [ ] Parser, router, pending-link buffer
- [ ] `app.json` scheme + typed-routes config; file-based routes cover every URL pattern in the
      table above
- [ ] iOS Associated Domains and AASA file served
- [ ] Android App Links and assetlinks.json served
- [ ] Web fallback pages for at least report and public-work resources
- [ ] Auth gating with redirect-after-login
- [ ] Cross-tenant handling
- [ ] Tests passing per strategy

## Standards & References

### Cross-cutting standards

- Architecture: `docs/engineering/architecture-patterns.md`
- Security (URL validation): `docs/engineering/security-baseline.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- Expo Router linking overview (verified current for SDK 56, 2026-07) — confirms file-based routes
  auto-generate the linking config, superseding a hand-written React Navigation linking spec:
  https://docs.expo.dev/linking/overview/
- Expo Router typed routes: https://docs.expo.dev/router/reference/typed-routes/
- iOS Universal Links: https://developer.apple.com/ios/universal-links/
- Android App Links: https://developer.android.com/training/app-links
- Expo Linking (low-level `Linking.createURL`/`getInitialURL` APIs used under the hood):
  https://docs.expo.dev/guides/linking/

### Project context

- Splash app initialization: `docs/tasks/01-splash/02-app-initialization.md`
- Push handler: `00-foundation/11-push-notification-handler.md`
- `CLAUDE.md`

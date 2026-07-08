# Civic Feed · Compartilhar action

> **Type:** Screen feature · UX + integrations
> **Screen:** SCREEN 07 · Civic Feed (also reused on Detail screens 13, 14, and Liga de Heróis)
> **Effort:** S (≤1 day)
> **Dependencies:** `07-civic-feed/03-feed-item-card.md`, `00-foundation/12-deep-link-handler.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`, `growth`

## Context

Citizens share reports with neighbors, family groups, or social media to
amplify pressure on the prefecture and recruit more supporters.
Compartilhar opens the OS share sheet with a pre-formatted message
including a deep link to the report. The deep link uses the universal
form (`https://cityhero.app/r/<id>`) so recipients without the app see a
preview page; recipients with the app open straight to the detail screen.

This is also a low-key acquisition channel — every shared link is a
potential new install.

## User Story

**As a** Citizen who supports a report,
**I want** to share it with friends and family,
**In order to** add pressure on the prefecture and bring others on board.

## Acceptance Criteria

### Scenario · Open share sheet

**Given** the user taps the share icon on a feed card (or any other surface)
**When** the action runs
**Then** the OS native share sheet opens
**And** the share payload includes:
  - A short subject ("Olha esse problema no nosso bairro")
  - A short message ("João reportou um buraco na R. Central. 34 vizinhos já apoiaram.")
  - A universal link `https://cityhero.app/r/<report_id>?utm_source=share&utm_medium=app`
  - A photo (the anonymized variant, optional based on platform)

### Scenario · Anonymous report shared

**Given** the report being shared is anonymous
**When** the share payload is built
**Then** the message uses "Um vizinho reportou…" (no name)
**And** the link is the same — recipients see the same anonymized post

### Scenario · Universal link opens the app (installed)

**Given** the recipient has the app installed
**When** they tap the shared link
**Then** the app opens directly to the report's detail screen
**And** if not authenticated, they're routed through login first; the deep-link target is preserved

### Scenario · Universal link opens fallback page (not installed)

**Given** the recipient does not have the app installed
**When** they tap the link
**Then** a web fallback page renders showing the report (anonymized photo, description, support count)
**And** offers an install CTA (App Store / Play Store)

### Scenario · WhatsApp deep link

**Given** the user picks WhatsApp from the share sheet
**When** the share fires
**Then** the message is formatted appropriately for WhatsApp (URL preview with title + image)
**And** OpenGraph tags on the fallback page produce a clean preview

### Scenario · Failed share

**Given** the OS share sheet returns a cancel or error
**When** the user dismisses the sheet
**Then** no error is shown (cancel is a normal action)
**And** if the share completed, telemetry records the chosen target if available

### Scenario · Throttling

**Given** a user shares many reports in rapid succession
**When** the rate exceeds a threshold (e.g., 20 shares/minute)
**Then** subsequent shares show a soft warning ("Você está compartilhando muito rápido")
**And** legitimate use isn't blocked; this is just a soft signal

### Scenario · Share from anonymous user

**Given** the user is not logged in (browsing as anonymous on web fallback)
**When** they share from the web fallback
**Then** the share works the same way (link is the same)

### Scenario · Accessibility

**Given** screen reader is on
**When** the user activates the share button
**Then** the action is announced
**And** the OS share sheet is the platform-native experience (its own a11y)

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/services/reports/
└── shareAction.ts             ← shared by Feed, Detail, Liga
```

### Behavior

- A function `shareReport(report)` builds the payload and invokes the OS share API.
- Universal link generation includes UTM parameters: `utm_source=share`, `utm_medium=app`, optionally `utm_campaign` from where the share was triggered.
- For anonymous reports, the message is rebuilt to omit names.
- Telemetry fires before the share sheet opens (intent) and after if the OS reports the chosen target.

### UI considerations

- The share button is one of the four actions on the feed card.
- A small ripple / haptic feedback fires on tap.

## Backend (FastAPI)

### Web fallback page

The fallback page lives at `https://cityhero.app/r/<id>` and is served by the backend (or by the web app's Next.js routing). It:

- Fetches the public-safe view of the report (anonymized photo, description, support count, status, neighborhood).
- Includes OpenGraph tags for rich previews on social platforms.
- Has a CTA "Abrir no CityHero" that uses the universal link (re-tries opening the app if installed).
- Has Apple/Google universal-link verification files at `/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json` (per `00-foundation/12-deep-link-handler.md`).

### Endpoint for fallback data

| Method | Path                              | Purpose                                    |
|--------|-----------------------------------|---------------------------------------------|
| GET    | `/api/v1/public/reports/{id}`     | Public-safe view of a report (no auth)     |

The endpoint:

- Returns only fields safe for public viewing.
- Anonymized photo URL only.
- No reporter name unless they are not anonymous.
- Reachable without auth.

## Database

No new schema. The fallback page reads the existing `reports` table.

## Edge Cases

- **Report deleted**: the fallback page shows a friendly "Esse problema foi resolvido ou removido" with a CTA back to CityHero.
- **Photo not yet anonymized**: the OG image uses a category-emoji placeholder.
- **Long descriptions**: trimmed for the share message and the OG description.
- **Recipient on an unsupported platform**: the link still opens the fallback page in any modern browser.

## Privacy / LGPD

- The shared message and fallback page expose only public-safe fields (per the anonymization pipeline).
- The reporter's name is included **only** if the report is not anonymous; the user already opted into public attribution.
- UTM parameters are non-identifying.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `report.share_intent`              | User taps share                            | `report_id`, `surface`               |
| `report.share_completed`           | OS reports a chosen target                 | `report_id`, `target`                |
| `report.share_canceled`            | OS reports cancel                          | `report_id`                           |

## Tests

- **Unit (frontend)**: payload constructed correctly for identified vs anonymous; URL includes the report ID and UTM params.
- **Unit (backend)**: public endpoint returns only safe fields; OG tags rendered correctly.
- **Integration**: deep link from the share opens the right screen.
- **E2E**: share to WhatsApp (or a sandbox target) and verify the preview.

## Definition of Done

- [ ] `shareReport` shared service
- [ ] OS share-sheet integration (mobile)
- [ ] Universal link generation with UTM
- [ ] Public report endpoint
- [ ] Web fallback page with OG tags
- [ ] Universal-link verification files served
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture: `docs/engineering/architecture-patterns.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- React Native Share: https://reactnative.dev/docs/share
- expo-sharing: https://docs.expo.dev/versions/latest/sdk/sharing/
- OpenGraph protocol: https://ogp.me/

### Project context
- Feed item card: `03-feed-item-card.md`
- Deep link handler: `00-foundation/12-deep-link-handler.md`
- Liga de Heróis screen (also uses share): `12-heroes-league/`
- `CLAUDE.md`

# Anonymous Send · Anonymous share UX

> **Type:** Screen feature · UI + integrations\
> **Screen:** SCREEN 11 · Anonymous Send\
> **Effort:** M (1-2 days)\
> **Dependencies:** `11-anonymous-send/01-render-anonymous-ui-base.md`,
> `00-foundation/12-deep-link-handler.md`, `07-civic-feed/07-compartilhar-action.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `growth`, `lgpd`

## Context

A small, restrained share panel offering two channels: WhatsApp and "Copiar link". Unlike the Liga
de Heróis screen (SCREEN 12), this one is **not** designed to amplify identity — the share message
and the universal-link preview both render as anonymous (🥷 Herói Anônimo · R. São Pedro). The user
can amplify the **report** without revealing themselves.

Title and copy reinforce: "Amplificar sem se expor".

## User Story

**As an** anonymous Citizen,\
**I want** to share my report without revealing my identity,\
**In order to** call for support without compromising my privacy choice.

## Acceptance Criteria

### Scenario · Default render

**Given** the user is on the screen\
**When** the share panel renders\
**Then** a small card with a violet-tinted background appears\
**And** the heading reads "Amplificar sem se expor" with a 🔗 icon\
**And** a short explanation says 'O link mostra "🥷 Herói Anônimo · R. São Pedro" — seu perfil fica
fora.'\
**And** two buttons appear side by side: "WhatsApp" (green icon) and "Copiar link"

### Scenario · Tap WhatsApp

**Given** the user taps WhatsApp\
**When** the action runs\
**Then** the OS share sheet opens with the anonymous-formatted message\
**And** the message has no "Reportado por João"-style attribution\
**And** the universal link points to `https://cityhero.app/r/<id>` with `utm_source=anon_share`\
**And** the link preview renders the anonymous variant on the fallback web page

### Scenario · Tap Copiar link

**Given** the user taps copy link\
**When** the action runs\
**Then** the universal link is copied to the system clipboard\
**And** a toast confirms ("Link copiado")\
**And** light haptic feedback fires

### Scenario · Share is optional

**Given** the user wants to skip sharing\
**When** they don't interact with this panel\
**Then** the screen continues to work normally\
**And** the bottom CTA still navigates to "Acompanhar reporte"

### Scenario · Web fallback shows anonymous

**Given** a recipient without the app taps the shared link\
**When** they land on the web fallback page\
**Then** the page shows 🥷 Herói Anônimo, the anonymized photo, the address, and the support count\
**And** install CTAs prompt them to download CityHero to support

### Scenario · Recipient with the app

**Given** the recipient has the app installed\
**When** they tap the link\
**Then** the app opens to the report's detail screen\
**And** the detail screen shows the anonymous variant (per `07-civic-feed/03`)

### Scenario · Tracking link analytics

**Given** the share carries UTM parameters\
**When** analytics are aggregated\
**Then** the `utm_source=anon_share` indicates an anonymous share\
**And** this segment can be measured (without identifying the user)

### Scenario · Anti-spam / rate limiting

**Given** the user shares many times quickly\
**When** the rate exceeds a threshold (e.g., 20/min)\
**Then** subsequent shares show a non-blocking warning\
**And** legitimate use is not blocked

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user navigates the panel\
**Then** the heading and explanation are read in order\
**And** each button is clearly labeled with its action and destination

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/AnonymousSend/
└── components/
    └── AnonymousShareCard.tsx
```

### Component behavior

- The card uses the shared `shareReport` service from `07-civic-feed/07` with an "anonymous
  formatting" flag.
- The flag forces the message template to omit reporter attribution and routes the share to either
  WhatsApp directly (if installed) or via the OS share sheet.
- Clipboard write uses the platform's Clipboard API; toast feedback is shown.

### Message template (anonymous)

The template is shorter and more impersonal:

> "🚨 Um vizinho reportou um {category} na {address}. Quanto mais gente apoiar, mais rápido a
> prefeitura resolve.
>
> 👉 cityhero.app/r/{id}"

The "vizinho" framing keeps the anonymity intact even in the recipient's chat preview.

## Backend (FastAPI)

This task reuses the public report endpoint and the web fallback page from `07-civic-feed/07`. The
web page itself is responsible for honoring the anonymous flag and rendering the anonymous variant.

The public summary endpoint returns the report's anonymized data when the report is anonymous
(already enforced in `07-civic-feed/07` and `00-foundation/08`).

## Database

No new schema. The report's `anonymous` field gates public-facing endpoints.

## Edge Cases

- **WhatsApp not installed**: fall back to the OS share sheet.
- **Clipboard unavailable** (rare permission issue): show a manual-copy alternative (e.g., a
  selectable text field with the link).
- **Recipient on a desktop browser**: the web fallback page renders responsively.
- **The user later turns the report public** (per task 06): the share link continues to work; the
  page reflects the new state.

## Privacy / LGPD

The whole point of this task is to **preserve** the user's privacy choice across the share surface:

- The message text never names the reporter.
- The link preview (OG tags on the fallback page) never names the reporter.
- The recipient cannot derive identity from any UI surface.
- LAI is unaffected: the prefecture still sees the real reporter regardless of sharing.

## Analytics

| Event                            | When                          | Props              |
| -------------------------------- | ----------------------------- | ------------------ |
| `anonymous_send.share_intent`    | User tapped WhatsApp or Copy  | `channel: whatsapp | copy` |
| `anonymous_send.share_completed` | OS returned a confirmed share | `channel`          |
| `anonymous_send.share_throttled` | Rate limit reached            | —                  |

## Tests

- **Unit (frontend)**: payload constructed without reporter name; clipboard write fires; channels
  open correctly.
- **Integration**: web fallback page renders anonymous variant for shared links.
- **E2E**: share to WhatsApp sandbox; verify preview is anonymous.

## Definition of Done

- [ ] AnonymousShareCard component
- [ ] Anonymous formatting reusing the shared share service
- [ ] Clipboard copy with toast
- [ ] Web fallback page renders anonymous (verified)
- [ ] UTM tracking on links
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture (REST, public endpoints): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- expo-clipboard: https://docs.expo.dev/versions/latest/sdk/clipboard/
- React Native Share: https://reactnative.dev/docs/share
- WhatsApp deep linking: https://faq.whatsapp.com/5913398998672934

### Project context

- Render UI base: `01-render-anonymous-ui-base.md`
- Share service (reused): `07-civic-feed/07-compartilhar-action.md`
- Deep link handler: `00-foundation/12-deep-link-handler.md`
- Identification toggle: `10-report-confirm/06-identification-toggle.md`
- `CLAUDE.md`

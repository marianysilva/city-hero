# Camera · Permission flow

> **Type:** Screen feature · Permissions
> **Screen:** SCREEN 08 · Camera with AI (live)
> **Effort:** S (≤1 day)
> **Dependencies:** `08-camera-live/01-render-camera-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `permissions`, `screen`

## Context

The camera screen needs explicit camera permission. Onboarding (SCREEN 03)
educated about the camera but did not request permission — that's done
here, the first time the user actually opens the camera. A pre-prompt
explains the purpose; the OS dialog follows. If denied, the screen shows
a clear explanation with a path to system settings (or Manual Report
fallback via task 08 of this folder).

## User Story

**As a** Citizen tapping the camera FAB for the first time,
**I want** the app to ask for camera permission with a clear reason,
**In order to** trust why I'm granting it.

## Acceptance Criteria

### Scenario · First-time camera open

**Given** the user has not yet been asked for camera permission
**When** the camera screen mounts
**Then** the viewfinder is replaced by a contextual pre-prompt explaining the purpose ("Pra você reportar problemas com fotos")
**And** if the user accepts the pre-prompt, the OS permission dialog appears
**And** if the user declines the pre-prompt, the camera modal closes without prompting

### Scenario · Permission granted

**Given** the OS dialog returned granted
**When** the result arrives
**Then** the viewfinder activates with the back camera
**And** the AI detection task (03) starts loading the model in parallel
**And** the user can capture (task 04)

### Scenario · Permission denied (first time)

**Given** the OS dialog returned denied
**When** the result arrives
**Then** the screen shows an explanation overlay ("Sem câmera, não dá pra reportar com IA")
**And** offers two CTAs: "Tentar de novo" (re-prompts) and "Reportar sem foto" (routes to Manual Report — task 08)

### Scenario · Permission denied permanently

**Given** the user previously denied with "Don't ask again"
**When** they reopen the camera
**Then** no OS dialog is shown
**And** the explanation overlay shows "Abrir Ajustes" CTA that opens system settings
**And** the Manual Report fallback CTA remains available

### Scenario · Permission already granted

**Given** the user previously granted permission
**When** the camera screen mounts
**Then** the viewfinder activates immediately (no pre-prompt, no OS dialog)
**And** the rest of the flow runs

### Scenario · Permission revoked mid-session

**Given** the user revoked permission in OS settings while the app was backgrounded
**When** the camera screen comes to foreground
**Then** the viewfinder pauses
**And** the explanation overlay reappears
**And** "Abrir Ajustes" or fallback CTA is offered

### Scenario · Hardware unavailable

**Given** the device has no camera (rare but possible — e.g., emulator)
**When** the screen mounts
**Then** the explanation overlay reads "Câmera não disponível neste aparelho"
**And** only the Manual Report fallback CTA is available

### Scenario · Multiple cameras

**Given** the device has multiple back cameras (wide-angle + telephoto)
**When** the viewfinder activates
**Then** the default back camera (1× standard) is used
**And** future tasks can add lens switching if needed (out of MVP)

### Scenario · Accessibility

**Given** screen reader is on
**When** the pre-prompt or explanation overlays render
**Then** content is announced as a live region
**And** CTAs are clearly labeled
**And** the user can navigate with screen reader actions

## Frontend (React Native / Expo)

### Where it lives

```
apps/mobile/src/screens/Camera/
├── components/
│   ├── CameraPermissionPrePrompt.tsx
│   └── CameraPermissionDeniedOverlay.tsx
└── hooks/
    └── useCameraPermission.ts
```

### Behavior

- `useCameraPermission` wraps the platform's permission API and exposes the current state (`undetermined`, `granted`, `denied`, `blocked`) plus a `request()` action.
- The pre-prompt is shown only on first open (when the state is `undetermined`).
- The denied overlay is shown when the state becomes `denied` or `blocked`.
- The screen subscribes to app-foreground events to re-check the state.

### Camera library

Use the platform-recommended camera library (e.g., `react-native-vision-camera` or Expo Camera depending on the project's stack). The viewfinder component is rendered into the `viewfinder` slot from task 01.

### Privacy-first messaging

The pre-prompt copy clearly states the reason: "Pra você capturar fotos dos problemas que vai reportar. As fotos são anonimizadas antes de aparecerem pra outros."

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **OS permission dialog is shown but the user backgrounds the app before answering**: the state remains `undetermined` until they return; the screen re-evaluates.
- **Permission is granted but the camera is busy** (another app is using it): show a transient error state with retry.
- **Slow camera initialization**: a small spinner overlays the viewfinder while initializing.
- **Pre-prompt + onboarding redundancy**: even though SCREEN 03 introduced the camera concept, this screen still requires explicit consent at this point — it's the first actual ask.

## Privacy / LGPD

- Camera permission is requested **only** at the camera screen — never at app launch or splash.
- The pre-prompt clearly states the purpose and the anonymization guarantee.
- Permission is requested at the minimum-necessary level (camera only — no microphone unless audio reports are added in a future scope expansion).

## Analytics

| Event                                  | When                                       | Props                              |
|----------------------------------------|--------------------------------------------|-------------------------------------|
| `camera.permission_pre_prompt_shown`   | Pre-prompt rendered                        | —                                   |
| `camera.permission_pre_prompt_accepted`| User taps Continue                         | —                                   |
| `camera.permission_pre_prompt_declined`| User cancels pre-prompt                    | —                                   |
| `camera.permission_granted`            | OS dialog returned granted                 | —                                   |
| `camera.permission_denied`             | OS dialog returned denied                  | `permanent: bool`                   |
| `camera.permission_settings_opened`    | User opened system settings                | —                                   |
| `camera.fallback_to_manual_pressed`    | User opted for Manual Report               | `from_state: denied|blocked|no_hw` |

## Tests

- **Unit**: state transitions through pre-prompt → OS prompt → granted/denied; permanent-denied opens settings; foreground re-check updates.
- **Integration**: granted path activates viewfinder; denied path shows fallback CTAs.
- **E2E**: simulate a fresh install opening the camera for the first time.

## Definition of Done

- [ ] `useCameraPermission` hook
- [ ] Pre-prompt component
- [ ] Denied / blocked overlay component with both CTAs
- [ ] Foreground re-check
- [ ] Hardware-unavailable case
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- expo-camera: https://docs.expo.dev/versions/latest/sdk/camera/
- react-native-vision-camera: https://react-native-vision-camera.com/
- iOS camera privacy: https://developer.apple.com/documentation/avfoundation/cameras_and_media_capture/requesting_authorization_to_capture_and_save_media
- Android camera permission: https://developer.android.com/training/permissions/requesting

### Project context
- Render UI base: `01-render-camera-ui-base.md`
- Manual Report fallback: `08-fallback-to-manual.md`
- Onboarding camera education (no permission ask): `03-onboarding-camera/`
- `CLAUDE.md`

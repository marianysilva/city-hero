# Citizen Profile · Settings + logout

> **Type:** Screen feature · UI + state + integration\
> **Screen:** SCREEN 28 · Citizen Profile\
> **Effort:** M (1-2 days)\
> **Dependencies:** `28-citizen-profile/01-render-profile-ui-base.md`,
> `00-foundation/06-auth-system.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `backend`, `screen`, `settings`

## Context

A "CONFIGURAÇÕES" section at the bottom with rows for: idioma, tema (light/dark/system), privacidade
(anonymous default, opt-out from AI training, opt-out from analytics), conta (editar perfil, mudar
senha, deletar conta — LGPD compliant), and a final "Sair" (logout) action.

> **This is the single entry point for every user preference in the app.** No other screen exposes a
> settings sheet (the feed and prefecture news bells were removed on 2026-06-19). When new
> preference categories are introduced — notifications, accessibility, data — they live here as
> additional rows.

Notification preferences are intentionally **not** in MVP scope: the product hasn't defined the
notification catalog yet. The row is reserved but disabled with a "Em breve" hint.

## Acceptance Criteria

### Scenario · Default render

**Given** the user scrolled to the settings section\
**When** it renders\
**Then** rows appear grouped by category\
**And** each row shows: icon + label + current value or chevron

### Scenario · Tap a row

**Given** the user taps a row\
**When** the action runs\
**Then** the appropriate detail sheet opens (language picker, theme picker, notification prefs,
etc.)\
**And** changes apply immediately and persist server-side

### Scenario · Theme switching

**Given** the user picks Dark mode\
**When** the action runs\
**Then** the app re-renders in dark mode immediately\
**And** the preference persists

### Scenario · Privacy controls

**Given** the user toggles "Anônima por padrão"\
**When** the action runs\
**Then** the user's default identification choice flips\
**And** future reports default to anonymous

### Scenario · Account deletion (LGPD)

**Given** the user wants to delete their account\
**When** they tap "Deletar conta"\
**Then** a confirmation modal explains the consequences (data anonymization, irreversibility)\
**And** confirming triggers the deletion flow per `00-foundation/06`

### Scenario · Logout

**Given** the user taps Sair\
**When** the action runs\
**Then** a confirmation appears\
**And** confirming clears tokens, navigates to Splash → Login

### Scenario · Localization

**Given** en-US\
**When** rendered\
**Then** all labels translate

### Scenario · Accessibility

**Given** SR is on\
**When** navigated\
**Then** each row has clear label + current value/state

## Frontend

```
apps/city-hero/src/screens/CitizenProfile/
├── components/
│   ├── SettingsList.tsx
│   ├── SettingsRow.tsx
│   ├── LanguagePickerSheet.tsx
│   ├── ThemePickerSheet.tsx
│   ├── PrivacyControlsSheet.tsx
│   └── DeleteAccountConfirm.tsx
└── hooks/
    └── useUserSettings.ts
```

## Backend

`PATCH /api/v1/auth/me` accepts settings updates. `DELETE /api/v1/auth/me` triggers account deletion
per `00-foundation/06`.

## Database

The `users` table holds preference fields.

## Edge Cases

- **Logout while offline**: tokens cleared locally; backend sync on next opportunity.

## Privacy / LGPD

This section is critical for compliance. All controls must work reliably; the account-deletion flow
follows the standard data-subject-rights process.

## Analytics

| Event                                      | When                       | Props                  |
| ------------------------------------------ | -------------------------- | ---------------------- |
| `citizen_profile.settings_opened`          | Section visible            | —                      |
| `citizen_profile.setting_changed`          | A setting was modified     | `setting`, `new_value` |
| `citizen_profile.logout_pressed`           | User initiated logout      | —                      |
| `citizen_profile.delete_account_initiated` | User entered deletion flow | —                      |

## Tests

- **Unit**: setting toggles; theme applies; logout clears tokens.
- **Integration**: deletion flow end-to-end.
- **A11y**: rows labeled with state.

## Definition of Done

- [ ] SettingsList + SettingsRow components
- [ ] Pickers/sheets per setting
- [ ] DeleteAccountConfirm
- [ ] useUserSettings hook
- [ ] Backend integration
- [ ] Logout flow
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Cross-cutting: `docs/engineering/`
- Auth system: `00-foundation/06-auth-system.md`
- `CLAUDE.md`

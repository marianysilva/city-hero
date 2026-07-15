# Irregularity Report · Step 4 · Identification disclosure

> **Type:** Screen feature · UI + privacy\
> **Screen:** SCREEN 24 · Irregularity Report\
> **Effort:** S (≤1 day)\
> **Dependencies:** `24-irregularity-report/01-render-irregularity-ui-base.md`,
> `10-report-confirm/06-identification-toggle.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `lgpd`

## Context

Step 4: the **how-to-identify** disclosure. The user chooses to file:

- **Identificada**: the user's identity (name, contact) goes with the complaint. The authority can
  follow up directly.
- **Anônima**: no identifying data goes with the complaint. The authority's response is published in
  their channels.

The screen explains the trade-offs honestly per LAI and each authority's policy (e.g., MP usually
requires identification for serious cases). For programs that involve potential retaliation risk
(housing, social), the screen emphasizes the anonymous option more strongly.

## Acceptance Criteria

### Scenario · Default render

**Given** the user reaches step 4\
**When** the screen renders\
**Then** two large tiles: "Identificada" and "Anônima"\
**And** below: a short paragraph explaining the trade-offs and the LAI\
**And** for sensitive programs (housing/safety), the anonymous tile is highlighted as recommended

### Scenario · Pick Identificada

**Given** the user picks Identificada\
**When** the action runs\
**Then** fields for name + contact (email/phone) appear, pre-filled if available\
**And** the user can edit before continuing

### Scenario · Pick Anônima

**Given** the user picks Anônima\
**When** the action runs\
**Then** no identifying fields appear\
**And** a soft sheet explains that the authority may not be able to follow up if they need more info

### Scenario · Authority-specific constraints

**Given** the chosen authority (from step 2) requires identification (e.g., TCU for some
categories)\
**When** the user picks Anônima\
**Then** a warning shows ("Esse órgão pode arquivar denúncias anônimas") with the option to switch
back

### Scenario · LAI reminder

**Given** the user is making the choice\
**When** the screen renders\
**Then** a small inline LAI explainer (reused from `10-report-confirm/06`) is available\
**And** it clarifies the relationship between identification, anonymity, and access to information

### Scenario · Localization

**Given** en-US\
**When** rendered\
**Then** copy translates with English-language law references

### Scenario · Accessibility

**Given** SR is on\
**When** the choice is read\
**Then** announced as a critical decision group with the trade-offs

## Frontend

```
apps/city-hero/src/screens/IrregularityReport/
└── steps/
    └── Step4Identification.tsx
```

Reuses the LAI explainer sheet from `10-report-confirm/06-identification-toggle.md`.

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **Mandatory ID for some authorities**: warn but allow user to proceed; they can choose to switch
  authority.
- **User has incomplete identity in profile**: fields stay empty for them to fill.

## Privacy / LGPD

This is the screen's main privacy mechanic. The user must make an informed choice. The data — once
chosen — travels with the complaint to the external authority (CityHero never stores it).

## Analytics

| Event                                | When                | Props                              |
| ------------------------------------ | ------------------- | ---------------------------------- |
| `irregularity.identification_chosen` | User selected       | `identified: bool`, `authority_id` |
| `irregularity.lai_explainer_opened`  | User tapped the LAI | —                                  |

## Tests

- **Unit**: identification selection; conditional warning per authority.
- **Snapshot**: each state.
- **A11y**: announcements.

## Definition of Done

- [ ] Step4Identification screen
- [ ] Reused LAI explainer
- [ ] Identity field for Identificada path
- [ ] Authority-specific warnings
- [ ] Localized copy
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Cross-cutting: `docs/engineering/`
- LAI explainer (shared): `10-report-confirm/06-identification-toggle.md`
- `CLAUDE.md`

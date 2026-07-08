# Manual Report · AI feedback loop

> **Type:** Screen feature · ML data ingestion
> **Screen:** SCREEN 09 · Manual Report
> **Effort:** S (≤1 day)
> **Dependencies:** `09-manual-report/02-category-grid.md`, `09-manual-report/03-photo-thumbnail.md`, `00-foundation/16-yolov8-inference-service.md`
> **Status:** ⬜ Not started
> **Labels:** `backend`, `ai`, `screen`, `data`

## Context

Every manual category pick is a labeled data point that can train the
next iteration of the AI model. When the on-device or backend AI
expressed low confidence (or didn't detect anything), the manual category
the user picks **is the ground truth**. By capturing this as a labeled
sample (photo + category, with the user's consent), we feed the
retraining pipeline naturally — converting friction into improvement.

This task implements the **client → backend** flow: the manual report
payload includes the AI's original detection (if any) and the user's
manual category. The backend marks the sample as a retraining candidate
for the model versioning service. The retraining itself lives in
`packages/ia_research` and is out of scope here.

## User Story

**As a** Product / ML team,
**I want** every manual category pick to feed model improvement,
**In order to** make the AI smarter without a separate labeling effort.

**As a** Citizen,
**I want** clear consent about how my photo helps train the model,
**In order to** decide whether to opt in.

## Acceptance Criteria

### Scenario · Default consent enabled

**Given** the user is on the manual report screen
**When** the AI feedback loop is configured
**Then** by default, the report's photo + manual category are sent as a labeled training candidate
**And** the footer message ("A IA aprende com cada reporte manual") communicates this transparently

### Scenario · Opt-out switch

**Given** the user wants to opt out
**When** they tap "Mais" / "Sobre a IA" or open Settings → Privacy
**Then** they can toggle off "Ajudar a IA a aprender com meus reportes"
**And** subsequent manual reports do not carry the training-candidate flag
**And** the change persists in the user profile

### Scenario · Training candidate metadata

**Given** a manual report is submitted with the consent on
**When** the backend receives it
**Then** the report record includes: `ai_label_candidate = true`, `ai_original_detection` (the AI's low-confidence guess or null), `user_label` (the manual category), `model_version` used at capture time
**And** the photo is the **anonymized** variant from the pipeline (`00-foundation/08`) so no PII enters the training corpus

### Scenario · Curation queue

**Given** training candidates accumulate
**When** the ML team queries them
**Then** they can filter by: model version, original detection confidence range, manual category, time window
**And** export a labeled dataset for retraining

### Scenario · Quality safeguards

**Given** a candidate has obviously implausible data (e.g., category "Buraco" but the photo is clearly a beach scene)
**When** the curator reviews
**Then** they can reject the candidate from the training set
**And** the report remains valid for the prefecture's purposes — only the ML training relevance is flagged

### Scenario · Privacy disclosure

**Given** the user reads the footer or taps the small "?" near it
**When** the disclosure expands
**Then** it explains: photos are anonymized first, only the manual category and the photo become a training signal, the user can opt out anytime, and the model improvement benefits everyone

### Scenario · Anonymization is non-negotiable

**Given** any photo enters the training pipeline
**When** the system processes
**Then** only anonymized versions are stored as training data
**And** raw (pre-anonymization) photos are **never** used for training, in any case
**And** this rule applies regardless of consent state (consent is to **opt in**; never to **bypass** anonymization)

### Scenario · Model version traceability

**Given** retraining produces a new model
**When** comparing performance against the prior model
**Then** the training data's `model_version` field allows analyzing which sources improved (or hurt) outcomes

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/ManualReport/
└── hooks/
    └── useAiFeedbackConsent.ts
```

The hook reads the user's consent setting (default on) and exposes it. The submit logic (task 06) reads this and includes the `ai_label_candidate` flag in the payload.

### Disclosure surface

The footer message links to a short "Sobre a IA" sheet explaining the loop and the opt-out. Settings (out of MVP scope, but planned) include a permanent toggle.

## Backend (FastAPI)

The report-create endpoint (owned by `docs/tasks/10-report-confirm/`) accepts the additional fields. No new endpoint here.

A periodic ETL (or dbt model) materializes the labeled dataset for the ML team to consume.

## Database

The `reports` table gains:

| Column                  | Type        | Notes                                                |
| ----------------------- | ----------- | ---------------------------------------------------- |
| `ai_label_candidate`    | boolean     | True when user consented and provided a manual label |
| `ai_original_detection` | jsonb       | The AI's guess at capture time (or null)             |
| `ai_model_version`      | varchar(20) | Model used at the time                               |
| `user_label`            | varchar(50) | The manual category key the user picked              |

(These integrate with the `reports` table schema owned by the report-creation flow.)

## Edge Cases

- **User picks "Outro"**: the secondary key is captured as the manual label; less directly useful for training but still a signal.
- **User submits without a photo**: no training candidate; the flag is automatically false.
- **Consent changed mid-report**: the report uses the consent state at submit time, not at screen mount.
- **Future migration of consent default**: if defaults change, existing users keep their explicit choice; new users get the new default.

## Privacy / LGPD

- The default-on behavior is acceptable under LGPD as long as the **purpose** is clearly disclosed and the **opt-out is one tap away**.
- The training data is the anonymized photo + a category label — neither of which is PII.
- Consent state is part of the user record and is auditable.

## Analytics

| Event                                        | When                                 | Props                                           |
| -------------------------------------------- | ------------------------------------ | ----------------------------------------------- |
| `manual_report.ai_feedback_consent_shown`    | Footer "?" tapped                    | —                                               |
| `manual_report.ai_feedback_opt_out`          | User opts out in this session        | —                                               |
| `manual_report.ai_label_candidate_submitted` | Report submitted with candidate flag | `had_original_detection: bool`, `model_version` |

## Tests

- **Unit**: consent state reading; payload flag inclusion; default on; opt-out persists.
- **Integration**: candidate written to DB; raw photo never enters training.
- **Compliance**: a test asserts that all training-bound photos are anonymized.

## Definition of Done

- [ ] `useAiFeedbackConsent` hook
- [ ] Submit payload includes the AI-feedback fields when applicable
- [ ] Backend `reports` columns added + Alembic migration
- [ ] Curation query / export documented (interface for ML team)
- [ ] Privacy disclosure surface
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Observability: `docs/engineering/observability.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- AI model retraining concepts: https://docs.ultralytics.com/modes/train/

### Project context

- Category grid: `02-category-grid.md`
- Photo thumbnail: `03-photo-thumbnail.md`
- Anonymization pipeline: `00-foundation/08-anonymization-pipeline.md`
- AI inference service: `00-foundation/16-yolov8-inference-service.md`
- Report creation: `docs/tasks/10-report-confirm/`
- `packages/ia_research` (training corpus consumer)
- `CLAUDE.md`

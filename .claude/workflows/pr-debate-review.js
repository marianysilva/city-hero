export const meta = {
  name: 'pr-debate-review',
  description:
    'Multi-agent adversarial-debate review of a PR/diff: design patterns, architecture, ' +
    'implementation, unit + E2E test coverage, data security, and information-leakage/security gaps',
  phases: [
    { title: 'Review', detail: '7 parallel specialist reviews, one per dimension' },
    { title: 'Debate', detail: 'adversarial rebuttal of each report' },
    { title: 'Synthesize', detail: 'reconcile into one final verdict' },
  ],
}

// ── Inputs ────────────────────────────────────────────────────────────────
// Pass via `args` when invoking this workflow — see
// .claude/skills/pr-debate-review/SKILL.md for how the caller gathers these.
//   target        — human label, e.g. "PR #45" or "branch feat/x vs main"
//   fetchCommand  — exact command an agent should run to see the diff,
//                   e.g. "gh pr diff 45 --repo owner/repo" or
//                   "git diff main...HEAD"
//   background    — why this change exists (1 paragraph is enough)
//   changedFiles  — array of changed file paths, for orientation
//   skipDimensions — optional array of dimension keys to omit (see
//                    DIMENSIONS below) when a category plainly doesn't
//                    apply, e.g. skip 'e2e-tests' for a backend-only PR
//                    with no UI-visible behavior change.

const target = args?.target ?? 'the current branch diff against main'
const fetchCommand = args?.fetchCommand ?? 'git diff main...HEAD'
const background = args?.background ?? '(no additional background provided — infer intent from the diff itself)'
const changedFiles = Array.isArray(args?.changedFiles) ? args.changedFiles : []
const skipDimensions = new Set(Array.isArray(args?.skipDimensions) ? args.skipDimensions : [])

const CANON_DOCS = `
Canonical project references — read the relevant ones, cite them, do NOT restate their reasoning
in your own words (that duplication is exactly what this project's docs-consistency-sweep skill
exists to undo later):
- docs/engineering/architecture-patterns.md — layering, DI, multi-tenant scoping, API style
  (REST/Open311 + GraphQL), frontend component architecture, patterns to AVOID
- docs/engineering/coding-standards.md — Python/TypeScript/SQL naming, migrations, error handling
- docs/engineering/security-baseline.md — authn/authz, input validation, OWASP top 10 coverage,
  LGPD/GDPR, photo-anonymization requirement
- docs/engineering/testing-strategy.md — test pyramid, coverage targets (new code >=80%, critical
  paths >=95%), what to mock, per-platform E2E tooling (Playwright web / Maestro mobile)
- CLAUDE.md (repo root) — project-wide instructions and conventions
`

const CONTEXT = `
Repo: CityHero monorepo (FastAPI backend, Next.js web dashboard, Expo mobile app, shared packages
under packages/*).

Review target: ${target}
Fetch the actual diff with: ${fetchCommand}
${
  changedFiles.length
    ? `Files changed (${changedFiles.length}):\n${changedFiles.map((f) => `- ${f}`).join('\n')}`
    : 'Changed-files list not provided — derive it from the diff.'
}

Background — why this change exists:
${background}

${CANON_DOCS}

Ground every finding in the ACTUAL code (Read/Grep the real files, don't reason only from the diff
text) and give concrete file:line references. Prefer few, real, well-evidenced findings over many
speculative ones.
`

const FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'short label for this finding' },
          severity: { type: 'string', enum: ['high', 'medium', 'low', 'nitpick'] },
          detail: { type: 'string', description: 'concrete description, with file:line references' },
          recommendation: { type: 'string', description: 'what should change, if anything' },
        },
        required: ['title', 'severity', 'detail', 'recommendation'],
      },
    },
    overallAssessment: { type: 'string', description: '2-4 sentence summary verdict for this dimension' },
  },
  required: ['findings', 'overallAssessment'],
}

const DEBATE_SCHEMA = {
  type: 'object',
  properties: {
    rebuttals: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          findingTitle: { type: 'string', description: 'must match a title from the original report' },
          verdict: { type: 'string', enum: ['upheld', 'overruled', 'downgraded', 'upgraded'] },
          reasoning: { type: 'string' },
        },
        required: ['findingTitle', 'verdict', 'reasoning'],
      },
    },
    additionalFindingsTheReviewerMissed: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['rebuttals', 'additionalFindingsTheReviewerMissed'],
}

const ALL_DIMENSIONS = [
  {
    key: 'design-patterns',
    label: 'Design patterns & codebase conventions',
    agentType: 'code-reviewer',
    prompt: `${CONTEXT}

Your lens: DESIGN PATTERNS & CODEBASE CONVENTIONS. Judge whether this change follows the idioms
already established elsewhere in this codebase, or introduces inconsistency. Concretely:
- For every new function/component/schema added, find the closest existing analogue in the
  codebase (a similar validator, a similar form field, a similar route handler) and compare them
  line by line. Flag real divergence, not just "could be written differently."
- Naming consistency: does new terminology match existing terminology for the same concept
  elsewhere (don't let a new synonym for an existing concept slip in unnoticed)?
- Does the change match this project's file/module organization conventions (coding-standards.md)?
- For backend: CamelBase schema conventions, field_validator + stable-code error pattern
  (PydanticCustomError, not raw ValueError), service-layer placement of business logic.
- For frontend: composition patterns from architecture-patterns.md, props/hooks/state conventions
  from coding-standards.md.
Report concrete findings with file:line refs, not generic style opinions.`,
  },
  {
    key: 'architecture',
    label: 'Architecture & layering',
    agentType: 'code-reviewer',
    prompt: `${CONTEXT}

Your lens: ARCHITECTURE & LAYERING. Judge structural decisions, not code style. Concretely:
- Layering: does business logic stay in the service layer (never in routers/route handlers), per
  architecture-patterns.md's two-layer backend shape? Any logic that leaked into the wrong layer?
- Permission/authorization boundaries: does every new mutable field get the SAME authorization
  gate as fields it sits next to (e.g. if role changes are admin-only, should this new field be
  too — or is a looser gate a deliberate, defensible choice)? Call out any field whose blast radius
  doesn't match its access gate.
- Multi-tenant scoping: does every new/changed query filter by city_id (architecture-patterns.md,
  security-baseline.md)? Flag any that don't, or justify why they're an intentional exception
  (e.g. clearly admin-only cross-tenant read).
- Data-layer changes (migrations): forward-only (never edit a merged migration — coding-
  standards.md), one logical change per migration, has a real downgrade(), idempotent against
  re-run if it's a data migration (compare to how existing seed migrations handle this).
- Shared-package boundaries (packages/api_client, packages/design_system, packages/i18n): does a
  change to a shared contract stay consistent across every consumer (web AND mobile, if both
  exist), or does it silently diverge platform behavior?
- "Patterns to AVOID" in architecture-patterns.md — god services/components, anemic models,
  implicit globals, magic strings, premature abstraction — does anything in this diff trip one of
  these?
Report concrete findings with file:line refs.`,
  },
  {
    key: 'implementation',
    label: 'Implementation correctness & edge cases',
    agentType: 'code-reviewer',
    prompt: `${CONTEXT}

Your lens: IMPLEMENTATION CORRECTNESS & EDGE CASES. Look for actual bugs, not style. Concretely:
- For every conditional/guard added, what's the behavior on the branch NOT exercised by the
  happy-path tests — is it correct, or silently wrong/inconsistent?
- For every new default value, does the UI's assumed default actually match the backend's real
  default (a common silent-divergence bug), or could they drift apart under some input?
- For every new field/parameter that's optional, trace every place it's threaded through (schema
  -> service -> DB write -> response) and confirm "omitted" and "explicitly null/empty" are handled
  the same way everywhere they should be, and differently where that distinction matters.
- Race conditions / concurrent-write scenarios on anything touching shared state.
- For every validated-then-stored value, confirm validation genuinely can't be bypassed by a
  different code path reaching the same storage write.
Report each finding with a concrete failure scenario: specific input/state -> specific wrong
output/behavior. Reject your own hypothesis if you can't state a concrete scenario for it.`,
  },
  {
    key: 'unit-tests',
    label: 'Unit test coverage',
    agentType: 'code-reviewer',
    prompt: `${CONTEXT}

Your lens: UNIT TEST COVERAGE. Read the actual new/changed test files (don't just skim names) and
judge coverage against docs/engineering/testing-strategy.md's targets (new code >=80% line
coverage, critical paths — auth, payments, uploads, anonymization — >=95%). Concretely:
- List every new/changed code path and check: is there a test exercising it directly, or only
  indirectly via a happy-path test that would still pass if this path were deleted?
- Permission/authorization boundaries introduced or touched — is there a test proving a user
  WITHOUT the right permission is actually rejected, not just that a user WITH it succeeds?
- Round-trip coverage: if a value is written, is there a test confirming it's readable back
  correctly from every read path that should expose it (not just the write endpoint's own response)?
- Are there component-level tests for any new/changed UI (per testing-strategy.md's React Testing
  Library conventions), or does this PR only add route/API-layer tests? If the latter, is that
  consistent with what OTHER similar components in this codebase already do (check a sibling
  component's test coverage before flagging this as a gap unique to this PR)?
- Malformed/boundary-value inputs (wrong case, empty string, unexpected type) — are they tested,
  or only the fully-valid and fully-absent cases?
Give a concrete list, each phrased as "no test covers: <scenario>" — not a coverage percentage guess.`,
  },
  {
    key: 'e2e-tests',
    label: 'E2E test coverage',
    agentType: 'code-reviewer',
    prompt: `${CONTEXT}

Your lens: E2E TEST COVERAGE. Per testing-strategy.md: Playwright drives apps/web
(docker-compose.e2e.yml + scripts/test-e2e.sh, see docs/tasks/00-foundation/21-e2e-test-database.md),
Maestro drives apps/city-hero (happy paths only). Concretely:
- Locate the actual e2e spec files for the app(s) this change touches. Does ANY existing spec
  exercise the flow this change modifies? If yes, was it updated to assert the new behavior? If no
  spec for this flow exists at all, that's the correct baseline to judge against — don't demand
  e2e coverage for a flow that has none, but DO flag it as a pre-existing gap worth naming.
  wired into any GitHub Actions workflow (.github/workflows/*.yml), or only documented as a
  manual/local-only command? State this explicitly — it changes how severe any gap is.
- If this change fixes a user-visible bug, is there (or should there be) an e2e assertion that
  would have caught the ORIGINAL bug and would catch a regression if the fix were reverted? Manual
  verification (a throwaway script, a screenshot) is not a substitute for a committed e2e test —
  say so if that's what happened, without assuming that means the PR is unacceptable (weigh it
  against the "happy paths only" scope testing-strategy.md itself sets for e2e).
Give a concrete list of untested e2e scenarios, phrased as "no e2e spec covers: <scenario>", and
explicitly state whether the e2e suite runs in CI.`,
  },
  {
    key: 'data-security',
    label: 'Data security & critical-path implementation security',
    agentType: 'security-reviewer',
    prompt: `${CONTEXT}

Your lens: DATA SECURITY & CRITICAL-IMPLEMENTATION-POINT SECURITY. Per security-baseline.md.
Concretely:
- Authn/authz on every new/changed endpoint or mutation — checked at BOTH route and service layer
  (security-baseline.md's "Authorization" section), not just one?
- Any new/changed field that touches a "critical path" per testing-strategy.md's definition (auth,
  payments, photo upload/anonymization) — does it get the elevated scrutiny that implies (input
  validation, explicit tests, no silent fallback on invalid input)?
- Input validation: is every new input whitelisted (allowed values enumerated) rather than
  blacklisted, per security-baseline.md's "Input validation" section? Any new field that skips
  Pydantic/schema-level validation and reaches storage some other way?
- SQL/data-layer: parameterized queries only, no raw string concatenation, multi-tenant city_id
  scoping preserved on every touched query.
- Migrations: does a new data migration correctly target only the intended rows (no risk of an
  overly broad WHERE, or a hardcoded value that breaks if the referenced row doesn't exist in a
  given environment)?
- LGPD/GDPR: does anything here touch PII in a way that needs to respect data-minimization, right-
  of-erasure, or consent rules from security-baseline.md's "LGPD/GDPR compliance" section?
Report each with severity (Critical/High/Medium/Low per the security-reviewer agent's own
convention), file:line, and concrete exploit/failure scenario.`,
  },
  {
    key: 'info-leakage',
    label: 'Information leakage & missing security checks',
    agentType: 'security-reviewer',
    prompt: `${CONTEXT}

Your lens: INFORMATION LEAKAGE & MISSING SECURITY CHECKS. Concretely:
- Error responses: does any new/changed error path leak internal details (stack traces, raw
  exception text, internal field names, whether a resource exists when it shouldn't — security-
  baseline.md's "Forbidden returns 404 rather than 403 when leakage of resource existence is a
  concern")?
- Timing: does any new comparison (credentials, tokens, existence checks) risk a timing side-
  channel the way security-baseline.md's constant-time login example addresses — and does new code
  preserve that property or accidentally short-circuit it?
- Logging: does anything new log PII, secrets, or tokens (security-baseline.md: "PII is never
  logged")?
- Rate limiting: does a new public-facing or resource-creating endpoint need it and lack it, per
  security-baseline.md's "Rate limiting" section?
- IDOR: does every new resource-scoped operation check the AUTHENTICATED user's permission for
  THIS SPECIFIC instance, not just the resource type in general?
- Secrets: any hardcoded credentials, tokens, or environment-specific literals that shouldn't be
  committed?
- Cookies/session state (if touched): correct secure/httpOnly/sameSite flags for what the cookie
  is actually used for (contrast a sensitive cookie against a non-sensitive preference cookie —
  they should NOT have identical settings if their sensitivity differs).
Report each with severity, file:line, and concrete scenario: what could an attacker/observer
actually learn or do because of this, specifically.`,
  },
]

const DIMENSIONS = ALL_DIMENSIONS.filter((d) => !skipDimensions.has(d.key))

if (DIMENSIONS.length < ALL_DIMENSIONS.length) {
  log(`Skipping ${ALL_DIMENSIONS.length - DIMENSIONS.length} dimension(s) per skipDimensions: ${[...skipDimensions].join(', ')}`)
}

const reviewed = await pipeline(
  DIMENSIONS,
  (d) =>
    agent(d.prompt, {
      label: `review:${d.key}`,
      phase: 'Review',
      agentType: d.agentType,
      schema: FINDINGS_SCHEMA,
    }),
  (review, d) =>
    agent(
      `${CONTEXT}

You are a skeptical rebuttal reviewer. Another reviewer just produced this report on the
"${d.label}" dimension of ${target}:

${JSON.stringify(review, null, 2)}

For EACH finding above, independently verify it against the actual code (Read/Grep the real files —
don't just trust the description) and decide: UPHELD (real, as described), OVERRULED (not actually
a problem — explain why, e.g. it's already handled elsewhere, or the concern doesn't apply here),
DOWNGRADED (real but less severe than claimed), or UPGRADED (real and worse than claimed). Also
list anything significant this reviewer missed within the same "${d.label}" lens. Be genuinely
adversarial — catch a reviewer being wrong, lazy, or citing a file:line that doesn't say what they
claimed. Default to skepticism, not agreement.`,
      { label: `debate:${d.key}`, phase: 'Debate', agentType: d.agentType, schema: DEBATE_SCHEMA },
    ).then((debate) => ({ dimension: d.key, label: d.label, review, debate })),
)

log(`Debated ${reviewed.length} dimension(s). Synthesizing final verdict...`)

const finalReport = await agent(
  `${CONTEXT}

You have the full debated review of ${target} across ${reviewed.length} dimensions. Here is the
complete data — each dimension's original findings AND the adversarial rebuttal against them:

${JSON.stringify(reviewed, null, 2)}

Write the final consolidated report as markdown, structured as:

# ${target} — Debate Review

## Verdict
One paragraph: is this change sound as-is, and what (if anything) is the single most important
follow-up?

## Confirmed issues (upheld after debate)
For each: severity, one-line description, file:line, concrete recommendation. Group by dimension.
Only include findings whose debate verdict was upheld, upgraded, or downgraded (not overruled).

## Overruled / non-issues
Briefly list findings that were raised but overruled in debate, with the one-line reason why — so
the same non-issue doesn't get re-litigated by a future reviewer.

## Test coverage gaps (unit + E2E combined)
A concrete, prioritized punch list of untested scenarios worth adding, ordered by how likely each
is to catch a real regression.

## Security findings
Data-security and information-leakage findings, combined and prioritized by severity — this
section should stand on its own since it's often what a reader jumps to first.

## Where the reviewers disagreed
Call out any dimension where the rebuttal significantly changed the verdict (overruled a
high-severity claim, or upgraded a low-severity one) — this is the most information-dense part of
a debate and should not get lost in the summary.

Keep it tight — this goes directly to the user, not into another round of processing.`,
  { phase: 'Synthesize', label: 'final-synthesis' },
)

return finalReport

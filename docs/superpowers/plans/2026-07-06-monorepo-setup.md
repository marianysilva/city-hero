# Monorepo Setup (Reconciled) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close out `docs/tasks/00-foundation/01-monorepo-setup.md` by adding the root tooling (Prettier, Husky, lint-staged, commitlint, PR template, branch protection, shared `tsconfig`) that doesn't exist yet, and by correcting every doc reference from `apps/city-hero` to the real folder name `apps/city-hero`.

**Architecture:** No new runtime code. This is pure repo-tooling work: one root-level config file per concern (Prettier, tsconfig base, lint-staged, commitlint), two Husky git hooks wired to those configs, a GitHub PR template, a GitHub branch-protection API call, and a scripted docs find/replace.

**Tech Stack:** npm workspaces + Turborepo (already in place), Husky v9, lint-staged, Prettier 3, commitlint (conventional-commits config), `gh` CLI for branch protection.

## Global Constraints

- Do not migrate off npm/Turborepo — Yarn Berry from the original task spec is explicitly rejected (confirmed by user).
- Do not rename `apps/city-hero` to `apps/city-hero` — the folder name stays; docs get corrected instead (confirmed by user).
- Do not create `packages/api_client`, `packages/i18n`, or `apps/ai_service` — those belong to foundation tasks 05, 13, 16 respectively (YAGNI).
- Conventional Commits prefixes allowed: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci` (from `CLAUDE.md` → Git Conventions).
- Git hooks must not break the existing CI jobs (`Backend · Lint (ruff)`, `Backend · Tests (pytest)`, `Web · Lint + Type Check`, `Web · Build (next build)`, `Mobile · Type Check`, `Mobile · Lint (eslint)`, `Mobile · Tests (jest-expo)`, `Docker · Backend image builds`) — CI never runs `git commit`, so hook installation via `npm ci`'s `prepare` script is harmless, but each task's verification step must confirm the corresponding `turbo run lint` / `turbo run typecheck` still passes repo-wide.
- Repo: `marianysilva/city-hero`, default branch `main`.

---

### Task 1: Rename sweep — `apps/city-hero` → `apps/city-hero` in docs

**Files:**

- Modify: `CLAUDE.md` (2 occurrences)
- Modify: 183 files under `docs/**` (206 total occurrences of the literal string `apps/city-hero`)
- Modify: `docs/tasks/00-foundation/01-monorepo-setup.md:68` (one occurrence that is NOT the `apps/city-hero` string — it's a bare `mobile/` line inside an ASCII folder-tree diagram, handled separately since a blind `mobile` → `city-hero` replace would corrupt unrelated prose elsewhere in the same files, e.g. "mobile-first", "React Native (mobile)")

**Interfaces:**

- Consumes: nothing (first task, no code dependency)
- Produces: every doc path reference now reads `apps/city-hero/...`, matching the real folder on disk. All later tasks that touch these docs (Task 7) build on this corrected state.

- [ ] **Step 1: Confirm current occurrence count**

Run: `grep -rlo "apps/city-hero" docs/ CLAUDE.md | wc -l` (counts matching files)
Expected: `184`

- [ ] **Step 2: Run the scripted replace**

```bash
git grep -lz "apps/city-hero" -- docs CLAUDE.md | xargs -0 sed -i 's#apps/city-hero#apps/city-hero#g'
```

- [ ] **Step 3: Fix the one bare tree-diagram line by hand**

In `docs/tasks/00-foundation/01-monorepo-setup.md`, find the folder-structure
block (around line 68) and change:

```
│   ├── mobile/                  # Expo
```

to:

```
│   ├── city-hero/               # Expo
```

- [ ] **Step 4: Verify zero remaining `apps/city-hero` references**

Run: `grep -rn "apps/city-hero" docs/ CLAUDE.md`
Expected: no output (exit code 1)

- [ ] **Step 5: Verify no unintended damage to unrelated "mobile" prose**

Run: `git diff --stat`
Expected: only files that legitimately contained `apps/city-hero` are listed
(184 files + the one manual edit = 185). Spot-check 3 random files from the
diff to confirm only the path string changed, e.g.:

```bash
git diff docs/tasks/01-splash/02-app-initialization.md | head -20
```

- [ ] **Step 6: Commit**

```bash
git add -A -- docs CLAUDE.md
git commit -m "docs: correct apps/city-hero references to the real apps/city-hero path"
```

---

### Task 2: Shared root `tsconfig.base.json`

**Files:**

- Create: `tsconfig.base.json`
- Modify: `apps/web/tsconfig.json`
- Modify: `apps/city-hero/tsconfig.json`
- Modify: `packages/types/tsconfig.json`

**Interfaces:**

- Consumes: nothing
- Produces: `tsconfig.base.json` at repo root, extended via relative path
  `../../tsconfig.base.json` by any TS project two levels deep
  (`apps/*/tsconfig.json`, `packages/*/tsconfig.json`).

- [ ] **Step 1: Create the base config**

Create `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- [ ] **Step 2: Wire `apps/web/tsconfig.json` to extend it**

Modify `apps/web/tsconfig.json` — add `"extends"` as the first key, keep
every existing key under `compilerOptions` as-is (they override the base,
which is intended: Next.js needs `target: ES2017`):

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Verify web typecheck still passes**

Run: `cd apps/web && npx tsc --noEmit`
Expected: no errors (exit code 0)

- [ ] **Step 4: Wire `apps/city-hero/tsconfig.json` to extend both configs**

TypeScript 5.9 (already the resolved version in this repo — confirmed via
`node -e "console.log(require('./node_modules/typescript/package.json').version)"`
→ `5.9.3`) supports an array in `"extends"`, where later entries win.
Modify `apps/city-hero/tsconfig.json`:

```json
{
  "extends": ["expo/tsconfig.base", "../../tsconfig.base.json"],
  "compilerOptions": {
    "strict": true,
    "types": ["jest"],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

- [ ] **Step 5: Verify mobile typecheck still passes**

Run: `cd apps/city-hero && npx tsc --noEmit`
Expected: no errors (exit code 0). If it fails because `tsconfig.base.json`'s
`module`/`moduleResolution` conflicts with Expo's Metro bundler expectations,
remove `"module"` and `"moduleResolution"` from `tsconfig.base.json` and
re-run this step — Expo's own base already sets the correct values for
Metro, and `apps/web` doesn't need those two specific keys duplicated (it
already redeclares them locally in Step 2).

- [ ] **Step 6: Simplify `packages/types/tsconfig.json` to extend the base**

Modify `packages/types/tsconfig.json` — drop every key that's now inherited:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

- [ ] **Step 7: Verify packages/types typecheck still passes**

Run: `cd packages/types && npx tsc --noEmit`
Expected: no errors (exit code 0)

- [ ] **Step 8: Commit**

```bash
git add tsconfig.base.json apps/web/tsconfig.json apps/city-hero/tsconfig.json packages/types/tsconfig.json
git commit -m "chore: add shared root tsconfig.base.json"
```

---

### Task 3: Root ESLint shared layer + Prettier config

**Files:**

- Create: `eslint.config.base.js`
- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Modify: `apps/web/eslint.config.mjs`
- Modify: `apps/city-hero/eslint.config.js`
- Modify: `package.json` (add `prettier` + `eslint-plugin-import`
  devDependencies, `format`/`format:check` scripts)

**Interfaces:**

- Consumes: nothing
- Produces: `eslint.config.base.js` (a plain CommonJS array of ESLint flat
  config objects, spread into both `apps/web/eslint.config.mjs` and
  `apps/city-hero/eslint.config.js`), `.prettierrc.json` (read automatically
  by any `prettier` invocation anywhere in the repo), and the `prettier`
  binary at `node_modules/.bin/prettier` — consumed by Task 4's lint-staged
  config.

**Why one shared file works across both apps:** `apps/web/eslint.config.mjs`
is ESM, `apps/city-hero/eslint.config.js` is CommonJS. Writing the shared
base as **CommonJS** (`eslint.config.base.js`, `module.exports = [...]`)
lets the CJS app `require()` it directly, and the ESM app `import` it —
Node's ESM loader exposes a CJS module's `module.exports` as the default
import, so `import shared from "../../eslint.config.base.js"` works from
`apps/web`'s `.mjs` file without any extra interop config. Writing the base
as `.mjs` instead would break `apps/city-hero`'s `require()`.

- [ ] **Step 1: Install the shared dependencies**

Run: `npm install -D prettier eslint-plugin-import`

- [ ] **Step 2: Create the shared ESLint base config**

Create `eslint.config.base.js`:

```js
// Shared layer spread into each app's own framework config (Next.js in
// apps/web, Expo in apps/city-hero) — only rules that make sense across
// both belong here.
const importPlugin = require("eslint-plugin-import");

module.exports = [
  {
    plugins: { import: importPlugin },
    rules: {
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
];
```

- [ ] **Step 3: Spread it into `apps/web/eslint.config.mjs`**

Modify `apps/web/eslint.config.mjs`:

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import sharedConfig from "../../eslint.config.base.js";

const eslintConfig = defineConfig([
  ...sharedConfig,
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
```

- [ ] **Step 4: Verify web lint still passes**

Run: `cd apps/web && npx eslint .`
Expected: exits `0` (or only pre-existing warnings, no new errors from
`import/order` — if it flags real out-of-order imports, that's a legitimate
finding; fix with `npx eslint . --fix`).

- [ ] **Step 5: Spread it into `apps/city-hero/eslint.config.js`**

Modify `apps/city-hero/eslint.config.js`:

```js
// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const sharedConfig = require("../../eslint.config.base.js");

module.exports = defineConfig([
  ...sharedConfig,
  expoConfig,
  {
    ignores: ["dist/*"],
  },
]);
```

- [ ] **Step 6: Verify mobile lint still passes**

Run: `cd apps/city-hero && npx eslint .`
Expected: exits `0` (or only pre-existing warnings; fix real `import/order`
findings with `npx eslint . --fix`).

- [ ] **Step 7: Create the Prettier config**

Create `.prettierrc.json`:

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

- [ ] **Step 8: Create the ignore file**

Create `.prettierignore`:

```
node_modules
.next
.expo
dist
build
coverage
package-lock.json
*.svg
```

- [ ] **Step 9: Add root scripts**

Modify `package.json` — add two entries to `"scripts"`:

```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```

- [ ] **Step 10: Verify Prettier runs cleanly**

Run: `npm run format:check`
Expected: exits non-zero and lists currently-unformatted files (this is
expected — nothing has been formatted yet). Then run `npm run format`
followed by `npm run format:check` again.
Expected: second `format:check` run exits `0` with no output.

- [ ] **Step 11: Verify lint and typecheck still pass after reformatting**

Run: `npm run lint && npm run typecheck`
Expected: both succeed — Prettier reformatting must not introduce syntax
errors or trip any existing lint rule.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: add shared root ESLint layer and Prettier config"
```

---

### Task 4: Husky + lint-staged pre-commit hook

**Files:**

- Create: `.husky/pre-commit`
- Create: `.lintstagedrc.json`
- Modify: `package.json` (add `husky` + `lint-staged` devDependencies, `prepare` script)

**Interfaces:**

- Consumes: `prettier` binary and `.prettierrc.json` from Task 3, and the
  updated `apps/web/eslint.config.mjs` / `apps/city-hero/eslint.config.js`
  (now spreading `eslint.config.base.js`) from Task 3; `ruff` on `PATH` for
  staged Python files (installed via `pip install ruff`, same as the
  `Backend · Lint (ruff)` CI job).
- Produces: a working `pre-commit` git hook. Task 5 adds a second hook
  (`commit-msg`) to the same `.husky/` directory created here.

- [ ] **Step 1: Install Husky and lint-staged**

Run: `npm install -D husky lint-staged`

- [ ] **Step 2: Add the `prepare` script and initialize Husky**

Modify `package.json` — add to `"scripts"`:

```json
"prepare": "husky"
```

Run: `npm run prepare`
Expected: creates a `.husky/` directory (if not already present) and a
`.husky/_/` internal folder (gitignored automatically by Husky v9).

- [ ] **Step 3: Create the lint-staged config**

Create `.lintstagedrc.json`:

```json
{
  "apps/backend/**/*.py": ["ruff check --fix"],
  "apps/web/**/*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
  "apps/city-hero/**/*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
  "packages/**/*.{ts,tsx}": ["prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"]
}
```

- [ ] **Step 4: Create the pre-commit hook**

Create `.husky/pre-commit`:

```
npx lint-staged
```

- [ ] **Step 5: Verify the hook blocks a bad commit**

```bash
echo "export const bad = ( )=>{return 1}" >> apps/web/app/lib/api.ts
git add apps/web/app/lib/api.ts
git commit -m "test: trigger lint-staged"
```

Expected: the commit is blocked — `eslint --fix` either fixes it silently
(if it's just a style issue) or fails with a lint error. If ESLint
auto-fixes and the commit succeeds, that's also a valid pass (lint-staged
ran); confirm by checking `git log -1 --oneline` shows the test commit,
then verify the file changed and revert:

```bash
git reset --soft HEAD~1
git checkout -- apps/web/app/lib/api.ts
```

- [ ] **Step 6: Verify a clean commit succeeds**

```bash
git commit --allow-empty -m "test: verify clean commit passes lint-staged"
```

Expected: commit succeeds immediately (no staged files matched, or all
matched files pass).

Run: `git reset --hard HEAD~1` to remove the empty test commit (safe here —
it has no content and was just created in this same step).

- [ ] **Step 7: Commit the hook setup itself**

```bash
git add .husky/pre-commit .lintstagedrc.json package.json package-lock.json
git commit -m "chore: add Husky pre-commit hook running lint-staged"
```

---

### Task 5: commitlint commit-msg hook

**Files:**

- Create: `commitlint.config.js`
- Create: `.husky/commit-msg`
- Modify: `package.json` (add `@commitlint/cli` + `@commitlint/config-conventional` devDependencies)

**Interfaces:**

- Consumes: `.husky/` directory created in Task 4.
- Produces: nothing consumed by later tasks — this is a terminal enforcement
  hook.

- [ ] **Step 1: Install commitlint**

Run: `npm install -D @commitlint/cli @commitlint/config-conventional`

- [ ] **Step 2: Create the commitlint config**

Create `commitlint.config.js`:

```js
module.exports = {
  extends: ["@commitlint/config-conventional"],
};
```

- [ ] **Step 3: Create the commit-msg hook**

Create `.husky/commit-msg`:

```
npx --no -- commitlint --edit "$1"
```

- [ ] **Step 4: Verify a bad commit message is rejected**

```bash
git commit --allow-empty -m "this has no conventional prefix"
```

Expected: commit is rejected with a commitlint error listing the allowed
types (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`, …).

- [ ] **Step 5: Verify a conventional commit message is accepted**

```bash
git commit --allow-empty -m "chore: verify commitlint accepts conventional messages"
```

Expected: commit succeeds.

Run: `git reset --hard HEAD~1` to remove the empty test commit.

- [ ] **Step 6: Commit the hook setup**

```bash
git add .husky/commit-msg commitlint.config.js package.json package-lock.json
git commit -m "chore: add commitlint commit-msg hook for conventional commits"
```

---

### Task 6: PR template

**Files:**

- Create: `.github/PULL_REQUEST_TEMPLATE.md`

**Interfaces:**

- Consumes: nothing
- Produces: nothing consumed by later tasks — GitHub picks this up
  automatically for every new PR.

- [ ] **Step 1: Create the template**

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```md
## Summary

<!-- What does this PR change, and why? -->

## Related issues

<!-- Closes #123, relates to #456 -->

## Test plan

<!-- How did you verify this? List commands run / scenarios exercised. -->

- [ ]

## Screenshots (if UI change)

<!-- Before/after, if applicable -->
```

- [ ] **Step 2: Commit**

```bash
git add .github/PULL_REQUEST_TEMPLATE.md
git commit -m "docs: add pull request template"
```

---

### Task 7: Update `docs/tasks/00-foundation/01-monorepo-setup.md` content

**Files:**

- Modify: `docs/tasks/00-foundation/01-monorepo-setup.md`

**Interfaces:**

- Consumes: the completed state of Tasks 1–6 (this task documents that they're done).
- Produces: nothing consumed by later tasks except Task 8, which flips the
  header status once branch protection (the one remaining item) is also done.

- [ ] **Step 1: Update the "Tooling decisions" section**

In `docs/tasks/00-foundation/01-monorepo-setup.md`, replace the "Tooling
decisions" section body:

```
- **JS package manager**: Yarn (Berry/v3+) using node-modules linker (PnP is incompatible with Expo). Pin the version in the repo so a new contributor doesn't accidentally mix versions.
```

with:

```
- **JS package manager**: npm workspaces + Turborepo (already in place before this task started — kept as-is rather than migrating to Yarn Berry; the original Yarn recommendation is superseded).
```

- [ ] **Step 2: Update the Definition of Done checklist**

Replace the full Definition of Done list with one reflecting reality:

```
## Definition of Done

- [x] Folder structure per the layout above (`apps/city-hero` instead of `apps/city-hero` — folder name decision, see `docs/superpowers/specs/2026-07-06-monorepo-setup-design.md`)
- [x] npm workspaces + Turborepo functional (superseding the original Yarn plan)
- [x] ESLint (shared root `eslint.config.base.js` spread into each app's Next.js/Expo config) + Prettier (shared root config) configured
- [x] Husky pre-commit and commit-msg hooks
- [x] CI pipeline running lint / typecheck / test / python-lint / python-test (already existed before this task)
- [ ] Branch protection enabled on `main`
- [x] PR template
- [x] Root README with setup instructions (already existed)
- [x] Comprehensive `.gitignore` (already existed)
- [x] Conventional commits enforced
```

- [ ] **Step 3: Commit**

```bash
git add docs/tasks/00-foundation/01-monorepo-setup.md
git commit -m "docs: reconcile monorepo-setup task doc with completed tooling work"
```

---

### Task 8: Branch protection on `main`

**Files:**

- Modify: `docs/tasks/00-foundation/01-monorepo-setup.md` (final status flip)

**Interfaces:**

- Consumes: the exact CI job names already running on `main` (`Backend ·
Lint (ruff)`, `Backend · Tests (pytest)`, `Web · Lint + Type Check`, `Web ·
Build (next build)`, `Mobile · Type Check`, `Mobile · Lint (eslint)`,
  `Mobile · Tests (jest-expo)`, `Docker · Backend image builds`).
- Produces: nothing consumed by later tasks — this is the final task.

**⚠️ Before running Step 1:** this changes how `main` accepts changes for
everyone going forward (direct pushes to `main`, including by the repo
owner unless `enforce_admins` is later flipped to `true`, will require a PR
with 1 approval and green required checks after this runs). Confirm with the
user immediately before applying, even though the design was already
approved — this is the one step in the whole plan that's live infrastructure,
not a file in the repo.

- [ ] **Step 1: Apply branch protection**

```bash
gh api repos/marianysilva/city-hero/branches/main/protection \
  -X PUT \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Backend · Lint (ruff)",
      "Backend · Tests (pytest)",
      "Web · Lint + Type Check",
      "Web · Build (next build)",
      "Mobile · Type Check",
      "Mobile · Lint (eslint)",
      "Mobile · Tests (jest-expo)",
      "Docker · Backend image builds"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
```

- [ ] **Step 2: Verify protection is active**

Run:

```bash
gh api repos/marianysilva/city-hero/branches/main/protection \
  --jq '{contexts: .required_status_checks.contexts, reviews: .required_pull_request_reviews.required_approving_review_count, linear: .required_linear_history.enabled, force_push: .allow_force_pushes.enabled}'
```

Expected output:

```json
{
  "contexts": [
    "Backend · Lint (ruff)",
    "Backend · Tests (pytest)",
    "Web · Lint + Type Check",
    "Web · Build (next build)",
    "Mobile · Type Check",
    "Mobile · Lint (eslint)",
    "Mobile · Tests (jest-expo)",
    "Docker · Backend image builds"
  ],
  "reviews": 1,
  "linear": true,
  "force_push": false
}
```

- [ ] **Step 3: Flip the task doc status to done**

In `docs/tasks/00-foundation/01-monorepo-setup.md`:

- Change `**Status:** ⬜ Not started` (header) to `**Status:** ✅ Done`
- Change the last remaining Definition of Done line from
  `- [ ] Branch protection enabled on \`main\``to`- [x] Branch protection enabled on \`main\``

- [ ] **Step 4: Commit**

Note: from this point on, direct pushes to `main` are blocked — this final
commit (and everything after it) must go through a PR.

```bash
git checkout -b chore/finish-monorepo-setup
git add docs/tasks/00-foundation/01-monorepo-setup.md
git commit -m "docs: mark monorepo-setup task done — branch protection enabled"
git push -u origin chore/finish-monorepo-setup
gh pr create --title "chore: finish monorepo-setup foundation task" --body "Closes out 00-foundation/01-monorepo-setup.md — branch protection is the last item, enabled in this same change. See docs/superpowers/specs/2026-07-06-monorepo-setup-design.md for the full reconciliation rationale."
```

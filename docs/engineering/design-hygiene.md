# Design Hygiene Log

Running log of **prototype artifacts that turned out not to be product
requirements**: pieces of UI that the original design exploration
included but, on review, were never fully defined, weren't essential,
or contradicted the product intent.

The goal is to catch these **before** implementation so they don't
become churn — every artifact in the prototype that hits an
implementation task becomes code, tests, and review cycles for
something nobody wanted.

## How this list grows

- When Mariany (or anyone) spots an element in `design/` (HTML
  protótipo) that feels under-specified or non-essential, add an entry
  below.
- Each entry has: **Where**, **What was there**, **Decision**, **Fix
  applied** (or **Open**), **Date**.
- Resolved entries stay in the log as a record of "we deliberately
  removed this and the reasons".

## Resolved

### H1 · Inconsistent step indicator + "Pular" across onboarding (Telas 02-05) — 2026-06-19

> ⚠️ **Superseded in part by H3 (2026-06-27):** a 5ª tela (Pacto Cidadão) foi inserida no fluxo, então a numeração final passou de "Passo X de 4" para "Passo X de 5". As decisões de remover "Pular" e adicionar back navigation permanecem válidas.

**Where:** Telas 02 (Escolher Cidade), 03 (Câmera IA), 04 (Gamificação),
05 (Seu bairro) — both in `design/src/screens/` and the task specs
under `docs/tasks/`.

**What was there:**

- Tela 02 had "Passo 2 de 5" but no "Pular".
- Telas 03, 04, 05 had a "Pular" button (top-right) but no step indicator.
- The "5" in "Passo 2 de 5" had no clear referent — there were only
  4 actionable steps in the flow.
- "Pular" let the user exit onboarding from any of the tutorial steps,
  which contradicts the product intent of "understanding the app on
  first launch is essential".

**Decision:** Make the four onboarding screens (02, 03, 04, 05)
**fully consistent**:

- Add `Passo X de 4` to every screen. Numbering: 02=1/4, 03=2/4,
  04=3/4, 05=4/4. (Splash is not a step — it doesn't ask for any
  action.)
- **Remove "Pular" everywhere.** The user must complete all 4 steps.
- Add a back button on 03, 04, 05 (and disable it on 02 since there's
  no previous step). The user can revisit a step but not skip ahead.
- Tela 05 still has a **"Permitir depois"** link — but that's
  permission-deferral, not onboarding-skip. The user did see all 4
  steps and the flow is marked complete.

**Fix applied:**

- `design/src/screens/02-city-select.js` → "Passo 1 de 4"
- `design/src/screens/03-onboarding-camera.js` → back + "Passo 2 de 4" (removed Pular)
- `design/src/screens/04-onboarding-gamification.js` → back + "Passo 3 de 4" (removed Pular)
- `design/src/screens/05-onboarding-neighborhood.js` → back + "Passo 4 de 4" (removed Pular)
- Task specs updated to match: `02-city-select/01`, `03-onboarding-camera/01`, `03-onboarding-camera/02-onboarding-step-machine.md`, `03-onboarding-camera/_README.md`, `04-onboarding-gamification/01`, `05-onboarding-neighborhood/01`, `05-onboarding-neighborhood/02-location-permission.md`, `05-onboarding-neighborhood/_README.md`.
- State machine no longer exposes `skip()`; only `next()` and `back()`. Analytics event `onboarding.skipped` removed; `onboarding.step_back` added in its place.
- `StepIndicator` molecule (already in design system) consumed by all 4 screens with `{ step, total: 4 }`.

---

### H3 · Inserção da tela "Pacto Cidadão" (04b) no onboarding — 2026-06-27

**Where:** novo arquivo `design/src/screens/04b-onboarding-community-pact.js` + nova pasta `docs/tasks/04b-onboarding-community-pact/` (com `_README.md` + 4 sub-tasks).

**What was new:** Antes do onboarding tinha 4 passos (Escolher Cidade → Câmera IA → Gamificação → Seu Bairro). Faltava uma tela que estabelecesse explicitamente o **pacto comunitário**: moderação de denúncias falsas e ofensas, consequências (XP / suspensão), identidade via Gov.br, LGPD, e o caráter apartidário (representamos o povo brasileiro, não partidos).

**Decision:** Adicionar uma 5ª tela entre Gamificação (04) e Seu Bairro (05). Numerada como **04b** no nome do arquivo (não renomear as 25+ telas seguintes só pra acomodar a inserção). No fluxo: vira o **Passo 4 de 5**.

**Fix applied:**

- Protótipo: criado `04b-onboarding-community-pact.js` com header (back + Passo 4 de 5), hero rotativo por faixa etária (`<18`, `+18`, `+30`, `+60` — Gov.br escolhe em produção, demo rotaciona a cada 10s), 5 cards (🇧🇷 Comunidade-não-política → 🚨 falsas denúncias → ⚖️ consequências → 🔐 identidade → 🛡️ LGPD), sticky footer com checkbox de aceite dos termos + CTA gating, e modal bottom-sheet com rascunho dos termos da plataforma (9 cláusulas).
- Registry `screens/index.js` atualizado: `onbPact` inserido entre `onbGame` e `onbHood`.
- Step indicators das outras 4 telas de onboarding bumpados de "de 4" pra "de 5" (`02/01`, `03/01`, `04/01`, `05/01`).
- State machine (`03/02-onboarding-step-machine.md`) atualizada: 5 steps, novo step key `community_pact` entre `gamification` e `neighborhood`, todos os Given/When/Then e DoD ajustados.
- READMEs de 03 e 05 atualizados (Step X of 5 + nova ordem incluindo Community Pact).
- 04/01 e 05/01: referências internas de Next/Back ajustadas pra apontar pra Community Pact.
- Docs novas em `docs/tasks/04b-onboarding-community-pact/`: `_README.md` + `01-render-community-pact-ui.md` + `02-age-tailored-message-rotator.md` + `03-terms-modal.md` + `04-accept-terms-gate.md`.
- Master `docs/tasks/README.md` atualizado: 04b adicionada na árvore de pastas + coverage atualizado pra "31 screens".

**Reuso aplicado:** o modal de termos é candidato a virar `TermsModal` em `packages/design_system/src/organisms/` quando a tela 28 (Citizen Profile / Settings) também precisar (re-exibir termos pra novas versões, ou exibir versão histórica). Decisão registrada em `open-questions.md` Q-pendente: "promover TermsModal pro design system quando segundo consumer chegar".

---

### H2 · Dois protótipos paralelos (monolítico + modular) — 2026-06-19

**Where:** `design/index.html` (monolítico, 4015 linhas, todas as
telas inline) vs `design/prototype.html` + `design/src/screens/*.js`
(modular, ES modules, 29 telas).

**What was there:** Dois protótipos coexistiam na pasta `design/` com
o mesmo conteúdo duplicado. Edições feitas nos `src/screens/*.js`
modulares não apareciam ao acessar `http://localhost:5173/`, porque o
Python serve `index.html` (o monolítico) por padrão. Mariany rodou
`python3 -m http.server` na pasta `design/` e viu o protótipo legado,
sem as alterações recentes (Passo X/4 + remoção do "Pular").

**Decision:** Manter apenas o protótipo **modular** como fonte única
de verdade. Princípio do reuso: nunca duplicar componente nem
documentação.

**Fix applied:**

- `git rm design/index.html` (remove o monolítico — git preserva no histórico).
- `git mv design/prototype.html design/index.html` (renomeia o modular pra ser servido por padrão).
- Reinício do `python3 -m http.server` faz `localhost:5173/` carregar a versão modular.
- Os 65 specs em `docs/tasks/*` que referenciam `design/index.html` continuam funcionando — o nome do arquivo se manteve.

---

## Open

(nothing yet — add new findings as bullets below; promote to a numbered
entry above when resolved.)

- _Add new prototype-vs-product gaps here..._

---

## Triaging convention

Use the same shape as `open-questions.md`:

- **Where** — which prototype file(s) + which task spec(s).
- **What was there** — the artifact as it stood.
- **Decision** — the call you made.
- **Fix applied** — the concrete edits, with paths.
- **Date** — when it was settled.

This log is meant to be reviewed alongside `open-questions.md`
(unresolved uncertainties) and the task catalog. It's the **artifact
removal log**, distinct from product roadmap and from open product
questions.

# SCREEN 24 · Irregularity Report

> **Group:** 02 · App Core\
> **Prototype screen:** `design/index.html` (search for `title: 'Denunciar irregularidade'`)\
> **Position in navigation:** From Programs hub footer, Bolsa Família detail, or directly from Mais
> menu

## Overview

CityHero **does not store** irregularity reports — this screen **orchestrates routing** to the
official channels (CGU, Ministério Público, Ouvidoria, TCU). The user picks the program/area, picks
the authority, fills the form (with pre-fills from context), reads the "como se identificar"
disclosure (anonymous vs identified, with the LAI implications), and the screen generates a
pre-formatted complaint that's handed off to the chosen channel via:

- **Email** (mailto: with body) — primary path.
- **Web form deep link** (if the authority has one).
- **In-app helper** (when an authority offers an API).

The user receives a confirmation page with the complaint reference (the channel's own protocol, not
a CityHero one).

## Features (6 tasks)

| #   | Task                                                                                           | Effort | Depends on                                               |
| --- | ---------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------- |
| 01  | [Render UI base · header + step indicator + slots](./01-render-irregularity-ui-base.md)        | S      | `00-foundation/02-design-tokens.md`                      |
| 02  | [Step 1 · Program/area selection](./02-step-1-program-selection.md)                            | S      | task 01                                                  |
| 03  | [Step 2 · Authority selection (CGU, MP, Ouvidoria, etc.)](./03-step-2-authority-selection.md)  | M      | task 01                                                  |
| 04  | [Step 3 · Form fields + pre-fills](./04-step-3-form-fields.md)                                 | M      | task 01                                                  |
| 05  | [Step 4 · Identification disclosure (anon vs identified + LAI)](./05-step-4-identification.md) | S      | task 01, `10-report-confirm/06-identification-toggle.md` |
| 06  | [Step 5 · Handoff to channel + confirmation](./06-step-5-handoff.md)                           | M      | task 01                                                  |

## Suggested implementation order

```
01 (UI shell) ──→ 02 (program) ──→ 03 (authority) ──→ 04 (form) ──→ 05 (identification) ──→ 06 (handoff)
```

## Product notes

- **CityHero never stores the irregularity report content.** Only telemetry tracks that a complaint
  was routed (event + authority + program category, no content).
- **Pre-formatted messages emphasize good citizenship**: structured, factual, with the user's
  context (program, address, location), and links to the source data they're flagging.
- **Anonymous routing**: when the channel supports it, the message is sent without identifying the
  user. CGU/MP usually require identification for follow-up — the disclosure makes this clear.
- **LAI references on identification**: the user must understand that some channels (TCU, MP)
  require identity for legitimate cases.
- **Confirmation screen**: shows the channel's protocol/reference number after submission so the
  user can follow up directly with that authority.

# Implementation Plan: EN/ES Parity

**Branch**: `006-bilingual-parity` | **Date**: 2026-11-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-bilingual-parity/spec.md`

## Summary

Make the whole site Spanish when ES is selected (Principle VI). Experience, Projects, Skills, the
Contact location line and the WhatsApp message move from component constants into
`src/lib/translations.ts`, typed so a missing key or a different number of bullets or items fails
the type check and therefore the build. The browser tab title follows the language through
a title owner in the existing language provider that re-applies the title on every route change. No new dependency and no new file under
`src/`. Decisions and the Spanish glossary are in [research.md](research.md); validation steps are
in [quickstart.md](quickstart.md).

## Technical Context

**Language/Version**: TypeScript 5, React 19, Node 24

**Primary Dependencies**: Next.js 16.4.5 (App Router), Tailwind CSS 3.4.19, Framer Motion 12.38
(all existing; none added)

**Storage**: N/A (content lives in `src/lib/translations.ts`; blog content in `content/blog`)

**Testing**: No test framework exists and none is added. Verification is `npm run lint`,
`npm run build`, `npx tsc --noEmit` (including a demonstration that a missing string fails), and
scripts kept in `.tmp/` (gitignored): key parity, an ES text scan with a headless browser, a facts
invariant check, tab-title checks, overflow and first-screen checks, and Lighthouse.

**Target Platform**: Modern evergreen browsers, 360px and up; hosted on Vercel

**Project Type**: Web application (single Next.js project)

**Performance Goals**: Lighthouse Performance and Accessibility on the home page each at least 90
and no drop greater than 3 points versus the pre-change baseline (best of 3)

**Constraints**: No new dependencies; no new files under `src/`; EN strings and the 14 owner-reviewed
ES strings from 005 unchanged; facts identical across languages; no layout or design change; no
horizontal overflow at 360px in ES

**Scale/Scope**: 51 new translation keys (26 Spanish prose strings for the owner to review, one of them
("+30 mil") already decided by the owner; 24 language-neutral; the WhatsApp message moved unchanged);
10 source files touched

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Result | Notes |
|-----------|--------|-------|
| I. Stack Fidelity | PASS | No new dependency |
| II. Component Conventions | PASS | Functional components, named exports; no new files in `src/`, so the structure list stays accurate; `"use client"` unchanged (all edited components are already client components) |
| III. Mobile-First | PASS | Spanish text is longer; 360px overflow check in ES is part of the plan |
| IV. Minimal UI (NON-NEGOTIABLE) | PASS | No visual change |
| V. Theme Through CSS Variables | PASS | No color change |
| VI. Bilingual Parity (NON-NEGOTIABLE) | PASS, with ONE recorded deviation | All visible prose in `translations.ts` with both languages; build fails on a missing string; language-neutral list explicit in the spec. Deviation: the meta description and Open Graph text stay English (see Complexity Tracking) |
| VII. Resilient Integrations | PASS | No external calls touched |
| Accessibility constraints | PASS | No change; `html lang` already follows the language |
| Workflow (build, lint, Lighthouse, Conventional Commits) | PASS | Planned in quickstart |

Post-design re-check: unchanged, all PASS.

## Project Structure

### Documentation (this feature)

```text
specs/006-bilingual-parity/
├── plan.md
├── research.md
├── quickstart.md
├── tasks.md             # Phase 2 output (/speckit-tasks)
├── es-review.md         # generated at the end: every new ES string for the owner's review
└── checklists/requirements.md
```

No `data-model.md` or `contracts/`: the feature has no new data model or external interface.

### Source Code (repository root)

```text
src/
├── lib/translations.ts                  # new typed groups (tuples); ES drafts for owner review
├── context/LanguageContext.tsx          # owns the tab title: registry + re-apply on route/language change
├── components/
│   ├── WhatsAppButton.tsx               # message from translations
│   ├── BlogIndex.tsx                    # registers the "/blog" title
│   ├── LocalizedPost.tsx                # registers the post title in the active language
│   ├── BlogNotFound.tsx                 # registers the site title
│   └── sections/
│       ├── Experience.tsx               # reads t.experience.*
│       ├── Projects.tsx                 # titles and descriptions from t.projects.items
│       ├── Skills.tsx                   # groups and labels from t.skills
│       └── Contact.tsx                  # location from t.contact.location
```

**Structure Decision**: Single Next.js project, existing layout, zero new files in `src/`. Tuple
types in the existing `Translation` type give the compile-time guarantee without new tooling.

## Complexity Tracking

One deviation from a NON-NEGOTIABLE principle, accepted by the owner on 2026-11-06 (spec.md, Owner
Decision 5). The constitution is not amended; the deviation is recorded here as Governance requires.

| Deviation | Why accepted | Simpler alternative rejected because |
|-----------|--------------|--------------------------------------|
| Principle VI: the page meta description and the Open Graph text stay English in both languages | Primary audience is US recruiters; this text is served before any script runs, so the client-side language switch cannot change it | Making it follow the language needs per-language URLs (`/es`), a routing change and a separate feature, now on the backlog (spec.md, Backlog) |

No other violations.

# Implementation Plan: EN/ES Parity

**Branch**: `006-bilingual-parity` | **Date**: 2026-11-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-bilingual-parity/spec.md`

## Summary

Make the whole site Spanish when ES is selected (Principle VI). Experience, Projects, Skills, the
Contact location line and the WhatsApp message move from component constants into
`src/lib/translations.ts`, typed so a missing key or a different number of bullets or items fails
the type check and therefore the build. The browser tab title follows the language through
client-side effects in components that already exist. No new dependency and no new file under
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

**Scale/Scope**: about 45 new ES/EN string pairs (8 experience bullets plus 2 roles and a
location, 3 project pairs, 5 skill groups with about 24 labels, location, WhatsApp message, 2 titles);
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
| VI. Bilingual Parity (NON-NEGOTIABLE) | PASS (this feature delivers it) | All user-facing prose in `translations.ts` with both languages; build fails on a missing string; language-neutral list explicit in the spec |
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
└── checklists/requirements.md
```

No `data-model.md` or `contracts/`: the feature has no new data model or external interface.

### Source Code (repository root)

```text
src/
├── lib/translations.ts                  # new typed groups (tuples); ES drafts for owner review
├── context/LanguageContext.tsx          # tab title for "/"
├── components/
│   ├── WhatsAppButton.tsx               # message from translations
│   ├── BlogIndex.tsx                    # tab title for "/blog"
│   ├── LocalizedPost.tsx                # tab title = post title in active language
│   ├── BlogNotFound.tsx                 # tab title = site title
│   └── sections/
│       ├── Experience.tsx               # reads t.experience.*
│       ├── Projects.tsx                 # titles and descriptions from t.projects.items
│       ├── Skills.tsx                   # groups and labels from t.skills
│       └── Contact.tsx                  # location from t.contact.location
```

**Structure Decision**: Single Next.js project, existing layout, zero new files in `src/`. Tuple
types in the existing `Translation` type give the compile-time guarantee without new tooling.

## Complexity Tracking

No constitution violations to justify. One residual limitation is accepted by the owner
(2026-11-06): meta description and social-preview text stay English because they are read before
scripts run (spec FR-022).

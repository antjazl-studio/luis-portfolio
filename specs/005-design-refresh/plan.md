# Implementation Plan: Design Refresh

**Branch**: `005-design-refresh` | **Date**: 2026-11-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-design-refresh/spec.md`

## Summary

Apply constitution v1.1.0, `PRODUCT.md`, `DESIGN.md` and the approved mock
`mocks/hero-dark.html` to the live site: (US1) swap the theme to the dark token set and rebuild
the hero; (US2) remove every Principle IV banned pattern and the eyebrow labels; (US3) bring the
site to WCAG AA (contrast, focus ring, reduced motion, skip link, 44px targets, `<html lang>`,
localized aria-labels, `svh`); (US4) mark the blog parts of spec 001 as superseded by spec 002.
Approach: no new dependencies and no new files under `src/`; changes are edits to
`globals.css`, `tailwind.config.ts`, `layout.tsx`, `translations.ts`, `LanguageContext.tsx`,
`Navbar.tsx`, `Footer.tsx`, `WhatsAppButton.tsx`, the blog components and all six sections.
Decisions and rationale are in [research.md](research.md); validation steps in
[quickstart.md](quickstart.md).

## Technical Context

**Language/Version**: TypeScript 5, React 19, Node 24

**Primary Dependencies**: Next.js 16.4.5 (App Router), Tailwind CSS 3.4.19, Framer Motion 12.38,
`@tailwindcss/typography` (all existing; none added)

**Storage**: N/A (static content; language state in memory only)

**Testing**: No test framework exists and none is added. Verification is `npm run lint`,
`npm run build`, grep checks, a WCAG contrast script run from `.tmp/`, Lighthouse, and browser
checks listed in quickstart.md.

**Target Platform**: Modern evergreen browsers, mobile (360px minimum) and desktop; hosted on
Vercel

**Project Type**: Web application (single Next.js project)

**Performance Goals**: Lighthouse Performance and Accessibility on the home page each at least 90
and no drop greater than 3 points versus the pre-change baseline (best of 3 runs)

**Constraints**: Dark-only theme; accent only on links and focus rings; neutral CTAs; no
horizontal overflow at 360px; all strings EN and ES; the constitution is amended only by the owner-approved v1.2.0 amendment

**Scale/Scope**: 1 home page (6 sections), blog index, blog post, 404; about 20 source files
touched

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Result | Notes |
|-----------|--------|-------|
| I. Stack Fidelity | PASS | No new dependency; Next, TypeScript, Tailwind, Framer Motion only |
| II. Component Conventions | PASS | Functional components, named exports; `"use client"` unchanged in kind. No new files in `src/`, so the structure list in the constitution and `CLAUDE.md` stays accurate (skip link lives in `Navbar.tsx`; `MotionConfig` lives in `LanguageContext.tsx`) |
| III. Mobile-First | PASS | Hero stacks below 800px, two columns from 800px; 360px overflow check in quickstart |
| IV. Minimal UI (NON-NEGOTIABLE) | PASS | Feature removes all current violations. The hero float animation is dropped (Principle IV marks it approved, not required; DESIGN.md says no float). See research.md R2 |
| V. Theme Through CSS Variables | PASS | Tokens match the table exactly (v1.2.0, incl. `--status-available`). Brand marks are exempt under the v1.2.0 clause; remaining small literals listed in Complexity Tracking |
| VI. Bilingual Parity | PASS | All new and changed strings added to EN and ES; a11y labels moved into translations |
| VII. Resilient Integrations | PASS | No external calls touched |
| Accessibility constraints (reduced motion MUST, WCAG AA) | PASS | Implemented by US3 |
| Workflow (build, lint, Lighthouse, Conventional Commits) | PASS | Planned in quickstart |

Post-design re-check: unchanged, all PASS.

## Project Structure

### Documentation (this feature)

```text
specs/005-design-refresh/
├── plan.md
├── research.md
├── quickstart.md
├── tasks.md             # Phase 2 output (/speckit-tasks)
├── checklists/requirements.md
└── mocks/hero-dark.html
```

No `data-model.md` or `contracts/`: the feature has no data model or external interface.

### Source Code (repository root)

```text
src/
├── app/
│   ├── globals.css            # tokens, focus ring, reduced-motion block, selection
│   ├── layout.tsx             # metadata (9 years), <main> target id lives in pages
│   ├── page.tsx               # main landmark id="main"
│   ├── not-found.tsx          # unchanged (renders BlogNotFound, which owns its <main>)
│   └── blog/...               # pages only if main landmark lives there
├── components/
│   ├── Navbar.tsx             # skip link, plain-text language toggle, solid bar, targets
│   ├── Footer.tsx             # tokens, localized labels, targets
│   ├── WhatsAppButton.tsx     # flat, focus ring, localized label, target
│   ├── BlogCard.tsx, BlogIndex.tsx, LocalizedPost.tsx, BlogNotFound.tsx,
│   │   MarkdownBody.tsx       # tokens, svh, main id, link style
│   └── sections/              # Hero (rewrite), About, Experience, Skills, Projects, Contact
├── context/LanguageContext.tsx # sets html lang; wraps MotionConfig reducedMotion="user"
└── lib/translations.ts        # new hero.* and a11y.* strings, 9 years
tailwind.config.ts             # + border-strong, focus-ring colors
specs/001-baseline-current-portfolio/spec.md   # superseded markers only
DESIGN.md                      # short "Implemented" note after build
```

**Structure Decision**: Single Next.js project, existing layout. Zero new files in `src/`
because the constitution's Principle II lists the component files explicitly and structural
changes would require a constitution amendment, which is out of scope.

## Complexity Tracking

Resolved by the owner on 2026-11-06 (Owner Decision 1 in spec.md): constitution v1.2.0 added the
`--status-available` token and a third-party brand-marks exemption. What remains outside the token
table is listed here so the reviewer can see it; none adds scope.

| Item | Status | Why |
|------|--------|-----|
| Availability dot `#34D399` | Now the `--status-available` token (constitution v1.2.0); used via `bg-status-available` in `Hero.tsx` and `Contact.tsx` | Owner-approved mock; Principle IV approves a static status dot with plain text |
| WhatsApp button fill `#25D366` | Exempt: third-party brand mark (constitution v1.2.0) | Recognizable brand affordance, pre-existing |
| `linearGradient` inside the Azure logo SVG in `About.tsx` | Exempt: artwork inside a third-party brand mark (constitution v1.2.0); Principle IV is not relaxed for the site's own UI | Redrawing a flat logo would change a third-party mark |
| Neutral selection highlight `rgba(255,255,255,.2)` in `globals.css` | Remains a documented literal: white at low alpha, the same family as the approved `ring-white/[0.07]` | A token for it would add surface area for no benefit |
| Skip link `bg-white text-neutral-900` | Approved neutral primary pair of Principle IV | Same pair as the primary CTA |

Pre-existing and left as is (out of scope): English-only experience, project and skill-group prose
(baseline deviation D-041).

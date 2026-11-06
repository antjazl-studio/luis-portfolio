# Implementation Plan: Quick Fixes — Blog Navigation, Experience Entry, Dependency Security

**Branch**: `003-quick-fixes` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-quick-fixes/spec.md`. Owner direction: keep it
minimal; `next/link` + `usePathname` for navigation; Footer rendered once in the root layout;
Experience data in translations; `npm audit fix` without `--force`; no new dependencies.

## Summary

Three small changes on the existing Next.js 14 App Router site:

1. **Navigation and footer**: `Navbar` renders section items and the "LJ" monogram as
   `next/link` links to `/#<section>` and `/`. On the home page the click handler keeps today's
   smooth scroll; on any other page the default link navigation takes the visitor home. The Blog
   item is active when the path is `/blog` or starts with `/blog/`. The scroll-spy effect
   re-subscribes on route change (otherwise highlighting breaks after client-side navigation
   back to home). `<Footer />` is rendered once in `src/app/layout.tsx` and removed from
   `src/app/page.tsx`, so every page, including 404s, shows exactly one footer.
2. **Experience**: the "Previous Role" entry becomes Full Stack Developer at Logiztik Alliance
   Group, Oct 2019 – Apr 2020; its role, period and bullets live in `lib/translations.ts` (EN +
   ES).
3. **Security**: `npm audit fix` (no `--force`). Fixes 4 of the 9 high/critical packages; the
   rest need major upgrades and are recorded as residual risk (see research.md R-04).

## Technical Context

**Language/Version**: TypeScript 5, React 18, Next.js 14.2.35 (App Router; already the newest 14.2.x)

**Primary Dependencies**: Next.js, Tailwind CSS 3.4, Framer Motion 12, react-markdown. No additions.

**Storage**: N/A (static content in `lib/translations.ts` and `content/blog`)

**Testing**: No automated test framework in the repo. Verification = `npm run build`,
`npm run lint`, `npm audit`, and manual browser checks per [quickstart.md](./quickstart.md).

**Target Platform**: Vercel-hosted static/SSG site; modern browsers, mobile and desktop

**Project Type**: Web application (single Next.js project)

**Performance Goals**: Home page Lighthouse Performance and Accessibility ≥ 90 (constitution); no
added client JS beyond the existing `Navbar`/`Footer` client components.

**Constraints**: No new dependencies; no major-version upgrades; no new files under `src/`; no
visual redesign (Principle IV deviations are out of scope); build and lint must pass.

**Scale/Scope**: 5 source files edited (`Navbar.tsx`, `layout.tsx`, `page.tsx`,
`Experience.tsx`, `translations.ts`); lockfile update. No structural change.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — see right column.*

| Principle | Status (pre-design) | Status (post-design) |
|---|---|---|
| I. Stack Fidelity — no new runtime deps | PASS (none added; `audit fix` only bumps existing transitive packages) | PASS |
| II. Component Conventions — named exports, server pages/layouts, `"use client"` only when needed | PASS. `layout.tsx` stays a server component and renders the existing client `Footer`; `Navbar` and `Footer` are already client components. | PASS. No files added or moved, so the constitution's structure list and `CLAUDE.md` stay accurate; no amendment needed. |
| III. Mobile-First — no horizontal overflow at 360px | PASS (no layout change) | PASS; drawer behavior re-checked in quickstart |
| IV. Minimal UI — no banned patterns added | PASS. No visual changes; `<button>` → `<Link>` keeps the same classes. Existing deviations are out of scope. | PASS |
| V. Theme via CSS variables | PASS (no color changes) | PASS |
| VI. Bilingual parity | PASS. New Experience strings added in EN and ES; nav labels already exist; language state lives in the root layout so it survives navigation. | PASS |
| VII. Resilient integrations | N/A | N/A |
| Workflow — build, lint, browser check, Lighthouse ≥ 90 | Required at implementation | quickstart.md covers all four |

No violations; Complexity Tracking not needed.

## Project Structure

### Documentation (this feature)

```text
specs/003-quick-fixes/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── navigation.md    # Phase 1 output (UI behavior contract)
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx              # EDIT — render <Footer /> after {children}, before <WhatsAppButton />
│   └── page.tsx                # EDIT — remove <Footer /> (and its import)
├── components/
│   ├── Navbar.tsx              # EDIT — Link items, onBlog prefix match, scroll-spy deps
│   └── sections/Experience.tsx # EDIT — 2nd entry reads role/period/bullets from translations
└── lib/translations.ts         # EDIT — add experience.logiztik {role, period, bullets} (EN+ES)

package-lock.json               # EDIT — via `npm audit fix` (package.json should not change)
```

**Structure Decision**: Existing single Next.js project; no files added. Footer moves from the
home page to the root layout, next to the other site-wide elements (`Navbar`, `WhatsAppButton`).
`not-found.tsx` and the blog routes are untouched.

# Implementation Plan: Mobile Menu Navigation and Home Tab Title

**Branch**: `010-mobile-menu-nav-and-title` | **Date**: 2026-11-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-mobile-menu-nav-and-title/spec.md`

## Summary

US1 (P1): tapping a section in the mobile menu closes the drawer but the page never moves. Root cause (research R1): the drawer's exit animation animates `height` from `"auto"`; Framer Motion must measure it and calls `window.scrollTo(0, currentY)` afterwards, which cancels the smooth scroll started in the same click. Fix: the drawer animates opacity only (no `auto` measurement), so nothing cancels the scroll. Also move keyboard focus to the chosen section (FR-004), on the home page and after cross-route hash navigation.

US2 (P2): home tab title becomes `Luis Jacho Zambrano` (root metadata and `translations.meta.home`, EN and ES). Role stays in the description; home-only Open Graph and Twitter tags carry the role.

## Technical Context

**Language/Version**: TypeScript, Node 24

**Primary Dependencies**: Next.js 16.4.5 (App Router), React 19, Framer Motion ^12.38, Tailwind CSS 3 (no new dependency)

**Storage**: N/A

**Testing**: no test framework in the repo; verification by scripted headless-browser checks kept outside the repo (see [quickstart.md](./quickstart.md)), `npm run lint`, `npm run build`

**Target Platform**: web, mobile-first (360 px) and desktop

**Project Type**: web application (single Next.js project)

**Performance Goals**: Lighthouse Performance and Accessibility >= 90, no drop > 3 points vs baseline (best of 3)

**Constraints**: no layout change at rest; reduced motion respected; EN/ES parity; routes stay static

**Scale/Scope**: 5 files touched (Navbar, layout, page, translations, globals.css)

## Constitution Check

*GATE: passes before Phase 0 research and after design (re-checked 2026-11-18).*

| Principle | Result | Note |
|-----------|--------|------|
| I Stack Fidelity | PASS | No new dependency; Next, React, Tailwind, Framer Motion only |
| II Component Conventions | PASS | Named exports, functional components, `"use client"` stays only in `Navbar`; `page.tsx` stays a server component; no new file in `src/` so the CLAUDE.md tree is unchanged |
| III Mobile-First | PASS | Bug is a 360 px defect; verified at 360 px |
| IV Minimal UI | PASS | No decoration added. The only visual change is the drawer transition: fade instead of height expansion (no glow, gradient or shadow). Reported in the PR |
| V Theme via CSS variables | PASS | One CSS rule, no color |
| VI Bilingual Parity | PASS | No visible string added or removed; `meta.home` EN and ES both updated. Page metadata stays English (accepted deviation, owner 2026-11-06) |
| VII Resilient Integrations | PASS (n/a) | No external call |
| Constraints | PASS | Framer Motion kept; `prefers-reduced-motion` honoured (duration 0, instant scroll); outline removed only on programmatic, non-interactive section targets; interactive elements keep the global `:focus-visible` ring; root layout keeps title, description and fonts |

## Project Structure

### Documentation (this feature)

```text
specs/010-mobile-menu-nav-and-title/
├── spec.md
├── plan.md
├── research.md
├── quickstart.md
├── baseline.md          # Lighthouse baseline (T002)
├── verification.md      # results of the scripted checks (T008, T013, T014)
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

`data-model.md` and `contracts/` are not produced: there is no data and no external interface.

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx       # metadata.title -> "Luis Jacho Zambrano"
│   ├── page.tsx         # + export const metadata (openGraph, twitter; role in title/description)
│   └── globals.css      # + section[tabindex="-1"]:focus { outline: none }
├── components/
│   └── Navbar.tsx       # drawer transition without height:auto; focusSection(); focus effect after hash navigation
└── lib/
    └── translations.ts  # meta.home EN and ES = "Luis Jacho Zambrano"; stale comment fixed
```

**Structure Decision**: edit existing files only; no section component is touched.

## Design decisions

1. **Drawer transition** (R1, R2): `initial {opacity: 0}`, `animate {opacity: 1}`, `exit {opacity: 0}`, same `dur(0.2)` and easing. Markup and classes unchanged. The header is fixed, so the drawer never reflows the page.
2. **Scroll** stays `scrollIntoView` with `scrollBehavior()` (auto under reduced motion). No timeout.
3. **Focus** (R3): `focusSection(id)` sets `tabindex="-1"` if absent and calls `focus({ preventScroll: true })`. Called after `scrollIntoView` in the home-route click handler, and from an effect on `pathname` when the URL hash is one of the five ids (cross-route navigation, direct load with a hash). CSS removes the outline only on `section[tabindex="-1"]` (non-interactive programmatic target, like `<main tabIndex={-1}>`).
4. **Title and sharing** (R4): root `metadata.title` and both `meta.home` strings become `Luis Jacho Zambrano`. `page.tsx` exports `metadata` with `openGraph` (type `website`, role title, same description as layout) and `twitter` (`summary`). Defined on the home page only so the blog index, posts and 404 do not inherit them.
5. **Other routes** (R5): reported only. The 404 follows `meta.home`, so its title becomes `Luis Jacho Zambrano`.

## Complexity Tracking

No constitution violations to justify.

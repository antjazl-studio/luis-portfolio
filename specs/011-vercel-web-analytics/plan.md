# Implementation Plan: Vercel Web Analytics (page views only)

**Branch**: `feat/vercel-analytics` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/011-vercel-web-analytics/spec.md`

## Summary

Add the host's own page-view analytics to the root layout with the documented Next.js App Router method: one new runtime dependency (`@vercel/analytics`) and one component rendered last in `<body>`. No props, no custom events, no new file under `src/`, no visual change. The same pull request reconciles the wording of feature 008 and `CLAUDE.md` so the widget rule ("no analytics, nothing about the conversation stored") and the site-level rule (anonymous page views) are stated side by side. No constitution amendment is needed (see Constitution Check and `research.md` R2 and R4).

Verification is measurement, not assertion: Lighthouse best of 3 before and after, screenshots, cookie and storage checks, a blocked-script run, and a route-table comparison. What needs the Vercel dashboard (enabling the feature, what the dashboard shows for production, preview and development) is owner-only and is written down as unverified.

## Technical Context

**Language/Version**: TypeScript, Node 24

**Primary Dependencies**: Next.js 16.4.5 (App Router), React 19, Tailwind 3, Framer Motion ^12.38; new: `@vercel/analytics` ^2.0.1 (MIT, zero runtime dependencies, optional peers `next >= 13` and `react ^18 || ^19`, both satisfied)

**Storage**: none (the site writes no cookie and no browser storage; the host stores aggregated page views on its side)

**Testing**: no test framework in the repo and none is added. Verification uses `npm run lint`, `npm run build`, scratch scripts and a stand-in proxy under `.tmp/` (gitignored), Playwright and Lighthouse installed outside the repo, and the owner's checks on the Vercel preview. See [quickstart.md](quickstart.md)

**Target Platform**: static site deployed on Vercel (Hobby plan), modern browsers

**Project Type**: web application (single Next.js project)

**Performance Goals**: home page Lighthouse Performance and Accessibility at or above 90 and no drop greater than 3 points vs the baseline measured before implementing (best of 3 for both, mobile and desktop)

**Constraints**: no visual change at 360 px and 1280 px; no cookie or storage written by the site; the site works with the analytics script blocked or failing; static routes stay static; no custom events (Hobby plan); no `track()` call anywhere

**Scale/Scope**: one new dependency, one edited source file (`src/app/layout.tsx`), documentation edits in `CLAUDE.md` and `specs/008-ai-chat-widget/spec.md` (scope note only)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design: unchanged.*

| Principle / rule | Result | Notes |
|---|---|---|
| I. Stack Fidelity | PASS | The rule forbids new runtime dependencies that duplicate the stack (CSS frameworks, animation libraries, UI kits). An analytics package duplicates none of them. It is first-party to the host, has zero runtime dependencies and is the host's documented method. Justification in `research.md` R2. Not a violation, so no Complexity Tracking entry |
| II. Component Conventions | PASS | `layout.tsx` stays a server component: the package's Next entry carries its own `"use client"` directive (verified in the published build). No new file or folder, so the structure list and the `CLAUDE.md` tree do not change |
| III. Mobile-First | PASS | No styles are added |
| IV. Minimal UI | PASS | The component renders nothing (returns `null`) |
| V. Theme Through CSS Variables | PASS | No colors are added |
| VI. Bilingual Parity | PASS | No visible string is added |
| VII. Resilient External Integrations | PASS (reading) | The script is injected after hydration from an effect, never blocks first render, and a 404 or a blocked request has no visible effect (verified in quickstart A1 to A5). Principle VII says a failure "MUST show a visible, graceful fallback". Agent decision 2026-11-20: that sentence applies to content-bearing integrations such as the agent API, where a blank section would be a broken page. For analytics, invisible degradation is the intended behavior, and a visible message would break the no-visible-change requirement. No secret exists: nothing to configure in the frontend |
| Stack and design constraints | PASS | No animation, no content claim added |
| Development workflow | PASS with measurement | Lint and build must pass. Lighthouse Performance and Accessibility at or above 90 on the home page, measured before and after |
| Privacy / analytics wording | NONE in the constitution | `grep` for analytic, privacy, cookie, consent, track and telemetry finds no match in `.specify/memory/constitution.md` (2026-11-20). The only wording is in feature 008 and `CLAUDE.md` and is scoped to the chat widget. **No amendment needed.** Decision 2026-11-20, agent, rationale in `research.md` R4. The owner is asked only if they disagree |

## Project Structure

### Documentation (this feature)

```text
specs/011-vercel-web-analytics/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/requirements.md
└── tasks.md             # created by /speckit-tasks
```

`contracts/` is not created. The feature exposes no interface of its own: the browser talks to routes that the host creates when the owner enables the feature, and their shape is the host's.

### Source Code (repository root)

```text
package.json             # + dependency @vercel/analytics ^2.0.1
package-lock.json
src/
└── app/
    └── layout.tsx       # + import { Analytics } from "@vercel/analytics/next"; <Analytics /> last child of <body>
CLAUDE.md                # + stack line, + "Analytics" section, widget line scoped to the widget
specs/008-ai-chat-widget/spec.md   # scope notes next to the "no analytics" wording (FR-012, SC-007, line 90, out of scope)
.tmp/                    # scratch checks and stand-in proxy (gitignored, never committed)
```

**Note (no CSP today)**: the repo sets no Content-Security-Policy (feature 008 check C-09). If one is added later it must allow same-origin `/_vercel/insights/*` and, in development only, `va.vercel-scripts.com`.

**Structure Decision**: edit existing files only. The component is rendered in the root layout, as the host's documentation prescribes for the App Router, after the existing providers and children (`<LanguageProvider>` block), as the last child of `<body>`. It takes no props (`research.md` R1).

## Complexity Tracking

No constitution violations. The one new dependency is justified above and in `research.md` R2.

---

description: "Task list for 003 Quick Fixes"
---

# Tasks: Quick Fixes — Blog Navigation, Experience Entry, Dependency Security

**Input**: Design documents from `/specs/003-quick-fixes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/navigation.md, quickstart.md

**Tests**: Not requested. The repo has no test framework; verification is lint, build, `npm audit` and the manual checks in quickstart.md.

**Organization**: Grouped by user story. Stories touch disjoint files, so they can be done in any order.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1 = blog navigation and footer, US2 = Experience entry, US3 = dependency security
- Paths are relative to the repository root. No new dependencies and no new files under `src/`.

---

## Phase 1: Setup

**Purpose**: Confirm the starting point.

- [X] T001 Confirm the current branch is `003-quick-fixes`, run `npm audit` and note the baseline (expected 17 findings: 1 critical, 8 high, 8 moderate), and confirm FR-020: `next` is `14.2.35` in `package.json` and `npm view next@14 version` lists no 14.2.x newer than 14.2.35.

---

## Phase 2: Foundational

No blocking prerequisites: the three stories share no code. Proceed directly to the story phases.

---

## Phase 3: User Story 1 - Navigate from the blog back to the portfolio (Priority: P1) 🎯 MVP

**Goal**: On `/blog`, `/blog/<slug>` and 404 pages, section links and the "LJ" monogram lead to the home page, Blog is active on every `/blog/*` page, and every page shows one footer.

**Independent Test**: quickstart.md §2 — open a post directly, click each nav item and "LJ", confirm Blog highlighting and exactly one footer on `/`, `/blog`, `/blog/<slug>`, `/blog/does-not-exist`, `/nope`. Behavior is defined in [contracts/navigation.md](./contracts/navigation.md).

### Implementation for User Story 1

- [X] T002 [US1] In `src/components/Navbar.tsx`, replace `const onBlog = pathname === "/blog"` with `const onHome = pathname === "/"` and `const onBlog = pathname === "/blog" || pathname.startsWith("/blog/")` (guard `pathname` being null if the type allows). Add `aria-current={onBlog ? "page" : undefined}` to both Blog `<Link>`s (desktop bar and mobile drawer). Keep every existing class name.
- [X] T003 [US1] In `src/components/Navbar.tsx`, change `navLinks` hrefs from `#${id}` to `/#${id}` and replace the section `<button>`s with `next/link` `<Link href={href}>` in both the desktop `<nav>` and the mobile drawer, keeping the same `className` strings and the `layoutId="nav-indicator"` underline. Replace `handleNavClick(href)` with a click handler taking the event and the section id: it always calls `setMobileOpen(false)`; only when `onHome` and the click is a plain left click (not `e.metaKey`, `e.ctrlKey`, `e.shiftKey` or `e.altKey`, and `e.button === 0`, so open-in-new-tab still works) it calls `e.preventDefault()` and `document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })`; otherwise it lets the link navigate to `/#<id>`. Depends on T002.
- [X] T004 [US1] In `src/components/Navbar.tsx`, change the "LJ" monogram from `<a href="#">` to `<Link href="/">` with the same classes. Its click handler calls `e.preventDefault()` and `window.scrollTo({ top: 0, behavior: "smooth" })` only when `onHome` and the click is a plain left click (same modifier-key/button check as T003), and does nothing extra otherwise so the link navigates home. Also close the mobile drawer (`setMobileOpen(false)`). Depends on T003 (same file).
- [X] T005 [US1] In `src/components/Navbar.tsx`, change the IntersectionObserver `useEffect` dependency array from `[]` to `[pathname]`: when `pathname !== "/"` call `setActive(null)` and return without observing; when on `/`, observe the five section elements exactly as today and disconnect in the cleanup. This keeps section highlighting working after client-side navigation from a blog page back to home (research.md R-02). Depends on T004 (same file).
- [X] T006 [P] [US1] In `src/app/layout.tsx`, add `import { Footer } from "@/components/Footer";` (named import, same style as the other imports) and render `<Footer />` inside `<LanguageProvider>` after `{children}` and before `<WhatsAppButton />`. `layout.tsx` stays a server component.
- [X] T007 [US1] In `src/app/page.tsx`, remove `<Footer />` and its `import { Footer }` line so the home page does not render two footers; leave `<main>` and the six sections unchanged. Depends on T006.
- [ ] T008 [US1] Verify US1 per quickstart.md §2 (steps 1–9) in `npm run dev` at 1280px and 375px, including: language stays Spanish after a blog → home click; browser Back returns to the blog page; section highlighting works after blog → `/#about` and scrolling; exactly one footer on all five URLs and no overlap with the WhatsApp button. Fix any failure in the files above before continuing. Depends on T005, T007. **Partial (2026-11-05)**: production-build HTML checked (one footer on all five URLs; Blog `aria-current` on `/blog`, post and unknown slug only; `/#section` and `/` hrefs). Still needs a browser pass for click-through, scroll-spy after navigation, language persistence, Back button, keyboard, drawer.

**Checkpoint**: Navigation, active state and footer behave as in contracts/navigation.md.

---

## Phase 4: User Story 2 - Recruiter sees only confirmed work history (Priority: P1)

**Goal**: The second Experience entry shows the owner-confirmed role at Logiztik Alliance Group in EN and ES; "Previous Role" is gone.

**Independent Test**: quickstart.md §3 — read Experience in EN and ES; confirm company, title, dates, both bullets, order MyWork → Logiztik → IESS, and no "Previous Role" in the page source.

### Implementation for User Story 2

- [X] T009 [P] [US2] In `src/lib/translations.ts`, extend the `Translation` type's `experience` object with `logiztik: { role: string; period: string; bullets: [string, string] }` (a two-element tuple so the type enforces exactly two bullets), and add the values to both languages (data-model.md: "Both `en` and `es` MUST define all three fields"; "`bullets` has exactly the two owner-supplied bullets"). EN: role `"Full Stack Developer"`, period `"Oct 2019 – Apr 2020"` (en dash with spaces), bullets `"Developed Cargo Plus, a logistics platform for shipment tracking and workflow automation using .NET, PostgreSQL and JavaScript."` and `"Built RESTful backend services and integrated third-party logistics APIs, reducing manual data entry for operations teams."`. ES: role `"Desarrollador Full Stack"`, period `"Oct 2019 – Abr 2020"`, bullets `"Desarrollé Cargo Plus, una plataforma logística para el seguimiento de envíos y la automatización de flujos de trabajo con .NET, PostgreSQL y JavaScript."` and `"Construí servicios backend RESTful e integré APIs logísticas de terceros, reduciendo la entrada manual de datos para los equipos de operaciones."`. Add no other facts.
- [X] T010 [US2] In `src/components/sections/Experience.tsx`, replace the second `EXPERIENCE` entry (company `"Previous Role"`, period `"2019 – 2020"`, two generic bullets) with the Logiztik entry: company `"Logiztik Alliance Group"` stays in the component; role, period and bullets come from `t.experience.logiztik`. Because `t` is only available inside the component, build the list inside `Experience()` (or a small helper taking `t`) with the first (MyWork) and third (IESS) entries unchanged and in the same order (MyWork, Logiztik, IESS). The entry is `current: false`, location `""`, and its displayed period is `t.experience.logiztik.period`. Keep `key={entry.company}`. Depends on T009.
- [ ] T011 [US2] Verify US2 per quickstart.md §3 in EN and ES, including a search of the rendered page for "Previous Role" (must find nothing) and of `src/` (`Previous Role` must not appear). Depends on T010. **Partial (2026-11-05)**: EN verified in rendered HTML (Logiztik present, "Oct 2019 – Apr 2020", no "Previous Role" in HTML or `src/`). ES view needs a browser toggle.

**Checkpoint**: Experience shows the confirmed entry in both languages.

---

## Phase 5: User Story 3 - Dependencies carry no avoidable critical or high vulnerabilities (Priority: P2)

**Goal**: Every audit finding fixable without a major upgrade is fixed; the rest are documented.

**Independent Test**: quickstart.md §1 — `npm audit` no longer lists `source-map-js`, `nanoid`, `js-yaml`, `brace-expansion` or the top-level `postcss`; remaining critical/high entries match research.md R-04; `package.json` dependencies and `next@14.2.35` unchanged.

### Implementation for User Story 3

- [X] T012 [US3] Run `npm audit fix` at the repository root — without `--force`, without adding `overrides`, without installing or upgrading any package by name. Expect `package-lock.json` to change (including optional native packages such as `@next/swc-*`, `@unrs/resolver-binding-*`, `fsevents`) and `package.json` not to change.
- [X] T013 [US3] Re-run `npm audit` and compare with research.md R-04: confirm `source-map-js`, `nanoid`, `js-yaml`, `brace-expansion`, top-level `postcss` (≥ 8.5.23) and `postcss-selector-parser` are no longer reported, and that what remains is only `next` (critical), the `postcss` copy nested in `node_modules/next/node_modules` (high), `eslint-config-next`, `@next/eslint-plugin-next`, `glob` and, if still flagged, `minimatch` (dev-only). Confirm with `git diff -- package.json` that dependencies are unchanged and that `node_modules/next/package.json` is still `14.2.35`. If anything differs from R-04, update the R-04 table in `specs/003-quick-fixes/research.md` to the actual result. Depends on T012.

**Checkpoint**: Residual risk is exactly the documented list.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across all stories. Run after T008, T011 and T013 so the build uses the updated dependencies.

- [X] T014 Run `npm run lint` and `npm run build` at the repository root; both must finish with no errors (Constitution: workflow gate).
- [ ] T015 Run the full quickstart.md (§1–§4) against `npm run dev` and, for Lighthouse, a production build with `npm run build && npm start`. **Partial (2026-11-05)**: §1 and §4 Lighthouse done; §2 interactive steps and §3 ES view pending (see T008, T011).
- [X] T016 Measure Lighthouse on `/` (production build): Performance and Accessibility must not regress against the same measurement on `master` (run both, record both for the PR description). The constitution target is ≥ 90; if the `master` baseline is already below 90, record that as a pre-existing deviation to be resolved in the design-refresh feature, not here.
- [X] T017 Review `git diff` against Constitution Principle IV: the change adds no glows, gradients, blur, tinted pills or new colors, and `git status` shows only these files changed: `src/components/Navbar.tsx`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/sections/Experience.tsx`, `src/lib/translations.ts`, `package-lock.json` (plus the `specs/003-quick-fixes/` docs).
- [ ] T018 Write the PR description: summary of the three changes, the residual-risk list from research.md R-04 with the note that feature 004 upgrades to Next.js 16, the Lighthouse scores, and a reminder that the Spanish bullet wording and "Abr" are drafts for owner review.

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (T001)**: first.
- **Foundational**: none.
- **US1, US2, US3**: independent of each other and of Setup beyond T001; any order or in parallel.
- **Polish (T014–T018)**: after T008, T011 and T013.

### Within each story

- **US1**: T002 → T003 → T004 → T005 (all in `Navbar.tsx`, sequential). T006 → T007 (layout, then page). The two chains touch different files, so they can run in parallel. T008 last.
- **US2**: T009 → T010 → T011.
- **US3**: T012 → T013. Run before T014 so lint/build use the final lockfile.

### Parallel opportunities

- T006 [P] and T009 [P] can start at the same time as the Navbar chain, since they edit different files.
- US2 (T009–T011) and US1's Navbar chain (T002–T005) can be done by different people at once; US3 changes only the lockfile but alters `node_modules`, so do it while no one is running a build.

### Parallel example

```text
Chain A (Navbar.tsx):  T002 → T003 → T004 → T005
Chain B (layout/page): T006 → T007
Chain C (Experience):  T009 → T010
Chain D (lockfile):    T012 → T013
Then: T008, T011 → T014 → T015 → T016 → T017 → T018
```

---

## Implementation Strategy

### MVP first (User Story 1)

1. T001.
2. US1 (T002–T008): fixes the dead navigation and missing footer, the highest-impact item.
3. Stop and validate with quickstart §2.

### Incremental delivery

1. Add US2 (T009–T011): replaces the placeholder entry.
2. Add US3 (T012–T013): dependency update.
3. Polish (T014–T018), then open the PR.

---

## Notes

- All 18 tasks follow the checklist format; paths are repo-relative.
- Out of scope: Principle IV visual deviations, contrast, reduced motion, translating the other Experience entries, the Next.js 16 upgrade (feature 004).
- Commit after each story with Conventional Commit prefixes (`fix:`, `chore:`).

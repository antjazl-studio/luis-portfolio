---

description: "Task list for the 404 hydration fix (feature 007)"
---

# Tasks: Fix 404 Hydration Mismatch

**Input**: Design documents from `/specs/007-fix-404-hydration/`

**Prerequisites**: plan.md, spec.md, research.md (R1 to R5), quickstart.md (B1 to B3, V1 to V9, O1 to O4)

**Tests**: No test framework exists and none is requested. Verification tasks use the quickstart checks.

**Conventions**: `[P]` = can run in parallel (different files, no dependency on an incomplete task).
`[OWNER]` = only the owner can do it. Scratch files go in `.tmp/` (gitignored). Each phase ends with a
checkpoint: `npm run lint` and `npm run build` must pass, then commit with a Conventional Commit message
ending with the attribution line. No visible string, style, token or dependency may change. Run the
production server on port 3107 and stop only the process listening on that port.

## Phase 1: Setup (baseline BEFORE any source change)

- [x] T001 Build the unmodified site (`npm run build`) and save the route table to `.tmp/routes-before.txt` (quickstart B1; baseline for FR-008, SC-004)
- [x] T002 Start `npx next start -p 3107`; `curl` `/blog`, `/blog/ai-agent-workflow-portfolio` and `/blog/nope` into `.tmp/before-blog.html`, `.tmp/before-post.html`, `.tmp/before-nope.html`; record that `aria-current="page"` is present in the first two and absent in the third (quickstart B2; baseline for FR-002, FR-006)
- [x] T003 With the same server, open `/blog/nope` in a headless browser and confirm the hydration error #418 is reproduced in the console; save the console log to `.tmp/console-before.txt` (quickstart B3)
- [x] T004 Run Lighthouse (Performance and Accessibility, mobile and desktop) 3 times against `http://localhost:3107/`; keep the best of 3 per category in `.tmp/lighthouse-baseline007.json`. Pass later: each score at least 90 and no drop greater than 3 points (the Navbar is on the home page, so the constitution gate is re-checked). Then stop the server by its port's PID
- [x] T005 Checkpoint: confirm `git status` shows only `specs/007-fix-404-hydration/` (plus `.specify/feature.json` if it shows as modified) as changes, then commit them: `docs(007): spec, plan, research, quickstart and tasks for 404 hydration fix`

---

## Phase 2: User Stories 1 and 2 (P1 and P2): clean console, and correct state after hydration

**Goal**: unknown URLs hydrate without errors and, once interactive, show the post-specific wording and the Blog highlight where applicable (FR-001 to FR-005, FR-009, FR-010 part: code only).

**Independent Test**: quickstart V4 (unknown URLs), V5 and V6 pass on the production build.

- [x] T006 [US1] In `src/components/Navbar.tsx` add and export `useStablePathname(prerenderedPaths: readonly string[]): string` per plan.md Design item 1: read `usePathname() ?? ""`; read a `hydrated` flag with `useSyncExternalStore(noopSubscribe, () => true, () => false)` (module-level `noopSubscribe`, same pattern as `reduceMotion` in `src/context/LanguageContext.tsx`); return the pathname if `hydrated` or `prerenderedPaths.includes(pathname)`, else `""`. Named export, typed, no `any` (FR-001, FR-002)
- [x] T007 [US1] In `src/components/Navbar.tsx` give `Navbar` the prop `prerenderedPaths: readonly string[]` and replace `usePathname() ?? ""` with `useStablePathname(prerenderedPaths)`; keep `onHome`, `onBlog` and the section-observer effect code unchanged; remove the now-unused `usePathname` import only if nothing else uses it (FR-003, FR-004, FR-006)
- [x] T008 [US1] In `src/app/layout.tsx` (server component, no `"use client"`) import `getVisiblePosts` from `@/lib/blog`, build `["/", "/blog", ...getVisiblePosts().map((p) => `/blog/${p.slug}`)]` and pass it as `<Navbar prerenderedPaths={...} />` (FR-001, FR-006, FR-008)
- [x] T009 [US2] In `src/components/BlogNotFound.tsx` replace `usePathname() ?? ""` with `useStablePathname([])` imported from `@/components/Navbar`; keep `isPost`, all strings from `translations`, the link targets and the markup exactly as they are (FR-003, FR-004, FR-005, FR-009)
- [x] T010 Checkpoint: `npm run lint` and `npm run build` exit 0; commit `fix(404): render a stable pathname until hydration to remove hydration mismatch (007)`

---

## Phase 3: User Story 3 (P3): no regression, plus verification of Stories 1 and 2

**Goal**: prove the fix and that known routes are unchanged (FR-001 to FR-009, SC-001 to SC-004).

**Independent Test**: all executable quickstart checks below pass.

- [x] T011 [US3] Quickstart V1 and V2: `npm run lint`, `npm run build` exit 0; the new route table equals `.tmp/routes-before.txt` (FR-008, SC-004)
- [x] T012 [US3] Quickstart V3: start `next start -p 3107`; re-fetch the three pages and compare against the `.tmp/before-*.html` baselines the rendered nav markup (the `<header>` element, including every `aria-current` attribute and the Blog link classes) and the 404 `<h1>`: `/blog` and the post still have `aria-current="page"` on the Blog link, `/blog/nope` still has none. Whole-file diffs are expected to differ in build hashes and in the inline Flight payload (the new `prerenderedPaths` prop), so do not compare whole files (FR-002, FR-006)
- [x] T013 [P] [US1] Quickstart V4: collect console messages and page errors for direct loads of `/`, `/blog`, `/blog/ai-agent-workflow-portfolio`, `/blog/nope`, `/nope`, `/blogger` (3 fresh loads for each unknown URL); expect zero errors and zero warnings; save to `.tmp/console-after.txt` (FR-001, FR-007, SC-001, SC-003)
- [x] T014 [P] [US2] Quickstart V5: after hydration check the wording, link text and `href`, and Blog `aria-current` on `/blog/nope` (post wording, `/blog`, current) and on `/nope` and `/blogger` (generic wording, `/`, none); also `/blog/nope/` and `/blog/a/b` (FR-003, FR-004, SC-002)
- [x] T015 [US2] Quickstart V6: on `/blog/nope` and `/nope` switch to ES and back to EN (one visible switcher): console clean, wording correct in both languages, Blog highlight unchanged; probe with `window.next.router.push('/blog/nope')` from `/` that an in-app navigation to an unknown URL is a full page load (the site has no link to an unknown URL); follow the link back to `/blog` (spec US1 scenarios 2 and 4, US2 scenarios 3 and 4, SC-001, SC-002). Result 2026-11-07: pass; `.tmp/es404-after.txt`
- [x] T016 [US3] Quickstart V7: after stopping the port 3107 server, repeat T013 against `npm run dev` (port 3108) and confirm zero hydration diagnostics; stop that server by its port's PID (FR-001)
- [x] T017 [US3] Quickstart V8: on `/` scroll to each section and confirm the matching nav item has `aria-current="location"`; on `/blog` and the post the Blog item is current; check the 404 and navigation at 360px and 1280px widths for no visual change (FR-006, FR-009, SC-003)
- [x] T018 [US3] Quickstart V9: `git diff upstream/master -- src/lib/translations.ts src/app/globals.css tailwind.config.ts package.json package-lock.json` is empty (FR-005, FR-008, FR-009)
- [x] T019 [US3] Re-run Lighthouse as in T004 on the new build; record the result next to the baseline in `.tmp/lighthouse-after007.json`; pass if each score is at least 90 and no more than 3 points below the baseline (constitution gate)
- [x] T020 Checkpoint: if any check failed, fix the code (back to Phase 2 tasks) and re-run; otherwise nothing to commit

---

## Phase 4: Documentation (close W-1)

- [x] T021 In `specs/004-upgrade-nextjs-16/spec.md` update waiver W-1: keep the original text as history, replace "the fix is tracked as feature 006" with "fixed by feature 007 on 2026-11-07 (owner-requested); waiver closed", and state the verification result from T013 to T015 (FR-010, SC-005). Also check the same file for other claims that the mismatch is open
- [x] T022 In `specs/004-upgrade-nextjs-16/research.md` update the R-14 "Status" sentence from open to "closed by feature 007 on 2026-11-07" with a pointer to `specs/007-fix-404-hydration/research.md` R2; also update the `Regression found` wording only by adding the closing note, not by deleting history (FR-010, SC-005)
- [x] T023 [P] `grep -rn "hydration\|W-1\|#418" specs README.md CLAUDE.md DESIGN.md PRODUCT.md` and fix any remaining statement that the defect is open or tracked as 006 (SC-005)
- [x] T024 Checkpoint: `npm run lint` and `npm run build` exit 0; commit `docs(004): close waiver W-1, hydration mismatch fixed by 007`

---

## Phase 5: Polish and hand-off

- [x] T025 Set `specs/007-fix-404-hydration/spec.md` Status to Implemented and add a section "R6. Verification results" to `specs/007-fix-404-hydration/research.md` with the check results with dates (console runs, Lighthouse before/after, route table) so no document claims something the code contradicts
- [x] T026 Final `npm run lint`, `npm run build`; commit `docs(007): record verification results`
- [ ] T027 [OWNER] O1: open `<preview>/blog/nope` with the DevTools console open: no red errors; post-not-found wording; Blog tab highlighted
- [ ] T028 [OWNER] O2: open `<preview>/nope`: no errors; generic wording; link goes home
- [ ] T029 [OWNER] O3: open `<preview>/`, `/blog` and the existing post: no errors; navigation highlights as before
- [ ] T030 [OWNER] O4: view the 404 at 360px and desktop width: looks as before
- [ ] T031 [OWNER] Authorize the Vercel preview for the fork PR (needed to run T027 to T030)

---

## Requirement coverage

| Requirement | Tasks |
|-------------|-------|
| FR-001 | T006, T008, T013, T015, T016 |
| FR-002 | T002, T006, T012 |
| FR-003 | T007, T009, T014, T027 |
| FR-004 | T007, T009, T014, T028 |
| FR-005 | T009, T018 |
| FR-006 | T007, T008, T012, T017 |
| FR-007 | T013, T029 |
| FR-008 | T001, T008, T011, T018 |
| FR-009 | T009, T017, T018, T030 |
| FR-010 | T021, T022 |
| SC-001 | T013, T015, T016 |
| SC-002 | T014, T015 |
| SC-003 | T013, T017, T029 |
| SC-004 | T001, T011 |
| SC-005 | T021, T022, T023 |

## Dependencies and order

- Phase 1 before any source change (baselines need the unmodified build).
- T006 before T007 and T009 (both import the hook); T008 depends on T007's new prop (same change set, edit together).
- Phase 3 depends on Phase 2; Phase 4 depends on Phase 3 passing (the docs cite its results).
- Parallel: T013 and T014 (read-only browser checks on the same running server), T023.
- Strategy: Phase 2 is the whole fix (MVP); everything after verifies and documents it.

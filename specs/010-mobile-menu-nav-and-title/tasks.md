# Tasks: Mobile Menu Navigation and Home Tab Title

**Input**: `specs/010-mobile-menu-nav-and-title/` (plan.md, spec.md, research.md, quickstart.md)

**Tests**: none added to the repo (no test framework; plan.md). Verification is scripted outside the repo and documented in quickstart.md. Verification scripts live in the session scratchpad, not in `src/`.

**Format**: `- [ ] T### [P?] [Story] Description with file path`. `[P]` = can run in parallel (different files). `[OWNER]` = only the owner can do it.

## Phase 1: Setup

- [x] T001 Baseline captured 2026-11-18: 360 px taps on all 5 sections fail on `next start`, `next dev` and the pre-008 build `3ea5600` (scrollY stays 0); delivered titles and meta tags per route recorded (research.md R1, R4, R5). No file change.
- [x] T002 Capture Lighthouse baseline (mobile, best of 3, `npx lighthouse` pinned version, not added to package.json) of the home page on a build of the branch before T003 (identical to `upstream/master`); write the scores in `specs/010-mobile-menu-nav-and-title/baseline.md`.

## Phase 2: User Story 1 - Tapping a menu section takes me there (P1)

**Goal**: FR-001 to FR-008, FR-012. **Independent test**: quickstart.md section 2.

- [x] T003 [US1] In `src/components/Navbar.tsx`, change the mobile drawer `motion.div` transition from `{opacity, height}` to `initial {opacity: 0}`, `animate {opacity: 1}`, `exit {opacity: 0}`; keep `dur(0.2)`, easing, classes and markup. No `height: "auto"` anywhere in the file (FR-002, FR-003, FR-012).
- [x] T004 [US1] In `src/components/Navbar.tsx`, add `focusSection(id)` (if the element has no `tabindex`, set `tabindex="-1"`; then `focus({ preventScroll: true })`) and call it right after `scrollIntoView` in `handleSectionClick` on the home route (FR-004).
- [x] T005 [US1] In `src/components/Navbar.tsx`, add an effect on `pathname`: when `pathname === "/"` and `location.hash` (without `#`) is one of `NAV_IDS`, call `focusSection` (FR-004, FR-005 cross-route).
- [x] T006 [P] [US1] In `src/app/globals.css`, add `section[tabindex="-1"]:focus { outline: none; }` with a one-line comment (programmatic focus target, same as `<main tabIndex={-1}>`) (FR-004).
- [x] T007 [US1] Run `npm run lint` and `npm run build`; fix failures. Commit `fix(nav): mobile menu section tap scrolls and focuses the section (010)`.
- [x] T008 [US1] Run quickstart section 2 on the production build (`next start`) and `next dev`: 5 sections x EN/ES x reduced motion on/off on `/`, plus 5 sections from `/blog/ai-agent-workflow-portfolio`, plus desktop 1280 px nav; also tap a second section while the first scroll is still running (final position = last section); record results in `specs/010-mobile-menu-nav-and-title/verification.md` (SC-001 to SC-003, FR-007, FR-008).

## Phase 3: User Story 2 - The tab title is just my name (P2)

**Goal**: FR-009 to FR-011. **Independent test**: quickstart.md section 3.

- [x] T009 [P] [US2] In `src/app/layout.tsx`, set `metadata.title` to `"Luis Jacho Zambrano"`; keep description, keywords, authors.
- [x] T010 [P] [US2] In `src/lib/translations.ts`, set `meta.home` to `"Luis Jacho Zambrano"` in EN and ES and keep the comment above the EN `meta` block accurate (EN equals the static metadata; note that the role now lives in the sharing tags) and update the comment in `src/components/BlogNotFound.tsx` that says the 404 "keeps today's English title" (comment only). Do not touch `meta.blog` (FR-011). Run T008 cross-route check explicitly: after blog-to-home hash navigation `document.activeElement.id` equals the section id; if the hash is not yet in the URL when the effect runs, read it in `requestAnimationFrame` or on `hashchange`.
- [x] T011 [US2] In `src/app/page.tsx`, add `export const metadata: Metadata` with `openGraph` (`type: "website"`, `title: "Luis Jacho Zambrano — Senior Full Stack Developer"`, `description` identical to the layout description) and `twitter` (`card: "summary"`, same title and description). Keep the page a server component (FR-010).
- [x] T012 [US2] Run `npm run lint` and `npm run build`. Commit `feat(meta): home tab title is just the name; role in sharing tags (010)`.
- [x] T013 [US2] Run quickstart section 3 (curl of delivered HTML on `/`, `/blog`, the post, `/nope`; runtime tab title in EN and ES via the headless browser); append results to `specs/010-mobile-menu-nav-and-title/verification.md` (SC-004).

## Phase 4: Polish and hand-off

- [x] T014 Lighthouse home page after the change (mobile, best of 3): Performance and Accessibility >= 90 and no drop > 3 vs T002; append to `verification.md` (SC-005).
- [x] T015 Update `CLAUDE.md` only if a documented behavior changed (title note, if present); otherwise no change. Mark spec.md Status "Implemented (verified locally; owner checks pending)". (CLAUDE.md has no title or drawer-animation note: no change needed)
- [ ] T016 Stop the dev and production servers started for verification by PID or port, remove the `.tmp-pre008` worktree and `.tmp-*.log` files, confirm `git status` shows only intended files.
- [ ] T017 [OWNER] On the Vercel preview (real phone): menu taps in EN and ES, from a blog post, with reduce motion; tab title; LinkedIn Post Inspector for the card (quickstart section 5). Owner may also test an older deployment to confirm the pre-008 finding.
- [ ] T018 [OWNER] Decide whether to align the blog post title pattern (`<post title> — Luis Jacho Zambrano`) in a later change (research.md R5).

## Requirement coverage

| Requirement | Tasks |
|---|---|
| FR-001, FR-002, FR-003, FR-012 | T003, T008 |
| FR-004 | T004, T005, T006, T008 |
| FR-005 | T005, T008 |
| FR-006 | T008 (EN and ES runs; no string added) |
| FR-007, FR-008 | T003 (no other nav change), T008 |
| FR-009 | T009, T010, T013 |
| FR-010 | T011, T013 |
| FR-011 | T010 (meta.blog untouched), T013, T018 |
| SC-001 to SC-003 | T008 |
| SC-004 | T013 |
| SC-005 | T002, T012, T014 |

## Dependencies

T003 -> T004 -> T005 (same file) -> T007 -> T008. T006 parallel with T003 to T005. Phase 3 does not depend on Phase 2 except that both touch the build (T012 after T007). T009 and T010 are parallel; T011 is independent of them. T014 after T012.

## Implementation strategy

MVP = Phase 2 (the bug). Commit it first, then Phase 3, one PR.

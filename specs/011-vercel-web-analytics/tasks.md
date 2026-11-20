# Tasks: Vercel Web Analytics (page views only)

**Input**: `specs/011-vercel-web-analytics/` (plan.md, spec.md, research.md, data-model.md, quickstart.md)

**Tests**: none added to the repo (no test framework; plan.md). Verification is scripted outside the repo (Playwright and Lighthouse in the session scratchpad, a stand-in proxy under `.tmp/`) and documented in quickstart.md. Nothing under `.tmp/` is committed.

**Format**: `- [ ] T### [P?] [Story] Description with file path`. `[P]` = can run in parallel (different files). `[OWNER]` = only the owner can do it (dashboard or authorized preview).

## Phase 1: Setup (baseline before any code change)

- [ ] T001 Baseline build on the unchanged app code of `upstream/master` (`8cd91e8`; only `specs/011-*` is untracked): run `npm run build`, save the route table and the total byte size of `.next/static/chunks` plus the chunks referenced by `/` to `.tmp/011-baseline.txt` (quickstart B1).
- [ ] T002 Lighthouse baseline: best of 3 runs, mobile and desktop, `/` on `npx next start` (pinned Lighthouse in the scratchpad, not added to `package.json`); record Performance and Accessibility in `.tmp/011-baseline.txt` (quickstart B2, FR-006).
- [ ] T003 [P] Baseline screenshots at 360 px and 1280 px of `/`, `/blog`, `/blog/ai-agent-workflow-portfolio` and `/nope` into `.tmp/011-shots/before/` (quickstart B3, FR-003).

## Phase 2: User Story 1 - The owner sees page views of the production site (P1)

**Goal**: FR-001, FR-002, FR-007, FR-009, FR-010. **Independent test**: quickstart A1, A2 and O1 to O5.

- [ ] T004 [US1] Run `npm install @vercel/analytics` (npm writes `^2.0.1` or the current 2.x latest; record the resolved version). Confirm `package.json` gains only that dependency, `package-lock.json` gains only that package entry, `npm ls @vercel/analytics` shows it with no children, and `npm audit` reports nothing new vs baseline (FR-009, plan R2).
- [ ] T005 [US1] In `src/app/layout.tsx`, add `import { Analytics } from "@vercel/analytics/next";` and render `<Analytics />` with no props as the last child of `<body>`, after the `<LanguageProvider>` block. Keep the layout a server component; add no `"use client"` (FR-001, FR-010, plan R1).
- [ ] T006 [US1] Run `npm run lint` and `npm run build`; fix failures. Compare the build route table with `.tmp/011-baseline.txt` (T001): `/`, `/blog`, every post and the 404 keep the same static markers (FR-007, plan R7). Commit `feat(analytics): Vercel Web Analytics, page views only (011)`.
- [ ] T007 [US1] Run quickstart A2: `grep -rn "track(" src` returns nothing, and the only match for `@vercel/analytics` in `src` is `src/app/layout.tsx` (FR-002, SC-002).
- [ ] T008 [US1] [OWNER] Enable Web Analytics for the project in the Vercel dashboard (Analytics tab, Enable button). It adds `/_vercel/insights/*` routes after the next deployment (quickstart O1).
- [ ] T009 [US1] [OWNER] On the authorized Vercel preview: `/_vercel/insights/script.js` returns 200 and a view request appears (quickstart O2). In the dashboard, report what production, a preview visit and a development visit each show (quickstart O4). After merge, confirm `/`, `/blog` and a post appear as page views on `luisjacho.dev` (quickstart O5, SC-001).

## Phase 3: User Story 2 - Visitors notice nothing (P2)

**Goal**: FR-003, FR-004, FR-005, FR-006. **Independent test**: quickstart A3 to A8.

- [ ] T010 [US2] Build the stand-in for scenario B in `.tmp/011-proxy.mjs`: a small HTTP proxy in front of `next start` that serves `.tmp/stand-in-script.js` (the debug script saved from `https://va.vercel-scripts.com/v1/script.debug.js`) at `/_vercel/insights/script.js` and answers any other `/_vercel/insights/*` request with 204. The stand-in is a different artifact from the production script (it is built for console logging), and the real endpoint names come from the remote script, not from the package, so the proxy is an approximation. Not committed (plan R6).
- [ ] T011 [US2] Scenario A browser checks with Playwright from the scratchpad, fresh context, production build: load `/`, `/blog`, a post and `/nope`; open the chat panel. Assert `document.cookie` is empty, `localStorage` and `sessionStorage` are empty, the only console error is the expected resource 404 for `/_vercel/insights/script.js` (the package's own `console.log` about the failed load is expected), `window.vaq` shows exactly one page view per full load with that page's path (including `/nope`), and there is no hydration warning on `/nope` and `/blog/nope` (quickstart A3, FR-004, SC-004).
- [ ] T012 [US2] Scenario B browser checks through the stand-in proxy: the script is requested once per full load, including a full load of `/nope`; the calls queued on `window.vaq` (and any view request the stand-in makes) show exactly one page view per full load with the path of that page (`/nope` on the 404) and one more after a client navigation from `/` to `/blog`; switching the language adds none; if the stand-in sends no request, record "not observable" and rely on the queue; cookies and storage stay empty (quickstart A4, FR-001, FR-004, User Story 1 scenarios 2 and 3).
- [ ] T013 [US2] Blocked-script run: abort the script request; the pages, the language switch and the chat panel work and no error is visible (quickstart A5, FR-005, SC-005).
- [ ] T014 [US2] After-change screenshots at 360 px and 1280 px into `.tmp/011-shots/after/`; pixel compare with T003 and record the changed-pixel count per image and the reason for any difference (quickstart A6, FR-003, SC-003).
- [ ] T015 [US2] Lighthouse after, best of 3, mobile and desktop, scenario A and scenario B: Performance and Accessibility at or above 90 and no drop of more than 3 points vs T002 (quickstart A7, FR-006, SC-006). Say plainly that B only shows the cost of loading and running a stand-in script, not the real production script, so SC-006 is not marked fully verified from B alone: the real cost is an owner check with Lighthouse on the preview after O1 and O2 (quickstart O6, added to T024).
- [ ] T016 [US2] If T015 shows a drop of more than 3 points or a score below 90 on either measure, stop and escalate to the owner (accepting a regression is the owner's decision). Otherwise record "no regression" with the numbers.
- [ ] T017 [US2] Added client JavaScript: total `.next/static/chunks` size and the home page's referenced chunks, after minus before, in bytes; record in `verification.md` (quickstart A8, plan R2).

## Phase 4: User Story 3 - The privacy position is explicit and consistent (P3)

**Goal**: FR-008, FR-011. **Independent test**: read spec 008, `CLAUDE.md` and spec 011 together; quickstart A9.

- [ ] T018 [P] [US3] In `specs/008-ai-chat-widget/spec.md`, add a one-line scope note next to the "no analytics" wording (locate by text, not by line number, because lines shift after the first insert: the "no analytics, no logs from the site" sentence of the privacy story, FR-012, SC-007 and the out-of-scope line), in the style of the existing "superseded by 009" notes: it refers to the chat widget and the conversation; site-level page-view analytics was added by feature 011 and does not change FR-012 or SC-007 because the widget writes no cookie or storage and never changes the page address. Do not change the meaning of any requirement (FR-008).
- [ ] T019 [P] [US3] In `CLAUDE.md`: add `@vercel/analytics` (page views only) to the stack list; add a short "Analytics" section (page views only; Hobby plan, no custom events, never call `track()`; enabled in the Vercel dashboard by the owner; the site writes no cookie or storage for it; separate from the chat widget); scope the existing line "Nada se persiste (sin cookies ni storage)..." to the widget. Keep the file's Spanish convention for these sections (FR-011).
- [ ] T020 [US3] Run quickstart A9: `git diff upstream/master --stat` lists only `package.json`, `package-lock.json`, `src/app/layout.tsx`, `CLAUDE.md`, `specs/008-ai-chat-widget/spec.md` and `specs/011-vercel-web-analytics/*`. Re-read 008, `CLAUDE.md` and 011 for contradictions (SC-007). Commit `docs(analytics): scope the 008 no-analytics wording to the widget; document analytics (011)`.

## Phase 5: Polish and hand-off

- [ ] T021 Write `specs/011-vercel-web-analytics/verification.md` with the quoted excerpts from the Vercel docs pages (copied verbatim with the fetch date) and every measured value (baseline and after Lighthouse, bytes, pixel counts, cookie and storage results, route tables), the stand-in limitation, the owner-only checklist left unchecked, and the plain statement that nothing is counted until the owner enables the feature in the dashboard (spec edge case). Mark `spec.md` Status "Implemented (verified locally; owner checks pending)".
- [ ] T022 Every decision made in conversation or by the agent (no amendment, 008 scope reading, owner assumption on the consent banner, Lighthouse outcome) is written into `spec.md` or `plan.md` with the date and "owner" or "agent"; no spec, plan or task claims something the shipped code contradicts.
- [ ] T023 Stop only the dev and production servers started for verification, by PID or port; `git status` shows only intended files; `.tmp/` content stays uncommitted.
- [ ] T024 [OWNER] Authorize the Vercel preview, run quickstart O1 to O5, confirm the cookies and storage on the preview (quickstart O3), run Lighthouse on the preview (quickstart O6), and approve and merge.

## Dependencies and order

T001 to T003 (baseline) before T004. T004 before T005 before T006. T007 after T005. T010 before T012 and T015 (scenario B). T011 to T017 need the build from T006. T018 and T019 are independent of the code and can run in parallel; T020 after both. T021 to T023 last. Owner tasks T008, T009 and T024 are not on the critical path of the PR.

## Requirement coverage

| Requirement | Tasks |
|---|---|
| FR-001 page views on every route | T005, T012, T009 |
| FR-002 no custom event, no `track()` | T005, T007 |
| FR-003 no visible change | T003, T014 |
| FR-004 no cookie or storage | T011, T012, T024 |
| FR-005 works with the script blocked or failing | T011, T013 |
| FR-006 Lighthouse at or above 90, no drop above 3 | T002, T015, T016 |
| FR-007 static pages stay static | T001, T006 |
| FR-008 widget scope stated; no conversation in the page address | T018, T019 (code evidence recorded in `research.md` R4) |
| FR-009 dependency justified | T004 (justification in `plan.md` and `research.md` R2) |
| FR-010 documented method | T005 (verified in `research.md` R1) |
| FR-011 `CLAUDE.md` and owner-only steps recorded | T019, T021, T008, T009, T024 |
| SC-001 | T009 |
| SC-002 | T007 |
| SC-003 | T014 |
| SC-004 | T011, T012, T024 |
| SC-005 | T013 |
| SC-006 | T015 |
| SC-007 | T018, T019, T020 |

## Implementation strategy

MVP is Phase 2: install, render the component, build, keep routes static. Then verify Phase 3 on the built site before touching the documents. Commit after each phase with Conventional Commits. Stop and ask the owner only if Lighthouse regresses (T016) or the owner disagrees with the no-amendment decision.

---

description: "Task list for the chat launcher redesign (feature 009)"
---

# Tasks: Chat Launcher Redesign (single dock)

**Input**: Design documents from `/specs/009-launcher-redesign/`

**Prerequisites**: plan.md, spec.md, research.md (R1 to R9), data-model.md, contracts/launcher-ui.md, quickstart.md

**Tests**: No test framework exists and none is requested or added. Verification tasks use the quickstart checks and scratch scripts under `.tmp/` (gitignored, never committed). Scratch browser automation uses `puppeteer-core` installed in its own folder `.tmp/verify/` (its own `package.json`; NOT added to the project's `package.json`).

**Conventions**: `[P]` = can run in parallel (different files, no dependency on an incomplete task). `[OWNER]` = only the owner can do it. `[BROWSER]` = needs a real browser; checks that cannot run headless go to the owner checklist and to "Not verified". Each phase ends with a checkpoint: `npm run lint` and `npm run build` must pass, then commit with a Conventional Commit message ending with the attribution line given by the session. Stage files by explicit path; never `git add -A`. Run the production server on port 3109 (`npx next start -p 3109`) and stop only the process listening on that port. All edits are inside existing files and folders; no new source file; no new dependency; no change to `ChatPanel.tsx`, `ChatMarkdown.tsx`, `useChat.ts`, `chatStream.ts`, `Footer.tsx`, `globals.css`, `tailwind.config.ts`, `package.json`, `DESIGN.md` or the constitution.

## Phase 1: Setup (baseline BEFORE any source change)

- [ ] T001 Install scratch tooling: in `.tmp/verify/` run `npm init -y` and `npm i puppeteer-core` (own folder, never the repo root); write `.tmp/verify/lib.mjs` exporting a helper that launches `C:/Program Files/Google/Chrome/Application/chrome.exe` headless at a given viewport and language (language is switched by clicking the site's EN/ES control, or by seeding the language context the way the site stores it; discover how in `src/context/LanguageContext.tsx` and note it in the script header)
- [ ] T002 Build the unmodified branch (`npm run build`), save the route table to `.tmp/routes-before.txt`, serve it with `npx next start -p 3109`, and capture the BASELINE with the helper: (a) screenshots at 360 and 1280 px of `/` top and end, in EN and ES, to `.tmp/before-*.png`; (b) the WhatsApp link `href`, `rel`, `target` and `aria-label` in EN and ES to `.tmp/baseline-whatsapp.json`; (c) the list of network requests on first load of `/` to `.tmp/baseline-requests.txt` (to prove later that the panel chunk is still not requested on load)
- [ ] T003 With the baseline server still on 3109, run Lighthouse (Performance and Accessibility) 3 times on `http://localhost:3109/` with `npx lighthouse ... --only-categories=performance,accessibility`; keep the best of 3 per category in `.tmp/lighthouse-baseline009.json`; stop the server by its port's PID (baseline for SC-006; pass later: each score at least 90 and no drop greater than 3 points)
- [ ] T004 Checkpoint: `git status` shows only `specs/009-launcher-redesign/` (plus the `.specify/feature.json` pointer if tracked); commit with explicit paths: `docs(009): spec, plan, research, contract, quickstart and tasks for the launcher redesign`

---

## Phase 2: Foundational (blocks every user story)

**Purpose**: shared strings and the WhatsApp segment that the dock composes.

- [ ] T005 [P] Add two keys to the `chat` block of the `Translation` type and to both `en` and `es` in `src/lib/translations.ts`: `launcherInput` (EN exactly "Ask anything about Luis…", ES exactly "Pregunta lo que quieras sobre Luis…") and `launcherHint` (EN exactly "AI", ES exactly "IA"). No other string changes; `chat.launcher` and `a11y.whatsapp` are reused (FR-012; data-model.md; Principle VI)
- [ ] T006 [P] Edit `src/components/WhatsAppButton.tsx` (keep the file, the `"use client"` directive and the `WhatsAppButton` named export) into the non-floating WhatsApp segment per plan.md "Phase 1 design summary" and research R2, R3: remove the fixed positioning, the wrapper `group` and the hover tooltip label; the root becomes the `<a>` itself with the same URL (`https://wa.me/593960138279?text=` plus the encoded `contact.whatsappMessage`), same `aria-label` (`a11y.whatsapp`), `target="_blank"`, `rel="noopener noreferrer"`; classes: `flex w-12 items-center justify-center rounded-r-full text-foreground hover:bg-surface-2 sm:w-14` plus a negative outline offset (`focus-visible:outline-offset-[-2px]`, research R6); the glyph keeps its path but takes `currentColor` (no `fill="white"` literal, no `style={{ backgroundColor: "#25D366" }}`), size `h-6 w-6 sm:h-7 sm:w-7`, `aria-hidden`. Remove the "third-party brand green" comment (FR-002, FR-007, FR-013)
- [ ] T007 Checkpoint: `npm run lint` and `npm run build` pass (with T006 applied and T008/T009 not yet done the page has no WhatsApp element, so commit ONLY the strings from T005 here: `feat(launcher): EN/ES strings for the dock (009)`; leave `WhatsAppButton.tsx` uncommitted so that every commit on the branch is a working state; it is committed together with the dock in T010)

---

## Phase 3: User Story 1 (P1) MVP: notice the assistant and open it from one coherent control

**Goal**: one floating dock whose primary segment opens the existing lazy panel with the textarea focused (FR-001 to FR-006, FR-010 to FR-013).

**Independent Test**: at 360px and 1280px exactly one floating control is present; the assistant segment is dominant; activating it opens the panel with the textarea focused and empty; closing returns focus to the assistant segment.

- [ ] T008 [US1] Edit `src/components/ChatWidget.tsx` per plan.md "Phase 1 design summary" and contracts/launcher-ui.md: while `!open`, render ONE container `fixed bottom-4 right-4 z-50 flex items-stretch rounded-full border border-border-strong bg-surface h-12 sm:bottom-6 sm:right-6 sm:h-14` (no shadow, NO `overflow-hidden`: each segment carries its own outer radius so the focus outline follows the pill shape and is never clipped, research R6) holding, in this order: (1) the assistant `<button type="button" ref={launcherRef}>` keeping, unchanged, the click handler (hostname check inside the handler, `setEverOpened(true)`, `setOpen(true)`), `onPointerEnter`/`onFocus` prefetch, `aria-haspopup="dialog"`, `aria-expanded={open}`; classes `flex items-center gap-2 rounded-l-full px-4 text-sm font-medium text-foreground hover:bg-surface-2 focus-visible:outline-offset-[-2px] md:min-w-[300px] md:gap-3 md:px-[18px]`; content: an inline sparkle SVG (`aria-hidden`, `currentColor`, stroke 1.6, path from `mocks/launcher-options.html` symbol `spark`), `<span className="md:hidden">{t.launcher}</span>`, `<span className="hidden font-normal text-muted md:inline">{t.launcherInput}</span>`, and the hint chip `<span className="ml-auto hidden rounded-md border border-border px-2 py-0.5 text-xs font-normal text-muted md:inline-flex">{t.launcherHint}</span>`; no `aria-label` on the button (research R4); put a literal space `{" "}` between the input-style span and the chip so the computed name reads "Ask anything about Luis… AI" (check in the accessibility tree, quickstart 5); (2) a 1px divider `<span aria-hidden className="w-px self-stretch bg-border-strong" />`; (3) `<WhatsAppButton />`. Keep the lazy `dynamic(() => import("./ChatPanel")...)`, `prefetchPanel`, the focus-return effect and `<ChatPanel ... />` untouched. Replace the stale comment about stacking above `WhatsAppButton` (008 R7) with one accurate line describing the dock (FR-001 to FR-006, FR-010, FR-011, FR-013)
- [ ] T009 [US1] Edit `src/app/layout.tsx`: remove the `WhatsAppButton` import and its `<WhatsAppButton />` element (ChatWidget now composes it); keep `<ChatWidget />` and the rest unchanged; `layout.tsx` stays a server component (FR-001)
- [ ] T010 [US1] Checkpoint: `npm run lint` and `npm run build` pass, route table equals `.tmp/routes-before.txt`; serve on 3109 and run the quickstart checks 2, 4, 5, 7 (screenshots at 360/767/768/1280 EN and ES; exactly one fixed element bottom-right while closed; accessible names; open then Esc returns focus, textarea empty). Look at the screenshots yourself and fix visual defects (alignment, heights, margins) before committing; commit `feat(launcher): single dock with assistant and WhatsApp segments (009)` including `src/components/WhatsAppButton.tsx` (T006), `src/components/ChatWidget.tsx` and `src/app/layout.tsx`

---

## Phase 4: User Story 2 (P1): WhatsApp stays one step away, visually secondary

**Goal**: WhatsApp keeps its exact destination and name, shows no green, is its own keyboard stop (FR-007, FR-008).

**Independent Test**: the WhatsApp segment's `href`, `rel`, `target` and `aria-label` equal `.tmp/baseline-whatsapp.json` in EN and ES; no green; Tab order is assistant then WhatsApp.

- [ ] T011 [US2] Run quickstart checks 8 and 6 with the helper: compare the WhatsApp `href`, `rel`, `target`, `aria-label` in EN and ES against `.tmp/baseline-whatsapp.json` (must be identical); tab from the page start and confirm the order assistant then WhatsApp with a visible, unclipped focus ring on each (screenshot the focused states at 360 and 1280); fix `WhatsAppButton.tsx` or `ChatWidget.tsx` if anything differs
- [ ] T012 [P] [US2] Run quickstart check 10: `git diff upstream/master -- src` must contain no `#25D366` in the dock code path, no `shadow`, `blur`, `gradient`, `transition`, `animate-` or `accent` utilities on the dock or its segments; the computed background of the WhatsApp segment is the `surface` token, not green (FR-013)

---

## Phase 5: User Story 3 (P2): accessible, unobtrusive and robust

**Goal**: constitution constraints hold at every width and state (FR-008, FR-009, FR-013 to FR-015).

**Independent Test**: no overflow at 360px in EN and ES, Footer and Contact links uncovered at the end of every page type, reduced motion honoured, preview host and service-down behaviour unchanged.

- [ ] T013 [US3] With the helper, at 360px in EN and ES measure both segments' bounding boxes (each at least 44×44, same height) and `document.documentElement.scrollWidth <= clientWidth`; at 767 and 768 px confirm the switch (compact label visible at 767 only; input-style text and chip visible at 768 only; never both); at 1280 px with browser zoom 200% (emulate by a 640px-wide viewport) confirm the dock stays on screen and operable (quickstart 3; FR-008, FR-009; spec edge cases)
- [ ] T014 [US3] With the helper, scroll to the end of `/`, `/blog`, `/blog/<an existing slug>` and a 404 URL at 360 and 1280 px (and a 640×360 landscape-phone viewport) and assert the Footer's LinkedIn and email links and the Contact links are fully visible and their rectangles do not intersect the dock's rectangle (quickstart 2; FR-009, SC-004). If any intersects, raise the issue rather than editing `Footer.tsx` silently: report to the supervisor
- [ ] T015 [P] [US3] Quickstart checks 9 and 13: emulate `prefers-reduced-motion: reduce` and confirm no running transition or animation on the dock; open the build via a non-allowed host (for example `http://<this machine's LAN IP>:3109`) and confirm the panel shows "Assistant available on luisjacho.dev" and no request to the agent service is made; with no agent service listening on the default address, open the panel on `http://localhost:3109` and confirm the existing localized unavailable state appears while the dock rendered normally (FR-013, FR-014)
- [ ] T016 [P] [US3] Contrast: compute the ratios for the pairs in research R5 from the token values in `src/app/globals.css` with a scratch script (`.tmp/contrast.mjs`) and compare against the research table (including `border-strong` on `surface` = 3.99); also confirm in the browser that computed text colours of the compact label, input-style text, chip text, sparkle and glyph are the expected tokens (FR-015)
- [ ] T017 [US3] Checkpoint: `npm run lint` and `npm run build` pass; apply and commit any fixes found by T011 to T016 as `fix(launcher): <what>` commits (no commit if nothing needed fixing)

---

## Phase 6: Polish & cross-cutting

- [ ] T018 [P] Edit `CLAUDE.md`: in the component tree change the `WhatsAppButton.tsx` comment to "WhatsApp segment of the launcher dock (rendered by ChatWidget)" and the `ChatWidget.tsx` comment to describe the single dock (assistant segment + WhatsApp segment, owns `useChat`, lazy-loads the panel); update any other `CLAUDE.md` text that says the launcher sits above WhatsApp
- [ ] T019 [P] Edit `specs/008-ai-chat-widget/spec.md`: add one note under FR-002 and SC-009 (or in its Assumptions) stating that the launcher arrangement (pill stacked above WhatsApp) was superseded by `specs/009-launcher-redesign` on 2026-11-17 (owner decision); change nothing else in 008
- [ ] T020 Lighthouse after: build, serve on 3109, run 3 times, keep the best of 3 per category; compare with `.tmp/lighthouse-baseline009.json` (Performance and Accessibility each at least 90 and no drop greater than 3 points); then quickstart check 11: compare first-load network requests with `.tmp/baseline-requests.txt` and confirm the panel chunk is still not requested on load but is requested on first hover, focus or click of the assistant segment (SC-006, SC-007); stop the server by its port's PID
- [ ] T021 Create `specs/009-launcher-redesign/verification.md` recording the result of every quickstart check actually run (check number, command or script, outcome, evidence file under `.tmp/`), the Lighthouse before/after numbers and a "Not verified" list (browser-only items); record every owner decision with its date and "owner" in `spec.md` and `plan.md` (option D, neutral white glyph, and the answers on the ES placeholder and the constitution descriptor); make sure no spec, plan or task claims something the shipped code contradicts (for example the "AI" chip, the 300px minimum, the no-shadow rule)
- [ ] T022 Checkpoint: `npm run lint` and `npm run build` pass; `git diff upstream/master --stat -- src` must list only `ChatWidget.tsx`, `WhatsAppButton.tsx`, `layout.tsx` and `translations.ts` (proves the panel, `useChat`, `chatStream`, `Footer` and the API contract are untouched, FR-014); commit `docs(009): CLAUDE.md tree, 008 pointer note and verification results` (include `verification.md`)
- [ ] T023 [OWNER] [BROWSER] On the Vercel preview (the owner must authorize it for the fork PR): run the owner checklist in `quickstart.md` (real phone, laptop, screen reader, Spanish at 360px) and confirm SC-008; approve and merge the PR. The constitution descriptor "(floating contact button)" stays unchanged by owner waiver (2026-11-17); rewording it is a possible later PATCH

---

## Dependencies & execution order

- Phase 1 before everything (baselines must be taken before any source change).
- Phase 2 blocks Phases 3 to 5: T005 and T006 are parallel; T007 after both.
- Phase 3: T008 before T009 only for convenience (different files); T010 after both. Phase 4 and 5 verification need T010.
- Phase 4 (US2) and Phase 5 (US3) are independent of each other after T010; T012, T015 and T016 are parallel.
- Phase 6: T018 and T019 are parallel; T020 after all source changes are final; T022 last before the PR; T023 after the PR.
- MVP: Phases 1 to 3 (US1) give the new dock; US2 and US3 are verification and fix passes.

## Requirement coverage

| Requirement | Task(s) |
|-------------|---------|
| FR-001 one control, replaces two | T008, T009, T010 |
| FR-002 two parts, one outline, height, margin | T006, T008, T010 |
| FR-003 compact label | T005, T008, T013 |
| FR-004 input-style from 768px, hint | T005, T008, T013 |
| FR-005 opens panel, textarea focused, no prefill | T008, T010 |
| FR-006 assistant dominant, no accent | T008, T010, T012 |
| FR-007 WhatsApp unchanged destination and name, no green | T006, T011, T012 |
| FR-008 keyboard stops, focus indicator, 44px | T006, T008, T011, T013 |
| FR-009 no overflow, Footer clearance | T013, T014 |
| FR-010 focus returns to assistant | T008, T010 |
| FR-011 no first-render delay, panel still lazy | T008, T020 |
| FR-012 EN/ES | T005, T010, T013 |
| FR-013 reduced motion, tokens only, no decoration | T006, T008, T012, T015 |
| FR-014 non-production, service down, panel/API unchanged | T015 (and no edits to panel/API files, T022 diff check) |
| FR-015 contrast | T016 |
| SC-001..SC-005 | T010, T011, T013, T014 |
| SC-006, SC-007 | T003, T020 |
| SC-008 | T023 |

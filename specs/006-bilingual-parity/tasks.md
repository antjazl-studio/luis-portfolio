---

description: "Task list for EN/ES parity (feature 006)"
---

# Tasks: EN/ES Parity

**Input**: Design documents from `/specs/006-bilingual-parity/`

**Prerequisites**: plan.md, spec.md, research.md (R1 to R8, Spanish glossary in R5), quickstart.md (B1, V1 to V10, O1, O2)

**Tests**: No test framework exists and none is requested. Verification tasks use the quickstart checks.

**Conventions**: `[P]` = can run in parallel (different files, no dependency on an incomplete task).
`[OWNER]` = only the owner can do it. Scratch files and scripts go in `.tmp/` (gitignored). Each phase
ends with a checkpoint: `npm run lint` and `npm run build` must pass, then commit with a Conventional
Commit message ending with the attribution line. English strings and the 14 Spanish strings the owner
reviewed in feature 005 MUST NOT change. Every new Spanish string follows the glossary in research.md R5
and is a draft for the owner.

## Phase 1: Setup

**Purpose**: baselines and verification scripts BEFORE any source change.

- [x] T001 Build the unmodified site (`npm run build`, `npx next start -p 3100`) and run Lighthouse (Performance and Accessibility, mobile and desktop) 3 times against `http://localhost:3100/`; keep the best of 3 per category; save to `.tmp/lighthouse-baseline-006.json` (quickstart B1, FR-043). Stop only the process on port 3100
- [x] T002 [P] With the baseline build running, capture the visible English text of the home page, `/blog`, `/blog/ai-agent-workflow-portfolio` and a missing URL to `.tmp/baseline-en-text.json` (used by T027 to prove English did not change; FR-008, FR-044)
- [x] T003 [P] Write `.tmp/i18n-parity.mjs`: transpile `src/lib/translations.ts`, flatten EN and ES, fail if key sets differ, and fail if any EN/ES pair is identical and not on the FR-010 allowlist (names, organizations, technologies, brand and certification names, loanwords such as Blog/Backend/Frontend/DevOps, places, numerals); it must pass on today's `translations.ts` before any change (the five identical pairs `nav.blog`, `blog.title`, `hero.who`, `about.azure_badge`, `a11y.linkedin` are allowed) (quickstart V2; FR-010, FR-011, FR-012)
- [x] T004 [P] Write `.tmp/facts.mjs`: extract digits, years and percentages from the EN and ES Experience, Projects and Skills text and compare them as multisets AFTER normalising number formatting (strip `.`, `,` and spaces inside numbers, so "30,000+" equals "30.000+" and "~60%" equals "~60 %"); compare bullet counts and order (quickstart V5; FR-007)
- [x] T005 [P] Write `.tmp/es-scan.mjs` (headless browser): select ES, collect visible text of the home page, `/blog`, one post and a missing URL, compare element by element with EN, flag English sentences and identical pairs not on the allowlist (quickstart V6; FR-001)
- [x] T006 [P] Write `.tmp/title-check.mjs`: ES selected, check `document.title` on `/`, `/blog`, a post and a missing URL, switching language on each page and via in-app navigation home to `/blog` to a post; also fetch the page source and assert the meta description is unchanged English (quickstart V7; FR-020, FR-021, FR-022)
- [x] T007 [P] Write `.tmp/es-layout.mjs`: in ES, 0px horizontal overflow at 360px on the 4 page types, and the hero title, subline, proof line and both buttons above the fold at 1280x800 and 390x844 (quickstart V8; FR-040, FR-041)

**Checkpoint**: baselines saved in `.tmp/`. No commit needed (no tracked file changed).

---

## Phase 2: Foundational

**Purpose**: nothing blocks the stories except the baselines above; the typed groups are added per story so each is reviewable. (No tasks.)

---

## Phase 3: User Story 1 - A Spanish visitor reads the whole site in Spanish (Priority: P1) MVP

**Goal**: Experience, Projects, Skills, Contact location and the WhatsApp message are fully Spanish in ES and unchanged in EN.

**Independent Test**: quickstart V5 (facts), V6 (ES scan) on the home page; T027 (EN unchanged).

- [x] T008 [US1] In `src/lib/translations.ts` add the typed group `experience.mywork` `{role, location, bullets}` and `experience.iess` `{role, bullets}` next to `experience.logiztik`; `bullets` is a TUPLE type (6 for MyWork, 2 for IESS) so counts cannot differ; EN = the exact current strings from `Experience.tsx` (role "Senior Full Stack Consultant", location "Quito, Ecuador (Remote)", the 6 bullets, role ".NET Developer", the 2 bullets); ES per research.md R5 ("Consultor full stack senior", "Quito, Ecuador (remoto)", "Desarrollador .NET"; bullets translated with identical facts: "30.000+" users, "~60 %", "4 personas", order preserved) (FR-002, FR-007)
- [x] T009 [US1] In `src/lib/translations.ts` add `projects.items`: a 3-TUPLE of `{title, description}`; EN = exact current titles and descriptions from `Projects.tsx`; ES per R5 ("MyWork — Plataforma de gestión de personal", "Migración a Azure Functions", "Motor de formularios dinámicos" and faithful descriptions, "30.000+" field workers) (FR-003, FR-007)
- [x] T010 [US1] In `src/lib/translations.ts` add `skills.groups` `{backend, frontend, cloud, databases, tools}` each `{name, items}` with `items` a TUPLE of fixed length (Backend 6, Frontend 3, Cloud 5, Databases 2, Tools 3) and leave the existing `skills.also` string in both languages EXACTLY as it is (the Spanish was reviewed by the owner in 005); EN = exact current group names and labels from `Skills.tsx`; ES per R5 (Backend, Frontend, "Nube y DevOps", "Bases de datos", "Herramientas y métodos"; "API REST", "Microservicios", "Ágil/Scrum", "Arquitectura en capas"; technology names unchanged and repeated in both languages) and the secondary list (React, Node.js, MongoDB, MySQL, Power BI) as a tuple (FR-004, FR-007)
- [x] T011 [US1] In `src/lib/translations.ts` add `contact.location` ("Quito, Ecuador (UTC−5)" in both languages: it is identical because it contains only a place name and the time-zone token, both on the FR-010 list) and `contact.whatsappMessage` with the EXACT current EN and ES messages from `WhatsAppButton.tsx` (text unchanged) (FR-005, FR-006)
- [x] T012 [US1] `src/components/sections/Experience.tsx`: build the entries from `t.experience.mywork`, `t.experience.logiztik`, `t.experience.iess`; keep the neutral constants (`start` "Jun 2020" ("Jun" is the same abbreviation in both languages), company names, IESS period "2017 – 2019"); remove the hard-coded English role, location and bullet strings (FR-002, FR-011)
- [x] T013 [P] [US1] `src/components/sections/Projects.tsx`: read titles and descriptions from `t.projects.items`; keep the `tech` arrays and the `featured` flag as constants; remove the hard-coded English (FR-003, FR-011)
- [x] T014 [P] [US1] `src/components/sections/Skills.tsx`: render groups and the secondary list from `t.skills`; keep the inline `·`-separated text and the definition-list layout unchanged; remove `PRIMARY_SKILLS` and `SECONDARY_SKILLS` English constants (FR-004, FR-011)
- [x] T015 [P] [US1] `src/components/sections/Contact.tsx`: show `t.contact.location` instead of the literal line (FR-005, FR-011)
- [x] T016 [P] [US1] `src/components/WhatsAppButton.tsx`: read the message from `translations[language].contact.whatsappMessage` and remove the local `MESSAGES` map (closes baseline deviation D-046) (FR-006, FR-011)
- [x] T017 [US1] Prove no existing string value changed: `git diff -U0 src/lib/translations.ts` must show no removed or edited EN or ES string-value line (this covers the 14 ES strings the owner reviewed in 005); only type-declaration changes and added lines are allowed (FR-008)
- [x] T018 [US1] Run `.tmp/facts.mjs` (T004): digits, years, percentages, bullet counts and order identical between EN and ES (quickstart V5; FR-007)

**Checkpoint**: lint and build pass. Commit: `feat(i18n): spanish experience, projects, skills, contact location and whatsapp message (006)`.

---

## Phase 4: User Story 2 - One source of truth, enforced by the build (Priority: P2)

**Goal**: no user-facing prose outside the translation table; a missing string or a different list length fails the build.

**Independent Test**: quickstart V2, V3, V4.

- [x] T019 [US2] Run `.tmp/i18n-parity.mjs` (T003): key sets identical and every identical EN/ES pair is on the FR-010 allowlist; fix any untranslated string (quickstart V2; FR-010, FR-011, FR-012)
- [x] T020 [US2] Demonstrate the build guarantee (SC-003): delete one ES string, run `npx tsc --noEmit`, record that it fails naming the missing property; delete one ES bullet from a tuple, record that it fails on the tuple length; restore both and confirm `npx tsc --noEmit` passes. Record the outputs in `specs/006-bilingual-parity/research.md` R2 (quickstart V3; FR-012)
- [x] T021 [US2] Search the edited components for sentence-like string literals outside `translations.ts` (3 or more words of letters and spaces, excluding class names, imports, URLs and comments); only the FR-010 neutral constants may remain; list them in `research.md` R3 (quickstart V4; FR-011)
- [x] T022 [US2] Remove any now-unused keys or constants left behind (for example the old `MESSAGES` map, `PRIMARY_SKILLS`) and confirm `npm run lint` reports no unused variable (FR-011)

**Checkpoint**: lint and build pass. Commit: `docs(006): record build-failure demonstration and allowlist` (documentation of results only; code commit if T019 to T022 changed source: `refactor(i18n): remove leftovers (006)`).

---

## Phase 5: User Story 3 - The browser tab title follows the language (Priority: P2)

**Goal**: the tab title follows the active language on the home page, `/blog`, posts and the 404 (owner decision 2026-11-06); meta description unchanged.

**Independent Test**: quickstart V7.

- [x] T023 [US3] In `src/lib/translations.ts` add `meta` `{home, blog}`: EN exactly the current titles ("Luis Jacho Zambrano — Senior Full Stack Developer", "Blog — Luis Jacho Zambrano"); ES home "Luis Jacho Zambrano — Desarrollador full stack senior" (lowercase, as the owner wrote it in feature 005), ES blog "Blog — Luis Jacho Zambrano" (identical, on the allowlist) (FR-020)
- [x] T024 [US3] `src/context/LanguageContext.tsx`: make the provider the single owner of the tab title. Extend the context type with `setPageTitle(title: string | null)`; keep `pageTitle` in state; desired title = `pageTitle`, else `meta.home` when `usePathname()` is `/`, else none. When a desired title exists, set `document.title` and install a `MutationObserver` on `document.head` (childList, subtree, characterData) that re-applies it whenever `document.title` differs; ignore changes already equal (no loop); disconnect in the effect cleanup. Import `usePathname` from `next/navigation` and `translations` as a value (translations.ts imports only the `Language` TYPE from this file; keep that `import type`, so no runtime import cycle). No markup change (FR-020)
- [x] T025 [P] [US3] `src/components/BlogIndex.tsx`: effect with deps `[language]` that calls `setPageTitle(meta.blog)` and, in its cleanup, `setPageTitle(null)` (FR-020)
- [x] T026 [P] [US3] `src/components/LocalizedPost.tsx`: effect with deps `[post.title]` that calls `setPageTitle(post.title)` (the post title in the active language) with cleanup `setPageTitle(null)`; `src/components/BlogNotFound.tsx`: effect with deps `[language]` that calls `setPageTitle(meta.home)` with the same cleanup (keeps today's English 404 title in EN) (FR-020, FR-021)
- [x] T027 [US3] Run `.tmp/title-check.mjs` (T006) against `next start` as a MANDATORY test of client-side navigation: ES selected, then in-app links home to `/blog` to a post to `/blog` to home, sampling `document.title` for 1.5 seconds after each navigation (it must settle on the expected Spanish title within 1 second and stay), a language switch on each page, a missing URL, and back to EN. Fail the task if any run ends on English in ES mode; fix the provider, no new dependency or file. Also assert the page source meta description and Open Graph text are unchanged English. Record the result in `research.md` R4 (quickstart V7; FR-020, FR-021, FR-022)

**Checkpoint**: lint and build pass. Commit: `feat(i18n): tab title follows the language (006)`.

---

## Phase 6: User Story 4 - Earlier owner decisions are on record (Priority: P3)

**Goal**: the three decisions carried over from feature 005 are in spec.md and the shipped UI matches them.

**Independent Test**: read spec.md Owner Decisions; DOM check.

- [ ] T028 [US4] Verify `specs/006-bilingual-parity/spec.md` "Owner Decisions" lists the wordmark, flat Projects cards and inline skills text, each dated 2026-11-06 and attributed to the owner (already written by `/speckit-specify`; fix wording if needed) (FR-030)
- [ ] T029 [US4] With `next start`, check the DOM: the navigation wordmark reads "Luis Jacho Zambrano"; Projects cards have no hover or link behavior (no `a`, no `hover:` background change); Skills render as inline text separated by `·` with no chips; confirms the shipped UI still matches the decisions after US1 (FR-030, FR-044)

**Checkpoint**: lint and build pass. Commit (if anything changed): `docs(006): confirm carried-over owner decisions (006)`.

---

## Phase 7: Polish and verification

- [ ] T030 Run `npm run lint`, `npx tsc --noEmit` and `npm run build`; all exit 0 (quickstart V1; FR-042)
- [ ] T031 Compare the visible English text of the 4 page types on the new build with `.tmp/baseline-en-text.json` (T002): identical (FR-008, FR-044)
- [ ] T032 Run `.tmp/es-scan.mjs` (T005): 0 English sentences in ES on the 4 page types; every identical pair on the allowlist (quickstart V6; FR-001, SC-001)
- [ ] T033 Run `.tmp/es-layout.mjs` (T007): 0px overflow at 360px in ES on the 4 page types; ES first screen above the fold at both viewports; fix any wrapping or overflow without changing the design (quickstart V8; FR-040, FR-041, FR-044)
- [ ] T034 Rerun the 005 scripts in `.tmp/` (`verify.mjs`, `firstscreen.mjs`, `decisions-check.mjs`, `hydration.mjs` against `next dev` if needed): all still pass, no hydration warning on `/` and `/blog` (quickstart V9)
- [ ] T035 Run Lighthouse 3 times, best of 3 (same procedure as T001), save `.tmp/lighthouse-after-006.json`; Performance and Accessibility each at least 90 and no drop greater than 3 vs baseline (quickstart V10; FR-043)
- [ ] T036 Generate `specs/006-bilingual-parity/es-review.md`: a table of every NEW Spanish string with its key, the English original and the Spanish draft, grouped by section, for the owner's review (FR-031); add a note that the About statistic "30k+" is a numeral shown unchanged in ES (the rest of the ES copy writes "30.000") so the owner can decide whether to change it in a follow-up
- [ ] T037 Record the verification results table in `specs/006-bilingual-parity/quickstart.md` and make sure no spec, plan or task claims something the shipped code contradicts
- [ ] T038 [OWNER] Authorize the Vercel preview for the fork PR
- [ ] T039 [OWNER] Review every new Spanish string (use `es-review.md` and the preview), approve or correct them before merge (quickstart O1; FR-031, SC-007)
- [ ] T040 [OWNER] On a real phone and a laptop toggle EN/ES: nothing stays English except names and technology names, nothing overflows, layout otherwise unchanged (quickstart O2)

**Checkpoint**: Commit: `docs: record verification results and es review sheet (006)`.

---

## Dependencies and Execution Order

- Phase 1 first and before any source edit (T001 and T002 need the unmodified build).
- US1 (Phase 3) is the MVP. T008 to T011 edit the same file (`translations.ts`), so run them in order; T012 to T016 touch different files and can run together after T008 to T011.
- US2 (Phase 4) needs US1. US3 (Phase 5) needs `translations.ts` from US1 and is otherwise independent. US4 (Phase 6) can run any time after Phase 1; T029 should run after US1.
- Phase 7 after all stories. T038 to T040 happen after the PR exists.

### Requirement coverage

| FR | Tasks |
|----|-------|
| FR-001 | T005, T032 |
| FR-002 | T008, T012 |
| FR-003 | T009, T013 |
| FR-004 | T010, T014 |
| FR-005 | T011, T015 |
| FR-006 | T011, T016 |
| FR-007 | T004, T008, T009, T010, T018 |
| FR-008 | T002, T017, T031 |
| FR-010 | T003, T019, T021 |
| FR-011 | T012 to T016, T019, T021, T022 |
| FR-012 | T003, T019, T020 |
| FR-020 | T006, T023 to T027 |
| FR-021 | T006, T026, T027 |
| FR-022 | T006, T027 |
| FR-030 | T028, T029 |
| FR-031 | T036, T039 |
| FR-040 | T007, T033 |
| FR-041 | T007, T033 |
| FR-042 | T030 and every checkpoint |
| FR-043 | T001, T035 |
| FR-044 | T002, T029, T031, T033 |

### Parallel example (US1 components)

After T008 to T011: T013, T014, T015 and T016 edit different files and can run together; T012 edits `Experience.tsx` and can run alongside them.

## Implementation Strategy

1. Setup (baselines and scripts), then US1: stop and review the Spanish site (MVP).
2. US2 enforcement, then US3 tab title, then US4 confirmation.
3. Polish, push, PR; owner tasks T038 to T040 on the preview. The owner's review of all Spanish copy blocks the merge.

---

description: "Task list for the design refresh (feature 005)"
---

# Tasks: Design Refresh

**Input**: Design documents from `/specs/005-design-refresh/`

**Prerequisites**: plan.md, spec.md, research.md (R1 to R16), quickstart.md (B1, V1 to V19)

**Tests**: No test framework exists and none is requested. Verification tasks use the quickstart
checks (grep, contrast script, Lighthouse, browser).

**Conventions**: `[P]` = can run in parallel (different files, no dependency on an incomplete
task). `[OWNER]` = only the owner can do it (browser, preview or a confirmation). Scratch files go
in `.tmp/` (gitignored). Each phase ends with a checkpoint: `npm run lint` and `npm run build`
must pass, then commit with a Conventional Commit message ending with the attribution line.

## Phase 1: Setup

**Purpose**: capture the baseline before any source change.

- [x] T001 Confirm `.tmp/` is gitignored (`git check-ignore .tmp`); if not, add `.tmp/` to `.gitignore`
- [x] T002 Build the UNMODIFIED site (`npm run build`, `npm run start`) and run Lighthouse (Performance and Accessibility, mobile and desktop) 3 times against `http://localhost:3000/`; keep the best of 3 per category; save results to `.tmp/lighthouse-baseline.json` (quickstart B1, FR-041). Stop only the PID/port you started
- [x] T003 [P] Write a WCAG contrast script `.tmp/contrast.mjs` that takes pairs of hex colors and prints ratios (used by T039; quickstart V10, FR-020)

**Checkpoint**: baseline numbers recorded. No commit needed (nothing tracked changed).

---

## Phase 2: Foundational (blocks all stories)

**Purpose**: the token layer every story depends on.

- [x] T004 Replace `:root` in `src/app/globals.css` with the 10 constitution v1.1.0 values (`--background #050505`, `--foreground #FFFFFF`, `--accent #548CFF`, `--accent-hover #7DA8FF`, `--surface #0E0E10`, `--surface-2 #18181B`, `--muted #A1A1AA`, `--border #27272A`, `--border-strong #71717A`, `--focus-ring #548CFF`); add `color-scheme: dark` and a `::selection` rule using a neutral highlight (`rgba(255,255,255,.2)`, NOT the accent, because the accent is for links and focus rings only; this deliberately differs from the mock's blue selection and `caret-color`) (FR-001, FR-012; R1)
- [x] T005 Add `border-strong` and `focus-ring` colors (mapped to the CSS variables) to `tailwind.config.ts` (FR-001; R1)
- [x] T006 Add the global `:focus-visible` rule in `src/app/globals.css`: `outline: 2px solid var(--focus-ring); outline-offset: 2px;` and make sure no component keeps `outline-none` or `focus:outline-none` without a replacement ring; use `outline` (not `box-shadow`) so the ring survives forced-colors/high-contrast mode (FR-021; R1; spec edge case)
- [x] T007 Add the `@media (prefers-reduced-motion: reduce)` block to `src/app/globals.css`: `scroll-behavior: auto` and near-zero `animation-duration`, `transition-duration`, `animation-iteration-count: 1` for all elements (FR-022; R7)

**Checkpoint**: lint and build pass. Commit: `feat(theme): apply dark token set and global focus and motion rules (005)`.

---

## Phase 3: User Story 1 - First screen that proves seniority (Priority: P1) MVP

**Goal**: hero matches `mocks/hero-dark.html` in EN and ES on the new tokens.

**Independent Test**: quickstart V13 (first screen at 1280x800 and 390x844, EN and ES, compare
with mock), V2, V4.

- [x] T008 [US1] Add hero strings to `src/lib/translations.ts` for EN and ES: title "Senior .NET & Azure engineer." (ES equivalent), subline "Nine years shipping for US teams. Now building AI agents." (ES), name and location line, availability (EN "Open to senior remote roles and consulting", ES exactly "Disponible para puestos remotos senior y consultoría"), timezone line "Quito, UTC−5 year-round: fully overlapping US Eastern and Central business hours." (ES translation, flagged for owner). Add `hero.portraitAlt` (EN and ES) for the portrait alt text (FR-006, FR-026). Reuse existing `hero.impact` for the proof line, changing only its separator from " · " to a period to match the mock (same facts, EN and ES); reuse existing CTA strings (FR-002, FR-003, FR-004, FR-009; R14)
- [x] T009 [US1] Change "8+" to "9" years in `src/lib/translations.ts` (`hero.bio`, `about.p1`, any other occurrence; EN and ES) in the hard-coded About statistic `value: "8+"` at `src/components/sections/About.tsx:21` (it is NOT in translations.ts), and in the metadata `description` in `src/app/layout.tsx` (FR-008; R13). Verify with `grep -rnE "8\+|8 años" src` returning nothing
- [x] T010 [US1] Rewrite `src/components/sections/Hero.tsx` to match `mocks/hero-dark.html`: reading order title, subline, name line, proof line, `·`-separated stack, CTAs, contact links, availability and timezone meta; two columns from 800px, stacked below; `min-h-svh`; remove `AnimatePresence` re-animation, radial gradient, gradient-text, blue pills, blur glow and looping float; one quiet fade-in (about 0.5s, 8px rise) for text and portrait (FR-002, FR-007, FR-010; R2, R4)
- [x] T011 [US1] In `src/components/sections/Hero.tsx` implement actions and links: primary = `href="/Luis_Jacho_Resume.pdf" download` with `bg-white text-neutral-900 min-h-11 px-[22px] rounded-[10px]`, hover `bg-zinc-200`; secondary = `href="#projects"`, 1px `border-border-strong`, `text-foreground`, hover `bg-surface`; email and LinkedIn as underlined accent text links (`underline-offset-3`, hover `text-accent-hover`) (FR-005, FR-011, FR-012; R5)
- [x] T012 [US1] In `src/components/sections/Hero.tsx` implement the portrait with `next/image` (`/pic.png`, width 1086, height 1448, `priority`), container `aspect-[4/5] rounded-[14px] ring-1 ring-white/[0.07] overflow-hidden`, `object-cover object-top`, alt text from translations; the fixed-aspect container keeps the layout and the `surface` background if the image fails to load (spec edge case); and the availability line: 6px static dot using `#34D399` plus plain text (FR-004, FR-006; R3)
- [x] T013 [P] [US1] In `src/components/sections/Hero.tsx` and `src/app/layout.tsx`, make sure the hero section uses the `bg-background` token (no hard-coded `#0a0a0a`) and `<html className>` no longer carries a stale `dark` class dependency that changes colors; the other sections' hard-coded backgrounds are replaced in Phase 4 (FR-001)

**Checkpoint**: lint and build pass; view EN and ES locally. Commit: `feat(hero): dark tokens and redesigned hero with 9 years copy (005)`.

---

## Phase 4: User Story 2 - No generic UI-kit decoration (Priority: P2)

**Goal**: zero Principle IV banned patterns and zero eyebrow labels, accent only on links and focus.

**Independent Test**: quickstart V3, V5, V6.

- [x] T014 [P] [US2] `src/components/Navbar.tsx`: replace `backdrop-blur-md` (both occurrences) with solid `bg-background` plus `border-b border-border`; monogram/wordmark in `text-foreground`; links `text-muted hover:text-foreground`; language toggle becomes two plain text buttons (EN, ES) with `aria-pressed`, active in `text-foreground`, no pill, no animated indicator (FR-010, FR-012; R4)
- [x] T015 [P] [US2] `src/components/sections/About.tsx`: remove eyebrow `<p>`, make the `h2` plain `text-foreground`, stat numbers `text-foreground`, section background `bg-background`, borders `border-border`; keep the Azure logo SVG gradient as the documented exception (FR-010, FR-013, FR-015, FR-020; R4)
- [x] T016 [P] [US2] `src/components/sections/Experience.tsx`: remove eyebrow, plain `h2`, timeline line `bg-border` and dots neutral (current entry `bg-foreground`, others `border border-border-strong`), company name `text-muted`, arrows `text-muted`, hard-coded `#0a0a0a` ring replaced by token (FR-010, FR-015; R4)
- [x] T017 [P] [US2] `src/components/sections/Skills.tsx`: remove eyebrow and the radial dot-grid `backgroundImage`; render each category's skills as inline text separated by `·` instead of bordered tinted chips; category label `text-muted`; plain `h2` (FR-010, FR-014, FR-015; R4)
- [x] T018 [P] [US2] `src/components/sections/Projects.tsx`: remove eyebrow, gradient hairline, hover lift and shadow; flat cards (`border-border`, hover `bg-surface-2`); "Featured" becomes plain `text-muted` text; plain `h2`; tech stack inline with `·` (FR-010, FR-013, FR-014, FR-015; R4)
- [x] T019 [P] [US2] `src/components/sections/Contact.tsx`: remove eyebrow; plain `h2`; cyan emoji icons become `text-muted` (or plain text labels); the cyan filled CTA becomes the neutral primary style; emerald glow dot becomes the static dot with plain text; contact links as underlined accent links (FR-010, FR-011, FR-012, FR-015; R4, R5)
- [x] T020 [P] [US2] `src/components/WhatsAppButton.tsx`: remove `shadow-lg shadow-black/40`; the tooltip pill becomes a flat bordered label (`border-border-strong`, `rounded-md`, no `rounded-full`); keep the brand-green button (documented exception) (FR-010; R4)
- [x] T021 [P] [US2] `src/components/Footer.tsx`: replace `bg-[#0a0a0a]` and `border-white/5` with `bg-background` and `border-border`; social links as muted text links with accent hover only for link text (FR-001, FR-012)
- [x] T022 [P] [US2] Blog components `src/components/BlogCard.tsx`, `BlogIndex.tsx`, `LocalizedPost.tsx`, `BlogNotFound.tsx`, `MarkdownBody.tsx`, `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx` (only if they contain markup): delete the `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]` classes at BlogCard.tsx:27, BlogNotFound.tsx:26 and LocalizedPost.tsx:21 so the global `:focus-visible` outline (T006, `--focus-ring`) applies and survives forced-colors mode, remove any banned pattern found by the grep in T023, use tokens (`bg-background`, `text-muted`, `border-border`), and set Markdown links to accent underlined via the typography `prose-a` override (FR-010, FR-012; R5)
- [x] T023 [US2] Run the banned-pattern grep from quickstart V5 and the accent grep from V6 across `src`; fix every remaining match except the documented exceptions (Azure SVG gradient, status dot color, WhatsApp brand green); record the final output in `research.md` R4 (FR-010, FR-011, FR-012, FR-014)

**Checkpoint**: lint and build pass. Commit: `refactor(ui): remove banned patterns and eyebrow labels (005)`.

---

## Phase 5: User Story 3 - Accessible to everyone (Priority: P2)

**Goal**: WCAG AA, visible focus, reduced motion, skip link, 44px targets, correct `lang`,
localized labels, `svh`.

**Independent Test**: quickstart V7 to V12 and V14 to V19.

- [x] T024 [US3] Add an `a11y` group to `src/lib/translations.ts` in EN and ES: skip link ("Skip to main content" / "Saltar al contenido principal"), menu toggle, language group label, LinkedIn, email, WhatsApp contact label (FR-023, FR-026; R10)
- [x] T025 [US3] `src/context/LanguageContext.tsx`: add `useEffect` setting `document.documentElement.lang = language`, and wrap the provider's children in Framer Motion `<MotionConfig reducedMotion="user">`; keep `"use client"` and the named export (FR-025, FR-022; R6, R7)
- [x] T026 [US3] `src/components/Navbar.tsx`: render the skip link as the very first focusable element (visually hidden until focus, localized with `t.a11y.skip`, `href="#main"`); localize the menu toggle `aria-label` and the language group `aria-label`; make smooth scroll calls (`scrollIntoView`, `scrollTo`) use `behavior: "auto"` when `matchMedia("(prefers-reduced-motion: reduce)").matches`; keep `data-scroll-behavior="smooth"` on `<html>` in `src/app/layout.tsx` (FR-022, FR-023, FR-026; R7, R8)
- [x] T027 [P] [US3] Add `id="main"` and `tabIndex={-1}` to the `<main>` landmark in `src/app/page.tsx`, `src/components/BlogIndex.tsx`, `src/components/LocalizedPost.tsx` and `src/components/BlogNotFound.tsx` (`src/app/not-found.tsx` only renders `BlogNotFound`, so it needs no change and must stay free of pathname-dependent UI); add `focus:outline-none` only on `#main` because it is a skip target, not a control (FR-023; R8)
- [x] T028 [P] [US3] Replace hard-coded English `aria-label` strings ("LinkedIn", "Email") in `src/components/sections/Hero.tsx` and `src/components/Footer.tsx`, and the WhatsApp label in `src/components/WhatsAppButton.tsx`, with `t.a11y.*` values (FR-026; R10)
- [x] T029 [P] [US3] Touch targets (FR-024 overrides the mock's 28px language buttons): give `min-h-11 min-w-11` (44px, via padding and flex centering) to the language buttons and menu toggle in `src/components/Navbar.tsx`, the social icon links in `src/components/sections/Hero.tsx` and `src/components/Footer.tsx`, the WhatsApp button in `src/components/WhatsAppButton.tsx`, nav links, and the blog back link in `src/components/LocalizedPost.tsx` and `src/components/BlogNotFound.tsx` (FR-024, FR-005; R9)
- [x] T030 [P] [US3] Replace `min-h-screen` with `min-h-svh` in `src/components/sections/Hero.tsx`, `src/components/BlogIndex.tsx`, `src/components/BlogNotFound.tsx`, `src/components/LocalizedPost.tsx` (FR-027; R11)
- [x] T031 [P] [US3] Contrast pass over `src/components` and `src/components/sections`: replace `text-neutral-500/600`, `text-zinc-500/600` (e.g. the About stat labels), `text-slate-*`, `text-gray-*`, `text-white/NN` and similar low-contrast text with `text-muted` or `text-foreground`; control outlines use `border-border-strong`; `border-border` only for decorative dividers (FR-020; R12)
- [x] T032 [US3] Reduced-motion audit of every `motion.*` use (about 119 matches across `motion.` and `AnimatePresence`): make sure that with reduced motion enabled content is visible immediately with no opacity/transform entrance (use `useReducedMotion()` to set `initial={false}` where `MotionConfig` still fades), hover-lift utilities and `transition-all` movement removed (FR-022; R7)
- [x] T033 [US3] Check 360px overflow on home, blog index, blog post and 404 with the dev server at 360px width; fix any horizontal overflow found (FR-028)

**Checkpoint**: lint and build pass. Commit: `feat(a11y): contrast, focus, reduced motion, skip link, targets, lang and labels (005)`.

---

## Phase 6: User Story 4 - Specs match shipped blog (Priority: P3)

**Goal**: blog parts of spec 001 are marked superseded by spec 002.

**Independent Test**: quickstart V11.

- [ ] T034 [US4] Read `specs/001-baseline-current-portfolio/spec.md` in full and list every blog-related item (User Story 5, blog edge cases, blog mentions in FR-002/FR-021/FR-022, FR-110 to FR-120, blog deviations including D-001, D-004, D-005, D-040, D-050, D-052, D-062, D-071, SC-005 and the input line) (FR-030; R15)
- [ ] T035 [US4] Add a one-line note "Superseded by spec 002 (native blog)." to each listed item in `specs/001-baseline-current-portfolio/spec.md`, preserving the original text; do not change non-blog lines. Confirm with `git diff` that the diff contains only added lines (FR-030)

**Checkpoint**: Commit: `docs(specs): mark spec 001 blog sections superseded by 002 (005)`.

---

## Phase 7: Polish and verification

- [ ] T036 Run `npm run lint` and `npm run build`; both must exit 0 (FR-040; V1)
- [ ] T037 Run the grep checks V2, V3, V4, V5, V6, V7, V8 from `quickstart.md`; fix or document every hit (FR-001, FR-008, FR-010, FR-012, FR-026, FR-027)
- [ ] T038 Write `.tmp/` script comparing the EN and ES key sets in `src/lib/translations.ts`; they must be identical (quickstart V9; FR-009)
- [ ] T039 Run `.tmp/contrast.mjs` on every foreground/background pair in use, paste the table into `specs/005-design-refresh/research.md` R12; all text pairs at least 4.5:1, large text and UI at least 3:1 (quickstart V10; FR-020)
- [ ] T040 Build, start and run Lighthouse 3 times (same procedure as T002), best of 3, save `.tmp/lighthouse-after.json`; Performance and Accessibility each at least 90 and no drop greater than 3 vs baseline (quickstart V12; FR-041)
- [ ] T041 Use browser tooling if available to check quickstart V13 to V19 (first screen at both viewports in EN and ES, keyboard and skip link, reduced-motion emulation, 360px, language and `html lang`, 44px targets); list what could not be run (FR-002, FR-007, FR-021 to FR-025, FR-028)
- [ ] T042 Update `DESIGN.md`: replace the DRAFT comment with a short "Implemented 005" note (shipped tokens, hero as built, exceptions); confirm `CLAUDE.md` theme table equals the shipped `:root`; do NOT edit `.specify/memory/constitution.md` (FR-042)
- [ ] T043 Write the final exception list (status dot green, WhatsApp green, Azure SVG gradient, ES translations) into `plan.md` Complexity Tracking with date, for the PR body
- [ ] T044 [OWNER] Confirm the ES translations flagged in T008 (title, subline, name line, timezone line) and the exceptions of T043 (status-dot green `#34D399`, WhatsApp brand green)
- [ ] T045 [OWNER] On the Vercel preview (authorize it for the fork PR), run quickstart V13 to V19 on a real phone and a laptop; report anything off

**Checkpoint**: Commit: `docs: record verification results and design notes (005)`.

---

## Dependencies and Execution Order

- Phase 1 first and before any source edit (T002 needs the unmodified build).
- Phase 2 blocks Phases 3 to 5.
- US1 (Phase 3) is the MVP and needs only Phase 2.
- US2 (Phase 4) is independent of US3 but touches the same files; run US2 before US3 to avoid conflicts, tasks marked `[P]` inside a phase touch different files.
- US4 (Phase 6) is independent and can run any time after Phase 1.
- Phase 7 after all stories. T044 and T045 happen after the PR exists.

### Requirement coverage

| FR | Tasks |
|----|-------|
| FR-001 | T004, T005, T013, T021, T037 |
| FR-002, FR-003, FR-004 | T008, T010, T012 |
| FR-005 | T011, T029 |
| FR-006 | T012 |
| FR-007 | T010, T041 |
| FR-008 | T009, T037 |
| FR-009 | T008, T038 |
| FR-010 | T010, T014 to T020, T022, T023 |
| FR-011 | T011, T019, T023 |
| FR-012 | T011, T014, T019, T021, T022, T023 |
| FR-013 | T015, T018 |
| FR-014 | T017, T018, T023 |
| FR-015 | T015 to T019 |
| FR-020 | T015, T031, T039 |
| FR-021 | T006 |
| FR-022 | T007, T025, T026, T032 |
| FR-023 | T024, T026, T027 |
| FR-024 | T029 |
| FR-025 | T025 |
| FR-026 | T024, T026, T028 |
| FR-027 | T030 |
| FR-028 | T033 |
| FR-030 | T034, T035 |
| FR-040 | T036 and every checkpoint |
| FR-041 | T002, T040 |
| FR-042 | T042 |

### Parallel example (Phase 4)

T014 to T022 each edit different files and can run together; T023 runs after all of them.

## Implementation Strategy

1. Setup, then Foundational, then US1: stop and review the hero (MVP).
2. US2, then US3 (same files, so sequential), then US4.
3. Polish, push, PR; owner tasks T044 and T045 on the preview.

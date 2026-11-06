---

description: "Task list for the Next.js 16 / React 19 / Node 24 upgrade"
---

# Tasks: Upgrade Next.js 14.2 → 16 with React 19

**Input**: Design documents from `/specs/004-upgrade-nextjs-16/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/unchanged-surface.md, quickstart.md

**Tests**: No automated test suite exists and none was requested. Verification tasks (lint, build, audit, draft gating, Lighthouse, visual comparison) take their place.

**Organization**: Tasks are grouped by user story. The upgrade itself touches every story, so it is the Foundational phase; each story phase then verifies its own outcome.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story from spec.md (US1 security, US2 no visible change, US3 build/CI/performance, US4 documentation)
- Commands are PowerShell, run from the repository root. Detailed procedures: `quickstart.md`.

---

## Phase 1: Setup — Baseline capture (on the feature branch, before any code change)

**Purpose**: Record the "before" state so every later comparison has a reference (data-model.md "Baseline"). The feature branch has only `specs/` changes at this point, so its code is identical to `master` (checked in T005).

- [X] T001 On branch `004-upgrade-nextjs-16`, run `npm ci; npm audit` and save the summary (counts per severity, package names of every critical/high) to `specs/004-upgrade-nextjs-16/baseline.md`
- [X] T002 Run `npm run build` (before any dependency change) and paste the route table (static/dynamic markers for `/`, `/blog`, `/blog/[slug]`, `/_not-found`) into `specs/004-upgrade-nextjs-16/baseline.md`
- [X] T003 With `npm start` on this build, run Lighthouse (mobile) on `/` and `/blog/ai-agent-workflow-portfolio` three times each and record the best of 3 for the four category scores per page in `specs/004-upgrade-nextjs-16/baseline.md`
- [X] T004 [P] Capture screenshots (EN and ES; 390px and 1280px) of `/`, `/blog`, `/blog/ai-agent-workflow-portfolio`, `/nope`, `/blog/nope` into an untracked folder `specs/004-upgrade-nextjs-16/screenshots/baseline/` and add `specs/004-upgrade-nextjs-16/screenshots/` to `.gitignore`
- [X] T005 Confirm the baseline was taken on unchanged code: `git diff master --stat -- . ":!specs" ":!.gitignore"` prints nothing (the only allowed non-spec change is the `.gitignore` line from T004)

**Checkpoint**: `baseline.md` contains audit, route table and best-of-3 Lighthouse numbers; baseline screenshots exist; T005 passed.

---

## Phase 2: Foundational — Perform the upgrade (blocks all stories)

**Purpose**: Apply the official codemods and the manual changes. Nothing can be verified until this phase finishes.

**CRITICAL**: Do not start story phases until `npm run lint` and `npm run build` both exit 0 (T014).

- [X] T006 Run `npx @next/codemod@latest upgrade latest` in the repository root, accept the prompted codemods (async request APIs, ESLint CLI migration, others offered), then list every file it changed with `git diff --stat` and note each codemod that ran in `specs/004-upgrade-nextjs-16/research.md` under the matching R-02..R-10 entry (applied / no-op)
- [X] T007 Edit `package.json` so versions are: `next` 16.x (latest stable), `react` and `react-dom` ^19, `@types/react` and `@types/react-dom` ^19, `eslint` ^9, `eslint-config-next` same version as `next`, `@types/node` ^24; leave `framer-motion`, `react-markdown`, `remark-gfm`, `@tailwindcss/typography`, `tailwindcss`, `gray-matter`, `zod` as they are; add no new dependency (FR-012)
- [X] T008 In `package.json` add `"engines": { "node": ">=24" }` and set the script `"lint": "eslint ."` (the `dev`, `build`, `start` scripts stay as they are)
- [X] T009 Run `npm install` to refresh `package-lock.json`; confirm with `npm ls next react react-dom eslint` that exactly one copy of each is installed at the intended version
- [X] T010 [P] Create `eslint.config.mjs` in the repository root: flat config using `defineConfig` / `globalIgnores` from `eslint/config`, spreading `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`, ignoring `.next/**`, `out/**`, `build/**`, `next-env.d.ts`; then delete `.eslintrc.json`. If the codemod from T006 already produced an equivalent file, review and keep it instead
- [X] T011 [P] In `src/app/blog/[slug]/page.tsx` make `params` async: `type Props = { params: Promise<{ slug: string }> }`; `generateMetadata` becomes `async` and reads `const { slug } = await params`; `PostPage` becomes `async` likewise. Keep `dynamicParams = false`, `generateStaticParams`, `notFound()` and the metadata fields exactly as they are. Skip if the codemod already produced this
- [X] T012 [P] In `.github/workflows/ci.yml` change `node-version: 20` to `node-version: 24`; keep the step order `npm ci`, `npm run lint`, `npm run build`
- [X] T013 Run `npm run lint` and fix every reported problem. Prefer behavior-neutral fixes in the affected files under `src/`; if a new React-hooks rule flags an existing client component (e.g. `src/context/LanguageContext.tsx`, `src/components/Navbar.tsx`) and a fix would change behavior, disable only that rule on that line with a comment and record it in `research.md` R-03
- [X] T014 Run `npm run build` (Turbopack default). Fix errors; accept Next's automatic `tsconfig.json` edits and review that diff. If the Tailwind/typography CSS differs from baseline and cannot be fixed, set `"build": "next build --webpack"` and record the reason in `research.md` R-04

**Checkpoint**: `npm ci && npm run lint && npm run build` pass on Node 24.

---

## Phase 3: User Story 1 — Security advisories closed (Priority: P1)

**Goal**: 0 critical and 0 high audit findings (or each documented).

**Independent Test**: `npm audit` after the upgrade compared with `baseline.md`.

- [X] T015 [US1] Run `npm audit` and write the before/after comparison into `specs/004-upgrade-nextjs-16/research.md` by creating a new section "R-13 Audit result": one row per former critical/high finding with status fixed / residual (data-model.md "Audit finding")
- [X] T016 [US1] For any critical or high finding still present, add package, scope (runtime/dev-only), reason it cannot be fixed and mitigation to R-13; do not use `npm audit fix --force`. A residual high in a **dev-only** package does not block the merge by itself but needs an explicit owner decision recorded in R-13 before merging; a residual critical or runtime high blocks the merge. If a fix needs a version change, change it explicitly in `package.json` and rerun T009 and T013..T014
- [X] T017 [US1] Confirm `npm ls next react react-dom` shows Next 16.x and React 19.x (spec acceptance scenario 3 of US1) and paste the output into R-13

**Checkpoint**: R-13 shows SC-001 satisfied or fully justified.

---

## Phase 4: User Story 2 — Visitors see no change (Priority: P1)

**Goal**: Identical pages and behavior in EN and ES; draft gating intact.

**Independent Test**: Screenshot comparison, interaction walkthrough, draft-gating builds.

- [ ] T018 [US2] Run `npm run build; npm start` and capture the same screenshot set as T004 into `specs/004-upgrade-nextjs-16/screenshots/after/`; compare each pair at both widths and both languages and list any difference in `specs/004-upgrade-nextjs-16/research.md` (create section R-14); accept differences no larger than anti-aliasing noise, anything else is a failure (expected: none). Pay attention to prose styling on the blog post (typography plugin) and the hero image
- [ ] T019 [US2] In the running site, check EN/ES switching, Navbar links, CV download of `/Luis_Jacho_Resume.pdf`, WhatsApp button, Contact links, and that the browser console shows no hydration errors or React 19 warnings; tab through the page to confirm focus rings are still visible, and toggle `prefers-reduced-motion` once to confirm animations still calm down (constitution accessibility rules); note results in R-14
- [ ] T020 [US2] Confirm the `next build` route table matches the baseline from T002: `/`, `/blog` static, `/blog/[slug]` statically generated with only existing slugs, no route turned dynamic (R-08)
- [ ] T021 [US2] Confirm `/nope` shows the general localized 404 and `/blog/nope` the post-not-found wording, in EN and ES
- [ ] T022 [US2] Draft gating, production: create an uncommitted throwaway post `content/blog/zz-draft-check/en.md` and `es.md` (valid frontmatter, `draft: true` in both), run `$env:VERCEL_ENV="production"; npm run build`, and confirm the draft is absent from the route table and from `/blog`, and `/blog/zz-draft-check` returns 404 (FR-005, SC-006)
- [ ] T023 [US2] Draft gating, non-production: with `VERCEL_ENV` unset (`Remove-Item Env:VERCEL_ENV`) run `npm run build` and confirm the draft is listed and reachable
- [ ] T024 [US2] Invalid content still fails the build: temporarily remove `title` from `content/blog/zz-draft-check/en.md`, run `npm run build`, confirm it fails with a message naming the post, language and field; then delete the whole `content/blog/zz-draft-check/` folder and confirm `git status` shows no leftover content changes
- [ ] T025 [US2] Record T022..T024 outcomes in `research.md` R-09 (replace "expected" with "verified" and the date)

**Checkpoint**: No visible or behavioral difference; draft gating verified in both modes.

---

## Phase 5: User Story 3 — Build, CI and performance stay green (Priority: P2)

**Goal**: Lint, build and CI pass on Node 24; Lighthouse not below baseline.

**Independent Test**: CI run on the PR plus Lighthouse comparison.

- [ ] T026 [US3] With the production build running (`npm start`), run Lighthouse (mobile) on `/` and `/blog/ai-agent-workflow-portfolio` three times each and add the best-of-3 "after" table next to the baseline in `specs/004-upgrade-nextjs-16/baseline.md`; every category must be >= baseline (FR-008), and on `/` Performance and Accessibility must also be >= 90 (constitution, Development Workflow). If any category dropped, investigate (image `srcset`/caching defaults in R-07, CSS output in R-04) and fix. If the baseline itself was under 90, stop and report it to the owner instead of passing silently
- [ ] T027 [US3] Verify the hero image (`src/components/sections/Hero.tsx`) and a markdown image path still load through `next/image` without warnings; if the build warns that `priority` is deprecated, replace it with `preload` and record it in `research.md` R-07
- [ ] T028 [US3] Commit the work in logical commits using Conventional Commit prefixes (`chore:` for dependency/CI/config, `fix:` for code changes, `docs:` for docs) on `004-upgrade-nextjs-16`, push, and open a PR to `master`; confirm the CI workflow passes on Node 24 (SC-003)

**Checkpoint**: CI green; Lighthouse table shows no regression.

---

## Phase 6: User Story 4 — Breaking changes documented (Priority: P3)

**Goal**: Every guide item has an applies / not-applies entry with its resolution.

**Independent Test**: Read `research.md`; each R-02..R-10 row says what actually happened.

- [ ] T029 [US4] Reconcile `specs/004-upgrade-nextjs-16/research.md` R-02..R-10 with reality: for each item write "applied by <codemod or manual edit, file>" or "not applicable: <evidence>", replacing any planning-time "expected/likely" wording; add any breaking change that surfaced and was not predicted
- [ ] T030 [US4] Re-read the official Next.js 15 and 16 upgrade guides once and tick off every listed breaking change against R-10's table; add missing rows so SC-005 (100% coverage) holds
- [ ] T031 [P] [US4] Add a short pointer to this feature in `specs/003-quick-fixes/research.md` R-04: "Residual findings resolved by feature 004 (see specs/004-upgrade-nextjs-16/research.md R-13)"

**Checkpoint**: Breaking-change record complete and audited.

---

## Phase 7: Polish & Owner Tasks

**Purpose**: Documentation consistency, the dependency-diff check and the manual Vercel step.

- [ ] T032 [P] Update `CLAUDE.md`: "Framework: Next.js 14 (App Router)" → "Next.js 16 (App Router)"; mention React 19 and Node 24 only if the file lists runtime versions
- [ ] T033 [P] Update `README.md` where it states the Next.js version or Node requirement (it lists "Next.js (App Router)"; add Node 24 to any prerequisites list)
- [ ] T034 Check `.specify/memory/constitution.md` Principle I: it says the version lives in `package.json`, so no edit is expected; if any sentence names Next 14 or Node 20, correct it and add a Sync Impact Report entry (FR-010)
- [ ] T035 **OWNER (manual, cannot be done from the repo)**: In Vercel → project `luis-jacho` → Settings → Build and Deployment → Node.js Version, select **24.x** and save. Do this before merging the PR (FR-013)
- [ ] T036 After T035, redeploy the PR preview and confirm in the Vercel build log that Node 24 is used and the build succeeds; note the date in `research.md` R-06
- [ ] T037 Run the full `quickstart.md` section 3 once more on the final branch state (lint, build, audit, `node -v`) and tick the "Done" list in `quickstart.md` section 4
- [ ] T038 FR-012 check: run `git diff master -- package.json` and confirm the only changes are: versions of `next`, `react`, `react-dom`, `eslint`, `eslint-config-next`, `@types/react`, `@types/react-dom`, `@types/node`; the `lint` script; the new `engines` field. Any added or removed dependency name is a failure; fix or justify it in `research.md` R-03
- [ ] T039 Merge the PR after CI and the Vercel preview are green; delete the local throwaway artifacts (`specs/004-upgrade-nextjs-16/screenshots/` stays untracked)

---

## Dependencies & Execution Order

- Phase 1 (baseline, on the feature branch) → Phase 2 (upgrade) → Phases 3, 4, 5, 6 → Phase 7.
- Inside Phase 2: T006 → T007 → T008 → T009; then T010, T011, T012 in parallel (different files); then T013 → T014.
- Phases 3 and 4 are independent of each other once Phase 2 is done (both P1). Phase 5 needs a production build from Phase 2 and the commits from Phases 3-4 (T028 pushes everything). Phase 6 can run alongside Phases 3-5.
- T035 (owner) has no code dependency and can be done any time before T036; do it early to avoid blocking the merge.

## Parallel Examples

- Phase 1: T004 (screenshots) in parallel with T003 (Lighthouse) if two shells/browsers are available; T001-T002 must come first.
- Phase 2: T010, T011, T012 together.
- Phase 7: T032, T033 together; T035 by the owner at any time.

## Implementation Strategy

1. **MVP = Phases 1-2 + US1 (Phase 3)**: the upgrade compiles, lints and the audit is clean. This closes the critical advisory.
2. Add US2 verification (the other P1) before opening the PR; do not merge without it.
3. US3 and US4 finish the merge gate and the record. Phase 7 includes the manual Vercel step.

## Notes

- No new dependencies beyond upgraded ones (FR-012). If a task seems to need one (e.g. `@eslint/eslintrc`), stop and re-check research.md R-03.
- Stop and report instead of pinning back to Next 14 if a blocker appears (R-12).

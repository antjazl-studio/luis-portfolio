---

description: "Task list for the native blog (replaces Dev.to)"
---

# Tasks: Native Blog Replacing Dev.to

**Input**: Design documents from `/specs/002-native-blog/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested and no test runner is added (plan.md, Technical Context). Verification is
by build-time failure fixtures, lint/build, and the manual scenarios in quickstart.md.

**Organization**: Grouped by user story. Stories are ordered by dependency (authoring/validation
first, since every other story renders loader output), then priority.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 Browse index · US2 Read post · US3 Share/metadata · US4 Authoring/validation ·
  US5 Drafts + launch post · US6 Dev.to removed
- All paths are relative to the repository root.

---

## Phase 1: Setup

- [X] T001 Add runtime dependencies `gray-matter`, `zod`, `react-markdown`, `remark-gfm` (and no others) via `npm install` in package.json / package-lock.json
- [X] T002 [P] Create empty content directory `content/blog/` with a `.gitkeep` (removed in T019 once the launch post exists); `public/blog/` is created only if a post needs an image

---

## Phase 2: Foundational (blocks all stories)

**Purpose**: loader, Markdown rendering and shared strings that every story uses.

- [X] T003 Create `src/lib/blog.ts` with types `Lang`, `PostVersion`, `Post` per contracts/blog-module.md; read each `content/blog/<slug>/{en,es}.md` with gray-matter; zod schema for frontmatter: `title` non-empty string, `summary` non-empty string, `date` ISO `YYYY-MM-DD` or full ISO that parses to a valid date (accept YAML `Date` and normalise to ISO string), `draft` boolean defaulting to `false`; body must be non-empty; compute `readingTime = Math.max(1, Math.ceil(words / 200))` with words = whitespace tokens of the body after removing HTML comments; export `loadPosts(rootDir?, opts?)` (throws on any error, memoised), `getVisiblePosts()` (sorted by EN `date` descending, ties by `slug` ascending), `getPost(slug)` (visible only), `isProductionBuild()` (`process.env.VERCEL_ENV === "production"`); drafts are always validated, then filtered out only when `isProductionBuild()`; ignore non-directory entries (e.g. `.gitkeep`) directly under `content/blog/`, and return `[]` when `content/blog/` is empty or absent
- [X] T004 [P] Add a `blog` group (EN and ES) to the `Translation` type and both language objects in `src/lib/translations.ts`: `title`, `intro`, `empty`, `readingTime` (with `{n}` placeholder: "{n} min read" / "{n} min de lectura"), `back`, `notFoundTitle`, `notFoundBody`, `notFoundLink`, `dateLocale` (`en-US` / `es-EC`)
- [X] T005 [P] Create `src/components/MarkdownBody.tsx` (server component, named export): `<ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>` with component overrides — `img` renders `next/image` (`width={0} height={0} sizes="100vw"`, class `h-auto w-full`) only when `src` starts with `/`, otherwise renders just the alt text; `a` adds `target="_blank" rel="noopener noreferrer"` for external URLs; `pre` and `table` wrapped/classed with `overflow-x-auto`; keep default URL sanitising; no `dangerouslySetInnerHTML`; prose classes `prose prose-invert max-w-none` with neutral overrides only (white headings, neutral body text, `--accent` for links, neutral code/pre styling) per Principle IV/V — no cyan, glows or gradients
- [X] T006 [P] Set `metadataBase` in `src/app/layout.tsx` metadata: `new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? \`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}\` : "http://localhost:3000")`

**Checkpoint**: `npm run lint` passes with the new files (they are not yet used).

---

## Phase 3: User Story 4 - Author adds a post safely (P1)

**Goal**: The build refuses invalid or incomplete posts with precise messages.

**Independent Test**: quickstart.md section 3 fixtures each fail the build with the listed message; a valid pair builds.

- [X] T007 [US4] In `src/lib/blog.ts`, enforce pairing/identity rules and throw with the exact message shapes from data-model.md: slug regex `^[a-z0-9]+(?:-[a-z0-9]+)*$` (`post "<slug>": directory name must be lowercase letters, digits and hyphens`); `post "<slug>": missing <lang>.md`; `post "<slug>": unexpected file <name>`; `post "<slug>": duplicate identifier` (case-insensitive comparison of directory names, FR-022); `post "<slug>": draft differs between en and es` (FR-011a); field errors formatted `post "<slug>" [<lang>] <field>: <reason>` built from zod issues (FR-021)
**Checkpoint**: US4 rules implemented; the fixture run (T008) happens in Phase 5, once pages call the loader during `npm run build`.

---

## Phase 4: User Story 1 - Browse the blog index (P1) — MVP

**Goal**: `/blog` lists visible posts in the active language, newest first, with no network or loading state.

**Independent Test**: quickstart.md section 1 steps 1, 2 and 5 (needs at least one post — use a temporary valid fixture or T018).

- [X] T009 [P] [US1] Rewrite `src/components/BlogCard.tsx` as a presentational named-export component (no data source, no Dev.to types); it is rendered inside client `BlogIndex` and calls `useLanguage()` itself for `t.blog` strings and `dateLocale`; do T009, T011 and T015 together before running lint/build, because the old pages import the old `Article` type: title, formatted date (`Intl.DateTimeFormat(dateLocale, { dateStyle: "medium", timeZone: "UTC" })`), summary, reading time via `t.blog.readingTime`, whole card links to `/blog/<slug>` via `next/link`; neutral styling per Principle IV (no pill badges, no cyan, no draft notice); any image via `next/image`
- [X] T010 [US1] Create `src/components/BlogIndex.tsx` (`"use client"`, named export): receives serialisable `{ slug; en: Card; es: Card }[]`, reads `useLanguage()`, renders heading/intro from `t.blog`, a list of `BlogCard`, and the localized `t.blog.empty` message when the list is empty (FR-032, FR-033, FR-093)
- [X] T011 [US1] Replace `src/app/blog/page.tsx` with a server component (no `"use client"`): calls `getVisiblePosts()`, maps to card data for both languages, renders `BlogIndex`; export static `metadata` (index title + description, EN) (FR-051)
- [X] T012 [US1] Verify at 360px and desktop: no horizontal overflow, language switch updates without reload, ordering newest first with two temporary fixtures (then remove them)

**Checkpoint**: US1 independently functional.

---

## Phase 5: User Story 2 - Read a post (P1)

**Goal**: `/blog/<slug>` renders the full post in the active language, statically generated.

**Independent Test**: quickstart.md section 1 steps 3 and 4.

- [X] T013 [P] [US2] Create `src/components/LocalizedPost.tsx` (`"use client"`, named export): props `{ slug; en: { title; date; readingTime; content: ReactNode }; es: { … } }`; picks by `useLanguage()`; renders back link (`t.blog.back` → `/blog`), title, localized date, reading time, and `content`
- [X] T014 [P] [US2] Create `src/components/BlogNotFound.tsx` (`"use client"`, named export) and a root `src/app/not-found.tsx` rendering it (with `dynamicParams = false`, unknown slugs fall through to the root not-found, not a segment one): localized "post not found" wording and a link to `/blog` for `/blog/*` paths, generic localized page-not-found with a link home otherwise (FR-042)
- [X] T015 [US2] Replace `src/app/blog/[slug]/page.tsx` with a server component: `export const dynamicParams = false`; `generateStaticParams` from `getVisiblePosts()`; page calls `getPost(params.slug)` → `notFound()` when undefined; renders `MarkdownBody` for EN and ES bodies and passes both to `LocalizedPost` (FR-041, FR-043)
- [X] T016 [US2] Verify direct-URL load in a private window, unknown slug → localized not-found, code block scrolls inside its container at 360px
- [X] T008 [US4] Run the quickstart.md section 3 fixture table against a temporary post in `content/blog/` (each case, plus the draft-with-missing-language case under `VERCEL_ENV=production`); confirm each `npm run build` fails with the expected message, then delete the fixture

**Checkpoint**: US1 + US2 work together.

---

## Phase 6: User Story 5 - Drafts hidden from production + launch post (P1)

**Goal**: One draft launch post, visible locally/preview, absent in production.

**Independent Test**: quickstart.md section 2.

- [X] T017 [US5] Check only (logic is implemented in T003): confirm `getVisiblePosts()`/`getPost()` in `src/lib/blog.ts` exclude drafts only when `isProductionBuild()`, so index, static params and metadata all derive from the filtered list (FR-090/091/093); no draft badge anywhere in the UI (FR-030)
- [X] T018 [P] [US5] Write `content/blog/ai-agent-workflow-portfolio/en.md` with frontmatter `title: "How I built an AI-agent workflow for my portfolio"`, a `summary`, `date: 2026-11-05`, `draft: true`; body covers ONLY: Spec Kit and the constitution; the least-privilege bot account contributing via fork and pull request; CI (lint and build — `.github/workflows`); branch protection; Vercel previews; human review of every change. No metrics, dates, versions, outcomes or quotes. Branch-protection and Vercel-preview statements stay generic and each is preceded by `<!-- REVIEW: owner to confirm … -->` (FR-070–072)
- [X] T019 [P] [US5] Write `content/blog/ai-agent-workflow-portfolio/es.md`: Spanish equivalent with identical `date`, `draft: true`, same structure and the same `REVIEW` comments; remove the `.gitkeep` from T002
- [X] T020 [US5] Run quickstart.md section 2: `VERCEL_ENV=production npm run build` + `npm start` → empty state in EN/ES and post URL not found; remove `draft` in a scratch copy and rebuild → post listed; restore `draft: true`; confirm `grep -r "REVIEW:" content/` lists the review points in both files

**Checkpoint**: launch content in place, draft-gated.

---

## Phase 7: User Story 3 - Share and discover posts (P2)

**Goal**: Post-specific title, description and Open Graph tags in the delivered HTML.

**Independent Test**: view source of `/blog/<slug>` and check head tags.

- [X] T021 [US3] Add `generateMetadata` to `src/app/blog/[slug]/page.tsx` (return `{}` when `getPost` is undefined; the page itself calls `notFound()`) using the EN version: `title`, `description` (summary), `openGraph: { type: "article", title, description, url: "/blog/<slug>", publishedTime: <date> }` (FR-050, FR-052; resolved against `metadataBase` from T006)
- [X] T022 [US3] Verify with `curl localhost:3000/blog/ai-agent-workflow-portfolio` (or view-source) that `<title>`, `og:title`, `og:description`, `og:type=article`, `og:url` (absolute, localhost fallback) and the article body are present in the initial HTML; verify that under `VERCEL_ENV=production` the draft URL yields none of this (SC-011)

---

## Phase 8: User Story 6 - Dev.to integration is gone (P1)

**Goal**: Zero Dev.to / rss2json references and no stored-data dependence.

**Independent Test**: quickstart.md section 4 greps.

- [X] T023 [US6] Confirm no leftovers in `src/`: old fetch/RSS/`localStorage`/`stripHtml`/`slugify` code and the old `Article` type are gone (they lived in the old `src/app/blog/page.tsx`, `[slug]/page.tsx`, `src/components/BlogCard.tsx`, rewritten in T009/T011/T015); delete any unused env usage or types; `grep -rniE "dev\.to|rss2json" src package.json` returns nothing
- [X] T024 [P] [US6] Update `CLAUDE.md`: remove Dev.to/rss2json mentions; update the structure tree (add `content/blog/`, `BlogIndex.tsx`, `LocalizedPost.tsx`, `MarkdownBody.tsx`, `BlogNotFound.tsx`, `lib/blog.ts`, `blog/not-found.tsx`; describe `BlogCard.tsx` as presentational)
- [X] T025 [P] [US6] Run `/speckit-constitution` (do not hand-edit `.specify/memory/constitution.md`) with these changes: Principle VII remove the "Dev.to via rss2json" example; Principle II structure list updated to match T024; PATCH bump to 1.0.1 with Sync Impact Report and Last Amended date
- [X] T026 [US6] Verify the blog works with network blocked to third parties (DevTools offline after first load) and `grep -rn "dangerouslySetInnerHTML" src` returns nothing

---

## Phase 9: Polish & Cross-Cutting

- [X] T027 Run `npm run lint` and `npm run build`; fix errors; confirm the `@next/next/no-img-element` warnings are gone
- [X] T028 [P] Principle IV review of `/blog` and the post page in the browser at 360px and desktop (no cyan, glows, gradients, pill badges; white headings; neutral secondary text; visible focus states; alt text)
- [X] T029 [P] Lighthouse on `/` and `/blog`: Performance and Accessibility ≥ 90 (FR-082, SC-010)
- [X] T030 Run the full quickstart.md end to end, plus manual checks: SC-001 (home → Blog → post in ≤ 2 clicks), SC-004 (language switch on index and post updates all text within 1 second, no reload), SC-005 (a new temporary post added by content files alone appears in index and gets a page with zero code changes; then remove it); record results in the PR description

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 (blocks everything). T003 first; T004, T005, T006 parallel after T001.
- US4 (T007) depends on T003 only; its fixture run T008 depends on T011 and T015 (pages must call the loader at build); US1 needs T003, T004; US2 needs T003–T005 and US1's BlogCard link target; US5 content (T018/T019) can be written any time after T001 but is verified after US1/US2; US3 depends on T015 and T006; US6 cleanup (T023) depends on T011/T015 and T009; docs T024/T025 are independent.
- Polish depends on all stories.
- Same-file sequencing: `src/lib/blog.ts` (T003 → T007 → T017), `src/app/blog/[slug]/page.tsx` (T015 → T021).

## Parallel Examples

```text
After T001:   T004 (translations), T005 (MarkdownBody), T006 (metadataBase)
US1/US2:      T009 (BlogCard) ‖ T013 (LocalizedPost) ‖ T014 (BlogNotFound)
Content:      T018 (en.md) ‖ T019 (es.md)
Docs:         T024 (CLAUDE.md) ‖ T025 (constitution)
```

## Implementation Strategy

- **MVP**: Phases 1–2, US4, US1, US2 with a temporary or the launch draft post → a working,
  validated, bilingual blog locally.
- **Then**: US5 (launch content + production gating), US3 (metadata), US6 (cleanup + governance
  docs), Polish.
- The feature is not shippable until US5 and US6 are done; merge only after T027–T030 pass.

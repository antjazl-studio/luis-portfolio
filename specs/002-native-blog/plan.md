# Implementation Plan: Native Blog Replacing Dev.to

**Branch**: `002-native-blog` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-native-blog/spec.md`, plus the owner's technical
decisions (recorded in [research.md](./research.md)).

## Summary

Replace the client-side Dev.to/rss2json blog with a repository-native one. Posts are plain
Markdown files, `content/blog/<slug>/{en,es}.md`, parsed with gray-matter and validated by zod in
one loader (`src/lib/blog.ts`); any validation error throws and fails the build. The index and
post pages are statically generated server components; react-markdown + remark-gfm render the body
to React elements (raw HTML skipped, no `dangerouslySetInnerHTML`). Both languages are rendered on
the server and a small client component shows the one selected in `LanguageContext`. Drafts are
included unless `VERCEL_ENV === "production"`. The Dev.to code, old `BlogCard` data source and
related types are deleted. One launch post (draft) is added.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 14.2 (App Router), React 18, Node 20 (CI)

**Primary Dependencies**: existing: Tailwind CSS (+ `@tailwindcss/typography`), Framer Motion.
New runtime deps (the only ones allowed): `gray-matter`, `zod`, `react-markdown`, `remark-gfm`.

**Storage**: Markdown files in `content/blog/` (no CMS, API or database)

**Testing**: No test runner exists and none is added. Verification = build-time validation
failures (fixtures in quickstart), `npm run lint`, `npm run build`, manual browser checks at
360px/desktop, Lighthouse.

**Target Platform**: Vercel (production + preview), static generation

**Project Type**: Web application (single Next.js project)

**Performance Goals**: Lighthouse Performance and Accessibility ≥ 90 (home required, blog
should); zero client-side fetching.

**Constraints**: no horizontal overflow at 360px; no third-party requests; Principle IV styling.

**Scale/Scope**: 1 post at launch; no pagination/search/tags/RSS.

## Constitution Check

*GATE: passed before Phase 0; re-checked after Phase 1 (no change).*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Stack Fidelity | PASS | The four new deps do not duplicate CSS/animation/UI-kit capabilities. Justification: gray-matter (frontmatter), zod (build-time validation), react-markdown + remark-gfm (safe Markdown → React; avoids `dangerouslySetInnerHTML`). Typography plugin is already installed. No other dependency added. |
| II. Component Conventions | PASS | Named exports; pages/layouts stay server components; `"use client"` only in `BlogIndex`, `LocalizedPost`, `BlogNotFound` (read `LanguageContext`). Structure list in constitution and `CLAUDE.md` must be updated (task). |
| III. Mobile-first | PASS | Mobile-first classes; code blocks scroll in their own container (`overflow-x-auto`), tables likewise; verified at 360px. |
| IV. Minimal UI | PASS | Restyle prose neutrally: white headings, neutral body, `--accent` only for links. Removes the existing cyan code/link colours and `bg-[#141414]` cards. No badges, glows or gradients; no draft badge. |
| V. Theme variables | PASS | Colours from CSS variables / neutral utilities. |
| VI. Bilingual Parity | PASS | Post content is paired EN/ES (enforced by build); fixed UI strings added to `lib/translations.ts` (new `blog` group). No i18n library. |
| VII. Resilient Integrations | PASS (simplifies) | No external calls. Principle text mentions "Dev.to via rss2json": amend to remove that example (PATCH bump, Sync Impact Report). |
| Content rule (no invented facts) | PASS | Launch post limited to FR-071; unconfirmed passages marked with HTML comments (`<!-- REVIEW: … -->`), which `skipHtml` drops so they never render. |
| Workflow | PASS | Feature branch; `npm run lint` and `npm run build` must pass; CI already runs both (CI is not `VERCEL_ENV=production`, so drafts are built and validated there). |

Baseline deviations resolved by this feature: D-001, D-040, D-050–D-053, D-056, blog parts of
D-004, D-005, D-014, D-062.

## Key Design Decisions

(Details and alternatives in [research.md](./research.md).)

1. **Single loader** `src/lib/blog.ts` (server-only by usage: uses `fs`, imported only from server
   components): reads every `content/blog/*/` directory, validates, returns posts. Throws
   `Error` with `post "<slug>" [<lang>] <field>: …` messages.
2. **Slug** = directory name, must match `^[a-z0-9]+(?:-[a-z0-9]+)*$` (stable, URL-safe, and lets
   the filesystem guarantee uniqueness; FR-022 is still checked explicitly for case-insensitive
   collisions).
3. **Frontmatter schema** (zod, strict): `title` non-empty string, `summary` non-empty string,
   `date` ISO `YYYY-MM-DD` (or full ISO) that parses to a valid date, `draft` boolean
   **defaulting to `false`** (resolves the FR-011 "optional" vs. "boolean" question). gray-matter
   parses unquoted YAML dates into `Date`; the schema accepts string or Date and normalises to an
   ISO string.
4. **Pairing rules** (build errors): missing `en.md`/`es.md`; draft differs between languages
   (FR-011a); unexpected extra files; invalid slug.
5. **Draft filtering** happens after validation (drafts are always validated):
   `includeDrafts = process.env.VERCEL_ENV !== "production"`. `generateStaticParams` and the index
   use the filtered list; `dynamicParams = false` makes everything else 404.
6. **Date shown** per the post's `date` of each language file (they may differ; index sorts by EN
   date, newest first, ties by slug). Formatted with `Intl.DateTimeFormat` (`en-US` / `es-EC`,
   `timeZone: "UTC"`) on the client component so it follows the language.
7. **Reading time** = `ceil(words / 200)` where words = whitespace-separated tokens of the body
   with HTML comments removed; minimum 1.
8. **Rendering**: `MarkdownBody` server component wraps `<ReactMarkdown remarkPlugins={[remarkGfm]}
   skipHtml components={{ img, a, pre… }}>`. `img` → `next/image` for site-local sources
   (`/blog/<slug>/…` under `public/`) with `width={0} height={0} sizes="100vw"` and auto height;
   non-local sources render only the alt text. `a` adds `rel="noopener noreferrer"` +
   `target="_blank"` for external URLs. react-markdown's default URL sanitising stays on.
9. **Language switching**: the post page server-renders `MarkdownBody` for EN and ES and passes
   both (plus per-language header data) as props to the client `LocalizedPost`, which renders the
   active one. Index: `BlogIndex` client component receives serialisable summaries for both
   languages. No client fetching; EN is in the initial HTML.
10. **Metadata**: `generateMetadata` (EN title/summary): `title`, `description`, Open Graph
    `type: "article"`, `url: /blog/<slug>`, `publishedTime`. `metadataBase` is set in the root
    layout (see Open items). Index has static metadata.
11. **Not found**: `src/app/blog/not-found.tsx` (client, localized, link to `/blog`) handles
    unknown slugs and drafts on production.
12. **Removal**: delete `src/app/blog/page.tsx` and `[slug]/page.tsx` (rewritten), old
    `BlogCard.tsx` (rewritten as a presentational card with no data source), Dev.to types,
    `localStorage`/fetch code and every Dev.to/rss2json reference in `CLAUDE.md` and the
    constitution.

## Project Structure

### Documentation (this feature)

```text
specs/002-native-blog/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── content-file.md      # authoring contract + build errors
│   └── blog-module.md       # src/lib/blog.ts public API + routes + metadata
└── tasks.md                 # /speckit-tasks (not created here)
```

### Source Code (repository root)

```text
content/
└── blog/
    └── ai-agent-workflow-portfolio/
        ├── en.md            # draft: true
        └── es.md            # draft: true
public/
└── blog/<slug>/…            # optional local images
src/
├── app/
│   ├── layout.tsx                 # + metadataBase
│   └── blog/
│       ├── page.tsx               # server: index (static)
│       ├── not-found.tsx          # localized not-found
│       └── [slug]/page.tsx        # server: generateStaticParams, generateMetadata
├── components/
│   ├── BlogCard.tsx               # rewritten: presentational, named export
│   ├── BlogIndex.tsx              # "use client": picks language, renders cards/empty state
│   ├── BlogNotFound.tsx           # "use client": localized not-found content
│   ├── LocalizedPost.tsx          # "use client": picks language version
│   └── MarkdownBody.tsx           # server: react-markdown config
└── lib/
    ├── blog.ts                    # loader + zod validation + reading time
    └── translations.ts            # + blog group (EN/ES)
```

**Structure Decision**: single Next.js project; content outside `src/` in `content/blog`. New
components keep the flat `components/` layout used today; constitution Principle II and
`CLAUDE.md` structure lists are updated accordingly (adds `content/`, `BlogIndex`,
`LocalizedPost`, `MarkdownBody`, `lib/blog.ts`).

## Open items for the owner

- **Production URL** (resolved): `metadataBase` in the root layout is derived from
  `VERCEL_PROJECT_PRODUCTION_URL` (set automatically by Vercel; it follows the custom domain once
  one is added), falling back to `http://localhost:3000`. Decision confirmed by the owner.
- Launch post statements about branch protection and Vercel previews stay generic with
  `REVIEW` comments until confirmed (FR-072).

## Complexity Tracking

No unjustified constitution violations. The only governance edits are amendments listed under
Principles II and VII (constitution PATCH bump to 1.0.1 with Sync Impact Report, done via `/speckit-constitution` as a task).

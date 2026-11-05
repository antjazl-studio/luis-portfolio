# Research: Native Blog

All items are decided; no NEEDS CLARIFICATION remain. Most decisions come from the owner's
technical brief.

## R1. Content format
- **Decision**: Plain Markdown, `content/blog/<slug>/en.md` and `es.md`; frontmatter `title`,
  `summary`, `date`, `draft`; parsed by gray-matter.
- **Rationale**: No executable code in content (rules out MDX); one file per language matches
  FR-010; adding a post needs no code (SC-005).
- **Alternatives**: MDX (executes code, rejected); single file with both languages (harder to
  review, easy to forget one); JSON/TS data (poor authoring).

## R2. Validation
- **Decision**: zod schema in `src/lib/blog.ts`; every failure throws with
  `post "<slug>" [<lang>] <field>: <reason>`; build fails.
- **Rationale**: Covers FR-011a, FR-020–FR-022 in one place at build time. Because pages and
  `generateStaticParams` call the loader during `next build`, an exception aborts the build.
  `draft` defaults to `false` so FR-011 ("MAY provide") and the boolean type agree.
- **Alternatives**: hand-written checks (more code, worse messages); a separate prebuild script
  (second place to maintain, can be skipped by `next dev`).

## R3. Reading time
- **Decision**: `Math.max(1, Math.ceil(words / 200))`, words = whitespace tokens of the body after
  removing HTML comments.
- **Rationale**: FR-012; no library needed. Markdown syntax characters slightly inflate counts;
  accepted at this precision.

## R4. Rendering
- **Decision**: `react-markdown` + `remark-gfm` in server components; `skipHtml`; no
  `dangerouslySetInnerHTML`; default URL sanitising kept.
- **Rationale**: FR-043 and the edge case "raw HTML … never executed". `skipHtml` also removes
  `<!-- REVIEW -->` comments, satisfying FR-072. react-markdown v9 supports React 18 and is ESM;
  Next 14 handles it without config.
- **Alternatives**: remark→rehype→`dangerouslySetInnerHTML` (violates FR-043); MDX (see R1).

## R5. Static generation
- **Decision**: Server components, `generateStaticParams` over visible posts,
  `export const dynamicParams = false`. Unknown/draft-in-production slugs → `notFound()` →
  `src/app/blog/not-found.tsx`.
- **Rationale**: FR-041/042/090; a draft's existence is not revealed in production.

## R6. Language handling
- **Decision**: Language is client state and URLs are language-agnostic (existing behaviour), so
  the server renders both versions and a client component selects one. Metadata uses EN.
- **Rationale**: FR-032, FR-052, SC-004, no reload, no fetch. Both versions are in the RSC
  payload; EN is in the initial HTML (default language).
- **Alternatives**: `/en/…` and `/es/…` routes (changes URL model, out of scope); fetching the
  other language on switch (violates no client fetching).

## R7. Draft visibility
- **Decision**: `includeDrafts = process.env.VERCEL_ENV !== "production"`, evaluated at build.
  Local `dev`/`build` and Vercel preview include drafts; Vercel production excludes them.
  Validation always covers drafts.
- **Rationale**: FR-090/091: environment-driven, not editable from content. Note: a local
  `npm run build` or CI build (no `VERCEL_ENV`) includes drafts, which is intended for validation
  but means `next start` locally is not a production simulation; to simulate, run
  `VERCEL_ENV=production npm run build`.

## R8. Images
- **Decision**: `next/image` via react-markdown's `img` override and in cards. Only site-local
  sources (`/…` under `public/`) are rendered; other sources render alt text only. Intrinsic size
  via `width={0} height={0} sizes="100vw"` with `h-auto w-full`.
- **Rationale**: Clears the `no-img-element` lint suppressions; avoids `remotePatterns` config and
  third-party requests (SC-002). Cover images are not required (spec assumption).

## R9. Styling
- **Decision**: Tailwind typography `prose prose-invert` with neutral overrides (white headings,
  neutral body, `--accent` links, neutral code blocks, `overflow-x-auto` on `pre`/tables).
  Existing cyan classes are removed.
- **Rationale**: Principle IV/V, FR-080/081.

## R10. Open Graph base URL
- **Decision** (confirmed by owner): `metadataBase` from `VERCEL_PROJECT_PRODUCTION_URL` (follows the custom domain automatically once added), with `http://localhost:3000` fallback.
- **Rationale**: Production domain not in repository; avoids hard-coding. 

## R11. Testing approach
- **Decision**: No new test dependency. The loader is a pure function over a directory
  (`loadPosts(rootDir, { includeDrafts })`) so it can be exercised with fixture directories
  during manual verification (see quickstart).
- **Rationale**: Dependency limit in the brief; build-failure behaviour is the contract.

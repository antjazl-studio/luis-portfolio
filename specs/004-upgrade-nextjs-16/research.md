# Research: Upgrade Next.js 14.2 → 16 with React 19

Planning date 2026-11-05. Registry facts below were read with `npm view` on that date; guide
items come from the official Next.js 15 and 16 upgrade guides and must be re-checked against the
guides at implementation time (the codemod output is the source of truth for what changed).

## R-01 Target versions

- **Decision**: `next@16` (latest 16.4.5; engines `node >=20.9.0`), `react` / `react-dom` ^19, `@types/react` / `@types/react-dom` ^19, `eslint-config-next` pinned to the same version as `next`.
- **Rationale**: Spec FR-001; the 14.2.x line has no fix for the critical advisory (R-04 of 003 confirmed 14.2.35 is the last 14.2).
- **Alternatives**: Stop at Next 15 — rejected, user asked for 16 and 15 would need another jump soon.

## R-02 Async request APIs (Next 15)

- **Applies to**: `src/app/blog/[slug]/page.tsx` — `Props = { params: { slug: string } }` is used in both `generateMetadata` and the page. In 15+ `params` is a `Promise`.
- **Not applicable**: `cookies()`, `headers()`, `draftMode()`, `searchParams` — a grep of `src/` finds none. `generateStaticParams` is unchanged (it takes no params). `layout.tsx` has no params.
- **Decision**: Run the `next-async-request-api` codemod (part of `upgrade`), then review: `type Props = { params: Promise<{ slug: string }> }`; `generateMetadata` becomes `async` and does `const { slug } = await params`; `PostPage` becomes `async` likewise. Both stay server components. `dynamicParams = false` and `notFound()` keep unknown slugs returning 404 (FR-006).
- **Alternatives**: Use the generated `PageProps<'/blog/[slug]'>` helper (Next 15.5+/16) — optional; keep the explicit `Props` type for a minimal diff.

## R-03 `next lint` removal and ESLint flat config (Next 16)

- **Facts**: `next lint` is removed in 16 and `next build` no longer runs lint. `eslint-config-next@16` has peer `eslint >=9`; it ships flat-config entries (`eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`). Current repo: ESLint ^8 with `.eslintrc.json` extending `next/core-web-vitals` and `next/typescript`. Latest ESLint is 10.14; eslint-config-next@16 is documented against 9.
- **Decision**: ESLint **^9** (not 10, to stay inside what `eslint-config-next@16` is tested against). Replace `.eslintrc.json` with `eslint.config.mjs` that imports the two flat entries from `eslint-config-next` directly (via `defineConfig` from `eslint/config`, plus `globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"])`). Script: `"lint": "eslint ."`. The official codemod `next-lint-to-eslint-cli` can generate this; its output is reviewed, not trusted.
- **CI**: `.github/workflows/ci.yml` already runs `npm run lint` then `npm run build`, so it picks up the new script with no edit. Order stays lint → build because build no longer lints.
- **No new dependency**: `@eslint/eslintrc` (FlatCompat) is not needed because the package exports native flat entries.
- **Risk**: Newer `eslint-plugin-react-hooks` rules in 16's config (React Compiler-era rules, e.g. set-state-in-effect) may flag existing client components (`LanguageContext`, `Navbar`, etc.). Handling: fix when trivial and behavior-neutral; otherwise disable that single rule with a comment and record it here. Lint must end green (FR-007).

## R-04 Turbopack default bundler (Next 16)

- **Facts**: `next dev` and `next build` use Turbopack by default. A project with a custom `webpack` config fails the build unless `--webpack` is passed. `next.config.mjs` is empty; there are no webpack customizations, no babel config.
- **Decision**: Use Turbopack for both dev and build. No flags. Verify the Tailwind 3 PostCSS pipeline (`postcss.config.mjs` with `tailwindcss`, and `require("@tailwindcss/typography")` in `tailwind.config.ts`) produces the same CSS: compare rendered pages and prose styling on the blog post; check `.next` CSS contains the `prose` rules.
- **Fallback**: If Turbopack output differs and cannot be fixed, build with `next build --webpack` and record why (visual parity beats bundler choice).
- **Local fonts**: `next/font/local` (`GeistVF.woff`) is supported; confirm fonts load in dev and build.
- Dev output dir moves to `.next/dev`; `.next` is already gitignored.

## R-05 React 19 compatibility

| Package | Installed | Declared support | Decision |
|---------|-----------|------------------|----------|
| framer-motion | 12.38.0 | peer `react ^18 \|\| ^19` | Compatible, no bump needed |
| react-markdown | 10.1.0 | peer `@types/react >=18`, `react >=18` | Compatible, no bump needed |
| @tailwindcss/typography | 0.5.19 | peer `tailwindcss >=3` (no React dependency) | Not a React concern; works with Tailwind 3 under Turbopack, verify in R-04 |
| remark-gfm | 4.0.1 | no React dependency | n/a |

Source scan for React 19 removals: no `forwardRef`, `propTypes`, `useRef()` without arg, `JSX.` global namespace, `ReactDOM.render`, `findDOMNode`. Ref-as-prop and `useFormState` renames not used. `@types/react@19` may surface stricter typing; fix in place.
Hydration: `LanguageContext` must not read browser storage during first render (a React 19 stricter hydration-error reporting would surface it as a warning); verify no console hydration errors in EN and ES.

## R-06 Node version vs CI

- **Facts**: Next 16 requires Node >= 20.9.0. CI used `actions/setup-node@v4` with `node-version: 20`. Node 20 reached end of life in April 2026. Local Node is 24.22.2. `@types/node` was `^20`.
- **Decision (owner request)**: Move the whole toolchain to Node 24 (current LTS) as part of this feature:
  - `.github/workflows/ci.yml`: `node-version: 24`.
  - `package.json`: `"engines": { "node": ">=24" }` (not a dependency; makes a mismatch fail early).
  - `@types/node`: `^20` → `^24` so types match the runtime.
  - **Owner task (manual, cannot be done from the repo)**: in Vercel → Settings → Build and Deployment → Node.js Version, select 24.x. Do this before merging, otherwise the Vercel build runs on an older Node and `engines` may fail or warn it. Record the date done in this file.
  - **Status (2026-11-06)**: owner confirmed the Vercel setting was already 24.x. CI on Node 24 passed (`build` job, PR #6). The Vercel build log was **not checked** by the owner, so the Node version used by the hosting build is **NOT VERIFIED** (tasks.md T036, SC-007).
- **Verification**: Local Node is already 24, so local runs match CI. `npm ci` on Node 24 must succeed with the new lockfile; confirm the Vercel preview deployment of the PR builds on Node 24 (build log shows the Node version).
- **Supersedes**: the earlier plan to keep CI on Node 20. Node 20 remains compatible with Next 16 but is no longer a target.

## R-07 `next/image` defaults

Changes in 15/16: `images.minimumCacheTTL` default 60s → 4h; `imageSizes` drops `16`; `qualities` default now `[75]` (other `quality` values are coerced); local `src` with query strings requires `images.localPatterns`; `images.domains` deprecated; `dangerouslyAllowLocalIP` and `maximumRedirects` tightened.
Usage here: `Hero.tsx` `src="/pic.png"` with `fill` and `priority`, no `quality` prop, no query string; `MarkdownBody.tsx` accepts only `/`-rooted local srcs with `width={0} height={0} sizes="100vw"`. No remote images, no `images` config.
- **Decision**: No config needed. Not applicable except the default-value changes, which affect only caching headers and the generated `srcset` (no `16`-px size; the smallest rendered image here is far larger). Verify the hero image looks identical and Lighthouse "image" audits do not regress. Blog authors must not add `?query` to local image paths (note in quickstart).
- `priority` is deprecated in 16 in favor of `preload`; it still works. **Decision**: keep `priority` (zero behavior risk); if the build warns, switch to `preload` and record it.

## R-08 Caching and rendering defaults

- Next 15: `fetch` and GET Route Handlers are no longer cached by default; client router cache `staleTimes` defaults to 0. Next 16: `cacheComponents` / `use cache` is opt-in (off by default); `experimental.ppr` removed.
- Usage here: no `fetch`, no route handlers, no `revalidate` exports, no middleware. All routes are static via `generateStaticParams` + `dynamicParams = false`.
- **Decision**: Not applicable; do not enable `cacheComponents`. Confirm in the `next build` route table that `/`, `/blog`, `/blog/[slug]` and `/_not-found` remain static (`○` / `●`), matching the baseline.

## R-09 Draft gating with `VERCEL_ENV=production`

- **Facts**: `isProductionBuild()` in `src/lib/blog.ts` reads `process.env.VERCEL_ENV` at build time; `getVisiblePosts` caches the loaded list in module scope outside dev. `generateStaticParams` and the page both go through it. Turbopack workers may evaluate the module in several processes, but each reads the same env, so results agree.
- **Decision**: No code change expected. Verify by temporarily adding a draft post (`draft: true` in both `en.md` and `es.md`) in a scratch copy / uncommitted change and building twice: `VERCEL_ENV=production npm run build` (draft absent from `/blog` HTML and from the route list; `/blog/<draft-slug>` → 404) and a plain build (draft present). Also confirm an invalid post still fails the build (FR-005). Remove the draft afterwards.
- On Windows use `$env:VERCEL_ENV="production"; npm run build` in PowerShell.

## R-10 Other items from the guides checked

| Item | Applies? | Handling |
|------|----------|----------|
| `middleware` → `proxy` rename (16) | No: no middleware file | none |
| AMP support removal | No | none |
| `next/legacy/image`, `images.domains`, `next/config` runtime config | No | none |
| `experimental.turbo` / `serverComponentsExternalPackages` renames | No: config is empty | none |
| `next.config` `eslint` / `typescript.ignoreBuildErrors` options | No | none |
| `tsconfig` auto-changes (`jsx: react-jsx`, `.next/dev/types` include) | Yes, applied | Next rewrote `tsconfig.json` on first build (`jsx: react-jsx`, `target: ES2017`, `.next/dev/types` in `include`); accepted, see R-15 |
| `next/font/google` import | No: only `next/font/local` | none |
| Route Handler / page param type generation (`next typegen`) | Optional | skip |
| Min TypeScript 5.1 | Satisfied (^5) | verify installed version |
| Min browsers (Chrome 111, Safari 16.4) | Informational | no polyfill work |
| `unstable_` cache APIs, `revalidateTag` signature | No | none |
| Parallel routes need `default.js` | No parallel routes | none |

## R-11 Audit outcome expectation

Target after upgrade: 0 critical, 0 high (spec SC-001). Expected to be resolved by `next@16` bringing a patched `postcss` and by `eslint@9` / `eslint-config-next@16` replacing the old dev-tool chain (the dev-only highs from R-04: glob, minimatch / brace-expansion chain via `eslint-config-next` 14). Anything left is recorded in data-model.md's finding table with reason and mitigation. `npm audit fix --force` is **not** used; versions are chosen explicitly.

## R-12 Rollback

Work is on branch `004-upgrade-nextjs-16`; `master` is untouched until the PR merges. If a blocker appears (e.g., Turbopack/Tailwind difference without a workaround), fall back to `--webpack` first; if the upgrade as a whole is blocked, stop and report rather than pin back (the critical advisory stays open on 14.2).

## R-15 Implementation log (what the codemods and manual edits actually did)

Run: `npx @next/codemod@latest upgrade latest --yes --skip-adoption --verbose` (2026-11-05).

| Step | Result |
|------|--------|
| `next-async-request-api` | Applied to `src/app/blog/[slug]/page.tsx`: `params` typed as `Promise<{ slug: string }>`, `generateMetadata` and `PostPage` made `async` and `await props.params`. Other files: unmodified (33 scanned, 0 other changes). |
| ESLint migration (`next-lint-to-eslint-cli`) | Removed `next lint`: script became `eslint .`, `eslint` 8 -> 9.39.5, `eslint-config-next` 14.2.35 -> 16.4.5, generated `eslint.config.mjs`. `.eslintrc.json` still existed, so it was deleted by hand. |
| React 19 recipe (`react/19/migration-recipe`) and `types-react-codemod` preset-19 | Bumped `react` / `react-dom` / `@types/react*` to 19.x; 0 source files modified (no removed APIs used, as predicted in R-05). |
| Manual: package.json | Codemod pinned exact React / types versions and added an `overrides` block for `@types/react*`. Replaced by ranges (`^19`) and removed `overrides` so the allowed-diff check (T038) is clean. `next` and `eslint-config-next` stay exact (as `next` was before). Added `"engines": {"node": ">=24"}`, `@types/node` `^24`. |
| Manual: `eslint.config.mjs` | The generated file had an unused `__dirname` block and no ignores; rewritten with `globalIgnores` (`.next`, `out`, `build`, `next-env.d.ts`, `.claude`, `.specify`). |
| Manual: lint findings | `eslint .` now also covers root config files and applies React-hooks 7 rules. Two errors: (1) `tailwind.config.ts` `require("@tailwindcss/typography")` -> `import typography from "@tailwindcss/typography"` (same plugin object); (2) `Navbar.tsx` `setActive(null)` synchronous in an effect -> moved into the effect cleanup (the highlight is still cleared when leaving the home page). |
| Manual: CI | `.github/workflows/ci.yml` `node-version: 20` -> `24`. |
| Turbopack build | Default. First build passed with 2 warnings ("dynamic filesystem access causes tracing of the whole project") from `src/lib/blog.ts` (`rootDir` parameter). Fixed with the `/*turbopackIgnore: true*/` markers Next suggests on `existsSync` / `readdirSync`; no behavior change. Build is now warning-free. Tailwind 3 + typography under Turbopack: verified in the US2 visual comparison. |
| `tsconfig.json` | Next rewrote it automatically: `jsx: react-jsx`, `target: ES2017`, `.next/dev/types/**/*.ts` in `include`, arrays reformatted. Accepted. |

## R-13 Audit result

`npm audit` after the upgrade (2026-11-05): **10 moderate, 0 high, 0 critical** (before: 8 moderate, 4 high, 1 critical; the 003 R-04 count of 17 had additionally included findings that `npm audit fix` in 003 already cleared). `npm audit --omit=dev`: 2 moderate.

| Former critical / high | Package | Result |
|------------------------|---------|--------|
| critical | next 14.2.35 | fixed: next 16.4.5 |
| high | postcss (nested in next) | fixed: next 16.4.5 bundles a patched copy |
| high | eslint-config-next | fixed: 16.4.5 |
| high | @next/eslint-plugin-next | fixed: 16.4.5 |
| high | glob | fixed: dropped from the dependency tree by eslint-config-next 16 |

Remaining moderates (not a goal of this feature, no critical/high residual):
- `@typescript-eslint/*`, `typescript-eslint`, `minimatch` via `eslint-config-next@16.4.5`: dev-only (lint tooling); nothing ships to visitors. Mitigation: wait for a newer `eslint-config-next`.
- `postcss-selector-parser` via `@tailwindcss/typography`: build-time only (CSS generation from the repo's own config); `npm audit fix --force` would downgrade the plugin to 0.5.4, which is worse, so it is not applied.

Installed: `next@16.4.5`, `react@19.3.1`, `react-dom@19.3.1` (`npm ls next react react-dom`, single copy each).

> Section order note: R-13..R-16 below follow implementation order, not numeric order (R-15, R-13, R-14, the R-09 verification, then R-16). The "R-04" in tasks.md T031 and in the spec header refers to **003**'s `specs/003-quick-fixes/research.md` R-04 (audit), not to R-04 (Turbopack) in this file.

## R-14 Visual and behavior comparison (2026-11-05)

Method: headless Chrome through DevTools, 5 pages x 390px/1280px x EN/ES (20 screenshots), before and after.

- Page height, visible text length and `<title>` are identical for all 20 captures; screenshot files are byte-identical or within 0.5% size (animation timing), no visible difference found in the pages viewed.
- Language toggle, navigation, CV and contact links: no console errors on `/`, `/blog`, a post and the general 404.
- **Regression found: React hydration error #418 on unknown `/blog/<slug>` URLs** (the `/blog/nope` 404; 4 of 20 captures; baseline had none). Cause: the 404 body is prerendered once as a static shell (`/_not-found`), so the server HTML is built without the requested URL. `Navbar` (Blog link `aria-current`/highlight) and `BlogNotFound` (post-not-found wording) depend on `usePathname()`, which on the client is the real `/blog/nope`. The page recovers by client re-rendering, so the end state is identical, but the console error is new and the pre-hydration HTML shows the generic "Page not found" wording with the Blog tab unhighlighted. Attempts: `useSyncExternalStore` in `BlogNotFound` only (error remains: the navbar differs too); `await connection()` in `not-found.tsx` (turns every route dynamic, rejected); `app/blog/not-found.tsx` (Next still serves the global shell, no effect). Options left are a product decision, listed in the PR description. Status: **CLOSED 2026-11-07 by feature 007** (it was accepted by the owner on 2026-11-06, spec.md W-1; the fix, expected in 006, shipped in 007). Fix: a hydration-safe pathname (known prerendered routes keep the real pathname, any other URL renders the neutral shell until hydration), see `specs/007-fix-404-hydration/research.md` R2. The text above is kept as history.
- Focus rings were **not verified**. `prefers-reduced-motion` is **not respected by the site**; this is pre-existing (not caused by the upgrade) and is fixed in feature 005 (US3). See spec.md W-3.
- Home Performance 92 vs baseline 93: accepted 2026-11-06 (spec.md W-2, baseline.md).

## R-09 verification (draft gating), 2026-11-05

- `VERCEL_ENV=production npm run build` with a throwaway draft post: draft absent from the route list and from `/blog`; `/blog/zz-draft-check` returns 404; published post 200.
- Same build without `VERCEL_ENV`: draft listed, `/blog/zz-draft-check` returns 200, appears in `/blog`.
- Removing `title` from `en.md`: build fails with `post "zz-draft-check" [en] title: required`.
- Throwaway post deleted afterwards; `git status` shows no content change.

## R-16 Reconciliation against the official guides (T030, 2026-11-06)

Read in full: https://nextjs.org/docs/app/guides/upgrading/version-15 and .../version-16 (both last updated 2026-10-15). Every heading of both guides and both "Review migration checklist" lists was compared with the repository.

| Guide item | Applies? | Handling |
|------------|----------|----------|
| 16: Node >= 20.9, TypeScript >= 5.1, modern browsers | Met | Node 24 (CI, `engines`); TypeScript 5.9.3 installed |
| 16: Turbopack default; fail on custom `webpack` config | Yes, default | No webpack config exists; build passes (R-04/R-15) |
| 16: `experimental.turbopack` -> `turbopack`, `resolveAlias`, Sass `~` imports | No | `next.config.mjs` is empty; no Sass |
| 16: Turbopack filesystem cache on by default | Informational | Stored under `.next/`, ignored by git; no action |
| 16 + 15: Async Request APIs (`params`, `searchParams`, `cookies`, `headers`, `draftMode`) | Yes, `params` only | `blog/[slug]/page.tsx` (page + `generateMetadata`) by codemod; others unused |
| 16: async `params`/`id` for `opengraph-image`, `icon`, `apple-icon`, `sitemap` | No | Only a static `favicon.ico` exists; no such functions |
| 16: React 19.2 / React Compiler | Informational | React 19.3.1 installed; compiler not enabled (opt-in) |
| 16: `revalidateTag`, `updateTag`, `refresh`, `cacheLife`/`cacheTag` | No | No cache APIs used |
| 16: Enhanced routing/prefetching | Informational | No code change; behavior verified in R-14 |
| 16: PPR removal / `cacheComponents` | No | Not used and not enabled |
| 16: `middleware` -> `proxy` | No | No middleware file |
| 16: `next/image` (query strings, `minimumCacheTTL`, `imageSizes`, `qualities`, local IP, redirects, legacy image, `domains`) | Defaults only | `Hero.tsx` and `MarkdownBody.tsx` use plain local paths, no `quality`; no config needed (R-07) |
| 16: concurrent dev/build (`.next/dev`) | Informational | tsconfig `include` updated automatically |
| 16: parallel routes need `default.js` | No | No parallel routes |
| 16: ESLint flat config | Yes | `eslint.config.mjs` (R-03/R-15) |
| 16: **Scroll behavior override** | **Yes (missed at planning)** | `globals.css` sets `html { scroll-behavior: smooth }`. Next 16 no longer forces instant scroll on route changes unless `<html data-scroll-behavior="smooth">`. Added the attribute in `src/app/layout.tsx` to keep the old behavior (navigation jumps instantly to top) |
| 16: `size` and `First Load JS` columns removed from `next build` output | Yes, cosmetic | Explains the shorter route table; Lighthouse used for sizes instead |
| 16: dev config loaded once (`process.argv`) | No | Config has no side effects |
| 16: Build Adapters API, Modern Sass API | No | Not used |
| 16 removals: AMP, `next lint`, runtime config, `devIndicators` options, `experimental.dynamicIO`/`useCache`, `unstable_rootParams` | `next lint` only | Replaced by `eslint .` (R-03); the rest are not used (grep of `src/` and config) |
| 16 troubleshooting: ESLint peer conflicts | No | `eslint-config-next@16.4.5` with ESLint 9.39.5 installed cleanly; ESLint 10 not adopted |
| 15: React 19, `useFormState` -> `useActionState` | Yes / No | React 19 applied; `useFormState` unused (codemod: 0 changes) |
| 15: `runtime = 'experimental-edge'` | No | No runtime exports |
| 15: `fetch`, Route Handler, client router caching defaults | No effect | No `fetch`, no handlers; `staleTimes` unset; routes stay static (R-08) |
| 15: `@next/font` -> `next/font` | No | Already `next/font/local` |
| 15: `bundlePagesExternals`, `serverExternalPackages` renames | No | Not configured |
| 15: Speed Insights auto-instrumentation removed | Not in repo | No `@vercel/speed-insights` in `package.json`. Owner confirmed 2026-11-06: Speed Insights was not in use, so no effect and no action |
| 15: `NextRequest` `geo`/`ip` removed | No | No middleware |

Result: 1 item missed at planning time (scroll behavior), fixed and verified (lint, build and the `data-scroll-behavior` attribute present in the prerendered HTML). SC-005 satisfied.

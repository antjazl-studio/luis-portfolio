# Research: Fix 404 Hydration Mismatch

Decisions taken by the supervisor inside the constitution, with facts checked on 2026-11-07 against a local
production build (Next.js 16.4.5, `npm run build` then `next start`).

## R1. Verified facts

- Route table at baseline: `/` static, `/_not-found` static, `/blog` static, `/blog/[slug]` SSG with one post (`ai-agent-workflow-portfolio`).
- Server HTML of `/blog/nope` (HTTP 404): heading "Page not found"; **no** `aria-current` anywhere in the nav.
- Server HTML of `/blog` and of `/blog/ai-agent-workflow-portfolio`: `aria-current="page"` on the Blog link.
- Therefore the 404 shell is prerendered with no URL, while real pages are prerendered with their own URL. A mismatch can only occur on the shell.
- `LanguageProvider` starts at `"en"` and does not persist the choice; a direct load of any URL is EN. ES is reached on a 404 only by switching the language on the 404 itself, because an in-app navigation to an unknown URL is a full page load (verified 2026-11-07: a `window` marker set before `router.push('/blog/nope')` is gone afterwards, and the language is back to EN; Next falls back to a hard navigation when the RSC request returns 404). The browser also logs one "Failed to load resource ... 404" line for the 404 document itself on every unknown URL, in the baseline too; it is excluded from the console counts (spec FR-001).
- `usePathname()` is used for markup only in `Navbar.tsx` and `BlogNotFound.tsx`. `LanguageContext.tsx` uses it for an effect (tab title), not markup.

## R2. Stable pathname for hydration

- **Decision**: a helper `useStablePathname(prerenderedPaths)` returns the real pathname when the page has hydrated or when the path is one of the prerendered paths; otherwise `""`. The hydrated flag uses `useSyncExternalStore` with server snapshot `false` and client snapshot `true`, the same pattern `LanguageContext` already uses for `reduceMotion`.
- **Rationale**: the first client render must equal the server HTML. For known routes the server HTML already contains the real pathname, so using it keeps the HTML (including `aria-current`) identical and avoids any flash. For the shell the server rendered with no URL, so the first client render uses `""`, then React re-renders with the real pathname after hydration. After hydration (client-side navigation) the flag is already true, so navigation state follows the URL immediately.
- **Alternatives considered**:
  - *Hydration flag for every page* (render `""` until mounted): rejected, it removes `aria-current` from the server HTML of `/blog` and posts and causes a visible highlight flash there (regression against FR-006).
  - *Context set by the 404 page*: rejected, `Navbar` hydrates in the same pass as the 404 body, so the context value is not available before the navbar's first client render.
  - *Reading `window.location` instead of `usePathname()`*: rejected, it still differs from the server HTML on the first client render.
  - *`await connection()` in `not-found.tsx`*: rejected in 004 R-14 (turns every route dynamic).
  - *`app/blog/not-found.tsx`*: rejected in 004 R-14 (Next still serves the global shell).
  - *`suppressHydrationWarning`*: rejected, it hides the symptom only for text nodes of one element and not for attribute and class differences across the navbar; it also would not fix the wording state.

## R3. Where the known-path list comes from

- **Decision**: `layout.tsx` (server component) computes `["/", "/blog", ...getVisiblePosts().map(...)]` and passes it to `Navbar` as a prop.
- **Rationale**: it reuses the exact loader and draft rule that `generateStaticParams` uses, so the list matches the prerendered pages. In production with `VERCEL_ENV=production`, drafts are excluded from both the list and the pages, so a draft URL is an unknown URL and takes the post-not-found path, as today.
- **Alternatives**: hard-code `/` and `/blog` and treat every `/blog/*` as unknown (rejected: posts would lose their server-rendered `aria-current`); import `lib/blog` into the client component (rejected: it reads the filesystem).

## R4. Where the helper lives

- **Decision (owner, 2026-11-07)**: `src/hooks/useStablePathname.ts`, imported by `Navbar.tsx` and `BlogNotFound.tsx`, and added to the `CLAUDE.md` tree.
- **History**: the first version of this feature (commit `fc14e25`) exported the hook from `src/components/Navbar.tsx`, because constitution 1.2.0 listed `hooks/useLanguage.ts` by name and a new file would have required an amendment. The owner then amended Principle II (constitution 1.3.0, 2026-11-07): new files inside existing folders need no amendment and must be added to the `CLAUDE.md` tree in the same PR. With that rule the natural location is `hooks/`, and the coupling between `BlogNotFound` and `Navbar` is gone.
- **Alternative rejected now**: keeping the hook in `Navbar.tsx` (coupled two client components for no remaining reason).

## R5. Documentation

- 004 `spec.md` W-1 and 004 `research.md` R-14 are updated to say "closed by feature 007 on 2026-11-07"; the original text stays as history.

## R6. Verification results (2026-11-07)

Environment: local, Node 24, Next.js 16.4.5, headless Chrome (puppeteer-core), production build on port 3107 and `next dev` on port 3108. Scratch scripts and raw output are in the gitignored `.tmp/` (`console007.mjs`, `es404.mjs`, `nav007.mjs`, `console-before.txt`, `console-after.txt`, `console-dev-after.txt`, `es404-after.txt`, `nav007-after.txt`, `lighthouse-*007*.json`).

| Check | Before (unmodified `upstream/master`) | After (this branch) |
|-------|----------------------------------------|----------------------|
| `/blog/nope`, 3 direct loads, production | React error #418 on 3 of 3 | 0 errors and 0 warnings on 3 of 3 |
| `/nope` ×3, `/blogger`, `/`, `/blog`, post, production | 0 | 0 |
| Same URLs in `next dev` | not measured | 0 |
| `/blog/nope/` and `/blog/a/b` | not measured | 0; post wording, Blog current |
| After hydration, `/blog/nope` | post wording, Blog `aria-current="page"` | same (EN: "Post not found", "Back to blog" to `/blog`) |
| After hydration, `/nope` and `/blogger` | generic wording, no `aria-current` | same ("Page not found", "Back to home" to `/`) |
| Switch to ES and back on `/blog/nope` and `/nope` | not measured | ES "Publicación no encontrada" / "Página no encontrada", back to EN correct, console clean, Blog highlight unchanged (production and dev) |
| Server HTML `<header>` nav and 404 `<h1>` | `/blog` and post `aria-current="page"`, `/blog/nope` none | byte-identical (md5 of the header equal for all three pages) |
| Route table | `/`, `/_not-found`, `/blog` static; `/blog/[slug]` SSG, 1 post | identical (`diff` empty) |
| Home section highlight while scrolling (about, experience, skills, projects, contact) | n/a | each shows `aria-current="location"` on its item, 0 console issues |
| 404 at 360px and 1280px | n/a | no horizontal overflow; screenshots viewed for the 360px blog case |
| Lighthouse home, best of 3 (mobile / desktop) | Performance 100 / 100, Accessibility 100 / 100 | Performance 100 / 100, Accessibility 100 / 100 |
| `git diff upstream/master` on translations, globals.css, tailwind config, package files | n/a | empty |
| `npm run lint`, `npm run build` | pass | pass |

Two facts found while verifying that changed the spec wording (spec FR-001 note, US1 scenarios 2 and 4, Edge Cases, SC-001):

1. The browser prints "Failed to load resource: the server responded with a status of 404" for the 404 document itself (and for the `?_rsc=` request that precedes an in-app navigation to an unknown URL). This is the correct HTTP status of a missing page, also present in the baseline for `/nope`; it is excluded from the counts. Any other console message counts.
2. An in-app navigation to an unknown URL is a full page load (a `window` marker set before `router.push('/blog/nope')` is lost, and the language returns to EN). Spanish on a 404 is therefore reached by switching the language on the 404 itself, which was verified.

Not verified: Vercel preview behavior (owner checks O1 to O4), browsers other than Chrome, real-device widths, pre-JavaScript rendering beyond reading the server HTML, and the Vercel production build log. In the dev-mode client-navigation script run, the two lines reported as failures contain only the `?_rsc=` 404 status line above (the script filter was not extended for it); no other message appeared.

## R7. Re-verification after moving the hook to `src/hooks/` (2026-11-07)

After constitution 1.3.0 (owner amendment of Principle II) the hook moved from `Navbar.tsx` to `src/hooks/useStablePathname.ts`; `Navbar.tsx` and `BlogNotFound.tsx` import it from there; `CLAUDE.md` lists it. No behavior change was intended. Production build, same scripts as R6:

- `npm run lint` exit 0; `npm run build` passes; route table identical to the baseline.
- Server HTML `<header>` for `/blog`, the post and `/blog/nope`: md5 equal to the baseline (before and after the move).
- `/blog/nope` 3 of 3 direct loads: 0 console issues; `/nope` 3 of 3: 0; `/`, `/blog`, the post, `/blogger`, `/blog/nope/`, `/blog/a/b`: 0.
- After hydration: `/blog/nope` "Post not found", link to `/blog`, Blog `aria-current="page"`; `/nope` and `/blogger` "Page not found", link to `/`, no highlight.
- ES toggle on `/blog/nope` and `/nope`: correct wording both ways, console clean.
- Home section highlight on scroll and 404 overflow at 360px and 1280px: 9 PASS, 0 FAIL.
- Not re-run after the move: Lighthouse and `next dev` (no markup, style or dependency change; the code path is identical). The in-app navigation probe still reports the browser's `?_rsc=` 404 status line, as in R6.

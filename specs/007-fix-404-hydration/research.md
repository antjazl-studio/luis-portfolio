# Research: Fix 404 Hydration Mismatch

Decisions taken by the supervisor inside the constitution, with facts checked on 2026-11-07 against a local
production build (Next.js 16.4.5, `npm run build` then `next start`).

## R1. Verified facts

- Route table at baseline: `/` static, `/_not-found` static, `/blog` static, `/blog/[slug]` SSG with one post (`ai-agent-workflow-portfolio`).
- Server HTML of `/blog/nope` (HTTP 404): heading "Page not found"; **no** `aria-current` anywhere in the nav.
- Server HTML of `/blog` and of `/blog/ai-agent-workflow-portfolio`: `aria-current="page"` on the Blog link.
- Therefore the 404 shell is prerendered with no URL, while real pages are prerendered with their own URL. A mismatch can only occur on the shell.
- `LanguageProvider` starts at `"en"` and does not persist the choice; a direct load of any URL is EN. ES reaches the 404 only by client-side navigation, where hydration is already done and no mismatch can occur.
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

- **Decision**: export `useStablePathname` from `src/components/Navbar.tsx` and import it in `BlogNotFound.tsx`.
- **Rationale**: the constitution's Principle II structure list names `hooks/useLanguage.ts`; adding `hooks/useStablePathname.ts` is a structural change that would need an amendment (owner-only, via `/speckit-constitution`). Co-locating avoids it.
- **Alternative**: a new `src/hooks/useStablePathname.ts` with an amendment to the structure list: acceptable later if the owner prefers, no behavior change.

## R5. Documentation

- 004 `spec.md` W-1 and 004 `research.md` R-14 are updated to say "closed by feature 007 on 2026-11-07"; the original text stays as history.

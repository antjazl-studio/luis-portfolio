# Implementation Plan: Fix 404 Hydration Mismatch

**Branch**: `007-fix-404-hydration` | **Date**: 2026-11-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-fix-404-hydration/spec.md`

## Summary

The prerendered `/_not-found` shell is built without the requested URL. `Navbar` and `BlogNotFound` read
`usePathname()`, which on the client is the real URL, so their first client render differs from the server
HTML (React error #418, waiver W-1). Fix: those two components render from a **stable pathname** that is
the real pathname when the route is known to be prerendered (so `/`, `/blog` and existing posts keep their
exact server HTML) or when the page has hydrated, and the neutral shell value (`""`) otherwise. Unknown URLs
therefore hydrate against matching markup, then switch to the post-specific wording and the Blog highlight
right after hydration. No route becomes dynamic, no dependency or string is added. Details and rejected
alternatives: [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript, React 19, Node 24

**Primary Dependencies**: Next.js 16.4.5 (App Router), Tailwind CSS, Framer Motion (no change; no new dependencies)

**Storage**: N/A (blog content is read at build time from `content/blog` by the existing `lib/blog.ts`)

**Testing**: no test framework in the repo. Verification is `npm run lint`, `npm run build` (route table), `curl` of server HTML, and browser console capture; see [quickstart.md](quickstart.md)

**Target Platform**: Static site on Vercel; evergreen browsers

**Project Type**: Web application (single Next.js project)

**Performance Goals**: Home page Lighthouse Performance and Accessibility at or above 90 and no drop greater than 3 points vs the baseline measured before the change (tasks T004 and T019; constitution gate; the change is not expected to move them)

**Constraints**: All routes stay static; server HTML of known routes unchanged; zero console errors on `/`, `/blog`, posts, `/blog/<unknown>`, `/<unknown>`

**Scale/Scope**: 3 source files touched (`Navbar.tsx`, `BlogNotFound.tsx`, `layout.tsx`) and 1 added (`hooks/useStablePathname.ts`), plus `CLAUDE.md`, the constitution amendment (1.3.0) and 004 documentation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design: unchanged.*

| Principle | Status | Note |
|-----------|--------|------|
| I. Stack Fidelity | PASS | No dependency added; React `useSyncExternalStore` and `next/navigation` already in use |
| II. Component Conventions | PASS | Functional components, named exports, no `any`. `layout.tsx` stays a server component and only passes a serializable prop. `"use client"` stays only on the two existing client components. The stable-pathname helper is a new file in the existing `src/hooks/` folder (`hooks/useStablePathname.ts`, named export, no `"use client"` needed, same as `useLanguage.ts`). Since constitution 1.3.0 (owner decision 2026-11-07, amendment of Principle II) a new file inside an existing folder needs no amendment; it is added to the `CLAUDE.md` tree in this PR as the principle requires |
| III. Mobile-First | PASS | No style changes |
| IV. Minimal UI | PASS | No visual change (FR-009) |
| V. Theme Through CSS Variables | PASS | No color or token change |
| VI. Bilingual Parity | PASS | No string added or changed; existing EN/ES keys reused (FR-005) |
| VII. Resilient Integrations | PASS | No external calls |
| Development Workflow | PASS | Feature branch; lint and build are gates; browser check at mobile and desktop widths is part of the quickstart |

No violations; Complexity Tracking not needed.

## Project Structure

### Documentation (this feature)

```text
specs/007-fix-404-hydration/
├── plan.md
├── research.md
├── quickstart.md
├── checklists/requirements.md
└── tasks.md             # created by /speckit-tasks
```

No `data-model.md` (no data) and no `contracts/` (no external interface) are created.

### Source Code (repository root)

```text
src/
├── app/
│   └── layout.tsx              # computes prerendered paths (server) and passes them to Navbar
├── hooks/
│   └── useStablePathname.ts    # NEW: hydration-safe pathname hook (named export)
└── components/
    ├── Navbar.tsx              # uses useStablePathname(prerenderedPaths)
    └── BlogNotFound.tsx        # uses useStablePathname([]) for its isPost decision

CLAUDE.md                       # tree lists hooks/useStablePathname.ts
.specify/memory/constitution.md # 1.3.0: Principle II no longer needs an amendment for new files in existing folders

specs/004-upgrade-nextjs-16/
├── spec.md                     # W-1 marked closed by 007
└── research.md                 # R-14 status marked closed by 007
```

**Structure Decision**: Single existing Next.js project; edits stay inside the files that already own the
pathname-dependent markup. No new directories, no change to the layout list in the constitution or CLAUDE.md.

## Design

1. `useStablePathname(prerenderedPaths: readonly string[]): string` (in `src/hooks/useStablePathname.ts`, named export):
   reads `usePathname() ?? ""`; reads a `hydrated` flag with `useSyncExternalStore(noopSubscribe, () => true, () => false)`
   (the pattern `LanguageContext` already uses for `reduceMotion`); returns the real pathname if `hydrated` or if
   it is in `prerenderedPaths`, else `""`.
2. `layout.tsx` builds `["/", "/blog", ...getVisiblePosts().map(p => `/blog/${p.slug}`)]` and passes it as a prop
   to `<Navbar prerenderedPaths={...} />`. Draft gating follows `getVisiblePosts()` (same rule as
   `generateStaticParams`).
3. `Navbar` replaces `usePathname() ?? ""` with `useStablePathname(prerenderedPaths)`. All derived values
   (`onHome`, `onBlog`, the section-observer effect) keep their code.
4. `BlogNotFound` replaces `usePathname() ?? ""` with `useStablePathname([])`. It renders only on 404 pages, so the
   first render is always the neutral shell and `isPost` becomes correct after hydration.
5. Docs: mark W-1 (004 spec.md) and R-14 status (004 research.md) closed by 007 on 2026-11-07.

## Risks

- **Known-path list drifts from reality**: the list comes from the same loader as `generateStaticParams`, so a post
  is in the list exactly when its page is prerendered. Mitigation: quickstart checks the server HTML of `/blog/<post>`.
- **Layout now imports the blog loader**: it already runs at build for the post pages; the layout is static, so the
  cost is build-time only. Mitigation: route table must be unchanged.
- **Path list size**: the list is serialized into each page's payload; negligible with one post, grows linearly with posts. Accepted (supervisor, 2026-11-07).
- **Dev-mode warnings differ from production**: the console check runs on both `next dev` and the production server.

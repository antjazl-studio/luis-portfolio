# Research: 003 Quick Fixes

No NEEDS CLARIFICATION items remain in the spec or Technical Context. The decisions below
resolve the design choices the spec left to planning. Findings come from reading
`src/components/Navbar.tsx`, `src/app/*`, and `npm audit` / `npm audit fix --dry-run` run on
2026-11-05.

## R-01 Section links and monogram on non-home pages

- **Decision**: Render section items and the monogram as `next/link` (`/#about`, … and `/`).
  On the home page, an `onClick` handler calls `preventDefault()` and keeps the current
  smooth-scroll (`scrollIntoView` / `scrollTo({top:0})`); elsewhere the default navigation runs.
  Drawer clicks also close the drawer.
- **Rationale**: Same markup and classes as today; real links also give correct semantics
  (they were `<button>`s). Home behavior (FR-002) is unchanged because the handler is the same.
  The App Router scrolls to the hash target after client navigation, and sections carry 96px of
  top padding, so the 56px fixed bar does not cover headings.
- **Alternatives considered**: (a) `router.push("/#about")` from the button handler — keeps
  buttons but loses link semantics and middle-click/open-in-new-tab; (b) plain `<a href>` — full
  page reload on blog → home, losing the in-memory language (violates FR-007).

## R-02 Active state and scroll-spy

- **Decision**: `onBlog = pathname === "/blog" || pathname.startsWith("/blog/")`. Add
  `aria-current="page"` on the Blog link when `onBlog`. Make the IntersectionObserver effect
  depend on `pathname`: when not on `/`, clear `active` and skip observing; on `/`, observe the
  five sections.
- **Rationale**: `Navbar` lives in the root layout and never remounts. The current effect runs
  once (`[]`) and looks up section elements at mount; after blog → home client navigation the
  elements are new and nothing observes them, so section highlighting would silently break.
  This is a regression risk created by fixing R-01, so it is part of this feature.
- **Alternatives considered**: remounting `Navbar` with a `key={pathname}` — works, but also
  resets the language pill animation state and scroll listeners for no benefit.

## R-03 Footer on blog routes

- **Decision** (owner, 2026-11-05): render `<Footer />` once in `src/app/layout.tsx`, after
  `{children}` and before `<WhatsAppButton />`, and remove it (and its import) from
  `src/app/page.tsx`. No new files; `not-found.tsx` is unchanged (it never rendered a footer).
- **Rationale**: One site-wide placement covers the home, blog list, blog posts, unknown blog
  slugs and generic 404s (FR-006) with no per-route wiring, and sits beside the other
  site-wide elements. In the App Router the root `not-found.tsx` renders inside the root layout,
  so it gets the footer too. `Footer` is already a client component; importing it into the
  server `layout.tsx` is fine. No structure change, so the constitution's Principle II list and
  `CLAUDE.md` stay accurate and no amendment is needed. Quickstart verifies exactly one footer on
  every page type.
- **Alternatives considered**: a `src/app/blog/layout.tsx` plus `<Footer />` in
  `not-found.tsx` — two edits plus a new file, and a constitution structure amendment, for the
  same result. Rejected by the owner.

## R-04 Dependency audit

State on 2026-11-05: 17 findings (1 critical, 8 high, 8 moderate); Next.js is 14.2.35, the
newest 14.2.x, so the "upgrade within 14.2" step is a no-op.

`npm audit` groups some findings under the package that would force a major upgrade, which
hides what a plain `npm audit fix` can still do. `npm audit fix --dry-run` (2026-11-05) shows
it also updates top-level `postcss` 8.5.14 → 8.5.32 (a direct devDependency within `^8`),
`postcss-selector-parser` 6.1.2 → 6.1.5 and `@tailwindcss/typography` 0.5.19 → 0.5.20, so
those are **not** residual.

**Fixed by `npm audit fix` (non-breaking, per dry run)**: `source-map-js` (high), `nanoid`
(high), `js-yaml` (high, dev), `brace-expansion` (high, dev), top-level `postcss` (high),
`postcss-selector-parser` / `@tailwindcss/typography` (moderate), and the `@typescript-eslint/*`
moderates (dev). `package.json` should not change (all ranges already allow the new versions);
the lockfile will, including optional platform-specific native packages (`@next/swc-*`,
`@unrs/resolver-binding-*`, `fsevents`) added for other operating systems — expected lockfile
noise, not new dependencies. The real run (T012/T013) is the source of truth.

**Actual result (T012/T013, 2026-11-05)**: it took **two** `npm audit fix` passes (the first
left `brace-expansion`; the second fixed it). Findings went from 17 (1 critical, 8 high,
8 moderate) to **13 (1 critical, 4 high, 8 moderate)**. Fixed: `source-map-js`, `nanoid`,
`js-yaml`, `brace-expansion`, top-level `postcss` (now 8.5.32). `package.json` is unchanged;
`next` is still 14.2.35. The dry-run prediction was too optimistic for the moderates: the
`@tailwindcss/typography` → `postcss-selector-parser` finding and the `@typescript-eslint/*`
moderates are still reported after the fix.

**Residual risk after the fix (recorded per FR-023)** — each critical/high item needs a
major upgrade:

| Package | Severity | Scope | Only fix |
|---|---|---|---|
| `next` | critical | runtime | `next@16.4.5` — owner decision: feature 004 |
| `postcss@8.4.31` nested in `next` | high | build-time (ships inside Next) | `next@16.4.5` |
| `eslint-config-next`, `@next/eslint-plugin-next` | high | dev only (lint) | `eslint-config-next@16.4.5` — goes with 004 |
| `glob` (via eslint-config-next) | high | dev only | `eslint-config-next@16.4.5` |
| `minimatch` (eslint-config-next / typescript-eslint copies) | moderate | dev only | same |
| `@typescript-eslint/*` | moderate | dev only | stay flagged while pinned by `eslint-config-next@14` |
| `@tailwindcss/typography` → `postcss-selector-parser` | moderate | build-time | `@tailwindcss/typography@0.5.4` (a downgrade flagged as breaking) |

- **Decision**: run `npm audit fix` without `--force`; re-run `npm audit` and paste the
  residual list into the PR. Do not use `overrides`.
- **Rationale**: matches the owner's "no major upgrades, no new dependencies" constraint;
  `overrides` would be an unreviewed pin of transitive packages and goes beyond "minimal".
- **Note**: after the fix, the remaining "high/critical" count will not be zero. SC-005 is
  defined as "none fixable without a major upgrade", which this satisfies.

## R-05 Experience data in translations

- **Decision**: Add `experience.logiztik = { role, period, bullets: [string, string] }` to the
  `Translation` type and to both languages in `lib/translations.ts`. `Experience.tsx` builds the
  second entry from `t.experience.logiztik`; the company name "Logiztik Alliance Group" stays in
  the component (proper noun, identical in both languages). The other two entries are left as
  they are.
- **Rationale**: Principle VI says new strings go through `translations.ts`; the type forces
  both languages to be present. The ES period uses "Abr" (assumption flagged in the spec).
- **Alternatives considered**: keeping the entry hard-coded in `Experience.tsx` (matches the
  other two entries but adds to deviation D-041); moving all three entries to translations
  (broader than the "quick fix" scope).

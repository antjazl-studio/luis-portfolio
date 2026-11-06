# Implementation Plan: Upgrade Next.js 14.2 → 16 with React 19

**Branch**: `004-upgrade-nextjs-16` | **Date**: 2026-11-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-upgrade-nextjs-16/spec.md`

## Summary

Move the portfolio from Next.js 14.2.35 / React 18 to Next.js 16 (latest stable, 16.4.5 on the
planning date) / React 19 with no visible or behavioral change, closing the critical Next.js
advisory and the high findings left as residual in 003 R-04. Approach: follow the official 15
and 16 upgrade guides, run the official codemods (`@next/codemod`), then hand-fix what the
codemods do not cover (ESLint flat config, CI lint step). Every breaking change is recorded in
[research.md](research.md) as applied / not applicable with its resolution. No new dependencies
beyond the upgraded ones (the one exception, `@eslint/eslintrc`, is **not** needed; see R-03).

## Technical Context

**Language/Version**: TypeScript 5 (strict); Node 24 LTS (CI, Vercel and `engines`; Next 16 itself needs only >= 20.9)

**Primary Dependencies**: next 14.2.35 → 16.x, react / react-dom ^18 → ^19, @types/react(-dom) → ^19, eslint ^8 → ^9, eslint-config-next 14.2.35 → 16.x (same version as next). Unchanged: framer-motion ^12.38, react-markdown ^10.1, remark-gfm, @tailwindcss/typography ^0.5, tailwindcss ^3.4, gray-matter, zod

**Storage**: Files (`content/blog/<slug>/{en,es}.md`), read at build time

**Testing**: No unit-test suite exists. Gates are `npm run lint`, `npm run build`, CI, manual EN/ES page comparison, draft-gating build check, Lighthouse before/after (see [quickstart.md](quickstart.md))

**Target Platform**: Vercel (project `luis-jacho`), static output for all routes; local dev on Windows

**Project Type**: Web application (single Next.js App Router project)

**Performance Goals**: Lighthouse score in every category >= pre-upgrade baseline (home and one blog post)

**Constraints**: Zero visual / behavioral change; draft gating via `VERCEL_ENV=production` preserved; no new dependencies; Constitution Principles I, II, IV, V, VI untouched

**Scale/Scope**: ~25 source files, 2 locales, 1 blog post. Files touched by the upgrade: `package.json`, lockfile, `src/app/blog/[slug]/page.tsx`, ESLint config, `.github/workflows/ci.yml`, `tsconfig.json` (auto-edited by Next), docs (`CLAUDE.md`, `README.md`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Note |
|-----------|--------|------|
| I. Stack Fidelity | PASS | Still Next.js App Router, TypeScript, Tailwind, Framer Motion. Constitution says the exact Next version lives in `package.json`, so **no constitution edit is needed** (FR-010). No UI-kit or duplicate libraries added |
| II. Component Conventions | PASS | Only `blog/[slug]/page.tsx` signature changes (server component stays server). Structure list unchanged, except if a new `eslint.config.mjs` at repo root is considered "structure" (it is not under `src/`) |
| III. Mobile-first | PASS | No style changes |
| IV. Minimal UI | PASS | No UI changes |
| V. Theme via CSS vars | PASS | `globals.css` untouched |
| VI. Bilingual parity | PASS | No strings added or changed |
| VII. Resilient integrations | PASS | No external calls |

Post-design re-check (after Phase 1): all PASS; no violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/004-upgrade-nextjs-16/
├── plan.md
├── research.md          # Decisions + full breaking-change record (R-01..R-12)
├── data-model.md        # Audit-finding / breaking-change / baseline records
├── quickstart.md        # Baseline capture + verification procedure
├── contracts/
│   └── unchanged-surface.md   # Routes and behaviors that must not change
├── checklists/requirements.md
└── tasks.md             # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
package.json                  # versions, lint script -> "eslint .", engines node >=24, @types/node ^24
package-lock.json
eslint.config.mjs             # NEW (replaces .eslintrc.json, which is deleted)
next.config.mjs               # unchanged (empty config)
tsconfig.json                 # Next may rewrite jsx / include on first build
.github/workflows/ci.yml      # node-version 20 -> 24; lint step works via the script
src/app/blog/[slug]/page.tsx  # async params in generateMetadata and page
CLAUDE.md, README.md          # "Next.js 14" -> "Next.js 16"
```

**Structure Decision**: Single existing project; the upgrade edits configuration and one page
file. No directories added or moved.

## Phases

### Phase 0 — Research (done)

[research.md](research.md) resolves every item named in the request: async request APIs,
`next lint` removal, Turbopack, React 19 compatibility of framer-motion / react-markdown /
@tailwindcss/typography, Node vs CI, image and caching defaults, draft gating verification,
plus the remaining items of the official guides that were checked and found not applicable.
No NEEDS CLARIFICATION remains.

### Phase 1 — Design (done)

[data-model.md](data-model.md), [contracts/unchanged-surface.md](contracts/unchanged-surface.md)
and [quickstart.md](quickstart.md).

### Implementation order (input for /speckit-tasks)

1. **Baseline** on `master` build: `npm audit` output, Lighthouse (home + post, mobile), screenshots EN/ES, draft-gating check, `next build` route table.
2. **Next 15 step** (guide order): `npx @next/codemod@canary upgrade 15` is skipped in favor of going straight to 16 — the `upgrade` codemod runs the 15 transforms (`next-async-request-api`, etc.) as part of the jump. Run `npx @next/codemod@latest upgrade latest`, review the diff.
3. **Hand fixes**: confirm `params` is `Promise` in `[slug]/page.tsx`; create `eslint.config.mjs`, delete `.eslintrc.json`, set `"lint": "eslint ."`; bump `eslint` to ^9 and `@types/react*` to ^19.
4. `npm install`, `npm run lint`, `npm run build` (Turbopack), fix findings.
5. **Verify**: draft gating (production-like and not), 404 paths, EN/ES walkthrough, Lighthouse, `npm audit`.
6. **Docs**: CLAUDE.md, README, research.md outcome notes, 003 R-04 cross-reference.
7. **Node 24**: set `node-version: 24` in CI, `"engines": { "node": ">=24" }` and `@types/node` ^24 in `package.json`.
8. **Owner task (manual)**: set Vercel → Settings → Build and Deployment → Node.js Version to 24.x before merging.
9. PR; CI must pass on Node 24 and the Vercel preview must build on Node 24.

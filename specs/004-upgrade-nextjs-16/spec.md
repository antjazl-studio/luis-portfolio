# Feature Specification: Upgrade Next.js 14.2 → 16 with React 19

**Feature Branch**: `004-upgrade-nextjs-16`

**Created**: 2026-11-05

**Status**: Complete (merged in PR #6, 2026-11-06; accepted deviations in "Recorded Waivers")

**Input**: User description: "004 Upgrade Next.js 14.2 → 16 (latest stable), with React 19: close the critical Next.js advisory and the remaining high npm audit findings recorded as residual risk in specs/003-quick-fixes/research.md (R-04). No visual or behavioral changes. Lint, build and CI must pass; Lighthouse must not regress. Use the official codemods and upgrade guide; record each breaking change that applied and how it was handled. Constitution Principle I: update only if the stack description must change."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Security advisories are closed (Priority: P1)

As the site owner, I want the portfolio's framework and runtime moved to the latest stable major versions so that the critical advisory and the high-severity findings recorded as residual risk in the 003 dependency audit (R-04) no longer apply to the deployed site.

**Why this priority**: This is the reason for the feature. A published site with a known critical advisory is the only urgent risk.

**Independent Test**: Run the dependency audit before and after. The critical finding and every high finding listed as residual in R-04 are gone, or each remaining one is documented with a reason it cannot be fixed.

**Acceptance Scenarios**:

1. **Given** the audit baseline in R-04 (1 critical, residual highs), **When** the audit is re-run after the upgrade, **Then** zero critical findings remain.
2. **Given** the same baseline, **When** the audit is re-run, **Then** zero high findings remain, or each remaining one is recorded with its package, reason and mitigation.
3. **Given** the upgraded project, **When** the installed framework and runtime versions are checked, **Then** they are the latest stable majors (Next.js 16, React 19).

---

### User Story 2 - Visitors see no change (Priority: P1)

As a visitor, I see and experience exactly the same site: home, blog index, blog posts and the 404 page look and behave as before, in both English and Spanish.

**Why this priority**: The upgrade has no user value if it alters the site. Equal priority with Story 1 because the upgrade is only acceptable if both hold.

**Independent Test**: Compare each page before and after the upgrade in EN and ES at mobile and desktop widths: visual appearance, language switching, navigation, animations, CV download, contact links and blog rendering.

**Acceptance Scenarios**:

1. **Given** the home page, **When** loaded in EN and in ES, **Then** all sections render with the same content, layout, theme and animations as before the upgrade.
2. **Given** the blog index and any published post, **When** opened, **Then** content, language switching and empty states match the pre-upgrade behavior.
3. **Given** a non-existent URL (general and under /blog/), **When** requested, **Then** the localized 404 shows with the correct wording as before.
4. **Given** a production-environment build, **When** a draft post exists, **Then** it is excluded from the index and not reachable; in non-production environments it remains visible as before.

---

### User Story 3 - Build, checks and performance stay green (Priority: P2)

As the maintainer, I want lint, the production build and CI to pass, and page performance not to regress, so the upgrade can be merged and deployed with confidence.

**Why this priority**: Gate for merging; depends on the first two stories being implemented.

**Independent Test**: Run lint and the production build locally and in CI; run a Lighthouse audit before and after on the home page and a blog post.

**Acceptance Scenarios**:

1. **Given** the upgraded branch, **When** lint and the production build run, **Then** both finish with no errors.
2. **Given** a pull request, **When** CI runs, **Then** all checks pass.
3. **Given** Lighthouse scores for the pre-upgrade site, **When** the audit is repeated after the upgrade, **Then** no category score is lower than the baseline.

---

### User Story 4 - Breaking changes are documented (Priority: P3)

As the maintainer, I want a record of each breaking change from the official upgrade guides that applied to this project and how it was handled, so the upgrade is auditable and repeatable.

**Why this priority**: Supports future maintenance; does not affect the running site.

**Independent Test**: Review the feature's research notes: each breaking change in the official guides is marked applicable or not, and each applicable one states the resolution.

**Acceptance Scenarios**:

1. **Given** the official upgrade guides and automated migration tools, **When** the upgrade is performed, **Then** the tools are used and each change they made is recorded.
2. **Given** a breaking change that applied, **When** reviewing the notes, **Then** it states what changed and how it was handled.

---

### Edge Cases

- A dependency (animation library, markdown renderer, typography plugin) does not yet support the new runtime major: it must be upgraded or a documented, behavior-neutral workaround used; if none exists, the blocker is reported rather than silently dropping a feature.
- Default behavior changes in the new framework (e.g. caching, rendering or build defaults) could silently alter output: blog pages must stay statically generated and unknown post URLs must still return 404.
- Draft gating depends on a deployment environment variable: it must be verified in both production-like and non-production builds.
- Language preference handling and first-paint language must not flash or mismatch (hydration differences) after the upgrade.
- Residual audit findings with no available fix must be recorded, not hidden.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST run on the latest stable major release of its web framework and of its UI runtime (Next.js 16, React 19) as of the upgrade date.
- **FR-002**: The upgrade MUST remove the critical advisory and all high-severity findings recorded as residual in R-04; any finding that cannot be removed MUST be documented with package, reason and mitigation.
- **FR-003**: Every page (home, blog index, blog posts, 404 and blog-specific 404) MUST render the same content and layout as before, in English and Spanish.
- **FR-004**: Interactive behavior (language switching, navigation, animations, CV download, contact and WhatsApp links) MUST be unchanged.
- **FR-005**: Draft posts MUST remain excluded only in production-environment builds and visible otherwise; invalid blog content MUST still fail the build.
- **FR-006**: Unknown blog post URLs MUST still return the localized not-found page.
- **FR-007**: Lint and the production build MUST complete without errors, and CI MUST pass.
- **FR-008**: Lighthouse scores for the home page and a blog post MUST be equal to or better than the pre-upgrade baseline in every category, and the home page Performance and Accessibility scores MUST be at least 90 (project constitution).
- **FR-009**: The official automated migration tools and upgrade guides MUST be used, and each applicable breaking change MUST be recorded with how it was handled.
- **FR-010**: The project constitution's stack principle MUST be updated only if the stack description itself must change (its version-agnostic wording means none is expected).
- **FR-011**: Project documentation that states the framework version (e.g. CLAUDE.md, README) MUST be updated to match.
- **FR-012**: No new runtime dependency that duplicates the existing stack may be introduced.
- **FR-013**: Local development, CI and the hosting platform MUST all use the current LTS Node.js release (24), and the project MUST declare that minimum so a mismatch fails early. Setting the hosting platform's Node version is a manual owner task.

### Key Entities

- **Audit finding**: A reported vulnerability with package, severity, status (fixed / residual) and, if residual, reason and mitigation.
- **Breaking-change record**: An item from the official upgrade guides with applicability (applied / not applicable) and the resolution taken.
- **Baseline**: Pre-upgrade audit result, page appearance and Lighthouse scores used as the comparison reference.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The audit reports 0 critical and 0 high findings, or every remaining one is documented with justification.
- **SC-002**: 100% of the pages checked (home, blog index, a published post, general 404, blog 404) show no visible difference from baseline in EN and ES at mobile and desktop widths.
- **SC-003**: Lint, production build and CI all pass on the first run of the final branch state.
- **SC-004**: No Lighthouse category (Performance, Accessibility, Best Practices, SEO) scores lower than baseline on the home page and a blog post, and the home page scores at least 90 in Performance and Accessibility.
- **SC-005**: 100% of breaking changes in the official guides have an applicable / not-applicable entry, with a resolution for each applicable one.
- **SC-006**: Draft gating verified in both modes: a draft is absent in a production-environment build and present in a non-production one.
- **SC-007**: The local environment, CI and the hosting platform's build log all report the same current LTS Node.js release (24).

## Recorded Waivers

Deviations from the requirements above that shipped with PR #6 and were accepted by the owner.

- **W-1 (FR-003, FR-004, US2 scenario 3) — 2026-11-06, owner**: On unknown `/blog/*` URLs (e.g. `/blog/nope`) React reports hydration error #418 (new; the baseline had none). The static `/_not-found` shell is prerendered without the requested URL, while `Navbar` and `BlogNotFound` read `usePathname()` on the client. The page recovers by client re-rendering, so the end state is identical, but the pre-hydration HTML shows the generic "Page not found" wording and an unhighlighted Blog tab. The mismatch is **accepted**; the fix is tracked as **feature 006**. Details and attempted fixes: research.md R-14.
- **W-2 (FR-008, SC-004) — 2026-11-06, owner**: Home Performance is 92 versus the 93 baseline (consistent across runs; LCP about 3.35 s vs 3.18 s). **Accepted** as within Lighthouse noise and above the constitution's 90 gate. All other categories are equal to baseline. Details: baseline.md.
- **W-3 (constitution accessibility rules) — 2026-11-06, owner**: Keyboard focus rings were not re-verified after the upgrade. `prefers-reduced-motion` is **not respected by the site**; this is pre-existing (not caused by the upgrade) and is fixed in feature 005 (US3). Tracked in research.md R-14.
- **SC-003 result (2026-11-06)**: `gh pr checks 6`: `build` pass (34s), Vercel pass, Vercel Preview Comments pass. Met.
- **SC-007 (2026-11-06)**: local and CI report Node 24. The hosting platform's build log was **not checked** by the owner (the Vercel Node.js setting was confirmed as 24.x). The hosting part is **NOT VERIFIED** (tasks.md T036).
- **Speed Insights (R-16)**: `@vercel/speed-insights` was not in use before the upgrade, so Next 15 removing its auto-instrumentation has no effect. No action.

## Assumptions

- "Latest stable" means the latest stable Next.js major (16) and React 19 at the time of implementation; if a newer stable exists, that applies.
- The deployment platform supports the new framework version without configuration changes beyond those recorded.
- Baseline measurements (audit, screenshots, Lighthouse) are taken from the current master before changes begin.
- Visual comparison is done manually or with screenshots; no automated visual-regression suite is added.
- Moderate audit findings are fixed where this happens as a side effect, but are not a goal of this feature.
- The existing translations, theme and content are out of scope and untouched.
- Source of the baseline: specs/003-quick-fixes/research.md, R-04.

# Feature Specification: Quick Fixes — Blog Navigation, Experience Placeholder, Dependency Security

**Feature Branch**: `003-quick-fixes`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "003 Quick fixes: (1) Navigation on blog routes (impeccable audit C3): on /blog and /blog/[slug], section links must navigate to the home page section; the LJ monogram must go to the home page; the Blog nav item must be active on /blog and every /blog/* page; blog pages show the Footer. (2) Experience placeholder (D-072 / H5): replace \"Previous Role\" with the real entry; mark company, title and dates as needing clarification, do not invent them. (3) Security: upgrade Next.js to the latest patched 14.2.x and resolve critical/high npm audit findings without major-version upgrades. EN/ES per Principle VI."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate from the blog back to the portfolio (Priority: P1)

A visitor reading the blog list or a post uses the top navigation to reach a portfolio section
(About, Experience, Skills, Projects, Contact) or to go home. Today those controls do nothing on
blog pages and nothing leads back to the home page except the browser's back button.

**Why this priority**: Dead navigation controls on two of the site's three page types. The blog
is a dead end for a visitor who arrives from a shared link.

**Independent Test**: Open a blog post directly in a new browser session, click each navigation
item and the "LJ" monogram, and confirm each lands on the expected home-page location.

**Acceptance Scenarios**:

1. **Given** the visitor is on `/blog` or any `/blog/<slug>` page, **When** they select About,
   Experience, Skills, Projects or Contact, **Then** they arrive on the home page scrolled to
   that section.
2. **Given** the visitor is on any blog page, **When** they select the "LJ" monogram, **Then**
   they arrive at the top of the home page.
3. **Given** the visitor is on the home page, **When** they select a section or the monogram,
   **Then** behavior is unchanged: smooth scroll to that section or to the top of the page.
4. **Given** the visitor is on `/blog` or on any `/blog/<slug>` page, **When** the navigation
   renders (desktop bar and mobile drawer), **Then** the Blog item shows as the active item and
   no section item shows as active.
5. **Given** the visitor is on the home page, **When** the navigation renders, **Then** the Blog
   item is not active.
6. **Given** the visitor is on a blog list, post or "post not found" page, **When** they scroll
   to the bottom, **Then** the site footer is shown, as on the home page.
7. **Given** the visitor changes language on any blog page and then navigates home, **Then**
   the selected language is retained (existing behavior is preserved).

---

### User Story 2 - Recruiter sees only confirmed work history (Priority: P1)

A recruiter reading the Experience timeline sees the real second role instead of a generic
"Previous Role" label, so the work history reads as complete and credible.

**Why this priority**: A placeholder company name in a professional profile is the first thing a
reviewer questions; the constitution forbids invented factual claims.

**Independent Test**: Open the home page in EN and ES and read the Experience timeline; no
entry reads "Previous Role", and no company, title or date was invented.

**Acceptance Scenarios**:

1. **Given** the Experience section renders, **When** the visitor reads the second entry,
   **Then** it shows Full Stack Developer at Logiztik Alliance Group, Oct 2019 – Apr 2020, with
   the two owner-supplied bullets, in place of "Previous Role", in both languages.
2. **Given** the three roles are listed, **When** the visitor reads the timeline, **Then** the
   order stays newest first and the dates do not overlap the adjacent roles.
3. **Given** the entry is shown in Spanish, **When** the language is switched, **Then** its
   title and descriptive text appear in Spanish (company name and proper nouns excepted).

---

### User Story 3 - Dependencies carry no avoidable critical or high vulnerabilities (Priority: P2)

The site owner wants the production site to run on patched dependencies so the portfolio does
not ship known critical or high-severity vulnerabilities that can be fixed without breaking
changes.

**Why this priority**: Security hygiene on a public site; it is invisible to visitors but has
the highest blast radius if neglected.

**Independent Test**: Run the dependency audit before and after, and run the build, lint and a
manual pass of the home page and blog; confirm fewer critical/high findings, no regressions.

**Acceptance Scenarios**:

1. **Given** the project uses the 14.2 line of the framework, **When** the upgrade is done,
   **Then** it runs the newest available patched release of that line.
2. **Given** the dependency audit reports critical or high findings, **When** the work is
   done, **Then** every finding that can be resolved without a major-version upgrade is
   resolved, and the audit is re-run to confirm.
3. **Given** a finding can only be resolved by a major-version upgrade, **When** the work is
   done, **Then** it is listed with its advisory and reason, left unresolved, and not
   upgraded.
4. **Given** dependencies were updated, **When** the project is built and linted, **Then**
   both pass with no errors, and the home page and blog render and behave as before.

---

### Edge Cases

- A visitor opens a non-existent blog URL such as `/blog/does-not-exist`: any path starting
  with `/blog/` (including unknown slugs) shows the Blog item active, and the footer and
  working navigation are present. A `/blog/<slug>#something` URL behaves like the post.
- A visitor on a blog page uses the mobile drawer: selecting a section closes the drawer and
  navigates home to that section.
- A visitor lands on `/#contact` from a blog page: the section is in view on arrival, with the
  fixed navigation bar not covering its heading.
- Navigating home from a blog page then using the browser Back button returns to the blog page.
- The not-found page for non-blog URLs (generic 404) is not a blog route: Blog is not active
  there, but navigation to home sections still works.
- The entry's end date (Apr 2020) is followed by the current role starting Jun 2020: the
  two-month gap is as supplied and must not be altered.

## Requirements *(mandatory)*

### Functional Requirements

**Blog navigation**

- **FR-001**: On every page other than the home page, selecting About, Experience, Skills,
  Projects or Contact MUST take the visitor to the matching section of the home page.
- **FR-002**: On the home page, section navigation MUST keep its current behavior.
- **FR-003**: Selecting the "LJ" monogram MUST take the visitor to the home page when on any
  other page, and keep scrolling to the top when already on the home page.
- **FR-004**: The Blog item MUST be shown as active on `/blog` and on every path starting with
  `/blog/` (posts and unknown slugs), in both the desktop bar and the mobile drawer, and not shown as active elsewhere.
- **FR-005**: While the Blog item is active, no section item MUST be shown as active.
- **FR-006**: The site footer MUST appear on the blog list, blog post and not-found pages, with
  the same content and localization as on the home page.
- **FR-007**: Navigation labels and any new text MUST exist in both EN and ES via the existing
  language mechanism; the selected language MUST persist across these navigations.
- **FR-008**: Section links on blog pages MUST remain keyboard-operable and exposed to
  assistive technology as links to a destination.

**Experience entry**

- **FR-010**: The Experience entry currently labeled "Previous Role" MUST be replaced by the
  real entry, shown identically in EN and ES where values are proper nouns or dates, and
  translated where they are descriptive text.
- **FR-011**: The entry MUST show, as confirmed by the owner on 2026-11-05: company **Logiztik
  Alliance Group**, title **Full Stack Developer**, dates **Oct 2019 – Apr 2020** (localized
  month names in ES, e.g. "Oct 2019 – Abr 2020"). It replaces the role currently shown as
  "Previous Role" (previously "2019 – 2020").
- **FR-014**: The entry's description MUST replace the two existing generic bullets with the
  owner-supplied bullets below, with Spanish translations shown when ES is active:
  - EN: "Developed Cargo Plus, a logistics platform for shipment tracking and workflow
    automation using .NET, PostgreSQL and JavaScript."
    ES: "Desarrollé Cargo Plus, una plataforma logística para el seguimiento de envíos y la
    automatización de flujos de trabajo con .NET, PostgreSQL y JavaScript."
  - EN: "Built RESTful backend services and integrated third-party logistics APIs, reducing
    manual data entry for operations teams."
    ES: "Construí servicios backend RESTful e integré APIs logísticas de terceros, reduciendo
    la entrada manual de datos para los equipos de operaciones."
- **FR-012**: No company, title, date or bullet for this entry MUST be invented; only the
  owner-supplied values in FR-011 and FR-014 are shown. The Spanish bullet translations are
  drafts for the owner to review.
- **FR-013**: The text "Previous Role" MUST NOT appear anywhere visible on the site once the
  entry is confirmed.

**Dependency security**

- **FR-020**: The framework MUST be on the newest available patched release of its current
  minor line (14.2.x).
- **FR-021**: All critical and high audit findings that have a fix within the same major
  versions MUST be resolved.
- **FR-022**: No dependency MUST be upgraded across a major version as part of this work.
- **FR-023**: Any critical or high finding that remains MUST be recorded in the plan with its
  advisory, affected package, and why it cannot be fixed without a major upgrade.
  **Decision (owner, 2026-11-05)**: the project is already on Next.js 14.2.35, the newest
  14.2.x release, and the audit's critical advisory on Next.js (and the PostCSS findings nested
  in it) lists its fix only in 16.x. This is accepted as **documented residual risk** for this
  feature. Feature 004 will upgrade to Next.js 16 and is expected to close it.
- **FR-024**: After dependency changes, build and lint MUST pass and the home page and blog
  MUST behave as before.

### Key Entities

- **Navigation item**: label (EN/ES), destination (home-page section or blog), and active
  state derived from the current page.
- **Experience entry**: role title, company, date range, location (optional), description
  bullets.
- **Audit finding**: package, severity, advisory, whether fixable without a major upgrade.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From any blog page, a visitor reaches any of the five home sections or the home
  page top in one click on desktop, or two taps on mobile (menu button, then the item); the
  monogram takes one tap (5 of 5 sections, plus the monogram).
- **SC-002**: The Blog item is active on 100% of pages whose path is `/blog` or starts with
  `/blog/` (list, posts and unknown blog URLs) and 0% of other pages.
- **SC-003**: The footer is present on 100% of site pages (home, blog list, blog posts,
  not-found).
- **SC-004**: The text "Previous Role" appears on 0 pages in either language, and the entry
  shows exactly the owner-confirmed company, title, dates and bullets in EN and ES.
- **SC-005**: The count of critical and high audit findings that are fixable without a major
  upgrade is 0 after the work; every remaining critical/high finding is documented.
- **SC-006**: Build and lint complete with no errors, and a manual pass of the home page and
  blog at mobile and desktop widths finds no regressions.

## Assumptions

- Work is limited to the three listed items; the other impeccable audit findings (Principle IV
  visual deviations, contrast, reduced motion) are out of scope for this feature.
- "Latest patched 14.2.x" means the newest 14.2 release published; at spec time the project is
  already on 14.2.35, which is that release, so the upgrade step may be a no-op.
- Navigation behavior on the home page, language persistence in memory across in-app
  navigation, and the existing localized labels stay as they are.
- The generic 404 page is covered by the footer and navigation fixes but the Blog item is
  active only on `/blog` and `/blog/*` paths.
- The owner supplied the Experience entry details on 2026-11-05; the Spanish bullet
  translations are drafts written from the English text. The ES month abbreviation "Abr" is an
  assumption.
- Transitive dependencies are updated only by non-breaking changes; if a fix would force a
  major upgrade (for example of the framework or the typography plugin), it is left as is.

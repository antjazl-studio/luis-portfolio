# Feature Specification: EN/ES Parity

**Feature Branch**: `006-bilingual-parity`

**Created**: 2026-11-06

**Status**: Implemented, pending the owner's review of the Spanish copy (2026-11-06)

**Input**: User description: "006 EN/ES parity: every user-facing string exists in both languages per Principle VI, including experience, project and skill-group text that is currently English-only. Facts stay identical across languages; only translation changes. Owner reviews all ES copy before merge. Also record in spec.md: Owner Decision (2026-11-06) from 005: keep the full-name wordmark, flat Projects cards and inline skills text."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A Spanish visitor reads the whole site in Spanish (Priority: P1)

A visitor from Ecuador or Latin America selects ES. Today the hero, About and Contact are Spanish,
but the Experience, Projects and Skills sections and the browser tab title stay in English (the
Contact location line and the WhatsApp message also sit outside the shared translation table). After this feature, selecting ES makes every sentence on every page Spanish,
and selecting EN makes it English again. Names of people, companies, technologies and places are
not translated. Every fact (employers, dates, numbers, what was done) is identical in both
languages.

**Why this priority**: Constitution Principle VI (bilingual parity) is NON-NEGOTIABLE, and a
half-translated page "reads as unfinished" for the Spanish-speaking audience.

**Independent Test**: Select ES on the home page and read it top to bottom, then do the same for
`/blog`, one blog post and a missing URL; list every sentence still in English. Compare the facts
in both languages side by side.

**Acceptance Scenarios**:

1. **Given** ES is selected, **When** the visitor reads Experience, **Then** every role title, the
   location line and every bullet of every entry is in Spanish, and company names are unchanged.
2. **Given** ES is selected, **When** the visitor reads Projects, **Then** every project title and
   description is in Spanish, and technology names are unchanged.
3. **Given** ES is selected, **When** the visitor reads Skills, **Then** the group names and the
   translatable skill labels are in Spanish, and technology names are unchanged.
4. **Given** ES is selected, **When** the visitor reads Contact, **Then** the WhatsApp prefilled
   message is Spanish, and the location line is served from the shared table (it reads the same in
   both languages because it contains only a place name and a time-zone token).
5. **Given** either language, **When** the same entry is compared across languages, **Then** the
   employer, dates, numbers (for example 30,000+ users, ~60% downtime reduction, a 4-person team),
   number of bullets and their order are identical.
6. **Given** the visitor switches EN to ES and back, **When** each switch happens, **Then** the
   page content changes immediately without reload and returns to the original English text.

---

### User Story 2 - One source of truth, enforced by the build (Priority: P2)

A maintainer adds or edits a visible string and cannot forget a language. Every user-facing
string lives in the shared translation table with both languages, including strings that today sit
inside components (experience, project and skill content, the WhatsApp prefilled messages, the
Contact location line). A short, explicit list of language-neutral strings may stay as constants.
A string that exists in one language only fails the build.

**Why this priority**: Without enforcement the gap reopens the next time content is added; it also
closes baseline deviations D-041 and D-046.

**Independent Test**: Remove one Spanish string and run the build: it must fail. Search the
components for user-facing prose outside the shared table: only the language-neutral list remains.

**Acceptance Scenarios**:

1. **Given** a string is defined in English only, **When** the project is built, **Then** the
   build fails with an error naming the missing language.
2. **Given** the source, **When** reviewed for user-facing prose outside the shared table, **Then**
   only the language-neutral strings listed in this spec are found.
3. **Given** the shared table, **When** the English and Spanish sets are compared, **Then** they
   contain exactly the same entries.

---

### User Story 3 - The browser tab title follows the language (Priority: P2)

Owner decision (2026-11-06): the tab title changes with the language. A visitor who selects ES
sees a Spanish tab title on the home page, `/blog` and blog posts. The meta description and the
text used for social previews stay English because they are read before any script runs; the owner
accepted this as a recorded deviation from Principle VI (Owner Decision 5).

**Why this priority**: The tab title is visible text and is currently the most obvious English
leftover in Spanish mode.

**Independent Test**: Open the home page, `/blog` and a post; toggle ES and read the tab title each
time; toggle back to EN.

**Acceptance Scenarios**:

1. **Given** EN on the home page, **When** the tab is read, **Then** it shows the current English
   title; **Given** the visitor selects ES, **Then** it shows the Spanish title without reload.
2. **Given** a blog post, **When** the language changes, **Then** the tab title is that post's
   title in the active language.
3. **Given** `/blog` or a missing URL, **When** the language changes, **Then** the tab title follows
   the language as well.
4. **Given** ES is selected, **When** the visitor navigates inside the site (home to `/blog` to a
   post and back), **Then** the tab title is Spanish after every navigation and never settles on
   English.
5. **Given** the page source before scripts run, **When** the meta description and Open Graph text
   are read, **Then** they are the existing English text (accepted deviation).

---

### User Story 4 - Earlier owner decisions are on record (Priority: P3)

A maintainer reading the spec sees the three design decisions the owner made at the end of feature
005, so they are not reopened by accident: keep the full-name wordmark in the navigation bar, keep
the flat non-interactive Projects cards, and keep the skills as inline text separated by `·`.

**Why this priority**: Documentation only; no visitor impact.

**Independent Test**: Open this spec and find the three decisions in "Owner Decisions" with their
date and "owner".

**Acceptance Scenarios**:

1. **Given** this spec, **When** the Owner Decisions section is read, **Then** it lists the three
   decisions carried over from feature 005, dated 2026-11-06 and attributed to the owner.
2. **Given** the shipped site, **When** the navigation bar, Projects cards and skills are viewed,
   **Then** they still look as those decisions describe.

---

### Edge Cases

- Spanish text is longer than English: titles, bullets and cards must wrap without horizontal
  overflow at 360px, and the hero first screen must not lose content.
- The visitor switches language while scrolled far down or with the mobile menu open: position and
  menu state do not jump.
- A label that is the same word in both languages (for example Docker, Git, Backend) is allowed to
  be identical only if it is on the FR-010 list; any other identical EN/ES pair is a defect.
- The tab title on the 404 page, and after client-side navigation (home to `/blog` to a post), when
  Next rewrites the title from route metadata.
- Fixed dates such as "Jun 2020 – Present": the word "Present" is already localized; month
  abbreviations that differ between languages must follow the active language.

## Requirements *(mandatory)*

### Functional Requirements

**US1: Spanish content**

- **FR-001**: With ES selected, every sentence, phrase and label on the home page, `/blog`, blog
  posts and the 404 page MUST be in Spanish, except the language-neutral strings in FR-010.
- **FR-002**: Experience: role titles, the location line and all bullets of the MyWork and IESS
  entries MUST be provided in both languages (Logiztik is already bilingual).
- **FR-003**: Projects: all three titles and all three descriptions MUST be provided in both
  languages.
- **FR-004**: Skills: the five group names and every skill label that is not a technology name
  (for example "Agile/Scrum", "Layered Architecture", "REST APIs", "Microservices") MUST be provided
  in both languages.
- **FR-005**: The Contact location line MUST be served from the shared table in both languages; it
  is identical in both because it contains only a place name and a time-zone token (FR-010).
- **FR-006**: The WhatsApp prefilled messages MUST be provided in both languages with the same
  meaning and wording as today.
- **FR-007**: Facts MUST be identical across languages: names, employers, titles' meaning, dates,
  numbers (30,000+ users, ~60%, a 4-person team, and so on), the number of bullets per entry and
  their order. No fact is added, removed or reworded; only translation changes.
- **FR-008**: English strings MUST NOT change, and the 14 Spanish strings the owner already
  reviewed in feature 005 MUST NOT be re-translated.

**US2: single source and enforcement**

- **FR-010**: The following are language-neutral and MAY stay as constants outside the shared
  table, identical in both languages: the owner's name (Luis Antonio Jacho Zambrano, Luis Jacho
  Zambrano, Luis Jacho); organization names (MyWork, Logiztik Alliance Group, IESS and its Spanish
  full name, Cargo Plus); technology and product names (C#, .NET, .NET Core, .NET Framework,
  Angular, TypeScript, JavaScript, Microsoft Azure, Azure DevOps, Azure Functions, App Services,
  Docker, SQL Server, PostgreSQL, MongoDB, MySQL, Power BI, React, Node.js, Git, CI/CD, DVIR,
  .NET 8); the technology arrays of Hero and Projects stay as constants for the same reason;
  brand names (LinkedIn, WhatsApp); certification names (Azure Developer Associate); technical
  loanwords used unchanged in Spanish technical writing (Blog, Backend, Frontend, DevOps); place
  names (Quito, Ecuador); the time-zone token UTC−5; contact addresses (the email address and the
  LinkedIn address); code identifiers and shell commands inside blog code blocks; the language codes EN and ES; and numerals, numeral abbreviations (30k+) and years. This list is complete: any other EN/ES pair that
  is identical is a defect.
- **FR-011**: Every other user-facing string MUST live in the shared translation table with both
  languages; components MUST NOT contain user-facing prose.
- **FR-012**: A string missing in either language MUST fail the build.

**US3: tab title**

- **FR-020**: The browser tab title MUST follow the active language on the home page, `/blog`, blog
  posts and the 404 page, update without reload when the language changes, and MUST NOT revert to
  English when the route changes through client-side navigation (Next resets the title from route
  metadata on navigation).
- **FR-021**: On a blog post, the tab title MUST be that post's title in the active language.
- **FR-022**: The meta description and the Open Graph (social-preview) text remain English. This is
  an accepted deviation from constitution Principle VI, decided by the owner on 2026-11-06 and
  recorded under Owner Decisions and in the plan's Constitution Check.

**US4 and process**

- **FR-030**: This spec MUST record, under Owner Decisions, the three decisions carried over from
  feature 005 with date and "owner".
- **FR-031**: All Spanish copy added by this feature is a draft and MUST be reviewed and approved by
  the owner before merge; this is an owner-only task.

**Cross-cutting**

- **FR-040**: No horizontal overflow at 360px in Spanish on any page.
- **FR-041**: In Spanish, the hero first screen at 1280x800 and 390x844 MUST still show the title,
  subline, proof line and both calls to action without scrolling.
- **FR-042**: `npm run lint` and `npm run build` MUST pass.
- **FR-043**: Home page Lighthouse Performance and Accessibility MUST each be at least 90 and drop
  no more than 3 points versus the pre-change baseline (best of 3 runs for both).
- **FR-044**: Visual design, layout and behavior MUST NOT change other than text length effects.

### Key Entities

- **Translatable string**: a piece of visible or assistive text with an English and a Spanish
  version, either prose (must differ by language) or language-neutral (identical, on the FR-010
  list).
- **Experience entry**: role, organization, dates, location and an ordered list of bullets.
- **Project**: title, description and a list of technologies.
- **Skill group**: name and an ordered list of skill labels.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With ES selected, 0 English sentences remain on the home page, `/blog`, a blog post
  and the 404 page; every string that is identical in EN and ES is on the FR-010 list.
- **SC-002**: 100% of numbers, names, dates, bullet counts and bullet order in Experience, Projects
  and Skills are identical between languages (side-by-side check).
- **SC-003**: Removing any one string from either language makes the build fail (demonstrated once).
- **SC-004**: The tab title is Spanish after selecting ES on the home page, a post and a missing URL
  (`/blog` reads "Blog — Luis Jacho Zambrano" in both languages, so it is checked for no reversion
  only), stays Spanish after in-app navigation, and returns to English on EN.
- **SC-005**: 0 horizontal scrollbars at 360px in Spanish on the 4 page types; the hero first screen
  holds at both reference viewports in Spanish.
- **SC-006**: Home Lighthouse Performance and Accessibility are each at least 90 and no more than
  3 points below the pre-change baseline.
- **SC-007**: The owner has reviewed 100% of the new Spanish copy before merge.

## Assumptions

- Feature 005 is merged (constitution v1.2.0, owner-reviewed Spanish for the hero and other
  strings); this feature builds on it and does not touch those strings.
- Spanish translations are drafted by the assistant, kept faithful to the English, and reviewed by
  the owner; where the English is a technical term with a common Spanish form (for example
  "Layered Architecture" as "Arquitectura en capas"), the common form is used.
- The Spanish tab title for the home page is drafted as "Luis Jacho Zambrano — Desarrollador full
  stack senior" (lowercase "full stack senior", as the owner wrote it in About in feature 005) and is
  part of the owner's review. `/blog` keeps "Blog — Luis Jacho Zambrano" in both languages (same words).
- The language choice is held in memory only, as today; a full reload returns to English.
- Blog post content is already bilingual and validated at build time; this feature only changes
  the tab title behavior for posts.

## Owner Decisions

Decisions made by the owner (Luis) and recorded here on 2026-11-06.

1. **Tab title follows the language (owner, 2026-11-06).** In answer to the scope question for this
   feature, the owner chose that the browser tab title follows the language (home, `/blog`, posts,
   client-side) while the meta description and social-preview text stay English (see decision 5).
   Per-language URLs (`/es`) are not part of this feature.
2. **Keep the full-name wordmark (owner, 2026-11-06, carried over from feature 005).** The navigation
   bar keeps the "Luis Jacho Zambrano" wordmark instead of the earlier "LJ" monogram.
3. **Keep flat Projects cards (owner, 2026-11-06, carried over from feature 005).** Projects cards
   stay flat and non-interactive (no hover effect, no link behavior).
4. **Keep inline skills text (owner, 2026-11-06, carried over from feature 005).** Skills stay as
   inline text separated by `·`, not chips or pills.
5. **Accepted Principle VI deviation: English-only meta description and Open Graph text (owner,
   2026-11-06).** The page `<meta name="description">` and the Open Graph text stay English in both
   languages. Rationale: the primary audience is US recruiters, and the text is served before any
   script runs, so it cannot follow the client-side language switch. This is a recorded deviation
   from the NON-NEGOTIABLE Principle VI, not an amendment of it. Spanish search and social metadata
   would need per-language URLs, which go to the backlog (below).
6. **The Spanish tab title must survive client-side navigation (owner, 2026-11-06).** Next resets the
   title from route metadata on route changes; the feature must keep the Spanish title anyway
   (FR-020, SC-004).

## Backlog (separate features, not started)

- **Per-language URLs (`/es`)** with Spanish search and social metadata. Not part of 006; proposed as
  its own feature if the Spanish audience grows. Recorded by the owner's decision of 2026-11-06.

## Out of Scope

- New content or facts, and any rewording of the English text.
- Per-language URLs (`/es`) and Spanish search or social metadata.
- Blog post content (already bilingual).
- Re-translating the 14 Spanish strings the owner reviewed in feature 005.
- Constitution changes, new dependencies, and design or layout changes.

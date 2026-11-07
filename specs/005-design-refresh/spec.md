# Feature Specification: Design Refresh

**Feature Branch**: `005-design-refresh`

**Created**: 2026-11-06

**Status**: Draft

**Input**: User description: "Design refresh (feature 005), applying constitution v1.1.0, PRODUCT.md, DESIGN.md and the approved dark hero mock at specs/005-design-refresh/mocks/hero-dark.html to the live site. US1 tokens + hero, US2 remove banned patterns, US3 accessibility, US4 mark spec 001 blog sections superseded. Out of scope: new photo, OG image, new content."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A first screen that proves seniority in under a minute (Priority: P1)

A US recruiter or hiring manager lands on the home page. Without scrolling they see who Luis is,
the strongest proof, and how to act: the title "Senior .NET & Azure engineer.", the muted subline
"Nine years shipping for US teams. Now building AI agents.", the proof line (production scale,
30,000+ users), a static availability line, a neutral primary action (download CV) and a neutral
secondary action (view work), next to the portrait. The whole site uses the dark palette defined
in constitution v1.1.0 (Ink Black page, Paper White text, Cornflower Blue only for links and
focus), and the hero matches the approved mock `specs/005-design-refresh/mocks/hero-dark.html`.

**Why this priority**: The hero is the page's whole job (PRODUCT.md principle 1, "Verify in under
a minute"), and the new palette is the foundation the other stories build on.

**Independent Test**: Open the home page at 1280x800 and at 390x844 in each language; compare with
the mock; confirm the required elements are visible without scrolling. Inspect the theme values
against the constitution table.

**Acceptance Scenarios**:

1. **Given** the home page in English at 1280x800 or 390x844, **When** it finishes loading,
   **Then** the title, subline, proof line, primary action and secondary action are all visible
   without scrolling.
2. **Given** the home page in Spanish, **When** it loads, **Then** every hero string is in Spanish,
   including the availability line "Disponible para puestos remotos senior y consultoría".
3. **Given** the hero, **When** compared with the dark mock, **Then** content, order, hierarchy
   and styling of the title, subline, name line, proof line, tech-stack line, actions, contact
   links, availability line and portrait match; the portrait has the approved white 7% ring
   frame.
4. **Given** the theme, **When** its values are inspected, **Then** background, foreground,
   accent, accent hover, surface, surface 2, muted, border, strong border and focus ring equal
   the constitution v1.1.0 table, including the new focus ring value.
5. **Given** any visible text that states years of experience, **When** read in EN or ES,
   **Then** it says 9 years (not "8+").
6. **Given** the primary action, **When** activated, **Then** the CV file downloads; **Given** the
   secondary action, **When** activated, **Then** the page scrolls to the projects section.

---

### User Story 2 - A calm interface with no generic UI-kit decoration (Priority: P2)

A visitor browsing any page (home sections and blog) sees a restrained interface: no glows, no
gradient text, no frosted cards, no tinted badges, no pulsing indicators, no colored image
borders, and no accent color on buttons or headings. The owner flagged these as "AI-generated
UI-kit tells", and constitution Principle IV bans them.

**Why this priority**: It delivers the "calm, precise, senior" brand and removes the existing
violations of a NON-NEGOTIABLE principle, but the site is still usable without it.

**Independent Test**: Review every page and section at mobile and desktop widths against the
Principle IV banned list, plus a source search for the banned patterns.

**Acceptance Scenarios**:

1. **Given** any page, **When** reviewed visually and by source search, **Then** none of the
   banned patterns exist: pulsing or glowing status dots, colored shadow glows, gradient text,
   heavy frosted-glass cards, tinted pill badges, radial glow overlays, cyan or emerald image
   borders.
2. **Given** any button or call to action, **When** inspected, **Then** it is neutral (white fill
   with dark text for primary, thin neutral outline for secondary) and never accent-colored.
3. **Given** the accent color, **When** its uses are listed, **Then** they are only links and
   keyboard focus rings.
4. **Given** the previous decorative elements, **When** removed, **Then** the information they
   carried (for example a tag or status) is still present as plain text, and no section loses
   content.
5. **Given** the tech stack on any section, **When** displayed, **Then** it is inline text
   separated by `·`.
6. **Given** any section heading, **When** displayed, **Then** it has no small label above it
   and is plain white text.

---

### User Story 3 - A site everyone can read and operate (Priority: P2)

Keyboard users, screen-reader users, people with low vision, people sensitive to motion and
mobile users can all use the site. Text and controls meet WCAG AA contrast, every interactive
element has a visible focus indicator, a skip link jumps past the navigation, controls are large
enough to tap, the page declares the language currently shown, assistive labels are localized,
and full-height sections fit on mobile browsers whose toolbars collapse and expand.

**Why this priority**: The constitution now requires these (WCAG AA, reduced motion as MUST), and
Lighthouse Accessibility must stay at or above 90.

**Independent Test**: Keyboard-only walkthrough of the home page and blog in both languages;
automated contrast and accessibility audit; reduced-motion setting enabled; mobile viewport check.

**Acceptance Scenarios**:

1. **Given** any text, **When** its contrast against its background is computed, **Then** body
   text is at least 4.5:1, and large text and UI components (control outlines, focus rings,
   icons) are at least 3:1. Outlines of interactive controls use the strong border value, not
   the decorative hairline value.
2. **Given** keyboard navigation, **When** tabbing through the page, **Then** every interactive
   element (links, buttons, language toggle, floating contact button, menu toggle) shows a
   visible focus ring and focus order follows reading order.
3. **Given** the first Tab press on any page, **When** the skip link receives focus, **Then** it
   is visible, and activating it moves focus to the main content, bypassing the navigation. Its
   label is localized.
4. **Given** the operating-system "reduce motion" preference, **When** the site loads and is used,
   **Then** no entrance, scroll, hover-transition or float animation plays on any page,
   including blog and 404.
5. **Given** a touch device, **When** measuring interactive elements, **Then** each has a hit area
   of at least 44x44 CSS px (spacing may substitute only where the element is inline text in a
   sentence).
6. **Given** the visitor switches language, **When** the switch completes, **Then** the page's
   declared language changes to match (`en` or `es`), and on first load it matches the language
   shown.
7. **Given** a screen reader in either language, **When** it reads icon-only or labeled controls
   (language switch, menu, floating contact, social links), **Then** the labels are in the active
   language.
8. **Given** a mobile browser with a collapsing address bar, **When** a full-height section is
   shown, **Then** it fits the visible area without content hidden or extra scroll caused by
   toolbar height.
9. **Given** a 360px-wide viewport, **When** any page is viewed, **Then** there is no horizontal
   scrolling.

---

### User Story 4 - Specs that do not contradict the shipped blog (Priority: P3)

A maintainer reading `specs/001-baseline-current-portfolio/spec.md` sees that its blog sections
(Dev.to feed, English-only blog, client-side fetch) describe behavior that was replaced by the
native blog of spec 002, and that they are marked superseded, so nobody treats them as current.

**Why this priority**: Documentation-only; no visitor impact.

**Independent Test**: Open spec 001 and check each blog-related section and requirement for a
superseded marker pointing to spec 002.

**Acceptance Scenarios**:

1. **Given** spec 001, **When** a maintainer reads any blog section, requirement, deviation or
   success criterion, **Then** it is visibly marked "Superseded by spec 002" with the original
   text kept for history.
2. **Given** spec 001, **When** non-blog content is read, **Then** it is unchanged.

---

### Edge Cases

- Very narrow screen (360px) or very long Spanish strings: hero title, actions and availability
  line wrap without overflow or clipping.
- Very short landscape viewport: the hero still reads in order and is not clipped; the first-screen
  guarantee applies to the two named viewports.
- Browser with JavaScript slow or disabled for animation: content is visible without the entrance
  animation (never hidden waiting for it).
- Reduced motion on and language switched mid-visit: no animation introduced by the switch.
- The 404 and blog pages must follow the same palette, focus and motion rules as the home page.
- If the portrait fails to load, the hero remains readable and keeps its layout.
- Forced-colors or high-contrast mode: focus indicators and control boundaries remain visible.

## Requirements *(mandatory)*

### Functional Requirements

**US1: tokens and hero**

- **FR-001**: The site theme values MUST equal the constitution v1.1.0 table (background
  `#050505`, foreground `#FFFFFF`, accent `#548CFF`, accent hover `#7DA8FF`, surface `#0E0E10`,
  surface 2 `#18181B`, muted `#A1A1AA`, border `#27272A`, strong border `#71717A`, focus ring
  `#548CFF`), and no page may use the previous palette values.
- **FR-002**: The hero MUST show, in this reading order: title "Senior .NET & Azure engineer.",
  muted subline "Nine years shipping for US teams. Now building AI agents.", name and location
  line, proof line, tech-stack line, primary and secondary actions, contact links, and the
  availability and timezone lines, with the portrait beside (desktop) or below (mobile) the text.
- **FR-003**: The proof line MUST convey the production-scale claim (30,000+ users). Proof text
  and every other hero fact MUST come from existing site copy or PRODUCT.md; no new claims.
- **FR-004**: The availability line MUST be a static dot plus plain text; EN "Open to senior
  remote roles and consulting", ES "Disponible para puestos remotos senior y consultoría".
- **FR-005**: The primary action MUST download the CV; the secondary action MUST navigate to the
  projects section; both MUST be at least 44px high.
- **FR-006**: The portrait MUST use the approved white 7% ring frame and have meaningful
  alternative text.
- **FR-007**: At 1280x800 and 390x844, the title, subline, proof line and both actions MUST be
  visible without scrolling.
- **FR-008**: Every statement of experience duration MUST read "9 years" in EN and the
  equivalent in ES, including the About statistic and the page description metadata.
- **FR-009**: Every new or changed visible string MUST exist in EN and ES through the existing
  language mechanism, and the hero MUST be complete in both languages.

**US2: banned patterns**

- **FR-010**: No page or component MAY contain any pattern banned by constitution Principle IV
  (glow or pulse dots, colored shadow glows, gradient text, frosted cards, tinted pills, radial
  glow overlays, cyan/emerald image borders).
- **FR-011**: Primary and secondary actions on every page MUST be neutral per Principle IV.
- **FR-012**: The accent color MUST be used only for links and focus rings.
- **FR-013**: Removing decoration MUST NOT remove information: any meaning carried by a removed
  tag, badge or status MUST remain as plain text.
- **FR-014**: Tech stacks MUST render as inline text separated by `·`.
- **FR-015**: Section headings MUST stand alone, with no kicker or label above them (DESIGN.md
  "No Eyebrow Rule"); section headings are white, never gradient or accent colored.

**US3: accessibility**

- **FR-020**: All text and UI components MUST meet WCAG AA contrast (4.5:1 body, 3:1 large text
  and UI components); control outlines MUST use the strong border value.
- **FR-021**: Every interactive element MUST show a visible focus ring in the focus-ring color
  and MUST NOT have its focus indicator removed.
- **FR-022**: All animation and transitions MUST be disabled or reduced to non-motion when the
  visitor prefers reduced motion, on all pages.
- **FR-023**: Every page MUST provide a localized skip link as the first focusable element,
  targeting the main content.
- **FR-024**: Interactive elements MUST have a hit area of at least 44x44 CSS px.
- **FR-025**: The page's declared language MUST equal the language currently displayed, on first
  load and after switching.
- **FR-026**: Every accessible label (aria-label and equivalents) MUST be localized EN/ES.
- **FR-027**: Full-height sections MUST size against the small viewport height so they are not
  cut off by collapsing mobile browser toolbars.
- **FR-028**: Pages MUST have no horizontal overflow at 360px.

**US4: documentation**

- **FR-030**: Every blog-related section, requirement, deviation and success criterion in spec
  001 MUST carry a "Superseded by spec 002" marker, preserving original text; non-blog content
  MUST NOT change.

**Cross-cutting**

- **FR-040**: `npm run lint` and `npm run build` MUST pass with no errors.
- **FR-041**: Home page Lighthouse Performance and Accessibility MUST each be at least 90 and
  drop no more than 3 points versus the pre-change baseline (best of 3 runs for both).
- **FR-042**: Documents that mirror theme values (`CLAUDE.md`, `DESIGN.md`) MUST remain
  consistent with the shipped values; `DESIGN.md` is updated if shipped values differ in detail
  (the constitution is not edited).

### Key Entities

- **Theme token**: a named color with a role (page, text, accent, surface, border, focus) and a
  required contrast relationship to the colors it sits on.
- **Hero content block**: the ordered set of localized strings and actions on the first screen.
- **Localized label**: an assistive-technology string that exists in EN and ES.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can state Luis's title, years of experience and one proof point
  after viewing only the first screen, with zero scrolling, at both 1280x800 and 390x844.
- **SC-002**: 0 occurrences of Principle IV banned patterns across all pages (visual review plus
  source search).
- **SC-003**: 100% of text/background and control/background pairs meet WCAG AA thresholds
  (4.5:1 body, 3:1 large text and UI) in an automated and manual check.
- **SC-004**: 100% of interactive elements show a visible focus ring and are reachable by
  keyboard; the skip link works in both languages.
- **SC-005**: With reduced motion enabled, 0 animations or movement transitions play on any page.
- **SC-006**: 0 horizontal scrollbars at 360px on every page; 100% of interactive elements are at
  least 44x44 CSS px.
- **SC-007**: Home Lighthouse Performance and Accessibility are each at least 90 and no more than
  3 points below the pre-change baseline.
- **SC-008**: 0 untranslated or wrong-language visible strings or accessible labels when switching
  between EN and ES.
- **SC-009**: 100% of blog-related items in spec 001 are marked superseded; 0 non-blog lines
  changed.

## Assumptions

- The dark theme is decided and final (DESIGN.md, 2026-11-06); no light theme or theme toggle.
- The existing portrait (`public/pic.png`) and CV (`public/Luis_Jacho_Resume.pdf`) are kept.
- Hero facts (proof line, tech stack, contact links, timezone line) reuse existing site copy and
  PRODUCT.md; the only new strings are those the mock introduces (title, subline, availability,
  timezone line). Their ES wording follows the owner-supplied ES availability line; other ES
  strings are translations of the EN wording and are flagged for the owner's confirmation.
- The static availability dot color follows the mock (a plain status color, not an accent), and
  is exempt from the accent-only-for-links rule because it is not the accent.
- Sections other than the hero (About, Experience, Skills, Projects, Contact, Footer, Navbar,
  blog) keep their content and structure; only styling, banned patterns and accessibility change.
- The pre-change Lighthouse baseline is captured before implementation.
- Constitution v1.1.0, PRODUCT.md and DESIGN.md are already committed on this branch and are not
  modified by this feature except for the consistency updates in FR-042.

## Out of Scope

- A new photograph or portrait retake.
- An Open Graph / social share image.
- New content, copy beyond the strings listed above, case studies, testimonials or new blog posts.
- New dependencies, a light theme or theme toggle, constitution amendments.
- Changes to blog content or blog behavior beyond styling and accessibility.

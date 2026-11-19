# Feature Specification: Mobile Menu Navigation and Home Tab Title

**Feature Branch**: `010-mobile-menu-nav-and-title`

**Created**: 2026-11-18

**Status**: Implemented (verified locally 2026-11-18; owner checks on the Vercel preview pending)

**Input**: User description: "Two small fixes, one PR. (1) BUG, high priority: on mobile, tapping a section in the hamburger menu (About, Experience, Skills, Projects, Contact) closes the menu but does not take the visitor to that section. Reproduced at 360 px on the development server and on the production build; also present before feature 008 (chat widget), so it is not a regression from it. After the fix: tapping a section closes the menu AND scrolls to the section, keyboard focus moves to it, it works with reduced motion, in EN and ES, and from other routes (e.g. a blog post) it navigates to the home section. (2) The browser tab title on the home page is just \"Luis Jacho Zambrano\"; the role stays in the meta description and in the social-sharing (Open Graph, Twitter) title and description. Report how other routes' titles are built; do not change them. Out of scope: the chat widget launcher and any layout change."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tapping a menu section takes me there (Priority: P1)

A visitor on a phone opens the hamburger menu and taps a section name (About, Experience, Skills, Projects, Contact). The menu closes and the page moves to that section. Today the menu closes but the page stays at the top, so the menu looks broken.

**Why this priority**: On phones the menu is the main way to move around the page, and it does nothing useful today. It is the reason this feature is high priority.

**Independent Test**: At a 360 px wide viewport, open the home page, open the menu, tap each of the five sections in turn (reloading between taps), in EN and ES, with and without the "reduce motion" system setting. After each tap, the chosen section is at the top of the visible area and the menu is closed.

**Acceptance Scenarios**:

1. **Given** the home page at the top on a 360 px viewport and the menu open, **When** the visitor taps any of the five sections, **Then** the menu closes and the chosen section's top edge aligns with the top of the visible area (its own padding keeps the heading clear of the fixed header).
2. **Given** the same state with "reduce motion" enabled, **When** the visitor taps a section, **Then** the page jumps to the section without animated scrolling and the menu closes.
3. **Given** the same state with "reduce motion" disabled, **When** the visitor taps a section, **Then** the page scrolls smoothly all the way to the section and is not interrupted by the menu closing.
4. **Given** the menu is open and the language is Spanish, **When** the visitor taps a section, **Then** the result is identical to English.
5. **Given** the visitor is on a blog post on a phone, **When** they open the menu and tap a section, **Then** the site opens the home page at that section and the menu is closed.
6. **Given** a section was chosen from the menu, **When** the move ends, **Then** keyboard focus is on the chosen section, so the next Tab continues from there instead of from the top of the page.
7. **Given** the visitor taps the Blog item in the menu, **When** the blog opens, **Then** the menu is closed (unchanged behavior).

---

### User Story 2 - The tab title is just my name (Priority: P2)

A visitor, or someone viewing their browser tabs and history, sees "Luis Jacho Zambrano" as the title of the home page, in both English and Spanish. The role (Senior Full Stack Developer) is not part of the tab title, but search results and link previews (for example on LinkedIn) still say what Luis does.

**Why this priority**: A branding and polish improvement requested by the owner. No visitor is blocked without it.

**Independent Test**: Open the home page in EN, switch to ES, and read the tab title in each. Read the page's description, sharing title and sharing description in the page source.

**Acceptance Scenarios**:

1. **Given** the home page in English, **When** it finishes loading, **Then** the tab title is exactly "Luis Jacho Zambrano".
2. **Given** the home page, **When** the visitor switches to Spanish, **Then** the tab title is still exactly "Luis Jacho Zambrano".
3. **Given** the home page source (before any script runs), **When** a search engine or link-preview crawler reads it, **Then** the title is exactly "Luis Jacho Zambrano", the description still names the role and experience, and the sharing (Open Graph and Twitter) title and description state the role ("Senior Full Stack Developer") and what Luis does.
4. **Given** the blog index, a blog post and an unknown URL (404), **When** their titles are read, **Then** the current pattern is reported to the owner (see Assumptions); no title other than the home page's is changed on purpose by this feature.

---

### Edge Cases

- Tapping the section the visitor is already viewing: the menu closes and the page stays on that section; no error.
- Tapping a section while the page is still moving from a previous tap: the page ends on the last chosen section.
- Opening a section link in a new tab from the menu (long-press or modified click): normal browser behavior, unchanged.
- Rotating the phone or resizing past the mobile breakpoint with the menu open: the menu closes, as today.
- A visitor who arrives on the home page with a `#section` address: opens at that section, as today.
- 404 page: it reuses the home title today, so it will show the same shorter title; this is reported, not a separate change.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Activating any of the five section items in the mobile menu MUST close the menu and bring that section to the top of the visible area, on every route that has the menu.
- **FR-002**: The movement to the section MUST complete; closing the menu MUST NOT cancel, shorten or reverse it.
- **FR-003**: With the system "reduce motion" setting on, the move to the section MUST be immediate (no animated scrolling); with it off, the scroll is smooth as today.
- **FR-004**: After a section is chosen from the menu, keyboard focus MUST be on that section (not on the page body), without the page jumping a second time and without a visible outline around the whole section.
- **FR-005**: From any route other than the home page, choosing a section MUST open the home page at that section.
- **FR-006**: The behavior MUST be identical in EN and ES. No visible string is added or changed for this part.
- **FR-007**: The desktop navigation (section links, Blog link, wordmark, language switcher) MUST behave exactly as before.
- **FR-008**: The menu's open/close control, the "current section" highlight and the Blog item MUST keep working as before.
- **FR-009**: The home page title shown in the browser tab MUST be exactly "Luis Jacho Zambrano" in EN and ES, both in the page as delivered and after the page is interactive.
- **FR-010**: The home page's description MUST keep naming the role and experience, and the home page MUST provide sharing (Open Graph and Twitter) title and description that state the role ("Senior Full Stack Developer") and what Luis does.
- **FR-011**: Titles of the blog index, blog posts and the 404 page MUST NOT be changed on purpose; the 404 page's title follows the home title because it already reuses it. The current pattern MUST be reported to the owner.
- **FR-012**: No layout, spacing, color or typography change is part of this feature; the menu keeps opening and closing with a visually continuous transition.

### Key Entities

- **Menu section item**: one of About, Experience, Skills, Projects, Contact; each leads to one section of the home page.
- **Page title / sharing summary**: the tab title, the description and the sharing title/description of a route.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of taps (5 sections × EN/ES × reduce motion on/off, on the home page, plus 5 sections from a blog post) at a 360 px viewport, the chosen section ends within 2 px of the top of the visible area and the menu is closed.
- **SC-002**: The same checks pass on the development server and on the production build.
- **SC-003**: After choosing a section, the focused element is that section in 100% of the combinations.
- **SC-004**: The home tab title equals "Luis Jacho Zambrano" in EN and ES and in the delivered page source; the delivered source contains the role in the description and in the sharing title and description.
- **SC-005**: Desktop navigation, lint, build and the route table (all routes static as before) show no regression; Lighthouse stays ≥ 90 with no drop > 3 points vs baseline.

## Assumptions

- The defect is not a regression from feature 008: it was reproduced on a build of the commit before 008 (`3ea5600`) as well. The owner's own check of an older deployment is welcome but not required.
- Current title pattern (reported, not changed): home "Luis Jacho Zambrano — Senior Full Stack Developer" (EN) and "… — Desarrollador full stack senior" (ES, applied after load); blog index "Blog — Luis Jacho Zambrano"; blog post = the post's own title only (no site name); 404 = the home title. The pattern is inconsistent (posts lack the site name); aligning it is a separate decision for the owner.
- The home page currently has no sharing (Open Graph/Twitter) tags; "keep the role in them" is read as "provide them with the role", in English only, consistent with the accepted deviation that page metadata stays English (owner, 2026-11-06).
- Out of scope: the chat widget launcher (separate PR), any layout change, titles of non-home routes, the viewing position after a language switch.

# Feature Specification: Fix 404 Hydration Mismatch

**Feature Branch**: `007-fix-404-hydration`

**Created**: 2026-11-07

**Status**: Draft

**Input**: User description: "007 Fix the hydration mismatch (React error #418) on unknown /blog/* URLs, closing waiver W-1 of specs/004-upgrade-nextjs-16/spec.md (research R-14). The prerendered 404 is built without the requested URL, but the navigation bar and the 404 message depend on the current URL in the browser, so the server HTML and the first client render differ and a console error appears. After the fix: no console errors on unknown URLs; correct Blog tab state and wording after the page is interactive (EN and ES); no regression on other routes; routes stay statically prerendered."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - No console errors on an unknown blog URL (Priority: P1)

A visitor (or the owner checking the site) opens a blog address that does not exist, for example a mistyped post link such as `/blog/nope`. Today the browser console reports a React hydration error (#418) that did not exist before the Next.js 16 upgrade. After this feature the page loads with a clean console.

**Why this priority**: This is the regression recorded as waiver W-1. It is the only user-visible defect the feature exists to remove, and the owner accepted it only on the condition that it be fixed.

**Independent Test**: Open `/blog/nope` in a fresh browser session, in English and in Spanish, with the console open. Also open `/nope` (a non-blog unknown URL). The console shows no errors and no hydration warnings in all cases.

**Acceptance Scenarios**:

1. **Given** the language is English, **When** the visitor opens `/blog/nope` directly (full page load), **Then** the console shows zero errors and zero hydration warnings.
2. **Given** the visitor has selected Spanish on another page, **When** they follow a link to `/blog/nope` (client-side navigation), **Then** the console shows zero errors and zero hydration warnings, and the 404 is in Spanish. (A direct page load always starts in English because the language choice is not stored; that is existing behavior and out of scope.)
3. **Given** any language, **When** the visitor opens `/nope` directly, **Then** the console shows zero errors and zero hydration warnings.
4. **Given** the visitor is on the home page, **When** they follow a link to an unknown blog URL (client-side navigation), **Then** the console shows zero errors.

---

### User Story 2 - Correct navigation state and wording once the page is interactive (Priority: P2)

On an unknown blog URL the visitor must still see the right context once the page is ready: the Blog tab in the navigation shows as the current section, the message says the *post* was not found, and the link leads back to the blog. On an unknown non-blog URL the message is the generic "page not found" and the link leads home. All of this is in the visitor's chosen language.

**Why this priority**: Removing the console error must not cost the helpful behavior the 404 has today (shipped in features 002 and 006). It ranks below P1 because the user-visible end state is already correct today; the feature must preserve it, not create it.

**Independent Test**: After the page has finished loading on `/blog/nope` and `/nope`, in EN and ES, read the heading, body text, link text and link target, and check which navigation item is marked as current.

**Acceptance Scenarios**:

1. **Given** the visitor is on `/blog/nope` (EN or ES), **When** the page is interactive, **Then** the heading and body use the "post not found" wording, the link reads the localized "back to blog" text and points to `/blog`, and the Blog navigation item is marked as the current page.
2. **Given** the visitor is on `/nope` (EN or ES), **When** the page is interactive, **Then** the heading and body use the generic "page not found" wording, the link reads the localized "go home" text and points to `/`, and no navigation item is marked as the current page.
3. **Given** the visitor is on `/blog/nope`, **When** they switch language, **Then** the wording changes to the other language and stays correct for the blog context.
4. **Given** the visitor is on `/blog/nope`, **When** they follow the link, **Then** they arrive at `/blog`, which shows the Blog item as current.

---

### User Story 3 - No regression on the other routes (Priority: P3)

Every other page behaves as it does today: the home page, the blog index and existing posts open with a clean console, the navigation highlights the right item (section while scrolling on the home page, Blog on blog pages), and the site stays fully static.

**Why this priority**: Protects what already works. Lower priority only because the fix is not expected to touch these pages' behavior.

**Independent Test**: Open `/`, `/blog` and an existing post in EN and ES with the console open; scroll the home page; confirm the highlighted navigation item. Run the production build and check the route table.

**Acceptance Scenarios**:

1. **Given** any language, **When** the visitor opens `/`, `/blog` or an existing post, **Then** the console shows zero errors and zero hydration warnings.
2. **Given** the visitor scrolls the home page, **When** a section is in view, **Then** the matching navigation item is highlighted; **When** they open `/blog` or a post, **Then** the Blog item is marked as the current page.
3. **Given** the production build, **When** the route table is read, **Then** the same routes are marked static as before this feature, and no route has become dynamic.

---

### Edge Cases

- A blog URL with a trailing slash or nested segments (`/blog/nope/`, `/blog/a/b`) is treated as an unknown blog URL: the Blog item is marked current and the post-not-found wording applies after the page is interactive.
- A URL that only starts with the same letters, such as `/blogger` or `/blog-old`, is not a blog URL: generic wording, no Blog item marked.
- The visitor selects Spanish, then reaches an unknown URL by client-side navigation: no console error; the page stays in Spanish.
- Slow connection or JavaScript disabled: the visitor still sees a readable 404 (the generic wording is acceptable before the page becomes interactive). The post-specific wording and the Blog state are not required without JavaScript.
- The visitor navigates between an unknown URL and a valid page in the same session (client-side): the navigation state follows the current page, with no stale highlight.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Opening any unknown URL by full page load (`/blog/<unknown>`, `/nope`) MUST produce no console errors and no hydration warnings, in EN and ES. The browser's own network line "Failed to load resource: the server responded with a status of 404" for the page's own address is not counted: it is the correct HTTP status of a missing page (the baseline `/nope` shows it too) and is not an application error.
- **FR-002**: The initial HTML of the 404 page MUST NOT depend on the requested URL, so that it is identical to what the browser renders first.
- **FR-003**: Once the page is interactive, an unknown blog URL (path under `/blog/`) MUST show the "post not found" heading and body, a localized link to `/blog`, and the Blog navigation item marked as the current page.
- **FR-004**: Once the page is interactive, an unknown non-blog URL MUST show the generic "page not found" heading and body, a localized link to `/`, and no navigation item marked as current.
- **FR-005**: The wording and link text MUST come from the existing EN/ES strings; this feature MUST NOT add, remove or change any visible string.
- **FR-006**: Navigation highlighting on `/`, `/blog` and existing posts MUST behave as before this feature (section highlight on the home page, Blog marked current on blog pages).
- **FR-007**: The home page, `/blog` and existing posts MUST show no console errors or hydration warnings.
- **FR-008**: No route that is static today may become dynamic, and no new runtime dependency may be added.
- **FR-009**: The visual appearance of the 404 page, the navigation and all other pages MUST be unchanged once the page is interactive.
- **FR-010**: On completion, waiver W-1 in `specs/004-upgrade-nextjs-16/spec.md` and the matching "Status" in `specs/004-upgrade-nextjs-16/research.md` (R-14) MUST be updated to record that feature 007 closed it, with the date, and no document may keep claiming the defect is open.

### Key Entities

Not applicable: this feature changes no data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On `/blog/nope` and `/nope`, with the console open, the number of console errors and hydration warnings is 0 across 3 consecutive fresh loads each (EN, direct load), and 0 after a client-side navigation to each in ES.
- **SC-002**: After load, 100% of the checks in User Story 2 pass in both languages (heading, body, link text and target, and which navigation item is marked current).
- **SC-003**: `/`, `/blog` and at least one existing post show 0 console errors in EN and ES, and the navigation highlight matches the page on each.
- **SC-004**: The production build route table is unchanged from the pre-feature build (same static routes, none dynamic), and lint and build pass with no errors.
- **SC-005**: Waiver W-1 is marked closed in the 004 documents and no remaining document describes the mismatch as open.

## Assumptions

- The visitor-visible end state of the unknown-URL page is already correct today (the page recovers after the error); the feature preserves it while removing the error.
- Out of scope: any visual redesign; new or changed strings; blog content; Lighthouse tuning; dependency changes; making the pre-hydration HTML itself show the post-specific wording or the Blog tab state (the prerendered 404 cannot know the requested URL, so before the page becomes interactive it shows the generic wording with no Blog item marked, which the owner accepted in W-1).
- A brief moment between first paint and interactivity in which the unknown blog URL shows the generic wording and then switches to the post wording is acceptable; it is the same moment the owner already accepted in W-1.
- Lighthouse Performance and Accessibility on the home page must stay at or above 90 per the constitution; the feature is not expected to move them, but the navigation bar is part of the home page, so the scores are measured before and after (at least 90 and no drop greater than 3 points versus the baseline, best of 3).
- The existing language preference mechanism and EN/ES strings are reused unchanged (Principle VI).

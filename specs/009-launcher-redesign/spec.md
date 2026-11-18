# Feature Specification: Chat Launcher Redesign (single dock)

**Feature Branch**: `009-launcher-redesign`

**Created**: 2026-11-17

**Status**: Draft

**Input**: User description: "Redesign the entry point (launcher) of the 'Ask about Luis' chat widget. Replace the two competing floating buttons with one coherent floating dock where the assistant is primary and WhatsApp is secondary. The chat panel and the agent API contract do not change."

## Context

Owner feedback on production (2026-11-17): the outline "Ask about Luis" pill stacked above the bright green WhatsApp circle gives two floating elements of different shape and weight; the green draws the eye away from the assistant, the more valuable feature; the pill has no cue that it is an AI assistant that answers instantly; the stack looks improvised (mismatched centres and margins).

Owner decision 2026-11-17: option D of `mocks/launcher-options.html` (hybrid dock), WhatsApp shown as a neutral white glyph (no green fill). This feature supersedes the launcher arrangement in `specs/008-ai-chat-widget` FR-002 (pill stacked above WhatsApp) and the "no overlap between the two floating buttons" wording of SC-009; every other 008 requirement stays in force.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Notice the assistant and open it from one coherent control (Priority: P1)

A recruiter lands on any page and sees a single floating control at the bottom-right. Its main part is clearly the AI assistant: an assistant icon with "Ask about Luis" on a phone, and on a laptop a wider input-style field reading "Ask anything about Luis…" with a small "AI" hint. A smaller WhatsApp part sits beside it. Activating the assistant part opens the existing chat panel with the question box ready to type in.

**Why this priority**: This is the whole point of the redesign: make the assistant the obvious primary entry point and remove the two-competing-buttons look.

**Independent Test**: Load the home page at 360px and at 1280px. Confirm there is exactly one floating control containing an assistant part and a WhatsApp part, the assistant part is visually dominant, and activating it opens the panel with the cursor in the question box.

**Acceptance Scenarios**:

1. **Given** any page at a width below 768px, **When** it loads, **Then** one floating control is visible at the bottom-right showing an assistant icon with the label "Ask about Luis" (ES: "Pregunta sobre Luis") and a separate icon-only WhatsApp part.
2. **Given** any page at 768px or wider, **When** it loads, **Then** the assistant part is wider and styled as an input-like field with the text "Ask anything about Luis…" (ES: "Pregunta lo que quieras sobre Luis…") and a small "AI" (ES: "IA") hint, and the WhatsApp part remains an icon-only part beside it.
3. **Given** the control is visible, **When** the visitor activates the assistant part by click, tap, Enter or Space, **Then** the chat panel opens and the question box has keyboard focus, with no text pre-filled.
4. **Given** the control is visible, **When** the visitor compares its two parts, **Then** both have the same height, share one outline and are aligned on one baseline and one margin from the screen edges (no mismatched centres).
5. **Given** the visitor reads the page in either language, **When** they switch language, **Then** every visible word and accessible name of the control changes accordingly.
6. **Given** a page load, **When** the page first renders, **Then** the control is already in its final form (no flash of the old two-button layout) and the first paint of the page is not delayed by it.

---

### User Story 2 - WhatsApp stays one step away, visually secondary (Priority: P1)

A visitor who prefers WhatsApp finds it in the same control, one tap away, without it competing with the assistant for attention. Activating it opens WhatsApp with the same prefilled message as today.

**Why this priority**: WhatsApp is a real contact channel; the redesign must not make it harder to reach.

**Independent Test**: At 360px and 1280px, activate the WhatsApp part and confirm it opens the same WhatsApp conversation with the same prefilled message (in the active language) in a new tab; confirm it uses no green fill.

**Acceptance Scenarios**:

1. **Given** the control is visible, **When** the visitor activates the WhatsApp part, **Then** WhatsApp opens in a new tab to the same number and with the same prefilled message in the active language as before this feature.
2. **Given** the control is visible, **When** it is inspected, **Then** the WhatsApp part shows a neutral white glyph on the control's neutral surface, with no green fill, and has the same accessible name as before ("Chat on WhatsApp" / "Escríbeme por WhatsApp").
3. **Given** a keyboard user, **When** they press Tab from the page, **Then** the assistant part and the WhatsApp part are two separate stops in that order, each with a visible focus indicator.

---

### User Story 3 - Control stays accessible, unobtrusive and robust (Priority: P2)

On every width the control meets accessibility rules, never overflows or hides other content, and keeps working when the chat panel cannot talk to the service.

**Why this priority**: Constitution requirements (WCAG AA, 44px targets, no overflow at 360px, reduced motion, resilient integrations) must hold; the story is separable from the visual redesign itself.

**Independent Test**: Check at 360px, 768px and 1280px with a keyboard, with reduced motion enabled, at the bottom of every page, and on a preview (non-production) address.

**Acceptance Scenarios**:

1. **Given** a viewport of 360px, **When** the control is shown in either language, **Then** there is no horizontal overflow and no text is clipped, and each part is at least 44×44px.
2. **Given** the visitor scrolls to the bottom of any page, **When** the Footer and Contact links are in view, **Then** they remain fully visible and reachable and the control does not cover them.
3. **Given** the panel is open and the visitor closes it (Esc or close control), **When** it closes, **Then** keyboard focus returns to the assistant part.
4. **Given** the visitor prefers reduced motion, **When** the control appears or is used, **Then** no animated transition occurs.
5. **Given** the site is opened on an address other than the production site, **When** the assistant part is activated, **Then** the panel shows "Assistant available on luisjacho.dev" and nothing is sent (unchanged from today).
6. **Given** the agent service is down, **When** the page loads, **Then** the control still renders and works; the failure only shows inside the panel as it does today.
7. **Given** the text and icon colours of the control, **When** contrast is measured, **Then** text meets 4.5:1 and outlines, icons and the focus ring meet 3:1.

---

### Edge Cases

- Spanish strings are longer than English: the 360px layout must still fit with no clipping or overflow.
- Widths around the 768px switch (767px and 768px): the control switches cleanly between compact and input-style form, never showing both or overlapping.
- Zoomed viewports (200% zoom, enlarged text): the control stays within the screen and remains operable.
- The panel is open: the control is not shown (as the launcher is today); closing restores it and returns focus.
- Blog pages and the 404 page also show the control, consistent with the current launcher behaviour.
- A short viewport (landscape phone): the control does not cover Footer links when the page is scrolled to the end.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST show exactly one floating control on every page, at the bottom-right, replacing the current two floating buttons (the "Ask about Luis" pill and the separate WhatsApp circle).
- **FR-002**: The control MUST have two parts sharing one outline, one height and one margin from the screen edges: a primary assistant part and a secondary icon-only WhatsApp part.
- **FR-003**: Below 768px the assistant part MUST show an assistant icon and the label "Ask about Luis" (ES "Pregunta sobre Luis").
- **FR-004**: From 768px the assistant part MUST present as an input-style field showing "Ask anything about Luis…" (ES "Pregunta lo que quieras sobre Luis…") and a small "AI" (ES "IA") hint.
- **FR-005**: Activating the assistant part MUST open the existing chat panel and put keyboard focus in the question box with no pre-filled text. The input-style appearance MUST NOT accept typing itself.
- **FR-006**: The assistant part MUST be visually dominant over the WhatsApp part (larger area and the primary label) without using the accent colour.
- **FR-007**: The WhatsApp part MUST keep the same destination, prefilled message (per active language) and accessible name as today, open in a new tab, and show a neutral white glyph with no green fill.
- **FR-008**: Each part MUST be an independent keyboard stop (assistant first, then WhatsApp) with a visible focus indicator, and each MUST be at least 44×44px.
- **FR-009**: The control MUST cause no horizontal overflow and no clipped text at 360px in EN and ES, and MUST fit within the Footer's existing bottom clearance so it never covers Footer or Contact links at the end of any page.
- **FR-010**: Closing the panel (Esc or close control) MUST return keyboard focus to the assistant part.
- **FR-011**: The control MUST appear without delaying the first render of the page, and the chat panel itself MUST still load only when first needed.
- **FR-012**: All visible text and accessible names of the control MUST exist in EN and ES and follow the language switcher.
- **FR-013**: The control MUST respect reduced-motion preferences (no animated transition when reduced motion is requested) and MUST use only the site's existing colour tokens with neutral styling: no shadows, glows, gradients, blur or pulsing.
- **FR-014**: Behaviour on non-production addresses and with the agent service down, the panel's content, and the agent API MUST remain exactly as before this feature.
- **FR-015**: The control MUST meet WCAG AA contrast: 4.5:1 for text, 3:1 for outlines, icons and focus indicators.

### Out of Scope

- The chat panel's content, layout or behaviour, and the agent API contract.
- A desktop hover label on the WhatsApp segment: the old hover/focus label is removed; the segment is icon-only and keeps its accessible name (owner-approved mock, 2026-11-17).
- Pre-filling the question box from the launcher.
- Moving or duplicating WhatsApp into the panel or the Contact section.
- A collapsing or reveal-on-tap pattern (speed dial).
- The production service-address fallback bug (separate fix).
- Changes to the Footer, Contact section, constitution or theme tokens.

### Key Entities

- **Launcher dock**: the single floating control. Has two parts (assistant, WhatsApp), a compact form (below 768px) and an input-style form (768px and up), and is hidden while the chat panel is open.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At 360px and 1280px the page shows exactly one floating control (no other fixed element in the bottom-right corner) while the panel is closed.
- **SC-002**: A first-time visitor opens the assistant in one action (one click, tap or key press) from any page, and WhatsApp in one action as well.
- **SC-003**: In EN and ES at 360px there is no horizontal overflow, no clipped text, and every interactive part is at least 44×44px.
- **SC-004**: At the end of every page (home, blog index, a blog post, 404) the Footer and Contact links are fully visible and not covered by the control at 360px and 1280px.
- **SC-005**: A keyboard-only user opens the assistant, closes it with Esc, and finds focus on the assistant part in 100% of attempts; the WhatsApp part is a separate stop.
- **SC-006**: Home-page Lighthouse Performance and Accessibility are ≥ 90 with no drop of more than 3 points versus the baseline measured before the change (best of 3 runs each).
- **SC-007**: The chat panel code is not part of the initial page load (still fetched only on first open or on hover/focus intent), as today.
- **SC-008**: The owner confirms in the Vercel preview that the assistant is the obvious primary entry point and WhatsApp reads as secondary.

## Assumptions

- "From 768px" means the site's `md` breakpoint (mobile-first, constitution Principle III).
- The WhatsApp number, message and accessible names already exist in the site and are reused as-is.
- The "AI"/"IA" hint and the English placeholder were approved with the mock (owner decision 2026-11-17).
- Owner decision 2026-11-17: the Spanish input-style text is "Pregunta lo que quieras sobre Luis…" (same meaning as the English). It only shows from 768px, where the field grows to fit it; the compact label below 768px is the existing "Pregunta sobre Luis".
- The control remains hidden while the panel is open (current behaviour) and is shown again on close.
- Dependencies: the existing chat panel and chat state from feature 008, unchanged; the Footer's current bottom clearance (144px) is enough for the control (up to 80px tall including its margin).

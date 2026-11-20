# Feature Specification: "Ask about Luis" AI Chat Widget

**Feature Branch**: `008-ai-chat-widget`

**Created**: 2026-11-17

**Status**: Draft

**Input**: User description: "Add a floating AI chat widget ("Ask about Luis") that talks to the portfolio agent service. Visitors ask questions about Luis and see answers appear progressively. Bilingual EN/ES, accessible, safe rendering, nothing stored, graceful when the service is unavailable or the site is not the production site."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask a question and read a streamed answer (Priority: P1)

A recruiter on the home page sees a floating "Ask about Luis" launcher, opens it, picks one of three starter questions (or types their own), and reads the answer as it appears progressively. While the assistant looks up information, a subtle "Searching Luis's profile…" state is shown. When the answer is complete, they can ask a follow-up in the same conversation.

**Why this priority**: This is the whole feature. Without a working ask-and-answer loop there is nothing to ship. It directly serves the product goal of letting a decision-maker verify fit quickly.

**Independent Test**: Open the site on the production origin, open the launcher, choose a starter question, and confirm an answer appears progressively and a follow-up question can be sent. Delivers value even with no other story implemented.

**Acceptance Scenarios**:

1. **Given** the panel is open with an empty conversation, **When** the visitor sees it, **Then** three starter questions and the disclaimer "AI assistant · answers come from Luis's profile and may contain mistakes" are visible (in the active language).
2. **Given** the empty conversation, **When** the visitor chooses a starter question, **Then** it is sent as their first message and an answer begins to appear.
3. **Given** an answer is being produced, **When** the assistant is looking up information, **Then** a subtle "Searching Luis's profile…" state is shown and is replaced by the answer text as it arrives.
4. **Given** an answer has finished, **When** the visitor types a follow-up and sends it, **Then** the assistant answers with awareness of the earlier turns of the same conversation.
5. **Given** the service signals that the streamed answer must be replaced by a different final text, **When** that happens, **Then** the visitor sees only the replacement text, never the discarded text together with it.
6. **Given** an answer contains bold text, lists or links, **When** it is displayed, **Then** they render as formatted text; any raw HTML in the answer is shown as inert text or omitted and never executed; links open in a new tab and the opened page gets no access to the site.

---

### User Story 2 - Open, close and operate the widget with keyboard and assistive technology (Priority: P1)

A keyboard or screen-reader user can reach the launcher, open the panel, move through the starters, input, send and close controls, and close with Esc. On close, focus returns to the launcher. On a phone the panel fills the screen; on desktop it is a panel that does not cover the whole page.

**Why this priority**: Accessibility is a binding constitution requirement (WCAG AA, visible focus, reduced motion), and the mobile layout is part of the primary experience. It is a separate testable slice from the chat logic.

**Independent Test**: With only a keyboard, open the widget, send a message, close it with Esc, and confirm focus returns to the launcher. Check at 360px and desktop widths.

**Acceptance Scenarios**:

1. **Given** focus is on the launcher, **When** the visitor presses Enter or Space, **Then** the panel opens and focus moves into it.
2. **Given** the panel is open, **When** the visitor presses Esc or activates the close control, **Then** the panel closes and keyboard focus is on the launcher.
3. **Given** the panel is open, **When** the visitor tabs through it, **Then** focus stays inside the panel while it is open, every control shows a visible focus indicator, and no control is unreachable.
4. **Given** a new assistant answer or status message appears, **When** a screen reader is in use, **Then** the update is announced without stealing focus.
5. **Given** a viewport of 360px width, **When** the panel is open, **Then** it fills the screen with no horizontal overflow and all controls are at least 44x44px.
6. **Given** the visitor prefers reduced motion, **When** the panel opens, closes or streams text, **Then** no animated transition is used.

---

### User Story 3 - Understand limits and errors without confusion (Priority: P2)

A visitor who hits a limit or an error always gets a short, human message in their language and a clear next step. The input shows a character counter and cannot exceed 2000 characters. At 20 messages the conversation can go no further and offers "Start a new conversation". A rate-limit error shows how long to wait and prevents immediate resending. A daily-budget error and a service-down or network error each have their own message and a way to retry when retrying makes sense.

**Why this priority**: Errors are common for a public, rate-limited, budget-capped service and the product must stay calm and credible, but the happy path (Story 1) ships value on its own.

**Independent Test**: Simulate each condition (over-long input, 20-message conversation, rate-limit with a wait time, daily budget reached, service unreachable) and verify the message, the language, and the available next action.

**Acceptance Scenarios**:

1. **Given** the input is being typed, **When** the visitor types, **Then** a counter shows used and maximum characters, and sending is blocked while the text is over 2000 characters or empty.
2. **Given** the conversation has reached 20 messages, **When** the visitor tries to continue, **Then** the input is disabled, a message explains the limit, and a "Start a new conversation" action clears the whole conversation and returns to the starter state.
3. **Given** the service says the visitor is sending too fast and gives a wait time, **When** the message is shown, **Then** it states the wait in seconds, sending is disabled until that time passes, and the visitor's typed text is not lost.
4. **Given** the service says its daily budget is reached, **When** the message is shown, **Then** the visitor is told the assistant is unavailable until later and is pointed to the existing contact options.
5. **Given** the service rejects the input as invalid, **When** that happens, **Then** a short message asks the visitor to shorten or rephrase, and their text is preserved.
6. **Given** the service is down or the network fails, **When** that happens, **Then** a short message is shown with a retry action, the rest of the site is unaffected, and no technical detail (status code, stack trace, raw server text) is shown.
7. **Given** a stream stops before it is complete, **When** that is detected, **Then** the visitor sees that the answer is incomplete and can retry.
8. **Given** the service stays silent for 30 seconds (no bytes at all), **When** the idle timeout fires, **Then** the visitor sees a "took too long" message, their message is kept, and one Retry action resends it; a slow but progressing answer is never cut off.

---

### User Story 4 - Degrade gracefully on non-production sites (Priority: P2)

On any site address other than the production site (for example a preview deployment of a branch), the service refuses requests by design. The widget must not appear broken: the launcher still exists, but opening it shows "Assistant available on luisjacho.dev" in the active language and offers no input. Local development talks to a local service so the feature can be built and tested.

**Why this priority**: Every pull request is reviewed on a preview deployment; a broken-looking widget there would mislead reviews. It does not affect production visitors.

**Independent Test**: Load the site from a non-production, non-local address and confirm the message appears, no request to the service is attempted, and the page is otherwise normal.

**Acceptance Scenarios**:

1. **Given** the site is served from the production address (apex or www), **When** the visitor opens the widget, **Then** the full chat is available.
2. **Given** the site is served from any other non-local address, **When** the visitor opens the widget, **Then** they see "Assistant available on luisjacho.dev" (EN/ES), no input is offered, and no request is sent to the service.
3. **Given** the site is served locally during development, **When** the widget is opened, **Then** the full chat is available against the local service address.

---

### User Story 5 - Bilingual and private by default (Priority: P2)

Every visible and accessible string of the widget exists in English and Spanish and follows the site's language switch. Nothing about the conversation is stored: no cookies, no browser storage, no analytics, no logs from the site. Closing the page or starting a new conversation discards everything. *(Scope clarified on 2026-11-20 by `specs/011-vercel-web-analytics`, agent decision: "analytics" here means analytics inside the widget or about the conversation. Site-level anonymous page-view analytics was added by feature 011 and does not contradict this, because the widget writes no cookie or storage and never changes the page address, so a page view never contains conversation content. The requirement itself is unchanged.)*

**Why this priority**: Both are binding (constitution Principle VI; privacy stated by the owner) but they are properties of the other stories rather than a separate flow.

**Independent Test**: Toggle EN/ES with the panel open and confirm all widget text switches; inspect the browser's storage and cookies after a conversation and confirm nothing was written.

**Acceptance Scenarios**:

1. **Given** a conversation exists, **When** the visitor switches language (the panel is a modal dialog, so the site language toggle is reachable with the panel closed) and reopens the panel, **Then** all widget labels, starters, counter, disclaimer, status and error messages are in the new language and the existing conversation is kept. *(Wording changed during implementation: see Assumptions.)*
2. **Given** a completed conversation, **When** browser storage and cookies are inspected, **Then** no conversation content or identifier has been written.
3. **Given** a conversation, **When** the visitor closes and reopens the panel without reloading, **Then** the conversation is still shown; **When** the page is reloaded, **Then** it is gone.

---

### Edge Cases

- The visitor sends a message while an answer is still streaming: sending is disabled until the answer completes or fails.
- The visitor closes the panel mid-answer: the answer continues or is cancelled without error; reopening shows a coherent state (completed text or an "incomplete" note), never a stuck loading state.
- The service answers with an empty text: show a short "no answer, try again" message.
- Markdown edge cases: unclosed bold, very long links, deeply nested lists, link with a non-web scheme (e.g. `javascript:`): all stay inert and safe.
- A single very long unbroken word or URL in an answer does not cause horizontal overflow at 360px.
- The visitor uses the browser back/forward or navigates between home and blog pages: the launcher is present on every page and behaves consistently.
- The prerendered 404 shell: the widget must not depend on the requested URL and must not cause a hydration mismatch.
- The widget coexists with the existing WhatsApp contact button; neither hides the other, and both stay reachable at 360px and with the panel closed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST show a floating "Ask about Luis" launcher on every page, without blocking or delaying the initial page render.
- **FR-002**: The launcher MUST NOT overlap or hide the existing WhatsApp contact button, and MUST NOT obscure page content that is otherwise reachable (including the Footer and Contact links) at 360px width. Arrangement (owner decision 2026-11-17, option B): the launcher is a neutral outline pill labelled "Ask about Luis", stacked directly above the WhatsApp button with the same right margin; the WhatsApp button keeps its current position. *(Arrangement superseded on 2026-11-17 by `specs/009-launcher-redesign`: one dock with an assistant segment and a WhatsApp segment; owner decision.)*
- **FR-003**: Activating the launcher MUST open a chat panel: a side panel on desktop (from the `md` breakpoint) and a full-screen view on mobile.
- **FR-004**: The panel MUST close on Esc and on a visible close control, and on close MUST return keyboard focus to the launcher.
- **FR-005**: While open, the panel MUST keep keyboard focus inside it, expose appropriate dialog semantics and an accessible name, and announce new assistant output to screen readers without moving focus.
- **FR-006**: An empty conversation MUST show exactly three starter questions; choosing one MUST send it as the first message. The three starters are "What has Luis done with Azure?", "Is he available for remote roles?" and "How can I contact him?" (with Spanish equivalents).
- **FR-007**: The panel MUST always show the disclaimer "AI assistant · answers come from Luis's profile and may contain mistakes" (with Spanish equivalent).
- **FR-008**: The visitor MUST be able to type and send a message with the keyboard (Enter to send, a way to insert a line break) and with a send control.
- **FR-009**: Answer text MUST appear progressively as it arrives. A "Searching Luis's profile…" status MUST be shown when the service reports a lookup is in progress.
- **FR-010**: When the service sends a replacement text, the previously shown partial answer MUST be discarded and only the replacement shown.
- **FR-011**: The widget MUST send the entire conversation so far on every turn, with the visitor's message last, and MUST keep the conversation only in the memory of the open page.
- **FR-012**: The widget MUST NOT write conversation content or any identifier to cookies, local or session storage, or any other persistent store, and MUST NOT include analytics or send conversation content anywhere except to the agent service. *(Widget scope; see the 2026-11-20 clarification in `specs/011-vercel-web-analytics`: site-level page-view analytics is separate and carries no conversation content.)*
- **FR-013**: The input MUST show a character counter against the limit of 2000 characters per message and MUST block sending when the text is empty or exceeds the limit.
- **FR-014**: When the conversation reaches 20 messages, the widget MUST stop accepting input, explain why, and offer "Start a new conversation", which clears everything and returns to the starter state.
- **FR-015**: Assistant answers MUST render simple markdown (bold, lists, links) as formatted text. Raw HTML MUST never be rendered or executed. Links MUST open in a new tab with no access granted to the opener, and only web links (http/https) and email links MUST be clickable.
- **FR-016**: For a rate-limit error the widget MUST show the wait time given by the service, keep the visitor's text, and prevent sending until the wait has elapsed.
- **FR-017**: For daily-budget, invalid-input, service-down, network and incomplete-stream conditions the widget MUST show a distinct short human message in the active language, with a retry or alternative-contact next step where applicable. It MUST NOT show status codes, stack traces or raw server text.
- **FR-018**: On any site address other than the production site (apex and www) and local development, the widget MUST show "Assistant available on luisjacho.dev" (with Spanish equivalent) when opened, MUST NOT send requests to the service, and MUST NOT affect the rest of the page.
- **FR-019**: The agent service address MUST be configurable per environment, with a default suitable for local development, and MUST be a public address containing no secret.
- **FR-020**: If the agent service is unavailable, the whole site MUST remain fully functional and the widget MUST show a visible graceful state rather than a blank or broken panel.
- **FR-021**: Every visible and accessible string of the widget MUST exist in English and Spanish and follow the site language switch; switching language MUST keep the current conversation.
- **FR-022**: The widget's visual design MUST use the existing dark theme tokens and obey the constitution's visual rules: flat surfaces, accent color only for links and focus rings, neutral calls to action, no glows, gradients, shadows or frosted blur, and subtle motion that is fully disabled under reduced-motion.
- **FR-023**: All text MUST meet WCAG AA contrast, every interactive element MUST have a visible focus state and a hit area of at least 44x44px, and the widget MUST NOT introduce horizontal overflow at 360px.
- **FR-024**: If the site later sends a Content-Security-Policy, it MUST permit connections to the agent service origin. (No policy exists today, so nothing is added now.)
- **FR-025**: The widget's own copy MUST NOT assert facts about Luis beyond the three starter questions; all facts come from the service's answers.
- **FR-026**: The widget MUST NOT apply a total request timeout (normal answers take 10 to 45 s). It MUST apply an idle timeout instead: if no bytes arrive from the service for 30 seconds (counted from sending, and restarted on every received chunk), the request is aborted and the error state is shown with a distinct "took too long" message. The visitor's message is kept, and one action (Retry) resends it. If partial text had arrived it is kept and marked incomplete. (Owner decision 2026-11-17.)

### Key Entities *(include if feature involves data)*

- **Conversation**: An ordered list of up to 20 messages, held only in the open page's memory; discarded on reload or on "Start a new conversation".
- **Message**: One turn with a role (visitor or assistant) and text of at most 2000 characters. The last message sent to the service is always the visitor's.
- **Assistant answer (in progress)**: Text still being received, a "searching" status, and a possible replacement; becomes a Message when complete.
- **Widget state**: Closed, open and ready, answering, waiting out a rate limit, conversation full, unavailable on this site, or showing an error.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor on the production site can open the widget and have a starter question sent in 2 interactions or fewer (open, choose).
- **SC-002**: Visible feedback (the "Searching" state, or the in-progress bubble) appears within 1 second of sending, and the visitor sees continuous progress (searching state, then streamed text) until the answer completes. Service latency is outside the client's control: per the API owner (2026-11-17) the service first calls a tool (3 to 10 s), then streams the answer, and full answers take 10 to 45 s; first answer text is typically under 15 s. That figure is an owner observation on production, not a client guarantee.
- **SC-003**: A keyboard-only user can open the widget, send a message, read the answer region and close it, with focus returned to the launcher in 100% of attempts.
- **SC-004**: Home page Lighthouse Performance and Accessibility remain at 90 or above, and each drops by no more than 3 points compared with the baseline taken before this feature (best of 3 runs for both).
- **SC-005**: With the agent service unreachable, 100% of site pages render and work as before, and the widget shows a readable message as soon as the browser reports the failure (connection refused, DNS or CORS failure), within 10 seconds of a send attempt. A connection that stays open but silent is handled by the idle timeout (FR-026), not by this criterion.
- **SC-006**: 0 raw-HTML or script payloads placed in an assistant answer are executed or rendered as elements across the test set of hostile samples.
- **SC-007**: 0 cookies and 0 browser-storage entries are created by using the widget through a full conversation. *(Unchanged by feature 011: the widget still creates none; the site-wide check is in `specs/011-vercel-web-analytics/verification.md`.)*
- **SC-008**: 100% of widget strings exist in both languages, and switching language never loses the conversation.
- **SC-009**: At 360px width the open panel and the closed launcher plus WhatsApp button cause no horizontal overflow and no overlap between the two floating buttons. *(Arrangement superseded on 2026-11-17 by `specs/009-launcher-redesign`: one dock with an assistant segment and a WhatsApp segment; owner decision.)*
- **SC-010**: On a non-production address, 0 requests are sent to the agent service and the message "Assistant available on luisjacho.dev" (or Spanish equivalent) is shown on opening.

## Assumptions

- The panel is a native modal dialog (FR-005: focus kept inside), which makes the rest of the page, including the navbar language toggle, inert while it is open. The language is therefore switched with the panel closed; the conversation survives and the reopened panel is fully translated (verified). A language control inside the panel is not added; if the owner wants one it is a small follow-up (owner decision pending).

- The agent service is already deployed and its behavior is fixed; this feature does not change it. It accepts only a conversation of at most 20 messages of at most 2000 characters each, streams its answer progressively, may report a "looking up" state, may replace the streamed answer with final text, and reports errors as short messages for invalid input, rate limiting (with a wait time), and daily budget.
- The assistant replies in the language of the question; the widget does not translate answers. Only the widget's own strings follow the site language.
- "Production site" means luisjacho.dev and www.luisjacho.dev. "Local development" means the site served from localhost or 127.0.0.1. Anything else counts as a non-production site.
- The launcher is visible on non-production sites; only the panel content changes (owner decision 2026-11-17).
- Launcher arrangement is settled by owner decision 2026-11-17 (see FR-002); mock in `mocks/launcher-layout.html`.
- Bot protection (Turnstile) is a separate future feature; this feature does not add it and must not preclude it.
- Messages in a conversation are plain text from the visitor; the visitor's text is shown as plain text (never interpreted as markdown or HTML).
- No new top-level folders or runtime dependencies that duplicate the existing stack are needed; formatting of answers can reuse the markdown handling already in the project (to be confirmed in planning).
- Out of scope: Turnstile or other bot protection, any change to the agent service or its contract, saving or exporting conversations, analytics inside the widget (site-level page views are feature 011), accounts, voice or attachments, and a dedicated full-page chat route.

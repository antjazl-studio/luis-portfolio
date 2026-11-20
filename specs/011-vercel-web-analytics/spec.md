# Feature Specification: Vercel Web Analytics (page views only)

**Feature Branch**: `feat/vercel-analytics`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "Add Vercel Web Analytics (page views only) to the portfolio so the owner can see aggregate, anonymous visit counts for the production site, with no visible change for visitors."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The owner sees page views of the production site (Priority: P1)

The owner opens the Vercel dashboard and sees how many page views luisjacho.dev gets, per page (home, blog index, each blog post). Counting is automatic: full page loads and in-site navigations both count. No custom event of any kind exists. Visits to previews and to a local development server must not add to the production numbers.

**Why this priority**: This is the whole point of the feature. Without it the owner has no signal about whether the portfolio or the blog is being read.

**Independent Test**: After a production deployment with the dashboard feature enabled, visit the home page, the blog index and a post from a normal browser, then confirm in the dashboard that the three pages appear with a view each. Visit a preview deployment and confirm the dashboard does not list it under production.

**Acceptance Scenarios**:

1. **Given** Web Analytics is enabled for the project and the site is deployed to production, **When** a visitor loads `/`, `/blog` and a blog post, **Then** the dashboard shows one page view for each of those paths.
2. **Given** a visitor is on the home page, **When** they navigate to the blog without a full reload, **Then** the blog index is counted as a page view.
3. **Given** a visitor switches the site language, **When** the page content changes without a URL change, **Then** no extra page view is recorded and no custom event is sent.
4. **Given** a preview deployment or a local development server, **When** it is visited, **Then** the owner confirms in the dashboard what appears (see Assumptions: this is an owner check and is not claimed by the build).

---

### User Story 2 - Visitors notice nothing (Priority: P2)

A visitor sees the same site as before. No banner, no layout change, no new cookie or browser-storage entry written by the site. If the analytics script is blocked or cannot load (an ad blocker, being offline, a missing script), every page and the chat widget still work and no error is shown to the visitor. The home page keeps its Lighthouse Performance and Accessibility scores at or above 90 and does not drop more than 3 points against the baseline measured before the change (best of 3 runs, for both).

**Why this priority**: The portfolio is a first impression (Constitution Principles IV and VII). Measurement must not cost anything the visitor can see or feel.

**Independent Test**: Compare screenshots at 360 px and 1280 px before and after (no visible difference); inspect cookies and storage after loading several pages (nothing written by the site); block the analytics request and confirm the site still works; run Lighthouse best of 3 before and after.

**Acceptance Scenarios**:

1. **Given** the change is deployed, **When** the home page, blog index, a post and the 404 page are viewed at 360 px and 1280 px, **Then** they look identical to the version before the change.
2. **Given** a fresh browser profile, **When** pages are loaded and the chat widget is used, **Then** the site writes no cookie and no local or session storage entry.
3. **Given** the analytics request is blocked or fails, **When** any page is used, **Then** the page, the language switch and the chat widget work normally and there is no visible error.
4. **Given** the baseline Lighthouse scores of the home page, **When** the same measurement is taken after the change, **Then** Performance and Accessibility are at or above 90 and no more than 3 points below the baseline.

---

### User Story 3 - The privacy position is explicit and consistent (Priority: P3)

The repository states clearly that page-view analytics is a site-level measure that is separate from the chat widget. The chat widget's own rule (feature 008, FR-012 and SC-007: nothing about the conversation is stored, and nothing is sent anywhere except to the agent service) stays true, because the analytics collect page addresses and anonymous page-view data and never conversation content. The wording of 008 is reconciled in the repository so nobody reads "no analytics" in 008 as a contradiction of this feature.

**Why this priority**: It is documentation and consistency work. It does not change what visitors see, but it prevents a future contradiction between two specs and keeps the owner's privacy statements accurate.

**Independent Test**: Read 008's FR-012, the chat section of `CLAUDE.md` and this spec: each states which rule applies to the widget and which to the site, with no contradiction. Confirm no conversation text can reach the page address that the analytics record.

**Acceptance Scenarios**:

1. **Given** the repository after this feature, **When** a reader looks up "analytics" in the specs and `CLAUDE.md`, **Then** the widget rule and the site-level rule are both stated, each with its scope.
2. **Given** a conversation in the chat widget, **When** the analytics record the visit, **Then** the recorded page address is the page the visitor is on and contains nothing from the conversation.

---

### Edge Cases

- The owner has not yet enabled Web Analytics in the Vercel dashboard: the site must still build and work, and the owner is told that nothing is counted until it is enabled.
- The visitor uses an ad blocker or an offline connection: no visible error, no broken layout, the rest of the site is unaffected.
- A visitor opens a post URL that does not exist (the localized 404): this is a normal page view of that path and needs no special handling.
- The monthly event allowance of the free plan is reached: collection pauses by the provider; the site is unaffected.
- A development or preview visit: the owner confirms how the dashboard treats it; the site code does not try to hide or filter it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST report one page view for each page visit (full load and in-site navigation) to the host's web analytics service, on every route including the blog index, blog posts and the 404 page.
- **FR-002**: The site MUST NOT send any custom event, and no code path may send one. Only automatic page views are collected.
- **FR-003**: The analytics MUST add no visible change: no new element, banner, notice or layout shift at 360 px and 1280 px.
- **FR-004**: The site MUST NOT write any cookie, local storage or session storage entry because of this feature.
- **FR-005**: If the analytics script cannot load or is blocked, every page, the language switch and the chat widget MUST keep working with no visible error (Constitution Principle VII).
- **FR-006**: The home page MUST keep Lighthouse Performance and Accessibility at or above 90 and not more than 3 points below the baseline measured before the change, best of 3 runs for both (Constitution, Development Workflow).
- **FR-007**: The addition MUST NOT make the home page, a post or the blog index dynamic: static pages stay static.
- **FR-008**: The recorded page address MUST NOT carry conversation content, because the chat widget keeps no conversation data in the address and does not navigate. Feature 008's FR-012 and SC-007 apply to the widget and stay unchanged in meaning; the repository MUST state this scope in 008's spec and in the chat section of `CLAUDE.md`.
- **FR-009**: The new runtime dependency MUST be justified in the plan against Constitution Principle I (it does not duplicate the stack, is maintained by the host, and is the host's own documented way to collect page views).
- **FR-010**: The change MUST be made with the host's documented method for this framework version, verified against the host's current documentation and not from memory.
- **FR-011**: `CLAUDE.md` MUST record the new dependency and the site-level analytics statement. The spec, plan and verification MUST state which steps are owner-only (enabling the feature in the dashboard, confirming preview versus production in the dashboard).

### Key Entities

- **Page view**: one visit to one page path, with the anonymous data the host documents for it (timestamp, path, referrer, country and region, device type, operating system and browser). It contains no conversation content, no user identifier set by this site and no personal data beyond what the host documents.
- **Production dashboard**: the owner's view of aggregated page views per path in the host's dashboard.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After deployment and enabling, 100% of the tested pages (home, blog index, one post, a non-existent URL) appear in the dashboard as page views within one day of being visited (owner check).
- **SC-002**: Zero custom events are sent; a search of the source finds no event-tracking call.
- **SC-003**: Screenshots at 360 px and 1280 px of the home page, blog index and a post show no visible difference (identical pixels, or every difference explained as rendering noise and none in layout) before and after.
- **SC-004**: After loading pages and using the chat widget in a fresh profile, 0 cookies and 0 storage entries are written by the site.
- **SC-005**: With the analytics request blocked, 100% of pages load and the chat widget works, with 0 visible errors.
- **SC-006**: Home page Lighthouse Performance and Accessibility are at or above 90 and not more than 3 points below the baseline (best of 3 before and after, mobile and desktop).
- **SC-007**: A reader finds the widget rule and the site-level rule stated together without contradiction in the repository.

## Assumptions

- The project is on the host's free (Hobby) plan. Custom events are not available on it, and collection is limited to the plan's monthly event allowance; the host documents that collection pauses when the allowance is exceeded.
- The host documents that it identifies visitors without third-party cookies (by a hash created from the incoming request, discarded after 24 hours) and collects only anonymous, aggregated page-view data. This spec relies on that documentation. It was not independently audited by the agent beyond checking that the analytics code writes no cookie or storage entry (verified in the plan).
- **Owner assumption (2026-11-20, not verified by the agent):** no consent banner is needed. The host's privacy page does not state this. A legal view is out of scope. If the owner later wants a privacy notice, that is a separate feature (it would be a visible change).
- The Constitution contains no wording about analytics or privacy, so no amendment is needed. Principle I forbids new runtime dependencies that duplicate the stack; an analytics package does not. Decision: 2026-11-20, agent, rationale in `research.md`.
- Feature 008's "no analytics" wording is scoped to the chat widget and the conversation. Decision: 2026-11-20, agent, with the clarification written into 008 and `CLAUDE.md` (FR-008). No constitution amendment is involved.
- Enabling Web Analytics in the dashboard (which adds routes on the next deployment) and checking the dashboard for production versus preview traffic are owner-only tasks, because they change the host's settings and need dashboard access.
- Out of scope: custom events, any change to the chat widget, any visual change, a consent banner or privacy page, and Speed Insights.

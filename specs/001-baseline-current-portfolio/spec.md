# Feature Specification: Baseline — Current Portfolio As-Is

**Feature Branch**: `chore/adopt-speckit` (no feature branch created; documentation only)

**Created**: 2026-11-05

**Status**: Draft (reverse-engineered baseline, not a change request)

**Input**: User description: "Baseline: document the CURRENT portfolio as-is so future features have a reference. Cover: Hero (incl. CV download), Navbar, About, Experience, Skills, Projects, Contact, Footer, WhatsApp button, EN/ES switcher, Blog index and post pages (Dev.to via rss2json). For each: current behavior and acceptance criteria. Add a 'Known deviations from constitution v1.0.0' section. Reverse-engineered documentation only."

> This document describes what the site does **today**, derived by reading the source on
> 2026-11-05. It is not a statement of desired behavior. Where current behavior conflicts with
> constitution v1.0.0 it is recorded under "Known deviations" instead of being silently
> blessed. Future features SHOULD diff against this baseline.

> **Update 2026-11-06 (spec 005):** the blog parts of this baseline (Dev.to via rss2json, browser
> storage, English-only blog pages, and the related deviations) are superseded by spec 002 and are
> marked inline. The Input line above still mentions them as originally written.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recruiter scans the home page (Priority: P1)

A visitor lands on the single-page home and sees, in order: Hero, About, Experience, Skills,
Projects, Contact, then the footer. A fixed top bar and a floating WhatsApp button stay on
screen throughout.

**Why this priority**: This is the core purpose of the site — present Luis's profile to
recruiters and clients.

**Independent Test**: Open `/` and scroll top to bottom; every section renders with content
and the page has no blank sections.

**Acceptance Scenarios**:

1. **Given** the visitor opens `/`, **When** the page loads, **Then** the Hero fills the first
   screen and its text/CTAs animate in sequentially (staggered fade-up).
2. **Given** the visitor scrolls, **When** each of About, Experience, Skills, Projects and
   Contact first enters view, **Then** its content fades/slides in once (not repeated on
   re-entry).
3. **Given** the visitor reaches the bottom, **When** the footer is visible, **Then** it shows
   the copyright line and LinkedIn and Email icons.

---

### User Story 2 - Switch language EN/ES (Priority: P1)

A visitor toggles between English and Spanish from the navigation bar and all translatable page
text changes immediately.

**Why this priority**: The site serves both Spanish- and English-speaking audiences.

**Independent Test**: Click "ES" in the navbar on `/`; every section label, heading,
paragraph, button and the footer text switch to Spanish; click "EN" to return.

**Acceptance Scenarios**:

1. **Given** the site loads, **When** no action is taken, **Then** the language is English.
2. **Given** English is active, **When** the visitor clicks "ES", **Then** the nav labels, Hero,
   About, Experience heading, Skills heading, Projects heading, Contact and footer text show
   Spanish and each section cross-fades briefly (~0.15s).
3. **Given** Spanish is active, **When** the visitor opens the WhatsApp button, **Then** the
   prefilled message and tooltip are in Spanish.
4. **Given** the visitor changes language, **When** they navigate to `/blog` and back via
   in-app links, **Then** the chosen language is retained (state lives above the pages); after
   a full browser reload it resets to English.

---

### User Story 3 - Navigate the page (Priority: P1)

A visitor uses the fixed navbar to jump to sections, see which section is active, and reach the
blog.

**Why this priority**: Primary wayfinding on a long single-page site.

**Independent Test**: Click each nav item on desktop and mobile; the page smooth-scrolls to
that section and the active indicator follows.

**Acceptance Scenarios**:

1. **Given** the home page, **When** the visitor clicks About, Experience, Skills, Projects or
   Contact, **Then** the page smooth-scrolls to that section.
2. **Given** the visitor scrolls, **When** a section crosses the viewport middle band, **Then**
   its nav item is highlighted white with a thin underline that animates between items.
3. **Given** the page is scrolled more than 20px, **When** the navbar renders, **Then** it has a
   dark translucent blurred background; at the top it is transparent.
4. **Given** a viewport narrower than 768px, **When** the visitor taps the hamburger, **Then** a
   drawer opens listing all sections plus Blog; selecting an item closes it; widening to ≥768px
   closes it automatically.
5. **Given** any page, **When** the visitor clicks the "LJ" monogram, **Then** the window
   scrolls smoothly to the top of the current page.
6. **Given** the visitor is on `/blog`, **When** the navbar renders, **Then** the Blog item is
   highlighted and no section item is highlighted.

---

### User Story 4 - Download CV and contact (Priority: P1)

A visitor downloads the CV, or contacts Luis via email, LinkedIn, or WhatsApp.

**Why this priority**: This is the conversion goal of the site.

**Independent Test**: Click "Download CV", the email controls, LinkedIn links, and the WhatsApp
button; each performs the action described below.

**Acceptance Scenarios**:

1. **Given** the Hero, **When** the visitor clicks "Download CV" / "Descargar CV", **Then** the
   browser downloads `Luis_Jacho_Resume.pdf` (a single file, same for both languages).
2. **Given** the Hero, **When** the visitor clicks "View My Work" / "Ver mi trabajo", **Then**
   the page jumps to the Projects section.
3. **Given** the Contact section, **When** the visitor clicks the email address or the
   "Send me an email" button, **Then** the mail client opens addressed to antjazl@gmail.com.
4. **Given** any link to LinkedIn (Hero, Contact, Footer), **When** clicked, **Then** it opens
   the profile in a new tab.
5. **Given** any page, **When** the visitor clicks the green WhatsApp button, **Then** WhatsApp
   opens in a new tab to +593 96 013 8279 with a prefilled greeting in the active language.

---

### User Story 5 - Read blog posts (Priority: P2)

> **Superseded by spec 002 (native blog).** The Dev.to feed, browser-storage flow and English-only
> blog described in this story were replaced by the native Markdown blog. Original text kept for history.

A visitor opens the Blog to see recent Dev.to articles and reads one inside the site.

**Why this priority**: Secondary content; not part of the core recruiter flow.

**Independent Test**: Open `/blog`; a list of up to 6 articles appears; click one to read it.

**Acceptance Scenarios**:

1. **Given** `/blog` opens, **When** the feed is loading, **Then** six placeholder skeleton rows
   show.
2. **Given** the feed responds successfully, **When** loading finishes, **Then** up to 6 articles
   appear, each showing category, title, ~150-character summary, author · date, and thumbnail
   if available; rows animate in staggered.
3. **Given** the feed request fails or returns a non-ok status, **When** loading finishes,
   **Then** the text "Could not load articles. Please try again." shows and no Refresh button
   is shown (the user must reload the page).
4. **Given** articles are shown, **When** the visitor clicks "Refresh", **Then** the feed is
   re-requested and the list re-renders.
5. **Given** the visitor clicks an article, **When** `/blog/<slug>` opens, **Then** the full
   article content, category, author · date, thumbnail, and a "Read original article on
   Dev.to →" link (new tab) appear, with a "← Back to Blog" link at top.
6. **Given** the visitor opens `/blog/<slug>` directly (new tab, shared link, or after clearing
   site data) without having visited `/blog` first, **When** the page loads, **Then** it shows
   "Article not found." (articles are only available from the list previously loaded in the same
   browser).

---

### Edge Cases

- Reduced-motion preference: animations (including the Hero image float and WhatsApp pulse)
  are not suppressed.
- JavaScript disabled: page content depends on client-side rendering; behavior not guaranteed.
- Blog thumbnails are absent: card/post renders without an image.
  *Superseded by spec 002 (native blog).*
- Dev.to returns an item without a category: "Dev" (post) / "Tech" (card) label is used.
  *Superseded by spec 002 (native blog).*
- Blog texts (header, error, Refresh, Back, Read original) do not change with the language
  switcher.
  *Superseded by spec 002 (native blog).*
- Experience entry dates for past roles are fixed text and not translated; job titles, company
  names, bullets, project descriptions, and skill names are English-only in both languages.

## Requirements *(mandatory)*

### Functional Requirements

**Page composition**
- **FR-001**: The home page (`/`) MUST present, in order: Hero, About, Experience, Skills,
  Projects, Contact, Footer.
- **FR-002**: The navigation bar and WhatsApp button MUST appear on all pages, including blog.
- **FR-003**: Each content section MUST be reachable by an in-page anchor (`#about`,
  `#experience`, `#skills`, `#projects`, `#contact`; Hero is `#hero`).

**Hero**
- **FR-010**: Hero MUST show: availability line with a static dot ("Available for freelance
  projects"), the name "Luis Antonio Jacho Zambrano", subtitle "Senior Full Stack Developer",
  an impact line, a tech list (.NET, Angular, Azure, TypeScript, Node.js), a bio paragraph, two
  CTAs, LinkedIn and email icon links, and the profile photo.
- **FR-011**: Hero MUST offer "View My Work" (jumps to `#projects`) and "Download CV" (downloads
  `Luis_Jacho_Resume.pdf`).
- **FR-012**: The profile photo MUST float gently up and down on a ~5s loop.
- **FR-013**: On mobile the photo MUST appear above the text; from 768px up the two sit
  side by side.

**Navbar**
- **FR-020**: The bar MUST be fixed at the top, 56px tall, with the "LJ" monogram at left.
- **FR-021**: It MUST list About, Experience, Skills, Projects, Contact, and Blog (Blog links
  to `/blog`), localized.
- **FR-022**: It MUST highlight the section currently in view (home) or Blog (on `/blog`).
- **FR-023**: Below 768px it MUST collapse to hamburger + animated drawer; the EN/ES switcher
  stays visible in the bar at all widths.

**Language switcher**
- **FR-030**: The site MUST support exactly two languages, EN (default) and ES, switched from
  the navbar pill control without page reload.
- **FR-031**: The selection MUST apply to all home-page sections, navbar, footer, and WhatsApp
  button text; it is held in memory only (not persisted across reloads) and the document `lang`
  attribute stays `en`.

**About**
- **FR-040**: About MUST show a label, heading, three paragraphs, an "Azure Developer
  Associate" badge, and three stat cards: "8+" years of experience, "30k+" users on production,
  "1" Azure certification.

**Experience**
- **FR-050**: Experience MUST show a vertical timeline of three roles, newest first: Senior
  Full Stack Consultant at MyWork (Jun 2020 – Present, Quito, Ecuador (Remote), 6 bullets);
  Full Stack Developer at "Previous Role" (2019 – 2020, 2 bullets); .NET Developer at IESS —
  Instituto Ecuatoriano de Seguridad Social (2017 – 2019, 2 bullets).
- **FR-051**: Only the word "Present"/"Presente" is localized in this section's entries.

**Skills**
- **FR-060**: Skills MUST show five groups — Backend, Frontend, Cloud & DevOps, Databases,
  Tools & Methods — each with its items as small tags, followed by a de-emphasized "Also
  experienced with" list (React, Node.js, MongoDB, MySQL, Power BI).
- **FR-061**: Tags MUST respond to hover (slight lift and border/background change).

**Projects**
- **FR-070**: Projects MUST show three cards: "MyWork — Workforce Management Platform"
  (marked Featured), "Azure Functions Migration", and "Dynamic Forms Engine", each with a
  description and technology tags. Cards are not links.

**Contact**
- **FR-080**: Contact MUST show heading and intro, email link, LinkedIn link, location "Quito,
  Ecuador (GMT-5)", a "Send me an email" button, and an availability card (status dot,
  "Open to: Freelance · Consulting", "Response time: within 24h", "Timezone: GMT-5
  (flexible)"). There is no contact form.

**Footer**
- **FR-090**: Footer MUST show "© <current year> Luis Jacho · Built with Next.js & Tailwind"
  (localized) and LinkedIn and Email icon links.

**WhatsApp button**
- **FR-100**: A round green button MUST be fixed bottom-right, appear after a ~2s delay with a
  slide-in, pulse periodically, enlarge on hover, and show a localized tooltip on hover
  (desktop only).
- **FR-101**: Clicking MUST open WhatsApp chat to +593960138279 with a localized prefilled
  message, in a new tab.

**Blog index**
- **FR-110**: `/blog` MUST fetch the Dev.to feed through the rss2json service when the page
  opens in the browser and show the first 6 items.
  *Superseded by spec 002 (native blog).*
- **FR-111**: Each loaded list MUST be saved in the browser's local storage so post pages can
  read it.
  *Superseded by spec 002 (native blog).*
- **FR-112**: Loading MUST show skeleton rows; failure MUST show the inline error message
  defined in User Story 5.
  *Superseded by spec 002 (native blog).*
- **FR-113**: A "Refresh" button MUST re-run the fetch (only visible after a successful load).
  *Superseded by spec 002 (native blog).*

**Blog post**
- **FR-120**: `/blog/<slug>` MUST locate the article by slug in local storage and render its
  HTML content with typography styling; unknown slug MUST show "Article not found."
  *Superseded by spec 002 (native blog).*
- **FR-121**: The slug MUST be derived from the article title (lowercase, hyphenated, up to 60
  characters).
  *Superseded by spec 002 (native blog).*

### Key Entities

- **Article**: title, summary, category, date, source (author), original URL, slug, optional
  thumbnail, optional full HTML content. Held only in browser storage; not persisted anywhere
  server-side.
  *Superseded by spec 002 (native blog).*
- **Language**: "en" | "es", the single piece of shared UI state.
- **Experience entry / Project / Skill group**: static content authored in the code; not
  editable without a code change.

## Known deviations from constitution v1.0.0 *(mandatory for this baseline)*

Findings are grouped by principle. Each is **current behavior that does not meet the
constitution**; none is fixed by this document.

### Principle II — Component Conventions
- **D-001**: `src/app/blog/page.tsx` and `src/app/blog/[slug]/page.tsx` are `"use client"`
  pages (constitution: pages MUST stay server components).
  *Superseded by spec 002 (native blog).*
- **D-002**: `Footer.tsx` is a client component only for the language cross-fade; it has no
  other interactivity needed beyond language. `BlogCard.tsx` is `"use client"` for a mount
  animation. Both are borderline under "only components that need interactivity".
  *Superseded by spec 002 (native blog) for the `BlogCard` part; the `Footer` part still applies.*
- **D-003** (compliant, for reference): `app/page.tsx` and `layout.tsx` are server components;
  `layout.tsx` wraps children in a client language provider, which is acceptable.
- **D-004**: The blog `<img>` tags suppress the Next.js lint rule with `eslint-disable`
  instead of using the framework image component.
  *Superseded by spec 002 (native blog).*
- **D-005**: `toArticle` in the blog index uses a double cast (`as unknown as`) and
  `Record<string, string>` to access array data (`categories`), a weak-typing workaround
  against the "no untyped any" spirit.
  *Superseded by spec 002 (native blog).*

### Principle IV — Minimal, Opinionated UI (non-negotiable)
Banned patterns present today:
- **D-010**: Gradient text on the Hero name ("Jacho Zambrano", `from-blue-400 to-cyan-400`) and
  on every section `h2` (About, Experience, Skills, Projects, Contact; white→white/70).
- **D-011**: Radial gradient glow overlay on the Hero background (blue); dotted radial
  background on Skills.
- **D-012**: Blurred cyan glow behind the Hero photo (`blur-3xl`, `bg-cyan-400/[0.12]`).
- **D-013**: Colored box-shadow glow on the first Experience timeline dot
  (`0 0 8px rgba(34,211,238,0.55)`), plus a cyan accent bar.
- **D-014**: Tinted pill badges: Hero tech stack (`bg-blue-500/10 border-blue-500/25
  text-blue-300`), blog category pills (cyan border, rounded-full), "Featured" project tag
  (`bg-cyan-400/10`).
  *The "blog category pills" part is superseded by spec 002 (native blog); the rest still applied at baseline.*
- **D-015**: Cyan-tinted tag hover on Skills (`hover:border-cyan-400/50 hover:bg-cyan-400/10`).
- **D-016**: Cyan accent top gradient line on the featured project card.
- **D-017**: Frosted/blurred translucent surfaces: navbar when scrolled (`backdrop-blur-md`),
  mobile drawer, and stat/availability cards (`border-white/10 bg-white/5`).
- **D-018**: Hero availability dot is cyan-400 rather than the approved static
  `bg-emerald-500/80` (Contact's dot is compliant).
- **D-019**: Primary CTAs are not neutral: Hero "View My Work" is `bg-blue-600`; Contact "Send me
  an email" is `bg-cyan-400`. The constitution requires white `bg-white text-neutral-900`
  primary CTAs.
- **D-020**: Heading/label color: section labels, company names, stat numbers, timeline arrows,
  contact icons and the "LJ" monogram all use cyan-400, contrary to "white headings; color is
  not hierarchy" and to the neutral icon-hover rule (Hero/Footer icon hover goes to blue).
- **D-021**: The WhatsApp button has a repeating pulse ring and a brand-green fill; it is not
  covered by the approved-pattern list and is similar to the banned pulsing indicator.
- **D-022** (compliant, for reference): the Hero photo's `ring-1 ring-white/[0.07]` frame and
  the 5s `y: [0, -8, 0]` float match the approved patterns.

### Principle V — Theme Through CSS Variables
- **D-030**: The CSS variables in `globals.css` are defined but **not used by any component**.
  Components hard-code hex values (`#0a0a0a`, `#0f0f0f`, `#0d1117`, `#141414`) and Tailwind
  palette classes (`cyan-400`, `blue-600`, `zinc-*`, `neutral-*`, `slate-*`).
- **D-031**: Mixed page backgrounds: home sections alternate `#0a0a0a` / `#0f0f0f`, the blog
  index uses `#0d1117` (the theme background), blog posts use `#0a0a0a`.
  *The blog page backgrounds part is superseded by spec 002 (native blog).*
- **D-032**: `--accent` is not limited to links and focus rings — the cyan/blue accent colors
  are used on CTAs, labels, badges and borders. There are no custom focus-ring styles.

### Principle VI — Bilingual Parity (non-negotiable)
- **D-040**: Blog index and post pages are English-only (header, error, "Refresh", "Back to
  Blog", "Read original article on Dev.to →", "Article not found.", date format `en-US`).
  *Superseded by spec 002 (native blog).*
- **D-041**: Experience (roles, companies, bullets, location), Projects (titles, descriptions),
  Skills (group names), Contact location "Quito, Ecuador (GMT-5)", Hero tech names, and the
  copyright holder are hard-coded English in the components rather than in the translation
  table. Several are proper nouns, but role titles, bullets, and project descriptions are
  prose that is not translated.
- **D-042**: Accessibility labels are English-only: hamburger `aria-label="Toggle menu"`,
  `aria-label` for LinkedIn/Email icons, image alt text.
- **D-043**: Root `<html lang="en">` is never updated when Spanish is selected.
- **D-044**: Language choice is not persisted and not reflected in the URL.
- **D-045**: The CV is a single PDF for both languages.
- **D-046**: The WhatsApp messages/tooltip live in the component, not in the shared translation
  table (translated, but outside the single source).

### Principle VII — Resilient External Integrations
- **D-050**: The blog fetch runs client-side on mount (`useEffect`), so the page is
  non-blocking and the home page has no external calls (compliant), but the blog list is
  empty until JavaScript runs.
  *Superseded by spec 002 (native blog).*
- **D-051**: Failure fallback exists (inline error text) but offers no retry button, and a
  stale cached list in local storage is not used as a fallback.
  *Superseded by spec 002 (native blog).*
- **D-052**: The blog post page depends entirely on local storage populated by the list page;
  deep links, shared URLs, and a second device show "Article not found." There is no
  server-side or on-demand fetch fallback.
  *Superseded by spec 002 (native blog).*
- **D-053**: Article HTML from a third party is injected unsanitized via
  `dangerouslySetInnerHTML` (security risk; not a listed principle, but relevant to Principle
  VII's external-content boundary).
  *Superseded by spec 002 (native blog).*
- **D-054**: The rss2json service is called without an API key (compliant — no secrets in the
  frontend); the free tier may rate-limit.
  *Superseded by spec 002 (native blog).*
- **D-055**: No agent API integration exists in the code (the constitution names one).
- **D-056**: The feed is `https://dev.to/feed` (global latest posts), not the owner's own posts;
  the page header says "Latest posts from the Dev.to community".
  *Superseded by spec 002 (native blog).*

### Principle III — Mobile-First / Accessibility baseline
- **D-060**: Not verified at 360px by this review. The Hero uses `min-h-screen`, which on mobile
  browsers can cause address-bar jumps.
- **D-061**: Animations do not honor `prefers-reduced-motion` (constitution: SHOULD).
- **D-062**: Blog images and thumbnails use empty `alt=""` even when decorative-vs-informative
  status is unclear; focus states are not styled.
  *The blog images and thumbnails part is superseded by spec 002 (native blog).*
- **D-063**: Nav section "buttons" are `<button>` scrolling via script rather than anchor links
  (no URL hash update).

### Workflow
- **D-070**: Lighthouse scores (Performance/Accessibility ≥ 90) have not been measured; status
  unknown.
- **D-071**: Metadata is defined once in layout; there is no per-page metadata for `/blog` or
  blog posts.
  *Superseded by spec 002 (native blog).*
- **D-072**: The Experience entry "Previous Role" (2019 – 2020) is a placeholder company name.
  Under the constitution, unconfirmed content MUST be marked for owner confirmation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can find and start the CV download within 10 seconds of
  landing on the home page.
- **SC-002**: A visitor can reach any of the five home sections from the navigation in a single
  click/tap.
- **SC-003**: Switching language updates every translatable string on the home page within one
  second, without page reload.
- **SC-004**: A visitor can start a WhatsApp or email conversation in two clicks or fewer from
  any page.
- **SC-005**: When the blog feed service is unavailable, the visitor still sees the error
  message and can navigate back to the home page without any crash (verified: error state
  renders).
  *Superseded by spec 002 (native blog).*
- **SC-006**: This baseline lists 100% of the components in the requested scope, each with
  behavior and acceptance criteria, and records every constitution deviation found.

## Assumptions

- The audience is recruiters and clients in English- and Spanish-speaking markets.
- The baseline reflects the repository state on branch `chore/adopt-speckit` (commit
  `d6b2e6c`), read from source only; the site was not run in a browser, and no Lighthouse or
  responsive testing was done.
- Visual details (exact colors, spacing) are intentionally summarized; the source is
  authoritative for these.
- Dev.to/rss2json behavior is as of the code; third-party response shape was not re-verified.
- Contact details (email, LinkedIn URL, WhatsApp number) are taken as correct as written in the
  code.
- Requirements in this document describe existing behavior; items under "Known deviations" are
  candidates for future specs and are out of scope here.

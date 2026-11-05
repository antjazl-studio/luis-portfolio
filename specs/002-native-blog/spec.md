# Feature Specification: Native Blog Replacing Dev.to

**Feature Branch**: `002-native-blog`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "002 Native blog replacing Dev.to: remove the Dev.to/rss2json integration entirely; blog posts live in this repository as content files, one file per language per post (no CMS, no external API, no database); index lists posts in the active language; post page renders the full post in the active language; every post MUST exist in EN and ES and the build should fail if a translation is missing; posts rendered at build time with per-post metadata (title, description, Open Graph); no dangerouslySetInnerHTML for post content; launch with exactly ONE post, 'How I built an AI-agent workflow for my portfolio', marked as a DRAFT for Luis to review; styling follows Principle IV."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse the blog index (Priority: P1)

A visitor opens the Blog from the navigation and sees the owner's own posts, listed with title,
date, summary and reading time, in the language currently selected.

**Why this priority**: Replaces the existing blog entry point; without it the blog has no content
of the owner's own.

**Independent Test**: In local development or a preview deployment (or in production once a
post is published), open `/blog` in EN, then switch to ES; the same post is listed in each
language with translated title, summary and date format.

**Acceptance Scenarios**:

1. **Given** English is active, **When** the visitor opens the blog, **Then** one post is listed
   with its English title, summary, publication date and reading time.
2. **Given** the blog index is open, **When** the visitor switches to Spanish, **Then** the same
   post appears with its Spanish title, summary, date and reading time, without page reload.
3. **Given** the blog index, **When** it renders, **Then** it needs no network request to any
   third-party service and never shows an error or loading state caused by one.
4. **Given** the list of posts, **When** several posts exist, **Then** they are ordered newest
   first.

---

### User Story 2 - Read a post (Priority: P1)

A visitor opens a post from the index (or from a direct link) and reads the full article in the
active language.

**Why this priority**: The post is the content the whole feature exists for.

**Independent Test**: Open the post from the index and by pasting its URL into a fresh browser
session; both show the full article.

**Acceptance Scenarios**:

1. **Given** the index, **When** the visitor selects the post, **Then** the full post appears
   with title, date, reading time, and body (headings, paragraphs, lists, links, code).
2. **Given** a post is open, **When** the visitor switches language, **Then** the same post is
   shown in the other language in place.
3. **Given** a visitor opens a post URL directly in a new browser session, **When** the page
   loads, **Then** the post renders (no dependence on previously visited pages or stored data).
4. **Given** a URL that matches no post, **When** opened, **Then** a clear "post not found"
   message with a link back to the blog is shown.
5. **Given** a post page, **When** it renders, **Then** a link leads back to the blog index.

---

### User Story 3 - Share and discover posts (Priority: P2)

When a post link is shared or crawled, it presents a proper title, description and preview.

**Why this priority**: Makes posts shareable on LinkedIn and discoverable; secondary to reading.

**Independent Test**: Inspect the page head for the post URL; title, description and social
preview fields are present and specific to the post.

**Acceptance Scenarios**:

1. **Given** a post URL, **When** its metadata is inspected, **Then** it has a post-specific
   title, description, and Open Graph title, description, type "article" and URL.
2. **Given** the site was built, **When** a post URL is requested, **Then** the content is
   present in the delivered page without needing the visitor's browser to fetch anything.

---

### User Story 4 - Author adds a post safely (Priority: P1)

The owner (or an agent working through a pull request) adds a post by committing content files
to the repository. The build refuses to publish a post that lacks either language.

**Why this priority**: Enforces constitution Principle VI automatically and defines how content
is authored.

**Independent Test**: Add a post with only an English file; the build fails with a message that
names the post and the missing language. Add the Spanish file; the build succeeds.

**Acceptance Scenarios**:

1. **Given** a post has both EN and ES content files, **When** the site is built, **Then** the
   build succeeds and the post is published.
2. **Given** a post has only one language, **When** the site is built, **Then** the build fails
   and the message identifies the post and the missing language.
3. **Given** a post's content is missing a required field (title, date, summary), **When** the
   site is built, **Then** the build fails identifying the post, language and field.
4. **Given** a new post is added by content files only, **When** the site is built, **Then** it
   appears in the index and gets its own page with no code change.

---

### User Story 5 - Draft posts are hidden from production (Priority: P1)

Posts carry a draft flag. Draft posts are visible while the owner works locally and in Vercel
preview deployments, but never appear in the production site. The blog launches with one post,
"How I built an AI-agent workflow for my portfolio", flagged as a draft; the owner reviews and
edits it, then removes the flag to publish it.

**Why this priority**: The post describes real working practices; the owner must confirm every
statement before it is public, and must be able to review it in a realistic preview first.

**Independent Test**: Run the site locally and open a preview deployment: the launch post is
listed and readable. Open the production site: the blog shows no posts and the post URL is not
found. Remove the draft flag, redeploy to production: the post appears.

**Acceptance Scenarios**:

1. **Given** a post flagged as draft, **When** the site runs in local development or as a Vercel
   preview deployment, **Then** the post appears in the index and its page renders, exactly as a
   published post would (no extra visible draft notice).
2. **Given** a post flagged as draft, **When** the site is built for production, **Then** the
   post is absent from the index, has no post page (its URL shows "post not found"), and
   contributes no page metadata.
3. **Given** the launch post is still flagged as draft, **When** production is built, **Then**
   the blog index shows the friendly empty message and the build still succeeds.
4. **Given** the owner removes the draft flag from both language versions after review, **When**
   production is built, **Then** the post is listed and readable in both languages.
5. **Given** the launch post content, **When** reviewed, **Then** it covers: Spec Kit and the
   project constitution; a least-privilege bot account contributing via fork and pull request;
   continuous integration (lint and build); branch protection; and preview deployments on
   Vercel — and makes no other factual claims (no metrics, dates, tool versions, outcomes or
   quotes beyond what the repository itself shows).
6. **Given** statements the owner has not yet confirmed (for example how branch protection and
   previews are configured), **When** they appear in the post, **Then** each is phrased
   generically and marked for review in the content file in a way that is never shown to
   visitors.
7. **Given** exactly one post exists, **When** the index renders in local development or
   preview, **Then** it lists exactly one entry.

---

### User Story 6 - Dev.to integration is gone (Priority: P1)

Nothing in the site depends on, mentions, or fetches from Dev.to or the feed-conversion service.

**Why this priority**: Explicit scope of the request; also removes the constitution deviations
D-001, D-040, D-050–D-053 and D-056 recorded in the baseline spec.

**Independent Test**: Search the repository and the delivered pages for Dev.to / feed-conversion
references; none remain. The blog works with the network offline.

**Acceptance Scenarios**:

1. **Given** the blog is opened with no internet access to third parties, **When** it loads,
   **Then** it works fully.
2. **Given** a visitor with data stored by the old blog, **When** they open the new blog,
   **Then** the old stored data is ignored and never required.
3. **Given** an old Dev.to-derived post URL, **When** opened, **Then** it shows the "post not
   found" experience (no redirect is provided).

---

### Edge Cases

- A post has an unusual character in its title or file name: the post URL is still valid and
  stable.
- Two posts share the same URL identifier: the build fails with a clear message.
- Post body contains raw HTML or script content: it is shown as inert text or ignored, never
  executed.
- A post has a future date: it is treated like any other post (no scheduling in this feature).
- A very long post: the page remains readable on a 360px-wide screen with no horizontal
  overflow, including code blocks (which scroll inside their own container).
- The visitor switches language while on a post whose translation exists: the post stays open
  in the other language (same URL).
- Zero published posts (including production while the launch post is still a draft): the index
  shows a friendly empty message in both languages.
- A post's draft flag differs between its language versions: the build fails, naming the post.
- A draft post's URL is opened on production: it shows the same "post not found" page as any
  unknown URL (its existence is not revealed).
- Draft posts still count for validation: a draft missing a language fails the build in every
  environment.

## Requirements *(mandatory)*

### Functional Requirements

**Removal**
- **FR-001**: The site MUST NOT fetch, store, display or link to content from Dev.to or any
  feed-conversion service; the previous blog index, post page and card data source MUST be
  replaced.
- **FR-002**: The blog MUST NOT use a CMS, an external API or a database; content MUST live in
  the repository.

**Content model**
- **FR-010**: Each post MUST consist of one content file per supported language (EN and ES),
  grouped under a shared post identifier that forms its URL.
- **FR-011**: Each language file MUST provide: title, publication date, summary, and body; and
  MAY provide a draft flag. A post is a draft when its draft flag is set.
- **FR-011a**: The draft flag MUST have the same value in both language versions of a post; the
  build MUST fail otherwise, naming the post.
- **FR-012**: Reading time MUST be derived automatically from the body of the displayed
  language, rounded up to whole minutes, at a fixed reading speed of 200 words per minute.
- **FR-013**: The post body MUST support headings, paragraphs, emphasis, ordered/unordered
  lists, links, block quotes and code blocks, and images (with alternative text).

**Validation (build time)**
- **FR-020**: The build MUST fail if any post lacks either language, naming the post and the
  missing language.
- **FR-021**: The build MUST fail if a required field is missing or the date is invalid,
  naming the post, language and field.
- **FR-022**: The build MUST fail if two posts resolve to the same URL identifier.

**Index**
- **FR-030**: The blog index MUST list all visible posts newest first (see FR-090), showing
  title, publication date, summary and reading time in the active language. No draft badge or
  notice is shown.
- **FR-031**: Selecting an entry MUST open that post's page.
- **FR-032**: The index MUST update when the language changes, without reload.
- **FR-033**: The index MUST not show a loading or error state (content is available at once).

**Post page**
- **FR-040**: The post page MUST show title, date, reading time, body and a link back to the
  blog, in the active language.
- **FR-041**: Post pages MUST be available at stable URLs and be pre-generated when the site is
  built, with content present in the delivered page.
- **FR-042**: Unknown post URLs MUST show a localized "post not found" page with a link to the
  blog.
- **FR-043**: Post content MUST be rendered from structured content into regular page elements;
  raw HTML strings from content MUST NOT be injected into the page.

**Metadata**
- **FR-050**: Each post page MUST have its own page title and description, and Open Graph title,
  description, type (article), URL and publication date.
- **FR-051**: The blog index MUST have its own page title and description.
- **FR-052**: Metadata for a post MUST be set at build time (language of the shared link is the
  default site language, English, since the language choice is not part of the URL).

**Language**
- **FR-060**: All fixed interface text on the blog (header, labels, empty state, not-found,
  back link, reading-time wording, date format) MUST exist in EN and ES via the existing
  language switcher (Principle VI).

**Draft visibility**
- **FR-090**: Draft posts MUST be visible (index and post page, with metadata) in local
  development and in Vercel preview deployments, and MUST be excluded from the production
  deployment: absent from the index, no post page generated, no metadata, and their URL shows
  the standard "post not found" page.
- **FR-091**: Production vs. non-production MUST be determined by the deployment environment,
  not by an editable content setting, so a draft cannot be published by mistake from content
  alone other than by removing its flag.
- **FR-092**: Publishing a draft MUST require only removing the draft flag from both language
  versions of the post (no code change).
- **FR-093**: With no visible posts, the index MUST show a localized empty message and the build
  MUST still succeed.

**Launch content**
- **FR-070**: The blog MUST launch with exactly one post titled "How I built an AI-agent
  workflow for my portfolio" (ES equivalent provided), flagged as a draft until the owner
  removes the flag after review.
- **FR-071**: The launch post MUST cover only: Spec Kit and the constitution; the least-privilege
  bot account with fork-and-pull contributions; CI; branch protection; Vercel previews; and
  human review of every change. It MUST NOT include invented facts, numbers, dates, quotes or
  outcomes.
- **FR-072**: Passages in the launch post that need the owner's confirmation MUST be marked in
  the content files in both languages in a way that is never rendered to visitors, so the owner
  can find them during review.

**Styling & quality**
- **FR-080**: The blog styling MUST follow constitution Principle IV: no gradient text, glows,
  frosted cards, tinted pill badges or cyan/emerald accent borders; white headings; neutral
  secondary text.
- **FR-081**: Pages MUST be mobile-first and free of horizontal overflow at 360px.
- **FR-082**: Home-page Lighthouse Performance and Accessibility MUST stay at or above 90, and
  the blog pages SHOULD meet the same bar.

### Key Entities

- **Post**: a unit of content identified by a stable identifier that forms its URL; has exactly
  one version per supported language.
- **Post version (per language)**: title, publication date, summary, body, optional draft flag;
  derived reading time.
- **Language**: EN or ES; selects which post version is shown.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can go from the home page to reading the launch post in two clicks or
  fewer.
- **SC-002**: The blog index and any post display fully, in both languages, with no external
  network requests and no visible loading state.
- **SC-003**: 100% of attempts to publish a post lacking either language fail before release,
  with a message that names the post and the missing language.
- **SC-004**: Switching language on the index or a post updates all visible text within one
  second, without reload.
- **SC-005**: A new post can be published by adding content files alone, with zero changes to
  application code.
- **SC-006**: Opening a post link directly in a fresh browser shows the full post 100% of the
  time.
- **SC-007**: A repository-wide search for the retired feed service finds zero references in the
  application and its delivered pages.
- **SC-008**: The launch post contains zero claims beyond the listed setup, and the owner can
  find every passage marked for confirmation.
- **SC-011**: While a post is flagged as draft, 0 of its pages, index entries or metadata are
  present in the production site, and 100% are present in local development and preview.
- **SC-012**: A draft can be published by removing its flag alone, with no other change.
- **SC-009**: Blog pages show no horizontal scroll at 360px width.
- **SC-010**: Home page Lighthouse Performance and Accessibility scores stay at or above 90.

## Assumptions

- Language selection stays in memory only (as today); post URLs are language-independent, so one
  URL serves both languages and shared links open in English by default.
- Content files are authored by the owner or by an agent through a reviewed pull request; no
  in-browser authoring or admin interface.
- Reading speed is 200 words per minute; dates display in a locale format matching the active
  language.
- No pagination, search, tags, categories, comments, RSS feed or scheduled publishing in this
  feature; one post at launch.
- Old Dev.to-based post URLs and browser-stored data from the previous blog are not preserved
  or redirected; the previous blog had no stable shareable links.
- The launch post is written in the owner's first person only where it restates the setup facts
  in this repository (constitution, CI workflow, fork-and-pull PRs, human review); descriptions
  of branch protection settings and Vercel previews are kept generic until the owner confirms
  them.
- Because the launch post starts as a draft, the production blog shows the empty state until the
  owner reviews the post and removes the flag.
- Vercel preview deployments are distinguishable from production by the hosting environment
  (the plan phase decides how); the draft flag is the only content-level control.
- A cover image for Open Graph is optional; none is required for launch.
- Replacing the blog also removes baseline deviations D-001, D-040, D-050–D-053, D-056 and the
  blog-related parts of D-004 and D-005, and the blog parts of D-014 and D-062 where styling is
  rewritten; other baseline deviations remain out of scope.

<!--
Sync Impact Report
- Version change: 1.0.0 -> 1.0.1 (PATCH: clarifications for feature 002-native-blog)
- Modified principles: II (structure list updated for the native blog); VII (removed the
  retired feed-service example; rule unchanged)
- Added sections: none
- Removed sections: none
- Deferred TODOs: none
-->
# Luis Portfolio Constitution

## Core Principles

### I. Stack Fidelity
The site MUST be built with Next.js (App Router), TypeScript, Tailwind CSS, and Framer Motion.
The exact Next.js version is pinned in `package.json`, not in this document. New runtime
dependencies that duplicate these capabilities (other CSS frameworks, other animation libraries,
UI-kit component libraries) MUST NOT be added. Rationale: a small, fixed stack keeps the
portfolio maintainable by one person and avoids an "assembled from kits" look.

### II. Component Conventions
All components MUST be functional components with named exports (no default exports except where
Next.js requires them, e.g. `page.tsx`, `layout.tsx`). `"use client"` MUST appear only in
components that need interactivity (state, effects, event handlers, browser APIs, Framer
Motion); pages and layouts MUST stay server components. Code MUST be TypeScript with no untyped
`any` unless justified in a comment.

Structure (`src/`), verified against the repository:
- `app/`: `layout.tsx` (root layout, metadata, fonts, providers), `page.tsx` (composes
  sections only), `globals.css`, `not-found.tsx` (localized 404), `blog/page.tsx` (blog index,
  server), `blog/[slug]/page.tsx` (post, statically generated).
- `components/`: `Navbar.tsx`, `Footer.tsx`, `WhatsAppButton.tsx` (floating contact button),
  `BlogCard.tsx` (presentational card), `BlogIndex.tsx`, `LocalizedPost.tsx`,
  `BlogNotFound.tsx`, `MarkdownBody.tsx`.
- `components/sections/`: `Hero.tsx` (includes the CV download of
  `public/Luis_Jacho_Resume.pdf`), `About.tsx`, `Experience.tsx`, `Skills.tsx`,
  `Projects.tsx`, `Contact.tsx`.
- `context/LanguageContext.tsx` and `hooks/useLanguage.ts`: language state.
- `lib/translations.ts`: all EN/ES strings; `lib/blog.ts`: blog content loader and validation.
- `content/blog/<slug>/{en,es}.md`: blog post content (Markdown with frontmatter), outside `src/`.

New files MUST follow this layout; structural changes MUST update this list and `CLAUDE.md`.

### III. Mobile-First Responsive Design
Styles MUST be authored mobile-first, with Tailwind breakpoints (`sm:`, `md:`, `lg:`) adding
behavior for larger screens. Every section MUST be usable and free of horizontal overflow at
360px width.

### IV. Minimal, Opinionated UI (NON-NEGOTIABLE)
The visual reference is Linear.app, Rauno.me, and Paco.me. The following are banned: pulsing or
glowing status dots, colored box-shadow glows, gradient text, heavy `backdrop-blur` frosted
cards, tinted pill badges, radial gradient glow overlays, and cyan/emerald accent borders on
images. Approved patterns: static status dot with plain text; tech stack as inline text with `·`
separators; white headings; `ring-1 ring-white/[0.07]` image frames; white primary CTA
(`bg-white text-neutral-900`); thin neutral outline secondary CTA; neutral icon hover; subtle
float animation (`y: [0, -8, 0]`, ~5s). When in doubt, remove decoration rather than add it.
Rationale: the owner flagged these patterns as generic AI-generated UI-kit tells.

### V. Theme Through CSS Variables
Colors MUST come from the CSS variables in `src/app/globals.css` (`--background #0d1117`,
`--foreground #e6edf3`, `--accent #0078d4`, `--accent-hover #106ebe`, `--surface #161b22`,
`--surface-2 #21262d`, `--muted #8b949e`, `--border #30363d`) or Tailwind neutral utilities
permitted by Principle IV. `--accent` and `--accent-hover` MUST be used only for links and
focus rings; CTAs MUST stay neutral per Principle IV. The theme is dark-only. Changes to theme
values MUST update both `globals.css` and this constitution.

### VI. Bilingual Parity (NON-NEGOTIABLE)
Every user-facing string MUST exist in both English (EN) and Spanish (ES) and be served through
the existing React Context language switcher (`LanguageContext`, `useLanguage`,
`lib/translations.ts`). External i18n libraries MUST NOT be added. A feature is not done until
both languages are complete. Rationale: the audience spans Ecuador and international
recruiters; a half-translated page reads as unfinished.

### VII. Resilient External Integrations
The site MUST remain fully functional when any external API (e.g. the agent API) is down. Initial render MUST NOT block on external calls, and a failure MUST show a visible,
graceful fallback (message or empty state), never a blank or broken section. Secrets MUST NOT
exist in the frontend (no API keys, tokens, or private endpoints in source, `NEXT_PUBLIC_*`
variables, or bundles); the frontend MUST call only public endpoints. Rationale: a portfolio is
a first impression and must not depend on third-party uptime.

## Stack & Design Constraints

- Content describes the owner: Luis Antonio Jacho Zambrano, Senior Full Stack Developer
  (.NET | Angular | Azure), Quito, Ecuador. Factual claims (roles, dates, projects) MUST NOT be
  invented; unknown content MUST be marked as a placeholder for the owner to confirm.
- Animations MUST use Framer Motion, MUST be subtle, and SHOULD respect
  `prefers-reduced-motion`.
- Pages MUST meet baseline accessibility: semantic landmarks, alt text on images, visible focus
  states, and sufficient contrast against the dark background.
- Root layout MUST define page metadata (title, description) and fonts.

## Development Workflow

- Work follows Spec Kit: specify → plan → tasks → implement, on a feature branch (not directly
  on `master`).
- Before merging, `npm run build` and `npm run lint` MUST pass with no errors.
- UI changes MUST be checked in the browser at mobile and desktop widths and reviewed against
  Principle IV.
- UI changes MUST keep Lighthouse Performance and Accessibility scores at or above 90 on the
  home page.
- Commits SHOULD use Conventional Commit prefixes (`feat:`, `fix:`, `chore:`, `docs:`).

## Governance

This constitution supersedes other practices for this repository. Amendments require editing
this file via `/speckit-constitution`, with a Sync Impact Report and a version bump. Versioning
follows semantic versioning: MAJOR for removed or redefined principles, MINOR for added
principles or materially expanded guidance, PATCH for clarifications. Every spec, plan, and
review MUST verify compliance with the principles above; deviations MUST be justified in the
plan's complexity/constitution-check section. `CLAUDE.md` provides runtime guidance and MUST
stay consistent with this document.

**Version**: 1.0.1 | **Ratified**: 2026-11-05 | **Last Amended**: 2026-11-05

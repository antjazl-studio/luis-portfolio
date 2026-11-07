# Research: Design Refresh

Decisions taken by the supervisor inside the constitution. Each was checked against the repository
or `node_modules` where it states a fact.

## R1. Theme tokens

- **Decision**: Set `:root` in `globals.css` to the constitution v1.1.0 table, add `--border-strong`
  and `--focus-ring`; add `border-strong` and `focus-ring` to the Tailwind color map (the other
  variables are already mapped in `tailwind.config.ts`). Add `color-scheme: dark`, a global
  `:focus-visible` ring (2px, offset 2px, `--focus-ring`) and a `::selection` rule with a neutral highlight (`rgba(255,255,255,.2)`; deliberately not the mock's blue, because the accent is for links and focus rings only; a documented literal, like the status dot).
- **Rationale**: Principle V requires colors from variables. Current values are the old palette
  (`#0d1117`, `#0078d4`), and sections use hard-coded `#0a0a0a`, `#0f0f0f`, `black/..` and
  `white/..` backgrounds that bypass the tokens.
- **Alternatives**: Keep hard-coded greys (rejected: two sources of truth).

## R2. Hero float animation and entrance

- **Decision**: Drop the looping `y: [0, -8, 0]` float and the per-language re-animation
  (`AnimatePresence key={language}`) in the hero. Keep one quiet fade-in on load for text and
  portrait, matching the mock (about 0.5s, 8px rise), disabled under reduced motion.
- **Rationale**: Principle IV lists the float as an approved pattern, not a required one.
  DESIGN.md (Portrait, Don'ts) says no looping float. Re-animating the hero on language change
  is extra motion with no value.
- **Alternatives**: Keep the float (rejected: contradicts DESIGN.md and PRODUCT.md "calm").

## R3. Portrait image

- **Decision**: Keep `next/image` for `/pic.png` with its real intrinsic size (1086x1448,
  verified; 3:4), `priority`, container `aspect-[4/5]`, `rounded-[14px]`,
  `ring-1 ring-white/[0.07]`, `object-cover object-top` as in the mock. The 3:4 file in a 4:5
  frame crops a thin strip from the bottom only; no new photo is needed.
- **Rationale**: Stable layout, no CLS, no new dependency.

## R4. Banned patterns: per-file replacement

Found by grep survey of `src/`:

| File | Found | Replacement |
|------|-------|-------------|
| Hero | radial-gradient overlay, gradient-text name, blue pills, `blur-3xl` glow, cyan dot, blue CTAs | Mock layout; neutral CTAs; inline `·` stack; static dot |
| Navbar | `backdrop-blur-md` x2, cyan monogram, `rounded-full` pill language toggle | Solid `bg-background` bar with hairline bottom rule; muted text links; plain-text EN/ES buttons with `aria-pressed`, active in full text color |
| About, Contact, Experience, Projects, Skills | cyan uppercase eyebrow labels, gradient-text `h2`, cyan stat numbers and icons | Remove eyebrows (DESIGN.md No Eyebrow Rule); `h2` white; stats `text-foreground`; icons `text-muted` |
| Contact | cyan filled CTA, emerald glow dot | Neutral primary CTA; static dot |
| Experience | cyan timeline line and dot | `border-border` line, neutral dots |
| Projects | tinted "Featured" tag, gradient hairline, hover lift with shadow | Plain text tag; flat `hover:bg-surface-2` |
| Skills | tinted pill chips, radial dot-grid background | Inline text separated by `·`; flat background |
| WhatsApp | `shadow-lg shadow-black/40`, `rounded-full` pill tooltip | Flat; no shadow; tooltip as plain bordered label |
| Footer | hard-coded `bg-[#0a0a0a]` | Token |

- **Exception**: `linearGradient` inside the Azure logo SVG in `About.tsx` is brand artwork.
  Kept and excluded from the final grep.
- **Final verification** (quickstart V5): no matches for `backdrop-blur`, `gradient`, `shadow-`,
  `blur-`, `animate-pulse`, `animate-ping`, `cyan-`, `emerald-`, `blue-500`, `text-transparent`
  other than the allowed Azure SVG (and the status dot, see Plan exceptions).

## R5. Accent usage

- **Decision**: `--accent` / `--accent-hover` only for text links (hero contact lines, Contact,
  Footer, Markdown links via the typography `prose-a` override) and the focus ring. Links are
  underlined with `underline-offset-3` in body and contact lines.
- **Rationale**: Principle V and DESIGN.md "One Voice Rule".

## R6. `<html lang>` follows the language

- **Decision**: In `LanguageProvider`, a `useEffect` sets `document.documentElement.lang`.
- **Rationale**: State starts at `"en"` and matches the server-rendered `lang="en"`, so there is
  no hydration mismatch. The language is not persisted today (in memory only), so there is no
  stored language to apply on first load; "on first load it matches the language shown" holds.
- **Alternatives**: Per-language routes or cookie (rejected: new architecture, out of scope).

## R7. Reduced motion (MUST)

- **Decision**: Three layers. (1) Framer Motion `<MotionConfig reducedMotion="user">` wrapped
  around the provider tree in `LanguageContext.tsx`. (2) A `@media (prefers-reduced-motion:
  reduce)` block in `globals.css` that sets `scroll-behavior: auto` and near-zero
  `transition-duration` and `animation-duration` for all elements. (3) `Navbar.tsx` smooth-scroll
  calls use `behavior: "auto"` when `matchMedia("(prefers-reduced-motion: reduce)")` matches.
- **Note on (1)**: `reducedMotion="user"` disables transform and layout animations but keeps
  opacity; entrance fades remain. Spec SC-005 says no animation or movement transitions play, so
  the CSS block and per-component handling must also remove opacity entrance animations: the
  hero and sections use `initial` states that must resolve to the final state immediately.
  Implementation verifies this with reduced-motion emulation (quickstart V15) and, where an
  opacity fade remains, gates `initial` with `useReducedMotion()`.
- **Keep** `data-scroll-behavior="smooth"` on `<html>`: verified in
  `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` (line 963) that Next 16
  no longer overrides scroll behavior unless this attribute is set, and the site relies on
  smooth in-page scrolling for non-reduced-motion visitors.

## R8. Skip link and main landmark

- **Decision**: The skip link is the first element rendered in `Navbar.tsx` (visually hidden
  until focused, localized through `a11y.skip`). Every page's `<main>` gets `id="main"` and
  `tabIndex={-1}` so the link moves focus. Pages: home, blog index, blog post, not-found,
  blog not-found.
- **Rationale and constraint**: A separate `SkipLink.tsx` would be a new component outside the
  structure list in constitution Principle II; the constitution cannot be edited here. Placing it
  in `Navbar.tsx` (rendered on every page by the layout) avoids that.
- **Alternatives**: New `SkipLink.tsx` plus constitution and `CLAUDE.md` structure update
  (rejected for this feature: needs an amendment; can be proposed separately).

## R9. Touch targets (44px)

- **Decision**: Apply `min-h-11 min-w-11` (44px) with padding to the language buttons, menu
  toggle, social icon links (hero and footer), WhatsApp button, nav links and the blog back link.
  Inline links inside sentences are exempt as stated in the spec.

## R10. Localized accessible labels

- **Decision**: Add an `a11y` group to `translations.ts` (EN and ES): skip link, menu toggle,
  language group, LinkedIn, email, WhatsApp. Replace the hard-coded `aria-label` strings in
  `Navbar.tsx`, `Hero.tsx`, `Footer.tsx`, `WhatsAppButton.tsx`.
  Brand names (LinkedIn) stay as is in both languages.

## R11. `svh`

- **Decision**: Replace `min-h-screen` with `min-h-svh` in the hero, `BlogIndex`, `BlogNotFound`
  and `LocalizedPost`.
- **Verified**: Tailwind 3.4.19 is installed and its config contains `svh: '100svh'`
  (`node_modules/tailwindcss/stubs/config.full.js`).

## R12. Contrast

- **Decision**: Text uses `--foreground` or `--muted` only; remove `neutral-500/600`,
  `slate-500` and `white/NN` text colors. Control outlines use `border-border-strong`;
  `border-border` is decorative only. Ratios from DESIGN.md (computed from hex): text on
  background 20.38, muted 7.95 / 7.52 on surface, accent 6.38, focus ring 6.38 (needs 3),
  `border-strong` 4.22 on background (needs 3). Implementation re-computes every used pair with a
  script kept in `.tmp/` (gitignored) and appends the result here.
- **Result (2026-11-06)**: WCAG 2.x ratios computed from the shipped hex values by a script kept in
  `.tmp/` (gitignored). Every pair passes.

| Pair | Ratio | Needs | Result |
|------|-------|-------|--------|
| text on background | 20.38 | 4.5 | PASS |
| text on surface | 19.28 | 4.5 | PASS |
| text on surface-2 | 17.72 | 4.5 | PASS |
| muted on background | 7.95 | 4.5 | PASS |
| muted on surface | 7.52 | 4.5 | PASS |
| muted on surface-2 | 6.91 | 4.5 | PASS |
| accent link on background | 6.38 | 4.5 | PASS |
| accent link on surface | 6.04 | 4.5 | PASS |
| accent link on surface-2 | 5.54 | 4.5 | PASS |
| accent-hover on background | 8.65 | 4.5 | PASS |
| accent-hover on surface | 8.19 | 4.5 | PASS |
| primary button text on white | 20.38 | 4.5 | PASS |
| primary button text on hover fill | 16.06 | 4.5 | PASS |
| focus ring on background (UI) | 6.38 | 3 | PASS |
| focus ring on surface (UI) | 6.04 | 3 | PASS |
| focus ring on surface-2 (UI) | 5.54 | 3 | PASS |
| border-strong on background (UI) | 4.22 | 3 | PASS |
| border-strong on surface (UI) | 3.99 | 3 | PASS |
| status dot on background (UI) | 10.60 | 3 | PASS |

Decorative only (no requirement): border #27272A on background = 1.37

- **Status dot** `#34D399` on `#050505` is above 3:1 (graphic) and the adjacent text is the
  accessible name, so the dot is decorative.

## R13. Years of experience

- **Decision**: Change "8+" to "9" in `translations.ts` (`hero.bio`, `about.p1`; EN and ES), in the hard-coded About stat `value: "8+"` in `About.tsx:21`,
  and in `layout.tsx` metadata description. A grep for `8+` and `8 años` confirms none remain.
- **Source**: PRODUCT.md "Operating Context": career starts 2017, use "9 years" everywhere.

## R14. Hero copy

- **Decision**: Title, subline, availability and timezone lines come from the mock and
  PRODUCT.md. The proof line reuses the existing `hero.impact` string; no new claims. ES strings
  other than the owner-supplied availability line are translations and are listed in the
  hand-off for owner confirmation.

## R15. Spec 001 supersession (US4)

- **Decision**: Insert a "Superseded by spec 002 (native blog)" note line under each blog-related
  item of `specs/001-baseline-current-portfolio/spec.md`, preserving all original text (diff is
  additions only: 33 insertions, 0 deletions), plus a dated banner at the top.
- **Marked**: User Story 5; the three blog edge cases; the Article entity; FR-110 to FR-113 and
  FR-120 to FR-121; D-001, D-004, D-005, D-040, D-050 to D-054, D-056, D-071, SC-005; and the
  blog-only parts of D-002, D-014, D-031, D-062 (noted as partial).
- **Left unmarked on purpose**: FR-002, FR-021, FR-022 and the blog-navigation scenarios of User
  Stories 2 and 3. They describe the navbar and language state on `/blog`, which still hold.
  D-055 (no agent API) is not about the blog.
- **Verified against the code** that the superseded claims no longer hold: blog pages have no
  `"use client"`, have per-page metadata and `dynamicParams = false`, and the source has no
  `rss2json`, `dangerouslySetInnerHTML` or `localStorage`.

## R16. Docs consistency

- **Decision**: `CLAUDE.md` already contains the v1.1.0 table. After build, add a short
  "Implemented" note to `DESIGN.md`. The constitution is not edited.

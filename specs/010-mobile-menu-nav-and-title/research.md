# Research: Mobile Menu Navigation and Home Tab Title

Date: 2026-11-18. Tools: Playwright 1.49.1 (outside the repo), Chromium headless, Pixel 5 emulation at 360x740 with touch taps.

## R1. Why tapping a menu section does not scroll

**Reproduction (baseline, before any change)**: on the production build, the development server and a build of the commit before feature 008 (`3ea5600`), tapping each of About, Experience, Skills, Projects, Contact leaves `scrollY` at 0 and the menu closed. Not a regression from 008: older. No hash is added (the handler calls `preventDefault`), no `<dialog>` is open, no console error.

**Isolation**:

| Experiment | Result |
|---|---|
| `scrollIntoView` smooth, menu closed | scrolls (1102) |
| `scrollIntoView` smooth, menu open, no close | scrolls (1102) |
| Real tap with reduced motion (instant scroll) | scrolls (1101) |
| Smooth scroll, then hide the drawer by CSS `height: 0` | scrolls |
| Smooth scroll, then remove the drawer node | scrolls |
| Smooth scroll, then close the drawer through React in the same task | stays at 0 |
| Close through React, scroll two animation frames later | scrolls (timing hack) |
| Smooth scroll, close the drawer through React 300 ms later | stops at 687 |

**Instrumentation**: wrapping `window.scrollTo`/`scrollIntoView`/`focus` showed, right after the close, `scrollTo(0, 687)` called from a Framer Motion chunk (`resolveKeyframes` -> `window.scrollTo(0, t.suspendedScrollY)` in `framer-motion` 12.38). Framer saves `scrollY` while it measures an unresolvable keyframe (`height: "auto"`) and restores it, which cancels the in-flight smooth scroll. The drawer's exit animates `height` to 0 from `auto`, so every close triggers it.

**Decision**: remove the height animation from the drawer. Animate only `opacity` (no measurement needed).

**Alternatives rejected**:
- Delay the scroll (two frames or a timeout): works, but it depends on Framer internals and timing; the spec asks for a root-cause fix.
- Close the menu after the scroll ends: leaves the menu covering the target for the scroll duration and still needs an end-of-scroll signal.
- CSS grid `0fr` to `1fr` height transition: keeps the slide but needs the drawer always mounted plus `inert`/hidden handling; more change for a decorative effect.
- Replace smooth scroll with instant: removes the animation for everyone to dodge a library quirk.

**Cross-route**: from a blog post, Next performs the hash navigation and the page lands on the section already in the baseline (verified for all five). Not changed.

## R2. Reduced motion

`dur()` already returns 0 under reduced motion and `scrollBehavior()` returns `auto`. The new drawer keeps `dur()`. The CSS block in `globals.css` already forces `scroll-behavior: auto`.

## R3. Keyboard focus on the section

Baseline: after a menu tap `document.activeElement` is `BODY` on the home page and after cross-route navigation. Sections have no `tabindex`. Programmatic `focus({ preventScroll: true })` on an element given `tabindex="-1"` moves the sequential-focus starting point without scrolling and does not cancel a smooth scroll. Chrome may draw a focus ring on script focus after keyboard use, so the section outline is removed (same as `<main tabIndex={-1} className="focus:outline-none">`). Interactive elements keep the global `:focus-visible` ring.

## R4. Title and sharing tags

Baseline (`curl` of the production build): home `<title>Luis Jacho Zambrano — Senior Full Stack Developer</title>`, description present, **no** `og:*` and **no** `twitter:*` tags. The tab title is also set at runtime by `LanguageContext` from `translations.meta.home` (EN and ES), so both the static metadata and `meta.home` must change or the runtime value would restore the suffix.

Next.js merges `openGraph`/`twitter` from the root layout into every route that does not override them, so putting them in `layout.tsx` would add role-bearing tags to the blog index. They go in `page.tsx` (home only). Blog posts already define their own `openGraph`.

## R5. Title pattern of the other routes (reported, not changed)

| Route | Delivered `<title>` | Runtime |
|---|---|---|
| `/` | `Luis Jacho Zambrano — Senior Full Stack Developer` (before) | `meta.home`, EN or ES |
| `/blog` | `Blog — Luis Jacho Zambrano` | `meta.blog` |
| `/blog/<slug>` | post title only | post title |
| unknown URL (404) | same as home | `meta.home` |

Inconsistency: post titles omit the site name. After this feature the home and 404 titles are `Luis Jacho Zambrano`. Proposed (not done): `<post title> — Luis Jacho Zambrano`; owner decision.

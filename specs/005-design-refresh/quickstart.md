# Quickstart: Validating the Design Refresh

Prerequisites: Node 24, `npm ci`, branch `005-design-refresh`. Scratch files go in `.tmp/`
(gitignored). Start the app with `npm run build` then `npm run start` (port 3000), or
`npm run dev` for quick checks. Lighthouse numbers come from the production build.

## Before implementation

**B1. Lighthouse baseline.** On the unmodified build, run Lighthouse (Performance and
Accessibility, mobile and desktop) three times against `http://localhost:3000/`; keep the best of
3 per category. Save to `.tmp/lighthouse-baseline.json`. Pass criterion later: each score at least
90 and no drop greater than 3 points versus this baseline.

## Executable checks (supervisor)

**V1. Build and lint.** `npm run lint` and `npm run build` both exit 0.

**V2. Theme values.** `globals.css` `:root` equals the constitution table (10 variables,
including `--border-strong` and `--focus-ring`). `grep -rnE "0d1117|0078d4|106ebe|161b22|21262d|8b949e|30363d|e6edf3" src` returns nothing.

**V3. Tokens instead of hard-coded greys.** `grep -rnE "#0a0a0a|#0f0f0f|bg-black|bg-neutral-9" src` returns nothing (allowed: `text-neutral-900` on the white primary CTA).

**V4. Years.** `grep -rnE "8\+|8 años" src` returns nothing; About stat and metadata read 9.

**V5. Banned patterns.** `grep -rnE "backdrop-blur|gradient|shadow-|blur-|animate-pulse|animate-ping|cyan-|emerald-|blue-500|text-transparent|uppercase tracking-widest" src` returns only the documented exceptions (Azure logo SVG gradients; status dot color). Zero eyebrow labels.

**V6. Accent only on links and focus.** `grep -rnE "text-accent|bg-accent|border-accent" src`
shows only link elements; no button or heading uses it.

**V7. Localized labels.** Every `aria-label` in `src` resolves from `translations.ts`;
`grep -rn 'aria-label="' src` returns no hard-coded English literal except brand names via translations.

**V8. svh.** `grep -rn "min-h-screen\|h-screen\|100vh" src` returns nothing.

**V9. Translations parity.** EN and ES keys of `translations.ts` are identical (script in
`.tmp/` compares key sets).

**V10. Contrast.** A script in `.tmp/` computes WCAG ratios for every foreground/background pair
used (text on background, surface, surface-2; muted; accent; focus ring; border-strong; primary
button; status dot). All text pairs at least 4.5, large text and UI at least 3. Paste the table
into `research.md` R12.

**V11. Spec 001.** Every blog-related item is marked "Superseded by spec 002"; `git diff` of
that file shows only added lines.

**V12. Lighthouse after.** Same procedure as B1, saved to `.tmp/lighthouse-after.json`; compare.

## Browser checks (browser tooling if available, otherwise owner on the Vercel preview)

**V13. First screen.** At 1280x800 and 390x844, in EN and ES: title, subline, proof line and both
buttons visible without scrolling; compare with `mocks/hero-dark.html` rendered alongside.

**V14. Keyboard.** Tab from page load: skip link appears first, activating it focuses main
content; every control shows the blue focus ring; order follows reading order; language toggle and
menu work with Enter/Space.

**V15. Reduced motion.** Emulate `prefers-reduced-motion: reduce`: no entrance animation, no
smooth scrolling, no hover movement on home, blog index, blog post, 404.

**V16. 360px.** Home, blog index, blog post and 404 show no horizontal scrollbar.

**V17. Language.** Toggle EN to ES: all visible text and aria-labels change; `document.documentElement.lang` becomes `es` and back.

**V18. Touch targets.** Measure icon links, language buttons, menu toggle, WhatsApp button: each at least 44x44 CSS px.

**V19. Mobile viewport.** On a phone or emulator with a collapsing address bar, the hero fits
without extra scroll.

## Verification results (2026-11-06, run by the supervisor on a production build)

Scripts live in `.tmp/` (gitignored): `lh.sh`, `verify.mjs`, `firstscreen.mjs`, `contrast.mjs`,
`parity.mjs`.

| Check | Result |
|-------|--------|
| B1 / V12 Lighthouse (best of 3) | Baseline mobile Perf 92, A11y 96; desktop 100 / 96. After (final code, best of 3): mobile 100 / 100; desktop 100 / 100. Meets "at least 90 and no drop greater than 3" |
| V1 lint and build | pass (`npm run lint`, `npm run build`) |
| V2 old palette, V3 hard-coded greys, V4 "8+", V7 literal aria-labels, V8 vh | no matches |
| V5 banned patterns | only the Azure logo SVG gradient stops (third-party brand mark, exempt under constitution v1.2.0) |
| V20 status token and Contact copy | no literal `#34D399` in `src/` (only `--status-available` in `globals.css`); the dot renders `rgb(52, 211, 153)` from the token; Contact reads "Open to senior remote roles and consulting" and "UTC−5" in EN and ES; no "GMT-5", "freelance" or "full-time" left in `src/` (owner decisions 1 and 2, 2026-11-06) |
| V6 accent usage | only link elements (hero, contact, blog back links, Markdown links) and the focus ring |
| V9 EN/ES key parity | 59 keys, none missing; 5 identical strings are proper nouns |
| V10 contrast | all 19 pairs pass (table in research.md R12) |
| V11 spec 001 | additions only, 33 insertions, 0 deletions |
| V13 first screen | title, subline, proof line and both buttons above the fold at 1280x800 and 390x844, EN and ES; live hero compared with the mock screenshot |
| V14 keyboard | skip link is the first Tab stop, visible, moves focus to `#main`; 20 Tab stops all show a 2px `#548CFF` outline |
| V15 reduced motion | emulated: no hidden content, no running animations, `scroll-behavior: auto` on `/` and `/blog`; control run without the preference shows the entrance animation |
| Hydration (dev server, console) | No hydration warnings on `/` and `/blog`, with and without `prefers-reduced-motion` (a first version had one under reduced motion; fixed, see research.md R7) |
| V16 360px overflow | 0px on `/`, `/blog`, a blog post, and a 404 |
| V17 language | `html lang` en to es to en; ES skip link, language group, footer and WhatsApp labels; ES availability line is the owner's exact text |
| V18 touch targets | every link and button at least 44x44 at 1280 and at 390 (menu open) |

Not verified by the supervisor: a real phone with a collapsing address bar (V19, the `svh` behavior),
forced-colors/high-contrast mode (outline is used so it should survive), Safari and Firefox, a screen
reader, and the Vercel preview. These are on the owner checklist.

# Quickstart: Validating EN/ES Parity

Prerequisites: Node 24, `npm ci`, branch `006-bilingual-parity`. Scratch files go in `.tmp/`
(gitignored). Run the production build with `npm run build` then `npx next start -p 3100`; stop only
the process on the port you started.

## Before implementation

**B1. Lighthouse baseline.** On the unmodified build run Lighthouse (Performance and Accessibility,
mobile and desktop) 3 times against `http://localhost:3100/`; keep the best of 3 per category; save to
`.tmp/lighthouse-baseline-006.json`. Pass later: each score at least 90 and no drop greater than 3
points versus this baseline.

## Executable checks (supervisor)

**V1. Build and lint.** `npm run lint`, `npx tsc --noEmit` and `npm run build` exit 0.

**V2. Key parity and allowlist.** A script transpiles `src/lib/translations.ts`, flattens both
languages, and fails if the key sets differ or if any EN/ES pair is identical and not on the spec
FR-010 allowlist (names, organizations, technologies, places, numerals).

**V3. Compile-time guarantee (SC-003).** Delete one ES string, run `npx tsc --noEmit`: it must fail
and name the missing property. Delete one ES bullet from a tuple: it must fail on the tuple length.
Restore both.

**V4. No prose outside the table.** `grep` the edited components for sentence-like string literals
(letters and spaces, 3 or more words) outside `translations.ts`: only the FR-010 neutral constants
remain.

**V5. Facts invariants (SC-002).** A script extracts digits, years and percentages from the EN and ES
Experience, Projects and Skills text and compares them as multisets; it also compares bullet counts
and order.

**V6. ES text scan (SC-001).** With a headless browser select ES and collect the visible text of
the home page, `/blog`, one post and a missing URL; compare element by element with EN; every
identical pair must be on the allowlist; flag English sentences.

**V7. Tab title (SC-004).** With ES selected: the home page, a post and a missing URL show the
Spanish (or post-language) title and `/blog` keeps "Blog — Luis Jacho Zambrano"; all return to English
on EN. Client-side navigation is mandatory: in-app links home to `/blog` to a post to `/blog` to home,
sampling the title for 1.5 seconds after each navigation; it must settle on the expected value within
1 second and stay (Next resets the title from metadata on route change; the provider re-applies it).
The meta description and Open Graph text in the page source are unchanged English (accepted
Principle VI deviation, owner 2026-11-06).

**V8. Overflow and first screen in ES (SC-005).** 0px horizontal overflow at 360px on the 4 page
types in ES; at 1280x800 and 390x844 in ES the title, subline, proof line and both buttons are above
the fold.

**V9. Regression.** Rerun the 005 scripts (`verify.mjs`, `firstscreen.mjs`, `decisions-check.mjs`);
all still pass (focus, skip link, reduced motion, 44px targets, token color).

**V10. Lighthouse after (SC-006).** Same procedure as B1; save to `.tmp/lighthouse-after-006.json`.

## Owner checks (browser, on the Vercel preview)

**O1.** Read every new Spanish string in context (Experience, Projects, Skills, Contact, tab title,
WhatsApp message) and approve or correct (task is owner-only; FR-031).

**O2.** Toggle EN/ES on a phone and a laptop: nothing stays English except names and technology
names; nothing overflows; the layout is otherwise unchanged.

## Verification results (2026-11-06, run by the supervisor on a production build)

Scripts live in `.tmp/` (gitignored). Baseline = unmodified `upstream/master` build.

| Check | Result |
|-------|--------|
| B1 / V10 Lighthouse (best of 3) | Baseline mobile Perf 100 / A11y 100, desktop 100 / 100. After: mobile 100 / 100, desktop 100 / 100. Meets "at least 90 and no drop greater than 3" |
| V1 lint, `tsc --noEmit`, build | pass |
| V2 key parity and allowlist | 107 keys in each language, none missing; every identical EN/ES pair is on the FR-010 list |
| V3 compile-time guarantee (SC-003) | demonstrated: missing ES property fails `tsc` (TS2741) and `npm run build` (exit 1); a 5-bullet ES list where 6 are required fails (TS2322, "Source has 5 element(s) but target requires 6"); file restored (research.md R2) |
| V4 prose outside the table | 18 hits, none is user-facing prose that belongs in the table (class strings, organization names, static metadata); research.md R3 |
| V5 facts invariants (SC-002) | numbers, years, percentages and list shapes identical between EN and ES for Experience, Projects and Skills ("30,000+" equals "más de 30.000", "~60%" equals "~60 %") |
| V6 ES text scan (SC-001) | 0 English sentences on the home page, `/blog`, a post and a 404 in ES (code blocks in posts excluded as code) |
| English unchanged (FR-008) | visible EN text of the 4 page types identical to the baseline capture; translations diff: 0 EN and 0 existing ES strings changed; only 7 type-declaration lines removed |
| V7 tab title (SC-004) | 16 checks pass: ES on home, post and 404; in-app navigation home to `/blog` to post to `/blog` to home keeps the title; EN returns; overwrite test restores ES; meta description and post Open Graph in the served HTML stay English. Control: with the observer disabled the overwrite test fails (research.md R4) |
| V8 ES layout (SC-005) | 0px horizontal overflow at 360px on `/`, `/blog`, a post and a 404 in ES; ES first screen above the fold at 1280x800 and 390x844 |
| V9 regression | 005 browser checks 18/18, token and Contact copy 6/6, hydration: 0 warnings on `/` and `/blog` with and without reduced motion (dev server) |
| US4 owner decisions | spec lists the three decisions with date and owner; DOM confirms full-name wordmark, 3 flat non-interactive cards, inline `·` skills in EN and ES |

Not verified by the supervisor: a real phone, Safari, Firefox, forced-colors mode, a screen reader,
the Vercel deployment, and whether Next rewrites the title on a real deployment (the tab title was
tested in headless Chrome against `next start` only). The quality of the Spanish copy is the owner's
review (`es-review.md`, tasks T038 to T040).

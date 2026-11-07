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

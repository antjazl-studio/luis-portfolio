# Quickstart: Validating the 404 Hydration Fix

Prerequisites: Node 24, `npm ci`, branch `007-fix-404-hydration`. Scratch files go in `.tmp/` (gitignored).
Run the production server with `npm run build` then `npx next start -p 3107`; stop only the process listening
on the port you started.

## Before implementation (baseline)

**B1. Route table.** Save the `npm run build` route table to `.tmp/routes-before.txt` (expected: `/`, `/_not-found`, `/blog` static; `/blog/[slug]` SSG with `ai-agent-workflow-portfolio`).

**B2. Server HTML.** `curl` `/blog`, `/blog/ai-agent-workflow-portfolio`, `/blog/nope` into `.tmp/before-*.html`. Expected: `aria-current="page"` present in the first two, absent in `/blog/nope`.

**B3. Reproduce W-1.** Load `/blog/nope` in a browser and confirm the hydration error #418 appears in the console.

## Executable checks (supervisor)

**V1. Lint and build.** `npm run lint` and `npm run build` exit 0 (SC-004).

**V2. Route table unchanged.** Compare with `.tmp/routes-before.txt`: identical (FR-008).

**V3. Server HTML unchanged for known routes.** Re-fetch the three pages; `/blog` and the post still contain `aria-current="page"` on the Blog link, byte-for-byte equal to the baseline apart from build hashes; `/blog/nope` still has none. Compare the `<header>` nav markup and the 404 `<h1>`, not whole files (build hashes and the Flight payload for the new prop differ by design) (FR-002, FR-006).

**V4. Console, production server (SC-001, SC-003).** (The browser's own "Failed to load resource ... 404" line for the 404 document is not counted, spec FR-001.) Headless Chrome via DevTools protocol (or an available browser tool) collects console messages and page errors for direct loads of `/`, `/blog`, `/blog/ai-agent-workflow-portfolio`, `/blog/nope`, `/nope`, `/blogger`; 3 fresh loads for each unknown URL. Expected: zero errors and zero warnings.

**V5. After-hydration state (SC-002).** On `/blog/nope`: heading and body are the post-not-found wording, link text "back to blog" and `href="/blog"`, Blog link has `aria-current="page"`. On `/nope` and `/blogger`: generic wording, link `href="/"`, no `aria-current` on Blog (FR-003, FR-004).

**V6. Spanish on the 404.** Load `/blog/nope` and `/nope`, switch to ES (one visible switcher), then back to EN: console clean, Spanish then English wording correct for the context, Blog highlight unchanged. Also probe that an in-app navigation to an unknown URL is a full page load (`window.next.router.push`, marker lost). Follow the 404 link back to `/blog` (US2 scenarios 3 and 4; US1 scenario 4).

**V7. Dev mode.** Repeat V4 on `next dev` (React dev hydration diagnostics are stricter).

**V8. Navigation on known pages.** On `/` scroll to each section: the matching nav item gets `aria-current="location"`; on `/blog` and the post the Blog item is current (FR-006).

**V9. No new strings.** `git diff upstream/master -- src/lib/translations.ts` is empty (FR-005).

## Owner checks (browser, Vercel preview)

**O1.** Open `<preview>/blog/nope` with DevTools console open: no red errors; page shows post-not-found wording and Blog tab highlighted.
**O2.** Open `<preview>/nope`: no errors; generic wording; link goes home.
**O3.** Open `<preview>/`, `/blog` and the existing post: no errors; navigation highlights as before.
**O4.** Check at 360px width and desktop that the 404 looks as before (FR-009).

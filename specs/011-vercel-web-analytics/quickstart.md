# Quickstart: validating Vercel Web Analytics (page views only)

Tags: `[auto]` the agent runs it; `[browser]` the agent runs it in a headless browser (outside the repo); `[owner]` only the owner can do it (dashboard or authorized preview). Results go in `verification.md`.

## Prerequisites

- Node 24, `npm ci`. Scratch scripts and the stand-in proxy live in `.tmp/` (gitignored). Playwright and Lighthouse are installed outside the repo.
- Production build for every check: `npm run build` then `npx next start -p <port>`. Stop only the PID or port you started.

## Baseline (before any code change, on `upstream/master`)

| ID | Check | Expected |
|---|---|---|
| B1 [auto] | `npm run build`: save the route table and the `.next/static/chunks` total size in bytes | Recorded |
| B2 [auto] | Lighthouse best of 3, mobile and desktop, `/` | Performance and Accessibility recorded |
| B3 [browser] | 360 px and 1280 px screenshots of `/`, `/blog`, one post, `/nope` | Saved in `.tmp/` |

## After the change

| ID | Check | Expected |
|---|---|---|
| A1 [auto] | `npm run lint`, `npm run build` | Pass; the route table matches B1 (same static markers on `/`, `/blog`, posts, 404) |
| A2 [auto] | `grep -rn "track(" src` and `grep -rn "@vercel/analytics" src` | No `track(`; the only import is in `src/app/layout.tsx` |
| A3 [browser] | Fresh context, scenario A (script 404): load `/`, `/blog`, a post, `/nope`; open the chat panel | `document.cookie` empty; `localStorage` and `sessionStorage` empty; no `console.error` except the one expected resource 404 for `/_vercel/insights/script.js` (the package's own `console.log` about the failed load is expected); `window.vaq` shows one page view per full load with that page's path, including `/nope`; no hydration warning on `/nope` and `/blog/nope` |
| A4 [browser] | Same, scenario B (proxy serves the stand-in script, view request answered 204) | Script requested once per full load (including `/nope`); `window.vaq` (and any request the stand-in makes) shows exactly one page view per full load with that page's path, one more after a client navigation (home to blog), none on a language switch (if the stand-in sends nothing, record "not observable" and rely on the queue); cookies and storage still empty |
| A5 [browser] | Block the script request (route abort) | Pages, language switch and chat panel all work; no visible error |
| A6 [browser] | 360 px and 1280 px screenshots after, pixel compare with B3 | No visible difference (record the changed-pixel count and explain any noise) |
| A7 [auto] | Lighthouse best of 3, mobile and desktop, `/`, scenario A and scenario B | Performance and Accessibility at or above 90 and no drop of more than 3 points vs B2. B uses a stand-in script, so it does not prove the real cost; the owner repeats Lighthouse on the preview after enabling (O6) |
| A8 [auto] | Added client JS: `.next/static/chunks` total and the home page's chunks, after minus before | Recorded in bytes |
| A9 [auto] | `git diff upstream/master --stat` | Only `package.json`, `package-lock.json`, `src/app/layout.tsx`, `CLAUDE.md`, `specs/008-ai-chat-widget/spec.md`, and `specs/011-vercel-web-analytics/*` |

## Owner-only checks (left unchecked until the owner reports)

| ID | Check | Expected |
|---|---|---|
| O1 [owner] | Vercel dashboard, the project's Analytics tab, click Enable (this adds `/_vercel/insights/*` after the next deployment) | Enabled |
| O2 [owner] | Authorize the preview for this fork PR; on the preview open DevTools, Network tab, reload | `/_vercel/insights/script.js` returns 200 once Web Analytics is enabled and the preview is rebuilt, and a view request appears |
| O3 [owner] | DevTools, Application tab, cookies and storage, on the preview and on production after merge | No cookie or storage entry from the site |
| O4 [owner] | Dashboard: after visiting production and, separately, a preview, report what each shows | Written into `verification.md`. The expectation that only production appears is **not verified** until the owner reports |
| O6 [owner] | Lighthouse on the authorized preview after O1 and O2 (home page, mobile and desktop) | Performance and Accessibility at or above 90 and no drop of more than 3 points vs B2 |
| O5 [owner] | After merge, visit `/`, `/blog` and a post on `luisjacho.dev` | Appear as page views in the dashboard within a day (SC-001) |

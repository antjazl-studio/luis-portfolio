# Verification (2026-11-18, local)

Tooling: Playwright 1.49.1 and Lighthouse 12.2.1, installed outside the repo. Pixel 5 emulation at 360x740 with touch taps. Pass criteria per tap: section top within 2 px of the viewport top, menu closed (`aria-expanded="false"`, drawer unmounted), `document.activeElement.id` equals the section id, route is `/`, no console errors.

## T008 Menu navigation (US1)

| Target | Combinations | Result |
|---|---|---|
| Production build (`next start`), start on `/` | 5 sections x EN/ES x reduced motion on/off = 20 | 20/20 pass |
| Production build, start on `/blog/ai-agent-workflow-portfolio` | 20 | 20/20 pass (includes focus after cross-route hash navigation; reviewer finding F2 resolved) |
| Dev server (`next dev`), start on `/` | 20 | 20/20 pass |
| Desktop 1280x800, `next start` | 5 nav links + wordmark | about/experience/skills/projects land at the top; contact stops at 71 px because the page bottom is reached (same as before); wordmark returns to 0 |

Before the change: 0/5 on production, dev and `3ea5600` (research.md R1).

Second tap while the first scroll is still running (production build; first tap, then reopen the menu and tap another section after 150 ms or 400 ms; 3 section pairs): 6/6 end on the last chosen section, menu closed, focus on it.

Not verified: touch hardware (real phone), Safari/iOS and Firefox (Chromium only).

## T013 Titles and sharing tags (US2)

Delivered HTML (`curl` of `next start`):

| Route | `<title>` | og/twitter |
|---|---|---|
| `/` | `Luis Jacho Zambrano` | og:title, og:description, og:type=website, twitter:card/title/description present; title "Luis Jacho Zambrano — Senior Full Stack Developer"; description names the role |
| `/blog` | `Blog — Luis Jacho Zambrano` (unchanged) | none (not inherited) |
| `/blog/ai-agent-workflow-portfolio` | post title (unchanged) | post's own tags (unchanged) |
| `/nope` | `Luis Jacho Zambrano` (follows home, as reported) | none |

Runtime tab title (headless browser): home EN `Luis Jacho Zambrano`; after switching to ES `Luis Jacho Zambrano`; 404 `Luis Jacho Zambrano`; blog index `Blog — Luis Jacho Zambrano`.

## T007 / T012 / T014 Build, lint, Lighthouse

- `npm run build`: passes; route table unchanged (`/`, `/blog` static, `/blog/[slug]` SSG, `/_not-found` static).
- `npm run lint` (project script, after removing the scratch worktree): exit 0, 0 errors, 5 warnings, all in the owner's gitignored `.tmp/verify/*.mjs` scratch files; `npx eslint src` is clean. (An earlier run with my temporary worktree present reported 247 errors, all in that worktree's copied files.)
- Lighthouse after, 3 runs: Performance 92, 93, 91; Accessibility 100 x3. Best Performance 93 vs baseline 94: drop of 1 point (<= 3), >= 90. Accessibility 100 vs 100.

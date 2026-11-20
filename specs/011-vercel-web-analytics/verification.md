# Verification: Vercel Web Analytics (page views only)

Run on 2026-11-20 on branch `feat/vercel-analytics` (from `upstream/master` `8cd91e8`). Production build (`next build`, `next start`) for every browser and Lighthouse check. Scratch scripts, the stand-in proxy and the saved stand-in script live in `.tmp/` and the session scratchpad and are not committed. Tools: Playwright 1.49.1 (Chromium), Lighthouse 12.2.1.

## Results measured by the agent

| ID | Check | Result |
|---|---|---|
| T004 | Install | `npm install @vercel/analytics` wrote `"@vercel/analytics": "^2.0.1"` (resolved 2.0.1). `package-lock.json` gains only that package entry (peer dependencies all optional). `npm ls` shows it with no children. `npm audit --json` summary: 9 moderate before and after (all in dev tooling: `@tailwindcss/typography`, `@typescript-eslint/*`, `minimatch`, `postcss-selector-parser`), none new. Run by the agent on 2026-11-20 with the counts read from the output; no raw output file was saved |
| T005 | Code | `src/app/layout.tsx`: `import { Analytics } from "@vercel/analytics/next"` and `<Analytics />` as the last child of `<body>`, no props. Layout stays a server component |
| T006 / A1 | Lint, build, routes | `npm run lint`: 0 errors, 5 warnings (all in the owner's gitignored `.tmp/verify`). `npm run build` passes. The route table is identical to the baseline: `/` and `/_not-found` and `/blog` static, `/blog/[slug]` SSG with the same posts |
| T007 / A2 | Grep | No `track(` in `src`; the only file that references `@vercel/analytics` in `src` is `src/app/layout.tsx` |
| T011 / A3 | Scenario A (script returns 404), fresh context per page, 360 px | On `/`, `/blog`, `/blog/ai-agent-workflow-portfolio`, `/nope`, `/blog/nope`: `document.cookie` empty, `localStorage` and `sessionStorage` empty, no page errors, no hydration error (React #418, #423, #425). The only `console.error` entries are the expected resource 404s (the script, plus the 404 page itself on `/nope` and `/blog/nope`). The package logs one `console.log` line about the failed script load, as expected. `window.vaq` holds exactly one `pageview` per full load, with that page's path (`/` , `/blog`, the post with route `/blog/[slug]`, and `/nope` and `/blog/nope` with their own path, not `/_not-found`) |
| T011 | Chat panel | On `/` at 1280 px the launcher opened the panel (an open `dialog` was found) |
| T012 / A4 | Scenario B (stand-in script via proxy) | Script requested once per full load. The stand-in prints "Debug mode is enabled by default in development. No requests will be sent", so no view request can be observed; the script's `[view]` console lines were used instead. One `[view]` per full load; none after a language switch; one more after each client navigation (`/` to `/blog`, `/blog` to a post). Cookies and storage still empty |
| T013 / A5 | Script blocked (request aborted) | All five pages load, `window.vaq` still queues the page view, no page error, no hydration error, the chat panel opens, the ES button click and the client navigation run without error (the visible text change after the language switch was not asserted in this run, so FR-005 is shown for page load, the chat panel and client navigation, not for the language switch effect). The only errors are `net::ERR_FAILED` for the script (and the page 404 on `/nope`) |
| T014 / A6 | Screenshots 360 px and 1280 px of `/`, `/blog`, the post and `/nope`, reduced motion, before vs after | All 8 pairs are byte-identical (same dimensions, no differing pixel). A second baseline capture was identical to the first, so the noise floor is zero in this setup |
| T015 / A7 | Lighthouse best of 3, home page | Baseline mobile Performance 99, 100, 100 (best 100), Accessibility 100 x3; desktop 100 x3 and 100 x3. After, scenario A: mobile 96, 100, 99 (best 100), Accessibility 100 x3; desktop Performance 100 x3, Accessibility 100 x3. After, scenario B: mobile 97, 100, 100 (best 100), Accessibility 100 x3; desktop 100 x3, 100 x3. Best of 3 is unchanged and at or above 90 everywhere; the single-run spread (96 to 100) is within the known plus or minus 3 variation |
| T016 | Regression decision | No drop of more than 3 points on best of 3: nothing to escalate. B is a stand-in (see below), so SC-006 is confirmed for real only by the owner's run on the preview (O6) |
| T017 / A8 | Added client JavaScript | `.next/static/chunks` total: 924,311 bytes before, 927,947 after (+3,636). JavaScript chunks referenced by the home page: 768,609 bytes before, 772,245 after (+3,636, uncompressed, 0.47%). The analytics code sits in one shared chunk that the home page loads |
| A9 | Diff scope | Only `package.json`, `package-lock.json`, `src/app/layout.tsx`, `CLAUDE.md`, `specs/008-ai-chat-widget/spec.md` and `specs/011-vercel-web-analytics/*` changed |

## Findings worth knowing

- The stand-in is the debug build of the host's script (5,290 bytes), a different artifact from the production script. It reads `localStorage` and writes it only when an identify call sets a user or group (this site never makes one); storage stayed empty in scenario B. This says nothing proven about the production script, which was not available. That is why the owner repeats the cookie and storage check on the preview (O3).
- The package's Next entry did not change any static route and did not trigger hydration warnings, including on the prerendered 404 shell (`/nope`, `/blog/nope`).
- In `npm run dev` the package loads `https://va.vercel-scripts.com/v1/script.debug.js` (debug mode, logs only, per the script's own message). The development script is not the production script.

## Excerpts from the Vercel documentation (fetched by the agent on 2026-11-20)

Copied verbatim. They could not be re-fetched by the independent reviewer.

- Quickstart (`https://vercel.com/docs/analytics/quickstart`, last_updated 2026-06-08): "Enabling Web Analytics will add new routes (scoped at `/_vercel/insights/*` and `/<unique-path>/*`) after your next deployment." and, for `nextjs-app`, "Add the following code to the root layout:" with `import { Analytics } from '@vercel/analytics/next';` and `<Analytics />` after `{children}` in `<body>`. Also: "Once your app is deployed, it will start tracking visitors and page views." and "Users on Pro and Enterprise plans can also add custom events".
- Privacy (`https://vercel.com/docs/analytics/privacy-policy`, last_updated 2026-06-26): "Vercel Web Analytics allows you to track your website traffic and gather valuable insights without using any third-party cookies, instead end users are identified by a hash created from the incoming request." and "The lifespan of a visitor session is not stored permanently, it is automatically discarded after 24 hours." and "The recording of data points (for example, page views or custom events) is anonymous, so you have insight into your data without it being tied to or associated with any individual, customer, or IP address."
- Pricing (`https://vercel.com/docs/analytics/limits-and-pricing`, last_updated 2026-08-25): Hobby "Included Events: 50,000 events / month included"; "Custom Events: -" for Hobby. "Hobby teams can't purchase additional events. Once you reach the monthly limit, collection pauses until the next billing cycle or until you upgrade to Pro." and "once you exceed the limits, a three day grace period will start before Vercel will stop capturing events."

## Not verified (cannot be checked by the agent)

- Anything in the Vercel dashboard: whether Web Analytics is enabled, what production shows, and what preview and development visits show. The expectation that only production appears is **not verified**.
- That `/_vercel/insights/script.js` returns 200 and a real view request is sent on a Vercel deployment (needs the owner to enable the feature and an authorized preview).
- The production script's behavior regarding cookies and storage (only the npm package and the debug stand-in were inspected).
- The real Lighthouse cost of the production script (B uses the debug stand-in).
- Safari, Firefox and a real phone: checks ran in Chromium only.
- The owner's position that no consent banner is needed. The host's privacy page does not state it, and it is not a legal opinion (owner assumption, 2026-11-20).
- The Hobby event allowance in practice (50,000 per month) and what happens at the limit, beyond the docs.

## Owner checklist (left unchecked on purpose)

- [ ] O1 Enable Web Analytics for the project in the Vercel dashboard (Analytics tab, Enable). It adds the `/_vercel/insights/*` routes after the next deployment.
- [ ] O2 On the authorized preview, DevTools Network: `/_vercel/insights/script.js` returns 200 and a view request appears.
- [ ] O3 DevTools Application tab, on the preview and on production: no cookie or storage entry from the site.
- [ ] O4 Dashboard: visit production and, separately, a preview; report what each shows (the expectation that only production appears is not verified until you report).
- [ ] O5 After merge, visit `/`, `/blog` and a post on luisjacho.dev; they appear as page views within a day.
- [ ] O6 Lighthouse on the preview after O1 and O2 (home page, mobile and desktop): Performance and Accessibility at or above 90, no drop of more than 3 points vs the baseline (100/100).
- [ ] Decide whether a privacy notice is wanted (a separate, visible feature; out of scope here).

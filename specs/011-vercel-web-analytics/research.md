# Research: Vercel Web Analytics (page views only)

Date: 2026-11-20. Everything marked "verified" was checked by the agent on that date. Sources are named so the owner can re-check them. Quotes and "last updated" dates from vercel.com were fetched by the agent on 2026-11-20 and could not be re-fetched by the independent reviewer; the excerpts are copied into `verification.md` (T021).

## R1. Method for Next.js App Router

- **Decision**: install `@vercel/analytics` and render `<Analytics />` from `@vercel/analytics/next` as the last child of `<body>` in `src/app/layout.tsx`, with no props.
- **Source (verified, fetched 2026-11-20)**: Vercel quickstart (`https://vercel.com/docs/analytics/quickstart`, last updated 2026-06-08), section "Add the Analytics component to your app" for `nextjs-app`: `import { Analytics } from '@vercel/analytics/next';` and `<Analytics />` after `{children}` in `app/layout.tsx`. The Pages Router variant (`pages/_app.tsx`) and the plain React variant (`@vercel/analytics/react`) are not the App Router method. The docs say the component "offer[s] more seamless integration with Next.js, including route support".
- **Version**: `npm view @vercel/analytics version` returned 2.0.1 (dist-tag latest, 2026-11-20). The package page lists "What's new in version 2.x": MIT license, resilient intake.
- **No props**: `mode` auto-detects from `NODE_ENV`, `debug` is automatic in development, `beforeSend` only matters if URLs carry personal data (this site's paths are `/`, `/blog`, `/blog/<slug>` and a 404 path; there are no accounts or identifiers in URLs), and `route`/`path` props would disable automatic tracking (not wanted).
- **Alternatives rejected**: the plain `<script>` HTML method (no route support for client navigation); `@vercel/analytics/react` (no Next route support); `inject()` (no route support).

## R2. Dependency justification against Principle I

- Principle I: "New runtime dependencies that duplicate these capabilities (other CSS frameworks, other animation libraries, UI-kit component libraries) MUST NOT be added." The capabilities are styling, animation and UI components. Analytics is none of them, so there is no violation and no amendment.
- Facts (verified with `npm view @vercel/analytics@2.0.1 --json` and `npm pack` inspected in the scratchpad, outside the repo): license MIT; no `dependencies` field (zero runtime dependencies); `peerDependencies` `next >= 13` and `react ^18 || ^19 || ^19.0.0-rc`, all optional, and this repo has `next 16.4.5` and `react ^19`; `exports["./next"]` points to `dist/next/index.mjs`, which is about 7 KB of source. The real added client bytes are measured from the build and recorded in `verification.md` (task T017), not assumed.
- Why first-party to the host: the site is deployed on Vercel and the package sends to same-origin routes that Vercel creates (`/_vercel/insights/*`). No new vendor, account or domain is introduced.
- Alternatives rejected: Google Analytics or similar (third-party cookies and a new vendor, against the owner's goal); Plausible or Umami (a new vendor and cost, and a separate script host); parsing server logs (the site is static, there is no server log the owner controls); Vercel Speed Insights (out of scope, a different measure).

## R3. What the host documents about privacy (quoted) and what it does not

Source: `https://vercel.com/docs/analytics/privacy-policy`, last updated 2026-06-26, fetched 2026-11-20.

- "Vercel Web Analytics allows you to track your website traffic and gather valuable insights without using any third-party cookies, instead end users are identified by a hash created from the incoming request."
- "The lifespan of a visitor session is not stored permanently, it is automatically discarded after 24 hours."
- "The recording of data points (for example, page views or custom events) is anonymous, so you have insight into your data without it being tied to or associated with any individual, customer, or IP address."
- Fields that may be stored with each data point: event timestamp, URL, dynamic path, referrer, filtered query params, geolocation (country, region, city), device OS and version, browser and version, device type, web analytics script version.
- **What the page does not say**: it does not state that a consent banner is unnecessary, and it does not say which environments (production, preview, development) are recorded.
- **Consequences**: (1) "No consent banner needed" is recorded as an **owner assumption, not verified** (spec Assumptions, 2026-11-20). A legal view is outside this feature. If the owner wants a privacy notice later, that is a separate visible change. (2) Which environments the dashboard shows is an **owner check**, not a claim. (3) The wording used in the repo is "anonymous page views, no third-party cookies, visitors identified by a request hash discarded after 24 hours (per the host's documentation)", not "no data is stored".
- **What the agent verified in the code** (published build, scratchpad): `dist/next/index.mjs` contains no `document.cookie`, `localStorage`, `sessionStorage` or `indexedDB` reference. This is about the browser package only. What the host's servers do is covered by the quote above, which is the host's statement, not the agent's.

## R4. Reconciliation with feature 008 ("no analytics")

- **Where the wording is** (verified, `grep`, 2026-11-20): `specs/008-ai-chat-widget/spec.md` line 90 ("Nothing about the conversation is stored: no cookies, no browser storage, no analytics, no logs from the site."), line 130 (FR-012: "... MUST NOT include analytics or send conversation content anywhere except to the agent service"), line 163 (SC-007: 0 cookies and 0 browser-storage entries created by using the widget), line 180 (out of scope: analytics). `CLAUDE.md` line 79: "Nada se persiste (sin cookies ni storage); la conversación vive solo en memoria de la página." The constitution has no such wording (grep returned nothing).
- **Reading**: every one of these concerns the chat widget and the conversation content. Site-level page-view analytics is a different thing: it records which page was visited, not what was said.
- **Evidence that the conversation cannot reach what analytics record** (verified, grep over `ChatWidget.tsx`, `ChatPanel.tsx`, `ChatMarkdown.tsx`, `useChat.ts`, `chatStream.ts`): no `pushState`, `replaceState`, `useRouter`, `router.`, `history.` or hash usage; the only `window.location` use is `window.location.hostname` for the host check in `ChatWidget.tsx` line 44. The widget never changes the page address, so a page view contains the page path, never a message. Assistant links open in a new tab with `rel="noopener noreferrer"` or are `mailto:` links (`ChatMarkdown.tsx`), so following one does not change this page's address; a page view on the destination belongs to that site.
- **Decision (2026-11-20, agent; the owner asked to be consulted only if an amendment is needed)**: no amendment. Add a scope note in 008 next to FR-012, SC-007, line 90 and the out-of-scope line ("this refers to the widget; site-level page-view analytics was added by feature 011; FR-012 and SC-007 stay true because the widget writes no cookie or storage and keeps conversation content out of the page address"), in the same style as the existing "superseded by 009" notes in that spec. Update `CLAUDE.md`: scope line 79 to the widget and add an "Analytics" section.
- **One thing this does not settle**: SC-007 says the widget creates 0 cookies and 0 storage entries. The browser check in quickstart A3 measures the whole site, so it also covers analytics (scenario B, with a stand-in script). The real production script is not available until the owner enables the feature; the owner re-checks cookies and storage on the preview (quickstart O3).

## R5. Environment behavior (package default, from the published build)

- Development or test (`NODE_ENV` is `development` or `test`): the script is `https://va.vercel-scripts.com/v1/script.debug.js`. The package docs say debug mode "log[s] all analytics events in the browser's console". This is a request to a Vercel-owned domain during `npm run dev`. It is documented behavior, noted so the owner is not surprised in the network tab.
- Production build (`next build` then `next start`, and every Vercel deployment including previews, because `NODE_ENV` is `production` there): the script is requested from the same origin at `/_vercel/insights/script.js`. Vercel serves that route only when Web Analytics is enabled for the project (docs: enabling "will add new routes (scoped at `/_vercel/insights/*`...) after your next deployment"; the 404 otherwise is inferred from that and from the package's load-error hint, and the owner confirms it in O2). Locally the request returns 404, to be observed in A3. That previews have `NODE_ENV` production is inferred from `next build` and is confirmed by the preview showing the script request (O2). This has no visible effect (Principle VII) and produces one expected console resource error. The package's own load-error handler also writes a `console.log` line (a Failed to load script message with a hint to enable Web Analytics); that log is expected too.
- **Not determined by the docs and therefore an owner check**: whether preview and development visits appear in the dashboard. The owner's expectation "page views only appear for production" is recorded as an expectation, not a fact. The owner confirms it in the dashboard and the result is written in `verification.md`.

## R6. Performance measurement method

- Baseline before any code change, on the unchanged production build of `upstream/master` (`8cd91e8`): Lighthouse best of 3, mobile and desktop, home page; plus 360 px and 1280 px screenshots of `/`, `/blog`, one post and a non-existent URL. Reuse the Lighthouse install in the scratchpad (outside the repo).
- After: the same measurements in two scenarios. **A**: the script returns 404 (as on any non-Vercel host and before the owner enables the dashboard). **B**: a small local proxy in `.tmp/` serves a stand-in `/_vercel/insights/script.js` (the debug build from `va.vercel-scripts.com`, saved in `.tmp/`, never committed) and answers the view request with 204, so the script's own cost is included. B is an approximation and shows only the cost of loading and running a script: the stand-in is the debug build, a different artifact from the production script, and the real endpoint names come from the remote script (not from the package). The real production script is not available until the owner enables the feature, so SC-006 is confirmed for real only by the owner's Lighthouse run on the preview (quickstart O6).
- Lighthouse varies by about plus or minus 3 points, so the requirement is "at or above 90 and no drop of more than 3 points vs baseline, best of 3 for both". Measured values go in `verification.md`.
- Added client JavaScript: compare `.next/static/chunks` total and the home page's referenced chunks before and after, in bytes, and record both.

## R7. Static rendering

The package's Next entry calls `useSearchParams` and `usePathname` and wraps its inner component in `Suspense` (verified in the published build). A `useSearchParams` call inside a Suspense boundary should not force the page to be dynamic. This is verified by the build's route table (home, `/blog`, posts and 404 must keep the same static marker as on `upstream/master`), not assumed.

## R8. Risks accepted or recorded

- Hobby plan: 50,000 events per month; after the allowance and a 3-day grace period, collection pauses until the next cycle (docs, `limits-and-pricing`, last updated 2026-08-25). The site is not affected. Custom events are not available on Hobby, and the site sends none.
- The "no consent banner" position is the owner's and is unverified.
- The development script is loaded from a Vercel domain (R5).
- Previews request a script that returns 404 until the owner enables the feature; harmless.
- If the host changes the package or the route in a later major version, the pinned caret range `^2.0.1` allows minor and patch updates only.

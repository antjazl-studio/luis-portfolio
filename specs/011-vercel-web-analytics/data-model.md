# Data Model: Vercel Web Analytics (page views only)

The site stores nothing. This describes what the host records for each page view, as the host documents it (`https://vercel.com/docs/analytics/privacy-policy`, fetched 2026-11-20). It is not verified independently of that page.

## Page view

One automatic record per page visit (full load or in-site navigation).

| Field | Notes |
|---|---|
| Event timestamp | when the visit happened |
| URL and dynamic path | for this site: `/`, `/blog`, `/blog/<slug>`, or a non-existent path |
| Referrer | the previous site, if the browser sends it |
| Query parameters (filtered) | the site uses none |
| Geolocation | country, region, city |
| Device OS and version, browser and version, device type | from the browser's own data |
| Script version | the version of the analytics script |

Not recorded, per the host's page: IP address tied to an individual, cross-site identifiers, a persistent visitor identity. Visitors are told apart for a session by a hash of the request, discarded after 24 hours.

## Rules for this site

- No custom event exists (Hobby plan; no `track()` call).
- No conversation content can be part of a page view, because the chat widget never changes the page address (`research.md` R4).
- The site itself writes no cookie and no browser storage.

## State transitions

None. The only switch is owner-side: Web Analytics enabled or not in the Vercel dashboard. Before it is enabled the script request returns 404 and nothing is recorded.

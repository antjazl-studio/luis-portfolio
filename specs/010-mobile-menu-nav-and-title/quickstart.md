# Quickstart: validate feature 010

Prerequisites: Node 24, `npm install`. Scripted checks use Playwright installed outside the repo (not a project dependency).

## 1. Build and lint

```text
npm run lint
npm run build      # route table: /, /blog, /blog/[slug] static as before
```

## 2. Menu navigation (scripted, 360x740, touch)

Run against `next start` (production build) and `next dev`.

For each section in about, experience, skills, projects, contact; each language EN, ES; reduced motion on and off; start on `/`, plus start on `/blog/ai-agent-workflow-portfolio` with the default motion setting:

1. Open the menu (button "Toggle menu"), tap the section link.
2. Wait for the scroll to settle (2 s).
3. Expect: menu button `aria-expanded="false"`; section top within 2 px of the top of the viewport; `document.activeElement.id` equals the section id; no console errors.

Baseline before the fix: `scrollY` stays 0 in every case on `/`.

Also: desktop 1280x800, click each nav link, expect the same scroll as before; wordmark click scrolls to top.

## 3. Titles and sharing tags (delivered HTML)

```text
curl -s http://localhost:3100/ | grep -o "<title>[^<]*</title>\|<meta [^>]*\(description\|og:\|twitter:\)[^>]*>"
```

Expect on `/`: title `Luis Jacho Zambrano`; description with the role; `og:title`, `og:description`, `twitter:title`, `twitter:description` with "Senior Full Stack Developer". `/blog`: title unchanged, no `og:`/`twitter:` role tags. A post: unchanged. `/nope`: title `Luis Jacho Zambrano`.

In the browser (EN then ES): the tab title is `Luis Jacho Zambrano`.

## 4. Lighthouse

Home page, best of 3 runs, mobile: Performance and Accessibility >= 90 and no drop > 3 points vs the baseline taken on `upstream/master`.

## 5. Owner checks on the Vercel preview (real phone)

- Open the menu, tap each section: it closes and the page scrolls there.
- Same from a blog post; same in ES; same with "reduce motion" enabled.
- Tab title reads `Luis Jacho Zambrano`; paste the preview URL in a LinkedIn post composer to see the card text (needs the production domain to be indexed or the Post Inspector).

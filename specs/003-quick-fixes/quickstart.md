# Quickstart: Validating 003 Quick Fixes

Prerequisites: Node and npm installed; on branch `003-quick-fixes`; at least one published or
draft post visible locally (drafts show in development).

## 1. Build, lint, audit

```bash
npm install
npm run lint
npm run build
npm audit
```

Expected: lint and build pass with no errors. `npm audit` no longer lists `source-map-js`,
`nanoid`, `js-yaml`, `brace-expansion`; remaining critical/high entries match the residual table
in [research.md](./research.md) R-04 (Next.js, PostCSS, `eslint-config-next` family). `package.json`
has no dependency changes; `next` is still 14.2.35.

## 2. Navigation on blog routes (spec User Story 1)

Run `npm run dev`, then check at 1280px and 375px widths against
[contracts/navigation.md](./contracts/navigation.md):

1. Open `/blog/<slug>` directly in a fresh tab. Click each of About, Experience, Skills,
   Projects, Contact → each lands on that home section with its heading visible below the bar.
2. From a blog page click "LJ" → home page, top.
3. On `/blog` and `/blog/<slug>`: Blog is highlighted (desktop and drawer); no section is.
4. On `/`: Blog is not highlighted; click each section and "LJ" → smooth scroll as before.
5. From a blog page go to `/#about`, then scroll through all sections → the highlight follows
   (guards against the scroll-spy regression).
6. Switch to ES on a blog page, click a section link → home is still Spanish.
7. Browser Back from home returns to the blog page.
8. Footer (now rendered once in the root layout, removed from the home page): exactly one
   footer on `/` (not two), `/blog`, `/blog/<slug>`, `/blog/does-not-exist`, `/nope`. It sits
   after the page content and does not overlap the floating WhatsApp button.
9. Keyboard: Tab to a section link on a blog page, press Enter → navigates.

## 3. Experience entry (User Story 2)

On `/` open Experience in EN and ES:

- Second entry reads Full Stack Developer / Desarrollador Full Stack, Logiztik Alliance Group,
  "Oct 2019 – Apr 2020" / "Oct 2019 – Abr 2020", with the two bullets in the right language.
- "Previous Role" appears nowhere (search the page source).
- Order: MyWork, Logiztik, IESS.

## 4. Regression and workflow checks

- Home page at 360px: no horizontal overflow; mobile drawer opens/closes as before.
- Lighthouse on `/` (production build: `npm run build && npm start`): Performance and
  Accessibility ≥ 90 (first measurement of this baseline; record the numbers in the PR).
- Review against Principle IV: the diff adds no glows, gradients, blur or tinted badges.

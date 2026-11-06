# Contract: Surface that must not change

The upgrade must leave the public behavior below identical (spec FR-003 to FR-006).

| Route | Behavior |
|-------|----------|
| `/` | Static. Hero, About, Experience, Skills, Projects, Contact; EN/ES switch; CV download `/Luis_Jacho_Resume.pdf` |
| `/blog` | Static. Lists visible posts in the active language, or the localized empty state |
| `/blog/<slug>` | Static, `dynamicParams = false`. Only slugs from `getVisiblePosts()`; metadata title/description/openGraph from the EN version |
| any unknown path | Localized 404 (`not-found.tsx`); under `/blog/` uses post-not-found wording |

Build-time contract (`src/lib/blog.ts`, untouched):
- `VERCEL_ENV=production` excludes `draft: true` posts everywhere (index, static params, post page); any other value includes them.
- Invalid frontmatter, missing `en.md` / `es.md`, stray files, bad slugs or mismatched `draft` fail the build.

Tooling contract:
- `npm run lint` and `npm run build` exit 0; `npm run dev` / `npm start` still work.
- CI (`.github/workflows/ci.yml`) runs on Node 24: `npm ci`, `npm run lint`, `npm run build`.

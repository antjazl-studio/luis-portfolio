# Quickstart: validating the native blog

Prerequisites: `npm install` (adds gray-matter, zod, react-markdown, remark-gfm).

## 1. Happy path (drafts visible locally)
1. `npm run dev`, open `/blog`. Expect exactly one post (the draft launch post), no loading state.
2. Switch EN → ES: title, summary, date format and reading time change without reload.
3. Open the post; paste its URL in a fresh private window: full article renders.
4. Open `/blog/does-not-exist`: localized "post not found" with link to `/blog`.
5. DevTools Network: no request to any third-party host.

## 2. Production behaviour (drafts hidden)
1. `VERCEL_ENV=production npm run build` (PowerShell: `$env:VERCEL_ENV="production"; npm run build`).
2. `npm start`: `/blog` shows the empty message (EN and ES); the post URL shows not found.
3. Remove `draft: true` from both files, rebuild with the same variable: post is listed and readable.

## 3. Build-failure fixtures (use a temporary post, delete afterwards)
| Change | Expected build error |
|--------|----------------------|
| Delete `es.md` | `post "<slug>": missing es.md` |
| Remove `summary` from `en.md` | `post "<slug>" [en] summary: …` |
| `date: not-a-date` | `post "<slug>" [en] date: …` |
| `draft: true` only in `en.md` | `post "<slug>": draft differs between en and es` |
| Directory `Bad_Slug` | invalid identifier message |
| Missing language on a draft post, with `VERCEL_ENV=production` | still fails |

## 4. Safety
- `grep -rn "dangerouslySetInnerHTML" src` → no results.
- `grep -rniE "dev\.to|rss2json" src package.json CLAUDE.md` → no results; constitution
  Principle VII no longer cites them.
- Add `<script>alert(1)</script>` and `<!-- REVIEW: x -->` to a temp post body: neither renders.
- `grep -r "REVIEW:" content/` lists the owner's confirmation points (SC-008).

## 5. Quality gates
- `npm run lint` and `npm run build` pass (no `no-img-element` warnings).
- 360px width: no horizontal scroll on `/blog` and the post, code blocks scroll internally.
- Lighthouse on `/` (and `/blog`): Performance and Accessibility ≥ 90.
- Styling review against Principle IV (no cyan, glows, badges).

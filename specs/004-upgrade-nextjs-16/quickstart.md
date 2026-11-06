# Quickstart: Validate the upgrade

Prerequisites: Node 24 (matches CI and Vercel), npm, Chrome (for Lighthouse). Commands in PowerShell.

## 1. Baseline (on the feature branch, before any code change)

```powershell
git switch 004-upgrade-nextjs-16   # code is identical to master at this point
npm ci
npm audit            # save summary
npm run build        # save the route table
npm start            # then Lighthouse (mobile) on / and /blog/ai-agent-workflow-portfolio
```

Take screenshots (EN and ES, 390px and 1280px) of `/`, `/blog`, the post, `/nope`, `/blog/nope`.
Store notes under `specs/004-upgrade-nextjs-16/` (e.g. `baseline.md`; screenshots stay untracked).

## 2. Upgrade (on the feature branch)

```powershell
git switch 004-upgrade-nextjs-16
npx @next/codemod@latest upgrade latest   # accept the prompted codemods
npm install
```

Then the hand edits in plan.md step 3 (flat ESLint config, `lint` script, `engines`).

## 3. Verify

```powershell
npm run lint                       # exit 0
npm run build                      # exit 0, Turbopack; routes /, /blog, /blog/[slug] static
npm audit                          # expect 0 critical, 0 high
node -v                            # must be v24.x, same as CI
```

Draft gating (use a throwaway draft post with `draft: true` in both `en.md` and `es.md`):

```powershell
$env:VERCEL_ENV="production"; npm run build   # draft absent from /blog and route list; /blog/<draft> -> 404
Remove-Item Env:VERCEL_ENV;   npm run build   # draft present
```

Delete the throwaway post afterwards. Also break a frontmatter field once to confirm the build fails.

Visual/behavior: `npm start`, repeat the screenshot set and compare with baseline; switch EN/ES;
check the browser console for hydration errors; click CV download, WhatsApp and contact links.

Lighthouse: repeat the baseline run; every category must be >= baseline.

## 4. Done

Vercel Node.js Version set to 24.x (owner task), CI green on the PR (Node 24), Vercel preview built on Node 24, docs updated (CLAUDE.md "Next.js 16", README), research.md R-02..R-10
updated with what the codemods actually changed.

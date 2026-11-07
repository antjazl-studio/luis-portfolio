# Baseline (before the upgrade)

Captured 2026-11-05 on branch `004-upgrade-nextjs-16` with no code change relative to `master`
(`git diff master --stat -- . ':!specs'` printed nothing before the `.gitignore` edit). Node v24.22.2,
Next.js 14.2.35, React 18. Lighthouse 13.6.0, mobile preset, headless Chrome, production build
served with `next start`; each number is the best of 3 runs.

## npm audit

13 vulnerabilities: 8 moderate, 4 high, 1 critical.

| Package | Severity | Direct | Fixed by |
|---------|----------|--------|----------|
| next | critical | yes | next@16.4.5 |
| postcss (nested in next) | high | no | next@16.4.5 |
| eslint-config-next | high | yes | eslint-config-next@16.4.5 |
| @next/eslint-plugin-next | high | no | eslint-config-next@16.4.5 |
| glob | high | no | eslint-config-next@16.4.5 |

## Route table (`npm run build`)

```
┌ ○ /                                    8.48 kB         143 kB
├ ○ /_not-found                          138 B          87.5 kB
├ ○ /blog                                3.16 kB        99.2 kB
└ ● /blog/[slug]                         3.19 kB         104 kB
    └ /blog/ai-agent-workflow-portfolio
+ First Load JS shared by all            87.3 kB
```

## Lighthouse (mobile, best of 3)

| Page | Performance | Accessibility | Best Practices | SEO |
|------|-------------|---------------|----------------|-----|
| `/` | 93 | 96 | 100 | 100 |
| `/blog/ai-agent-workflow-portfolio` | 100 | 96 | 100 | 100 |

Home Performance and Accessibility are both >= 90 (constitution gate).

## Screenshots

20 PNGs (5 pages x mobile 390px / desktop 1280px x EN/ES) in the untracked folder
`specs/004-upgrade-nextjs-16/screenshots/baseline/`. No console errors or warnings during the run.
Language is in-memory state (toggle button), so `<html lang>` stays `en` in both languages.

## After the upgrade (same method, same machine, 2026-11-05)

Lighthouse mobile, best of 3 (home: 6 runs: 87, 92, 92, 92, 91, 92):

| Page | Performance | Accessibility | Best Practices | SEO |
|------|-------------|---------------|----------------|-----|
| `/` | **92** (base 93) | 96 | 100 | 100 |
| `/blog/ai-agent-workflow-portfolio` | 100 | 96 | 100 | 100 |

Home Performance dropped by 1 point and is consistent across runs (LCP about 3.35 s vs 3.18 s;
total transfer 397 KiB vs 361 KiB, i.e. the larger Next 16 / React 19 client runtime). Still >= 90.
FR-008 asks for "equal or better"; the owner accepted the 1-point drop on 2026-11-06 as within Lighthouse noise and above the constitution's 90 gate (spec.md W-2).

Audit: 10 moderate, 0 high, 0 critical (research.md R-13). Route table: `/`, `/blog` static,
`/blog/[slug]` SSG with the single existing slug, `/_not-found` static (unchanged shape).

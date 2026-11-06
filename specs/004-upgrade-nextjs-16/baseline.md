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

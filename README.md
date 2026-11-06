# Luis Jacho — Portfolio

Bilingual (EN/ES) portfolio of Luis Antonio Jacho Zambrano, Senior Full Stack Developer (.NET · Angular · Azure).

**Live site:** [luis-jacho.vercel.app](https://luis-jacho.vercel.app)

[![CI](https://github.com/antjazl-studio/luis-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/antjazl-studio/luis-portfolio/actions/workflows/ci.yml)

## Tech stack

- Next.js (App Router) · TypeScript
- Tailwind CSS
- Framer Motion

## Run locally

Requires Node 24 (see `engines` in `package.json`).

```bash
npm ci
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint    # ESLint (flat config)
```

## How this repo is built

- **Spec-Driven Development** with [GitHub Spec Kit](https://github.com/github/spec-kit). Project
  principles live in [`.specify/memory/constitution.md`](.specify/memory/constitution.md) and
  feature specs in [`specs/`](specs/).
- **AI agents** work under a least-privilege bot account, contributing by fork-and-pull request.
- **Every change is human-reviewed** before it is merged.

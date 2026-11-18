# Implementation Plan: "Ask about Luis" AI Chat Widget

**Branch**: `008-ai-chat-widget` | **Date**: 2026-11-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/008-ai-chat-widget/spec.md`

## Summary

A floating "Ask about Luis" launcher (neutral outline pill, stacked above the WhatsApp button; owner decision
2026-11-17) opens a native `<dialog>` chat panel (full screen on mobile, 400px side panel from `md`). The browser
sends the whole conversation to the already-deployed agent service with `fetch` and reads the Server-Sent Events
stream with a `ReadableStream` reader, handling the `text`, `tool`, `replace` and `done` events. Answers are
rendered with the already-installed `react-markdown`, restricted to a small element allow-list and a strict URL
filter, so no raw HTML can ever render. The conversation lives only in React state. The panel and its markdown
code are loaded lazily on first open, so the initial page weight, render and Lighthouse scores do not depend on
the feature or on the service. On any origin other than the production site and local development the panel
shows "Assistant available on luisjacho.dev" and sends no request. All strings are EN/ES in
`lib/translations.ts`. Decisions and rejected alternatives: [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript (strict), React 19, Node 24

**Primary Dependencies**: Next.js 16.4.5 (App Router), Tailwind CSS 3.4, `react-markdown` 10.1.0 (already installed, already used by `MarkdownBody`). **No new dependency.** Framer Motion is not needed (CSS opacity fade).

**Storage**: None. Conversation is in-memory React state only (FR-011, FR-012).

**Testing**: no test framework in the repo and none is added. Verification is `npm run lint`, `npm run build`, scratch scripts and a mock agent server under `.tmp/` (gitignored), browser checks, Lighthouse; see [quickstart.md](quickstart.md)

**Target Platform**: Static site on Vercel; evergreen browsers (native `<dialog>.showModal()`, `fetch` streaming)

**Project Type**: Web application (single Next.js project)

**Performance Goals**: Home page Lighthouse Performance and Accessibility at or above 90 and no drop greater than 3 points vs the baseline measured before implementing (best of 3 runs for both). Visible feedback (Searching state) within 1 s of sending; first answer text typically under 15 s and full answers 10 to 45 s (service latency, owner observation on production). Idle timeout 30 s, no total timeout (FR-026).

**Constraints**: All routes stay static (route table in `npm run build` unchanged apart from nothing new). No request to the service on page load. No cookies or browser storage. No horizontal overflow at 360px. No CSP exists today and none is added.

**Scale/Scope**: 5 new source files (`ChatWidget.tsx`, `ChatPanel.tsx`, `ChatMarkdown.tsx`, `hooks/useChat.ts`, `lib/chatStream.ts`), 3 edited (`layout.tsx`, `translations.ts`, `Footer.tsx`), `CLAUDE.md` and docs for the feature. No constitution amendment.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design: unchanged.*

| Principle | Status | Note |
|-----------|--------|------|
| I. Stack Fidelity | PASS | No dependency added. Native `<dialog>` instead of a modal library; CSS opacity transition instead of a second animation mechanism; `react-markdown` already in `package.json`. No UI kit |
| II. Component Conventions | PASS | Functional components, named exports, no `any`. `layout.tsx` stays a server component (it only renders `<ChatWidget />`). `"use client"` only on `ChatWidget`, `ChatPanel`, `ChatMarkdown` (state, effects, event handlers, `<dialog>` API; `ChatMarkdown` renders inside the already-client panel and passes function props to `react-markdown`) and `useChat` consumers. `useChat.ts` and `chatStream.ts` need no directive (same as `useLanguage.ts`). All new files are inside existing folders (`components/`, `hooks/`, `lib/`), so no amendment is needed (constitution 1.3.0); they are added to the `CLAUDE.md` tree in this PR |
| III. Mobile-First | PASS | Full-screen panel by default, side panel from `md`; 360px no-overflow is a gate (FR-023, SC-009) |
| IV. Minimal UI (NON-NEGOTIABLE) | PASS | Flat panel, hairline `border-strong`, no shadow, no `backdrop-blur`, no gradient or glow, no tinted pills; neutral CTAs (white fill primary, outline secondary); the launcher is a neutral outline pill; fade <= 150 ms |
| V. Theme Through CSS Variables | PASS | Tailwind token utilities only (`bg-surface`, `text-muted`, `border-border-strong`, ...). Accent only on links in answers and focus rings. No new color, no token change, no `DESIGN.md` change |
| VI. Bilingual Parity (NON-NEGOTIABLE) | PASS | New typed `chat` block in `Translation` plus `en` and `es`; the compiler fails if either is missing. Starters are `Three<string>`. Server error text is never displayed |
| VII. Resilient Integrations | PASS | Initial render never calls the service; panel loads lazily; every failure maps to a visible localized state; the base URL is a public endpoint in `NEXT_PUBLIC_AGENT_API_URL` (no key, token or private endpoint) |
| Stack & Design Constraints | PASS | Motion respects `prefers-reduced-motion` (global CSS block); visible focus; AA contrast using pairs already verified in `DESIGN.md`; no invented facts (all copy is neutral; the three starters come from the request) |
| Development Workflow | PASS | Feature branch; lint and build gate each checkpoint; browser check at 360px and desktop; Lighthouse gate in tasks; Conventional Commits |

No violations; Complexity Tracking not needed. Two things to record, not violations:

- The launcher and the WhatsApp button are positioned by matching hard-coded offsets (WhatsApp is not edited). If the WhatsApp size or offsets change, the launcher offsets must change with them; this coupling is documented in a code comment and in research R7.
- `NEXT_PUBLIC_AGENT_API_URL` is inlined at build time (Next.js docs, environment variables). The owner must set it for the Vercel Production environment before the first production build that contains this feature.

## Project Structure

### Documentation (this feature)

```text
specs/008-ai-chat-widget/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── agent-api.md      # consumed (read-only) contract of the existing agent service
├── mocks/
│   └── launcher-layout.html
├── checklists/requirements.md
└── tasks.md              # created by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   └── layout.tsx               # EDIT: render <ChatWidget /> next to <WhatsAppButton />
├── components/
│   ├── ChatWidget.tsx           # NEW (client): launcher + owner of chat state; lazy-loads the panel
│   ├── ChatPanel.tsx            # NEW (client): <dialog> UI; loaded with next/dynamic (ssr: false)
│   ├── ChatMarkdown.tsx         # NEW (client): safe markdown renderer for assistant answers
│   └── Footer.tsx               # EDIT: bottom clearance (pt-8 pb-36) for the stacked floating buttons
├── hooks/
│   └── useChat.ts               # NEW: state machine + fetch streaming
└── lib/
    ├── chatStream.ts            # NEW: pure helpers (SSE parser, Retry-After, availability, constants)
    └── translations.ts          # EDIT: typed chat block, EN and ES
CLAUDE.md                        # EDIT: tree + NEXT_PUBLIC_AGENT_API_URL
.tmp/                            # scratch checks and mock agent server (gitignored, never committed)
```

**Structure Decision**: single Next.js project, flat files in the existing `components/`, `hooks/` and `lib/`
folders. No new folder under `src/`, so no constitution amendment (Principle II as amended in 1.3.0).

## Phase 0 and Phase 1 outputs

- [research.md](research.md): decisions R1 to R14, with rejected alternatives and the watch-outs from the brief.
- [data-model.md](data-model.md): `Message`, `Conversation`, `ChatStatus` and the transitions.
- [contracts/agent-api.md](contracts/agent-api.md): the consumed API contract, verbatim from the owner's request.
- [quickstart.md](quickstart.md): every verification check with commands; browser-only and owner-only checks marked.

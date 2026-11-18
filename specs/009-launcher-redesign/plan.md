# Implementation Plan: Chat Launcher Redesign (single dock)

**Branch**: `009-launcher-redesign` | **Date**: 2026-11-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/009-launcher-redesign/spec.md`

## Summary

Replace the two floating buttons (outline "Ask about Luis" pill stacked above the green WhatsApp circle) with one
fixed dock at the bottom-right: a pill with two segments, the assistant segment (primary) and a WhatsApp segment
(secondary, neutral white glyph). Below `md` the assistant segment is a sparkle icon plus "Ask about Luis"; from
`md` it widens into an input-style field ("Ask anything about Luis…" plus an "AI" hint). Activating it opens the
existing lazy-loaded chat panel exactly as today (no prefill). `ChatWidget` renders the dock; `WhatsAppButton`
is kept but becomes the non-floating WhatsApp segment. Only the launcher entry point changes: panel, `useChat`,
`chatStream` and the agent API contract (008) are untouched. Owner decision 2026-11-17: option D of
[mocks/launcher-options.html](mocks/launcher-options.html), neutral white WhatsApp glyph. Decisions and rejected
alternatives: [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript (strict), React 19, Node 24

**Primary Dependencies**: Next.js 16.4.5 (App Router), Tailwind CSS 3.4. **No new dependency.** Framer Motion is not used by the dock (no motion added).

**Storage**: None.

**Testing**: no test framework in the repo and none is added. Verification is `npm run lint`, `npm run build`, headless-Chrome scripts under `.tmp/` (gitignored) for layout and DOM checks, Lighthouse run with `npx` (not added to `package.json`); see [quickstart.md](quickstart.md)

**Target Platform**: Static site on Vercel; evergreen browsers

**Project Type**: Web application (single Next.js project)

**Performance Goals**: Home-page Lighthouse Performance and Accessibility at or above 90 and no drop greater than 3 points versus the baseline (best of 3 runs each, baseline built from `upstream/master`). The panel chunk is still not in the initial load.

**Constraints**: Routes stay static. No request on page load. No storage. No horizontal overflow at 360px in EN and ES. Dock height plus margin (max 56 + 24 = 80px) stays inside the Footer's 144px bottom clearance (`pb-36`, unchanged). Each segment at least 44×44px.

**Scale/Scope**: 0 new source files. Edited: `ChatWidget.tsx`, `WhatsAppButton.tsx`, `layout.tsx`, `translations.ts`; docs: `CLAUDE.md` tree line, a pointer note in `specs/008-ai-chat-widget/spec.md`. No constitution amendment (see risk below).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design: unchanged.*

| Principle | Status | Note |
|-----------|--------|------|
| I. Stack Fidelity | PASS | No dependency added; Tailwind utilities and inline SVG only. No UI kit |
| II. Component Conventions | PASS | Functional components, named exports, no `any`. `layout.tsx` stays a server component (it renders `<ChatWidget />`, a client component, as today). `WhatsAppButton` already has `"use client"` (reads language context). No new files, so no structure change |
| III. Mobile-First | PASS | Compact dock by default; `md:` adds the input-style form. 360px no-overflow in EN and ES is a verification gate |
| IV. Minimal UI (NON-NEGOTIABLE) | PASS | Flat neutral pill: hairline `border-strong` outline, no shadow, glow, gradient, blur, pulse or tinted badge. White-on-ink glyph; the "AI" hint is a plain bordered text label, no tint. Removes the saturated green fill ("when in doubt, remove decoration"). Neutral CTA: no accent |
| V. Theme Through CSS Variables | PASS | Tokens only: `bg-surface`, `hover:bg-surface-2`, `text-foreground`, `text-muted`, `border-border-strong`, `border-border` (decorative chip hairline only). Accent appears only as the existing global focus ring. The WhatsApp brand green `#25D366` is no longer used by the button (the exemption is simply unused; the constitution is not changed) |
| VI. Bilingual Parity (NON-NEGOTIABLE) | PASS | Two new typed strings (`chat.launcherInput`, `chat.launcherHint`) in `Translation`, `en` and `es`; compiler fails if one is missing. Existing `chat.launcher` and `a11y.whatsapp` reused |
| VII. Resilient Integrations | PASS | No external call added; the dock renders without the service; panel still lazy with `ssr: false` |
| Stack & Design Constraints | PASS | No motion added (hover is a colour change), so `prefers-reduced-motion` holds; visible focus via the global `:focus-visible`; contrast pairs listed in research R5 meet AA; no invented facts (copy is the owner-approved mock copy) |
| Development Workflow | PASS | Feature branch; lint and build at every checkpoint; browser check at 360px and desktop; Lighthouse gate in tasks; Conventional Commits |

No violations; Complexity Tracking not needed. Risks to record (not violations):

- The constitution's structure list describes `WhatsAppButton.tsx` as "(floating contact button)". After this feature the file is the WhatsApp segment of the launcher dock. The list is explicitly "key files, not an exhaustive inventory" and the file name, folder and role (WhatsApp contact) are unchanged, so no amendment is requested; the `CLAUDE.md` tree line is updated. The owner decided (2026-11-17) to leave the descriptor and note a waiver rather than amend in this PR.
- Owner waiver 2026-11-17: the constitution descriptor "(floating contact button)" is left as is in this PR; the owner may reword it later through `/speckit-constitution` as a separate PATCH.
- Stale mentions found by the diff review, left unchanged under the same owner waiver (2026-11-17, owner): the constitution and `DESIGN.md` still list the WhatsApp `#25D366` fill as an allowed third-party exception although no code uses it now (the exemption is permissive), and `PRODUCT.md` says "a floating WhatsApp button". Rewording is a possible later PATCH through `/speckit-constitution`.
- The WhatsApp segment has no visible text label on any viewport (the old desktop hover label was removed; accessible name unchanged). This follows the owner-approved mock (2026-11-17).
- Supersedes 008 FR-002 and SC-009 (launcher stacked above WhatsApp). A pointer note is added to the 008 spec; the rest of 008 stays in force.

## Project Structure

### Documentation (this feature)

```text
specs/009-launcher-redesign/
├── plan.md              # This file
├── research.md          # Phase 0: decisions R1-R7
├── data-model.md        # Phase 1: component state (no persisted data)
├── quickstart.md        # Phase 1: validation scenarios
├── contracts/
│   └── launcher-ui.md   # Phase 1: UI contract of the dock
├── mocks/
│   └── launcher-options.html   # Owner-approved options mock (option D chosen)
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── layout.tsx                  # EDIT: stop rendering <WhatsAppButton />; ChatWidget composes it
├── components/
│   ├── ChatWidget.tsx              # EDIT: render the fixed dock (assistant button + WhatsApp segment)
│   └── WhatsAppButton.tsx          # EDIT: non-fixed WhatsApp segment, white glyph, no tooltip label
└── lib/
    └── translations.ts             # EDIT: chat.launcherInput, chat.launcherHint (EN, ES, type)
CLAUDE.md                           # EDIT: WhatsAppButton tree comment
specs/008-ai-chat-widget/spec.md    # EDIT: pointer note (launcher arrangement superseded by 009)
```

**Structure Decision**: Existing single Next.js project; all changes inside existing folders and files. Untouched:
`ChatPanel.tsx`, `ChatMarkdown.tsx`, `hooks/useChat.ts`, `lib/chatStream.ts`, `Footer.tsx`, the agent API contract.

## Phase 1 design summary

- **Dock container** (in `ChatWidget`, rendered only while the panel is closed): `fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6`, `flex items-stretch rounded-full border border-border-strong bg-surface`, height `h-12 sm:h-14`.
- **Assistant segment**: `<button>` with the existing `launcherRef`, click handler (hostname check in the handler, never in render), `onPointerEnter`/`onFocus` prefetch, `aria-haspopup="dialog"`, `aria-expanded`. Content: inline sparkle SVG (`aria-hidden`), `<span class="md:hidden">` compact label, `<span class="hidden md:inline">` input-style text, hint chip `hidden md:inline-flex`. Hidden spans are `display: none`, so the accessible name always equals the visible text (label-in-name).
- **Divider**: 1px `bg-border-strong` between segments.
- **WhatsApp segment** (`WhatsAppButton`): `<a>` same URL, message and `aria-label`, `target="_blank" rel="noopener noreferrer"`, `w-12 sm:w-14`, centred white glyph via `currentColor`, `hover:bg-surface-2`.
- **Focus**: global `:focus-visible` ring; negative `outline-offset` on both segments; segments carry the outer radii (`rounded-l-full`, `rounded-r-full`) and the container has no `overflow-hidden`, so the ring is never clipped (verified visually).
- **Closing**: existing effect returns focus to `launcherRef` when the panel closes (button remounts, effect runs).

# Quickstart: validating the launcher redesign

Scratch scripts and outputs go in `.tmp/` (gitignored). Chrome: `C:/Program Files/Google/Chrome/Application/chrome.exe`.

## Prerequisites

```powershell
npm ci
npm run lint
npm run build
npm run start   # production server on http://localhost:3000 (stop only the PID you started)
```

## Baseline (before the change)

Build `upstream/master` in a separate worktree under `.tmp/`, serve it on another port, run Lighthouse on `/` three times (`npx lighthouse http://localhost:<port> --only-categories=performance,accessibility`), keep the best Performance and best Accessibility.

## Checks the agent runs

| # | Check | Expected | Spec |
|---|-------|----------|------|
| 1 | `npm run lint` and `npm run build` | Pass, route table unchanged | Workflow |
| 2 | Headless screenshots at 360, 767, 768, 1280 px, EN and ES, top and end of `/`, `/blog`, a post, a 404 | One dock; compact below 768, input-style from 768; Footer and Contact links uncovered | FR-001..004, FR-009, SC-001, SC-004 |
| 3 | DOM script: bounding boxes of both segments | Each >= 44×44; same height; `scrollWidth <= clientWidth` at 360 (EN, ES) | FR-002, FR-008, SC-003 |
| 4 | DOM script: fixed elements in the bottom-right | Exactly one while closed | SC-001 |
| 5 | DOM/accessibility tree: names | At 360: "Ask about Luis"; at 1280: "Ask anything about Luis… AI"; WhatsApp: "Chat on WhatsApp"; ES equivalents | FR-012, R4 |
| 6 | Tab order from page start | Assistant, then WhatsApp; both show a visible ring (not clipped) | FR-008 |
| 7 | Click assistant, then Esc | Panel opens with textarea focused and empty; after close focus is on the assistant segment | FR-005, FR-010 |
| 8 | WhatsApp `href` and `rel` | Same URL and message as `upstream/master` for EN and ES | FR-007 |
| 9 | `prefers-reduced-motion` emulation | No transition on the dock | FR-013 |
| 10 | Grep the diff for `#25D366`, `shadow`, `blur`, `gradient`, `accent` in the dock | None in the dock | FR-013 |
| 11 | Initial-load network or build output | Panel chunk not requested on load; requested on first hover/focus/open | FR-011, SC-007 |
| 12 | Lighthouse x3 after | Performance and Accessibility >= 90 and no drop > 3 vs baseline | SC-006 |
| 13 | Non-production host (`http://127.0.0.1:3000` is allowed; use the LAN IP or a hosts alias) | Panel says "Assistant available on luisjacho.dev" | FR-014 |

## Owner checks (Vercel preview, browser only)

1. On a real phone: one dock, assistant obviously primary, thumb reach, WhatsApp opens the right chat.
2. On a laptop: input-style field reads as an invitation; click opens the panel with the cursor ready.
3. Screen reader: the assistant segment announces the visible text; WhatsApp announces "Chat on WhatsApp".
4. Switch to Spanish at 360px: no clipped text.

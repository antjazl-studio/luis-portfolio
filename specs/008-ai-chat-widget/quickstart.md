# Quickstart: validating the chat widget

Shell: Git Bash or PowerShell 5.1 (no `&&` in PowerShell). Scratch files live in `.tmp/` (gitignored, never
committed). Legend: **[auto]** I run it; **[browser]** driven in a real browser by me when a browser tool is
available, otherwise listed for the owner; **[owner]** only the owner can do it (Vercel, production).

## Prerequisites

- Node 24, `npm install` done.
- Baseline first (before any implementation commit): Lighthouse on the home page, best of 3, Performance and Accessibility (task T-baseline). Record numbers in `research.md` or `tasks.md` notes.

## Checks

| ID | What | How | Expected |
|----|------|-----|----------|
| C-01 [auto] | Lint and build | `npm run lint` then `npm run build` | Both pass; route table lists the same static routes as before (`/`, `/blog`, `/blog/[slug]`, `/_not-found`), none became dynamic |
| C-02 [auto] | Stream parser | Scratch script `.tmp/check-stream.ts` run with `node` (Node 24 type stripping) against `src/lib/chatStream.ts` | Splits at every byte boundary give the same events; `\r\n` works; malformed JSON and unknown types ignored; `replace` after `text` yields replacement only; Retry-After: `5`, `0`, `9999`, HTTP date, garbage, missing give 5, 1, 3600, seconds-to-date, 30, 30; `isChatAvailable` true for the 4 allowed hosts, false for `preview-x.vercel.app`, `luisjacho.dev.evil.com`, `evilluisjacho.dev` |
| C-03 [auto] | Mock agent | `node .tmp/mock-agent.mjs <port>` serving `POST /chat` with CORS for `http://localhost:3000` and scenarios chosen by the last user message (`ok`, `tool`, `replace`, `422`, `429`, `503`, `cut`, `empty`, `hostile`, `slow`, `stall`) with realistic timing: `tool` and `ok` emit the `tool` event after ~5 s, then stream text over ~10 s; `stall` sends headers and one chunk, then no bytes for over 30 s | Server starts; `curl -N -X POST` shows the events at those delays |
| C-04 [browser] | Happy path | `NEXT_PUBLIC_AGENT_API_URL=http://127.0.0.1:<port> npm run dev`, open `http://localhost:3000` | Launcher visible; open; 3 starters; choosing one streams an answer; `tool` shows the searching state; follow-up works; `replace` shows only the replacement |
| C-05 [browser] | Limits | Type 2001 chars; send 10 turns | Counter and block over 2000; at 20 messages input disabled and "Start a new conversation" clears all |
| C-06 [browser] | Errors | Scenarios `422`, `429` (Retry-After 5), `503`, `cut`, `empty`, server stopped | Distinct localized messages; 429 countdown disables send then re-enables; 422 restores text; no status code or server text visible; page unaffected |
| C-06b [browser] | Latency and idle timeout | Scenario `tool` (tool at ~5 s, text over ~10 s): Searching state visible within 1 s of sending and until the first text; the ~15 s answer completes without any timeout. Scenario `stall`: after 30 s of silence the "took too long" error appears, the visitor message is kept, one Retry click resends it | No total timeout cuts a slow answer; idle timeout fires at 30 s (+/- 1 s); no duplicate visitor message after Retry |
| C-07 [browser] | Safe markdown | Scenario `hostile` (script, img onerror, `javascript:` and `data:` links, nested HTML) | No script runs; no `<script>`, `<img>`, `<iframe>` in the panel DOM; `javascript:` and `data:` links not clickable; `https` links have `target="_blank"` and `rel="noopener noreferrer"` |
| C-08 [browser] | Privacy | After a full conversation: devtools Application tab or `document.cookie`, `localStorage.length`, `sessionStorage.length` | `""`, 0, 0 (nothing written by the widget) |
| C-09 [auto] | No CSP | `curl -sI http://localhost:3000` (against `npm run build` + `npm start`) | No `content-security-policy` header |
| C-10 [browser] | Keyboard and focus | Tab to launcher, Enter; Tab cycle inside panel; Esc | Focus enters the panel; stays inside; visible focus ring on every control; Esc closes; focus on launcher |
| C-11 [browser] | Responsive | 360x640 and 1280x800 | Mobile full screen, no horizontal scroll (also with a 200-char unbroken word in an answer); desktop side panel 400px; launcher above WhatsApp with no overlap at both widths; last footer links reachable and not covered |
| C-12 [browser] | Reduced motion | Emulate `prefers-reduced-motion: reduce` | No fade or transition |
| C-13 [browser] | EN/ES | Switch the language with the panel closed mid-conversation, then reopen (the modal dialog makes the navbar inert while open) | Every widget string switches (title, starters, disclaimer, counter, errors, aria-labels); conversation kept; grep shows both `en.chat` and `es.chat` populated |
| C-14 [browser] | Non-production origin | Open a production build (`npm run build` then `npx next start`) through a non-allowed host such as `http://127.0.0.2:<port>` (`next dev` blocks non-localhost origins, so the page would not hydrate) | Opening the panel shows "Assistant available on luisjacho.dev" (and ES), no input, zero requests to the API in the network panel |
| C-15 [browser] | Hydration | Open `/`, `/blog`, a post, `/blog/nope`, `/nope` | No console errors, no hydration warnings |
| C-16 [auto] | Lighthouse | Home page, best of 3, after implementation | Performance >= 90 and Accessibility >= 90, and no drop > 3 points vs baseline |
| C-17 [owner] | Vercel Production env | Set `NEXT_PUBLIC_AGENT_API_URL=https://api.luisjacho.dev` for Production before the production build | Without it production falls back to `127.0.0.1:8000` and shows "service unavailable" |
| C-18 [owner] | Preview | Open the Vercel preview of the PR (fork PRs need owner authorization) | Launcher visible; panel shows "Assistant available on luisjacho.dev"; page normal |
| C-19 [owner] | Production, real API | After merge, on `https://luisjacho.dev`: ask each starter in EN and ES | Streams a real answer; answers are not verified by me (they come from the service) |

## Notes

- Mock server and scratch scripts are local tools only; they are not part of the PR.
- If no browser tool is available in the session, every **[browser]** row moves to the owner checklist in the PR and the hand-off says so under "Not verified".

---

description: "Task list for the Ask about Luis chat widget (feature 008)"
---

# Tasks: "Ask about Luis" AI Chat Widget

**Input**: Design documents from `/specs/008-ai-chat-widget/`

**Prerequisites**: plan.md, spec.md, research.md (R1 to R14), data-model.md, contracts/agent-api.md, quickstart.md (C-01 to C-19)

**Tests**: No test framework exists and none is requested or added. Verification tasks use the quickstart checks, a scratch script and a mock agent server under `.tmp/` (gitignored, never committed).

**Conventions**: `[P]` = can run in parallel (different files, no dependency on an incomplete task). `[OWNER]` = only the owner can do it. `[BROWSER]` = needs a real browser; if no browser tool is available in the session it moves to the owner checklist and is reported under "Not verified". Each phase ends with a checkpoint: `npm run lint` and `npm run build` must pass, then commit with a Conventional Commit message ending with the attribution line given by the session. Stage files by explicit path; never `git add -A` (the untracked `scripts/` folder belongs to the owner and must not be committed). Run dev or production servers on a port chosen for the task (3107 for `next start`, 3108 for `next dev`, a free port for the mock) and stop only the process listening on that port. New files are flat inside existing folders (`components/`, `hooks/`, `lib/`); no new dependency; no change to `WhatsAppButton.tsx`, `globals.css`, `tailwind.config.ts`, `package.json`, `DESIGN.md` or the constitution.

## Phase 1: Setup (baseline BEFORE any source change)

- [X] T001 Build the unmodified branch (`npm run build`) and save the route table to `.tmp/routes-before.txt` (quickstart C-01; baseline for the "all routes stay static" constraint)
- [X] T002 Start `npx next start -p 3107`; run Lighthouse (Performance and Accessibility, mobile and desktop) 3 times against `http://localhost:3107/`; keep the best of 3 per category in `.tmp/lighthouse-baseline008.json`; stop the server by its port's PID (baseline for SC-004 and quickstart C-16; pass later: each score at least 90 and no drop greater than 3 points)
- [X] T003 Create the local mock agent server `.tmp/mock-agent.mjs` (node:http, no dependencies, port from argv) implementing `POST /chat` per `contracts/agent-api.md`: CORS for `http://localhost:3000`, `http://localhost:3107`, `http://localhost:3108` (preflight `OPTIONS`, `Access-Control-Expose-Headers: Retry-After`), SSE responses, and scenarios chosen by the last user message text: `ok` (several `text` events), `tool` (a `tool` event then text), `replace` (text then `replace` then `done`), `422`, `429` (header `Retry-After: 5`), `503`, `cut` (some text then close without `done`), `empty` (`done` only), `hostile` (markdown with `<script>`, `<img onerror>`, `[x](javascript:alert(1))`, `[x](data:text/html,x)`, `![x](https://example.com/x.png)`, `https` and `mailto` links, a 200-character unbroken word), `slow` (one word per 300 ms), `stall` (headers and one chunk, then silence for more than 30 s). Realistic timing (owner, 2026-11-17): `tool` and `ok` first emit a `tool` event after ~5 s, then stream the text over ~10 s. Smoke test with `curl -N -X POST` (quickstart C-03)
- [X] T004 Checkpoint: `git status` must show only `specs/008-ai-chat-widget/` (and `scripts/` untracked, untouched); commit with explicit paths: `docs(008): spec, plan, research, data model, contract, quickstart and tasks for the chat widget`

---

## Phase 2: Foundational (blocks every user story)

**Purpose**: shared pure logic, strings and the safe renderer that all stories use.

- [X] T005 Create `src/lib/chatStream.ts` (no `"use client"`, no dependencies, named exports, no `any`) with: constants `MAX_MESSAGES = 20` and `MAX_CHARS = 2000`; types `ChatRole = "user" | "assistant"`, `ChatEvent` (`{type:"text",text:string}`, `{type:"tool",name:string}`, `{type:"replace",text:string}`, `{type:"done"}`); `parseSseChunk(buffer: string): { events: ChatEvent[]; rest: string }` (split on `\n`, strip a trailing `\r`, keep the incomplete tail in `rest`, only `data:` lines with one optional space after the colon, `JSON.parse` in try/catch, type guards, ignore unknown types and malformed JSON); `parseRetryAfter(header: string | null, now?: number): number` (integer seconds, or HTTP date converted to seconds, clamped to 1..3600, missing or invalid gives 30); `isChatAvailable(hostname: string): boolean` (exactly `luisjacho.dev`, `www.luisjacho.dev`, `localhost`, `127.0.0.1`; no suffix matching); `IDLE_TIMEOUT_MS = 30000`; `getApiUrl(): string` using the literal expression `process.env.NEXT_PUBLIC_AGENT_API_URL` with default `http://127.0.0.1:8000` and trailing slashes stripped (research R1, R3, R5, R11; FR-009, FR-018, FR-019)
- [X] T006 [P] Add the typed `chat` block to `Translation` and to both `en` and `es` in `src/lib/translations.ts`, using exactly these keys: `launcher`, `title`, `close`, `starters` (`Three<string>`; EN exactly "What has Luis done with Azure?", "Is he available for remote roles?", "How can I contact him?"; ES natural equivalents), `startersLabel`, `disclaimer` (EN exactly "AI assistant · answers come from Luis's profile and may contain mistakes"), `placeholder`, `send`, `counter` (pattern with `{used}` and `{max}`), `overLimit`, `searching` (EN exactly "Searching Luis's profile…"), `answering`, `incomplete`, `emptyAnswer`, `timedOut`, `retry`, `newConversation` (EN exactly "Start a new conversation"), `limitReached`, `rateLimited` (with `{seconds}`), `budget`, `invalid`, `unavailable`, `unavailableHere` (EN exactly "Assistant available on luisjacho.dev"), `you`, `assistant`, `messagesLabel`. Error copy points to the existing contact options (email, LinkedIn, WhatsApp) and states no fact about Luis (FR-006, FR-007, FR-017, FR-021, FR-025; Principle VI)
- [X] T007 [P] Create `src/components/ChatMarkdown.tsx` (`"use client"`, named export `ChatMarkdown({ source: string })`) per research R8: `react-markdown` with `skipHtml`, `allowedElements={["p","strong","em","ul","ol","li","a","code","br"]}`, `unwrapDisallowed`, no `remark-gfm`, no `rehype-raw`; custom `urlTransform` that returns the URL only when its parsed protocol is `http:`, `https:` or `mailto:` (relative URLs and everything else give `""`); `a` renders `target="_blank" rel="noopener noreferrer"` for `http(s)` and a plain anchor for `mailto:`; compact token-only classes (`text-foreground`, `text-accent underline underline-offset-[3px] hover:text-accent-hover` for links only, `break-words`, `min-w-0`) (FR-015, FR-022, FR-023)
- [X] T008 [P] Write `.tmp/check-stream.ts` (run with `node .tmp/check-stream.ts` using Node 24 type stripping; import `../src/lib/chatStream.ts`; if the extension import is a problem, copy the file to `.tmp/` first) covering quickstart C-02: splitting one SSE payload at every byte boundary yields identical events; `\r\n` input; malformed JSON and unknown types ignored; `replace` after `text`; `parseRetryAfter` for `"5"`, `"0"`, `"9999"`, an HTTP date, `"garbage"`, `null` giving 5, 1, 3600, seconds-to-date, 30, 30; `isChatAvailable` true for the four allowed hosts and false for `preview-x.vercel.app`, `luisjacho.dev.evil.com`, `evilluisjacho.dev`, `""`. Save the output to `.tmp/check-stream-output.txt`; all assertions must pass before the T009 checkpoint commit
- [X] T009 Checkpoint: `npm run lint` and `npm run build` pass; run `.tmp/check-stream.ts` (T008) and require all assertions to pass; commit `feat(chat): stream parser, strings and safe markdown renderer (008)`

---

## Phase 3: User Story 1 (P1) MVP: ask a question and read a streamed answer

**Goal**: the visitor opens the launcher, picks a starter or types, and reads a streamed answer with the searching state and replace handling (FR-001, FR-003, FR-006 to FR-011, FR-015, FR-020 part).

**Independent Test**: quickstart C-04 and C-07 against the mock server.

- [X] T010 [US1] Create `src/hooks/useChat.ts` (named export `useChat`; no `"use client"` needed, same as `useLanguage.ts`) per data-model.md: state `messages: Message[]`, `status` (`idle | streaming | rate-limited | error | full`), in-progress answer `{ text, searching }`; `send(text)` posts `${getApiUrl()}/chat` with `Content-Type: application/json`, body `{"messages":[{role,content}]}` containing only role and content of the whole conversation with the new visitor message last, `credentials: "omit"`, `cache: "no-store"`, an `AbortController`; read `response.body.getReader()` with `new TextDecoder("utf-8")` and `decoder.decode(chunk, { stream: true })` (the `stream` option belongs to `decode`, not the constructor), feed `parseSseChunk`; `text` appends, `tool` sets `searching` until the first text (and `searching` is already true from the moment of sending, so feedback shows within 1 s), `replace` sets the answer to exactly the payload discarding earlier text, `done` finalizes into an assistant message (an empty final text is never appended); coalesce appends per `requestAnimationFrame` and flush synchronously on `replace`, `done` and stream end; abort on unmount; `AbortError` is not an error. Visitor text is the trimmed input; send is allowed only when trimmed length is 1 to 2000 characters ("max 20 messages, max 2000 chars each") and `messages.length <= 19` and status is `idle` (FR-009, FR-010, FR-011, research R10, R11). Error and limit handling beyond the happy path is added in Phase 5
- [X] T011 [US1] Create `src/components/ChatPanel.tsx` (`"use client"`, named export `ChatPanel`) with the visual structure only (dialog behaviour is refined in Phase 4): header (title, close button), scrollable message list (visitor text as plain text in `whitespace-pre-wrap break-words`, assistant text via `ChatMarkdown`), three starters from `translations[language].chat.starters` shown only when the conversation is empty and sending the chosen text, the always-visible `disclaimer`, a textarea (Enter sends, Shift+Enter newline, `text-base` on mobile) and a send button, the `searching` line while `searching` and the in-progress bubble with `aria-busy`. Neutral flat tokens only (Principle IV and V): `bg-surface`, `border-border-strong`, primary button `bg-white text-neutral-900`, no shadow, no blur, no gradient (FR-006 to FR-009, FR-022)
- [X] T012 [US1] Create `src/components/ChatWidget.tsx` (`"use client"`, named export `ChatWidget`): calls `useChat()`, keeps `open` and `everOpened` state, renders the launcher button (neutral outline pill, label from `chat.launcher`, `min-h-[44px]`, `fixed right-4 sm:right-6 z-50`, `bottom-[76px] sm:bottom-[92px]`, `aria-haspopup="dialog"`, `aria-expanded`, hidden while open) with a code comment naming the coupling to `WhatsAppButton.tsx` offsets (research R7), and, once opened for the first time, the panel loaded with `next/dynamic(() => import("./ChatPanel").then((m) => m.ChatPanel), { ssr: false })`; prefetch the chunk on launcher `onPointerEnter` and `onFocus` with a dynamic `import("./ChatPanel")`. It MUST NOT read `usePathname` or `window.location` during render (FR-001, FR-003; hydration rule from 007)
- [X] T013 [US1] Edit `src/app/layout.tsx`: import `ChatWidget` and render `<ChatWidget />` right after `<WhatsAppButton />` inside `LanguageProvider`; the file stays a server component with no `"use client"` (FR-001; Principle II)
- [X] T014 [US1] Edit `src/components/Footer.tsx`: replace the `py-8` on the `<footer>` with `pt-8 pb-36` so the stacked floating buttons (top edge 120px on mobile, 136px from `sm`) never cover the last footer links (FR-002; research R7)
- [X] T015 [US1] Checkpoint: `npm run lint` and `npm run build` pass; the route table equals `.tmp/routes-before.txt`; commit `feat(chat): launcher, streamed answers and safe markdown panel (008)`
- [X] T016 [US1] [BROWSER] Quickstart C-04 and C-07: start the mock (T003) and `NEXT_PUBLIC_AGENT_API_URL=http://127.0.0.1:<port> npm run dev -- -p 3108`; verify scenarios `ok`, `tool`, `replace`, `slow`, `hostile` (no script runs, no `script`/`img`/`iframe` in the panel DOM, `javascript:` and `data:` links not clickable, `https` links open in a new tab with `rel="noopener noreferrer"`); fix and re-run until they pass; stop the dev server by its port's PID

---

## Phase 4: User Story 2 (P1): keyboard, assistive technology, responsive and motion

**Goal**: native modal dialog behaviour, focus management, announcements, mobile full screen and desktop side panel, reduced motion (FR-003 to FR-005, FR-022, FR-023).

**Independent Test**: quickstart C-10, C-11, C-12.

- [X] T017 [US2] In `src/components/ChatPanel.tsx` make the root a native `<dialog>` opened with `showModal()` when the `open` prop becomes true and closed with `close()` when false; `aria-labelledby` the title; handle the `close` event (covers Esc) by calling `onClose`; on open focus the textarea; layout per research R6: mobile `fixed inset-0 h-[100dvh] w-full max-w-none m-0 p-0 rounded-none`, from `md` `inset-auto bottom-6 right-6 w-[400px] h-[min(640px,calc(100dvh-3rem))] rounded-[14px] border border-border-strong`, transparent `::backdrop` on `md` and up, no shadow, no blur; `overscroll-contain` on the list; opacity transition of at most 150 ms (no JS motion code). Pass `open`, `onClose`, `launcherRef`, and the chat state as props from `ChatWidget` (FR-003, FR-004, FR-005, FR-022, FR-023)
- [X] T018 [US2] In `src/components/ChatWidget.tsx` create the `launcherRef` and, in `onClose`, set `open` false and call `launcherRef.current?.focus()` after the launcher is visible again (use an effect keyed on `open` so the focus call happens after render) (FR-004)
- [X] T019 [US2] In `src/components/ChatPanel.tsx` add the announcements per research R9: a visually hidden `role="status" aria-live="polite"` element announcing `searching`, `answering` and the final answer text once complete; errors rendered with `role="alert"`; the message list is NOT a live region; `aria-busy` on the in-progress bubble; every control at least 44x44px (`min-h-11 min-w-11`); scroll to bottom while streaming unless the visitor scrolled up; long words break (`break-words`, `min-w-0`) (FR-005, FR-023)
- [X] T020 [US2] Checkpoint: `npm run lint` and `npm run build` pass; commit `feat(chat): modal dialog focus, announcements and responsive layout (008)`
- [X] T021 [US2] [BROWSER] Quickstart C-10, C-11, C-12: keyboard-only open, Tab cycle stays inside, visible focus ring everywhere, Esc closes and focus is on the launcher; 360x640 and 1280x800 (full screen vs 400px panel, no horizontal scroll even with the 200-character word from scenario `hostile`, launcher above WhatsApp with no overlap, last footer links reachable); emulated `prefers-reduced-motion: reduce` shows no transition; save screenshots to `.tmp/shots/`; fix and re-run until they pass

---

## Phase 5: User Story 3 (P2): limits and errors

**Goal**: counter and blocking, 20-message limit, rate limit countdown, budget, invalid input, service-down and incomplete-stream states (FR-013, FR-014, FR-016, FR-017, FR-020).

**Independent Test**: quickstart C-05, C-06.

- [X] T022 [US3] In `src/hooks/useChat.ts` implement the failure rules of data-model.md: non-2xx status mapping (422 gives `error:invalid`, removes the visitor message from the conversation and returns its text to the caller so the input is restored; 429 gives `rate-limited` with `until = now + parseRetryAfter(response.headers.get("Retry-After")) seconds` and keeps the visitor message with `failed = true`; 503 gives `error:budget` and keeps it with `failed = true`; any other status or a thrown `TypeError` gives `error:unavailable` and keeps it); stream ended without `done` with text gives `error:incomplete` (partial answer kept as an assistant message with `incomplete = true`) and without text gives `error:unavailable`; `done` with empty text gives `error:empty`; idle timeout (FR-026, research R11): NO total timeout; arm a 30 s `IDLE_TIMEOUT_MS` timer at send, re-arm it each time `reader.read()` returns bytes (and on response headers), clear it on done, error, abort and unmount; when it fires abort with a flag so it is not treated as a user abort: no text gives `error:timeout` (visitor message kept, `failed = true`), partial text gives `error:incomplete`; `retry()` resends the same conversation without duplicating the visitor message (the failed message is reused); `startNewConversation()` aborts any request and clears messages, error and countdown; status becomes `full` when `messages.length` reaches 20 with no pending turn. The server's `error` text is never read or shown (FR-014, FR-016, FR-017)
- [X] T023 [US3] In `src/components/ChatPanel.tsx` render the states with the strings from T006: character counter `{used} / 2000` (not a live region), over-limit message and disabled send when the trimmed text is empty or longer than 2000 characters; `full` state with the `limitReached` message, disabled input and a "Start a new conversation" button (secondary outline style); `rate-limited` countdown text with `{seconds}` that ticks once per second, disables send until it ends and keeps the typed text; `budget`, `invalid`, `unavailable`, `incomplete`, `emptyAnswer`, `timedOut` messages in a `role="alert"` block with a Retry button where retry makes sense and the contact pointers for `budget` and `unavailable`; a "Start a new conversation" action also available once the conversation is non-empty (shipped as a text button above the disclaimer, not in the header, to keep the header uncluttered at 360px) (FR-013, FR-014, FR-016, FR-017)
- [X] T024 [US3] Checkpoint: `npm run lint` and `npm run build` pass; commit `feat(chat): limits, rate-limit countdown and localized error states (008)`
- [X] T025 [US3] [BROWSER] Quickstart C-05 and C-06 against the mock: 2001 characters blocks send; ten turns reach the limit and "Start a new conversation" clears everything; quickstart C-06b (scenario `tool` completes in ~15 s with no timeout and shows Searching within 1 s; scenario `stall` shows the "took too long" error at 30 s with one-click Retry and no duplicate message); scenarios `422`, `429`, `503`, `cut`, `empty` and a stopped server each show their own localized message with no status code or server text; 429 re-enables send after the countdown; 422 restores the text; the rest of the page keeps working; fix and re-run until they pass

---

## Phase 6: User Story 4 (P2): graceful on non-production origins

**Goal**: previews and unknown origins show "Assistant available on luisjacho.dev" and send nothing (FR-018, FR-019, FR-020).

**Independent Test**: quickstart C-14.

- [X] T026 [US4] In `src/components/ChatPanel.tsx` compute availability once when the panel opens (inside an effect or the open handler, never during the first render) with `isChatAvailable(window.location.hostname)`; when false render only the header, the `unavailableHere` message in the active language and the close control (focus goes to the close button), render no textarea, starters or send, and make `useChat().send` unreachable so no request is ever sent (FR-018, research R5)
- [X] T027 [US4] Checkpoint: `npm run lint` and `npm run build` pass; commit `feat(chat): graceful state on non-production origins (008)`
- [X] T028 [US4] [BROWSER] Quickstart C-14: open the dev server through a host that is not allowed (the machine's LAN IP or a hosts alias); the panel shows the message in EN and ES, no input, and the network panel shows zero requests to the mock; on `localhost` the chat works; then quickstart C-15 on `/`, `/blog`, a post, `/blog/nope`, `/nope`: no console errors or hydration warnings (FR-001, SC-010)

---

## Phase 7: User Story 5 (P2): bilingual and private

**Goal**: full EN/ES parity with language switching mid-conversation, and nothing stored (FR-012, FR-021).

**Independent Test**: quickstart C-08, C-13.

- [X] T029 [US5] Audit `src/components/ChatWidget.tsx`, `ChatPanel.tsx`, `ChatMarkdown.tsx` and `useChat.ts`: no hard-coded visible or accessible string (grep for string literals in JSX and `aria-label`), no `localStorage`, `sessionStorage`, `indexedDB`, `document.cookie`, `console.log` of conversation content, analytics call or `navigator.sendBeacon`; conversation text is never put in a URL; fix any finding (FR-012, FR-021, FR-025)
- [X] T030 [US5] [BROWSER] Quickstart C-08 and C-13: after a full conversation `document.cookie` is `""`, `localStorage.length` and `sessionStorage.length` are 0; toggling EN/ES with the panel open and mid-conversation switches every widget string (title, starters, disclaimer, counter, status, errors, aria-labels) and keeps the conversation; reload empties it (SC-007, SC-008)
- [X] T031 [US5] Checkpoint: `npm run lint` and `npm run build` pass; commit only if T029 changed files: `fix(chat): bilingual and privacy audit fixes (008)`

---

## Phase 8: Polish and cross-cutting

- [X] T032 [P] Update `CLAUDE.md` (project root): add `ChatWidget.tsx`, `ChatPanel.tsx`, `ChatMarkdown.tsx` under `components/`, `useChat.ts` under `hooks/`, `chatStream.ts` under `lib/` in the structure tree, and a short note on `NEXT_PUBLIC_AGENT_API_URL` (public URL, default `http://127.0.0.1:8000`, must be set to `https://api.luisjacho.dev` for the Vercel Production environment). Leave the constitution untouched (Principle II requires the tree update in this PR)
- [X] T033 [P] Grep the repo for the old README or docs that list env vars or components (`README.md`, `docs/`) and update them if they exist; record "none found" in the PR otherwise
- [X] T034 Quickstart C-01 and C-09: `npm run lint`, `npm run build` exit 0; route table equals `.tmp/routes-before.txt`; `npx next start -p 3107` then `curl -sI http://localhost:3107` shows no `content-security-policy` header; stop the server by its port's PID
- [X] T035 Quickstart C-16: Lighthouse as in T002 on the new build; save to `.tmp/lighthouse-after008.json`; pass if Performance and Accessibility are each at least 90 and no more than 3 points below the baseline; if not, move more code behind the lazy panel and repeat
- [X] T036 Verify the diff scope: `git diff --stat upstream/master` lists only `specs/008-ai-chat-widget/**`, `src/components/{ChatWidget,ChatPanel,ChatMarkdown,Footer}.tsx`, `src/hooks/useChat.ts`, `src/lib/{chatStream,translations}.ts`, `src/app/layout.tsx` and `CLAUDE.md`; `package.json` and `package-lock.json` are unchanged; `scripts/` is not staged
- [X] T037 Reconcile documents: every decision made in conversation (owner choices of 2026-11-17: launcher option B, launcher visible on previews) is written in spec.md and plan.md with the date and "owner"; no spec, plan or task statement contradicts the shipped code; fix wording where the implementation differs; commit `docs(008): final reconciliation of spec, plan and tasks`
- [ ] T038 [OWNER] Set `NEXT_PUBLIC_AGENT_API_URL=https://api.luisjacho.dev` for the Vercel Production environment before the production build that contains this feature (quickstart C-17)
- [ ] T039 [OWNER] On the Vercel preview of the PR (fork PRs need authorization): the launcher is visible and the panel shows "Assistant available on luisjacho.dev" (quickstart C-18)
- [ ] T040 [OWNER] After merge, on `https://luisjacho.dev`: ask each starter in EN and ES and confirm real streamed answers, and that the three browser-storage checks of C-08 still pass (quickstart C-19)

---

## Verification record (feature 008, 2026-11-17/18)

- Baseline Lighthouse (best of 3, local production build): mobile 100/100, desktop 100/100 (Performance/Accessibility). After: mobile 100/100, desktop 100/100. Route table identical before/after (`/`, `/_not-found`, `/blog`, `/blog/[slug]` static).
- Browser checks were driven with puppeteer-core against system Chrome (scratch scripts in `.tmp/`, not committed): C-04/C-07 (15/15), C-10/C-11/C-12 (25/25), C-05/C-06/C-06b (40/40, including the 30 s idle timeout measured at 30.04 s and a 14 s answer that is not cut off), C-14/C-15 (28/28), C-08/C-13 (22/22). C-09: no `content-security-policy` header. C-02: 25 parser checks pass.
- C-14 was run against `next start` (production build), not `next dev`: the dev server blocks non-localhost origins' assets, so the page never hydrates there.
- Not verified by me: C-17, C-18, C-19 (owner), real-API behavior, screen-reader speech output, Safari/Firefox, touch devices.

## Requirement coverage

| Requirement | Tasks |
|-------------|-------|
| FR-001 launcher on every page, no render blocking | T012, T013, T028 |
| FR-002 no overlap with WhatsApp, content not obscured | T012, T014, T021 |
| FR-003 side panel desktop, full screen mobile | T012, T017, T021 |
| FR-004 Esc, close control, focus returns | T017, T018, T021 |
| FR-005 focus kept inside, semantics, announcements | T017, T019, T021 |
| FR-006 three starters | T006, T011 |
| FR-007 disclaimer | T006, T011 |
| FR-008 keyboard send | T011 |
| FR-009 progressive text, searching state | T005, T010, T011 |
| FR-010 replace discards streamed text | T005, T010, T016 |
| FR-011 whole conversation each turn, memory only | T010 |
| FR-012 nothing stored, no analytics | T029, T030 |
| FR-013 counter, block over 2000 | T010, T023, T025 |
| FR-014 20-message limit, new conversation | T022, T023, T025 |
| FR-015 safe markdown | T007, T016 |
| FR-016 rate limit wait | T022, T023, T025 |
| FR-017 distinct localized errors, no raw text | T006, T022, T023 |
| FR-018 non-production origin message | T005, T026, T028 |
| FR-019 configurable service address | T005, T038 |
| FR-020 site works when service is down | T022, T023, T025 |
| FR-021 EN/ES parity, language switch keeps conversation | T006, T029, T030 |
| FR-022 tokens, flat, reduced motion | T007, T011, T017 |
| FR-023 contrast, focus, 44px, no overflow | T007, T017, T019, T021 |
| FR-024 CSP | T034 (verified none exists); future requirement in research R4 |
| FR-025 no invented facts in widget copy | T006, T029 |
| FR-026 idle timeout, no total timeout | T005, T006, T010, T022, T023, T025 |
| SC-004 Lighthouse | T002, T035 |

## Dependencies and order

- Phase 1 before everything (baseline before any source change). Phase 2 blocks all stories. T008 (scratch check) runs before the T009 checkpoint commit.
- Phases 3 to 7 edit shared files (`ChatPanel.tsx`, `useChat.ts`) and therefore run sequentially in this order; they are independently verifiable by their own checks, not independently parallelizable.
- Parallel inside phases: T006, T007 and T008 (different files); T032 and T033.
- MVP: Phases 1 to 3 (the working chat). Phases 4 and 5 are required before the PR because accessibility and error handling are binding (constitution, spec P1 for US2).

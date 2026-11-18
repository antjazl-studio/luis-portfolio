# Research: "Ask about Luis" AI Chat Widget

Date: 2026-11-17. Facts marked (verified) were checked in this repository or in the installed package docs.

## R1. Stream transport: `fetch` + `ReadableStream`, not `EventSource`

- **Decision**: `fetch(POST)` and `response.body.getReader()` with `TextDecoder("utf-8", { stream: true })`; incremental line parser in `lib/chatStream.ts`.
- **Rationale**: the endpoint is POST with a JSON body; `EventSource` can only GET and cannot send a body or custom headers (owner's contract says the same).
- **Rejected**: `EventSource` (cannot POST); a library such as `@microsoft/fetch-event-source` (new dependency for ~60 lines of parsing, Principle I).
- **Parser rules**: buffer text, split on `\n`, strip a trailing `\r`, keep the incomplete tail for the next chunk, only lines starting with `data:` count (value after the first `:` with one optional leading space), `JSON.parse` in try/catch, ignore unknown `type` and malformed JSON. A multi-byte character split across chunks is handled by `TextDecoder` streaming mode.

## R2. No proxy route or server action

- **Decision**: the browser calls the public API directly.
- **Rationale**: the API is already public with CORS for the production origins (owner's contract); a proxy would add a server dependency, move the site off fully static output (Principle VII wants the site to stay up when externals fail) and double the hops of a stream.
- **Rejected**: Next.js route handler proxy, server action.

## R3. API base URL

- **Decision**: `process.env.NEXT_PUBLIC_AGENT_API_URL`, default `http://127.0.0.1:8000`, trailing slash stripped. The literal `process.env.NEXT_PUBLIC_AGENT_API_URL` expression must appear in source so Next.js inlines it (verified in `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`: inlined at build time; dynamic lookups are not inlined).
- **Rationale**: matches the owner's contract. Public endpoint, no secret (Principle VII).
- **Owner-only**: set `NEXT_PUBLIC_AGENT_API_URL=https://api.luisjacho.dev` for the Production environment in Vercel. If it is missing, production builds fall back to `127.0.0.1:8000` and the widget shows its "service unavailable" state (graceful, but useless). `.env.local` already exists locally and is gitignored (`.env*.local`).
- **Preview builds**: do not need the variable; the widget never calls the API there (R5).

## R4. Content-Security-Policy

- **Decision**: add nothing. Verified: `next.config.mjs` is empty, there is no `middleware.ts`, `src/middleware.ts`, `proxy.ts` or `vercel.json`. Quickstart check C-09 confirms with `curl -I` that no CSP header is sent.
- **Future requirement (FR-024)**: a later CSP must include `connect-src 'self' https://api.luisjacho.dev`.

## R5. Availability on previews and local development

- **Decision**: `isChatAvailable(hostname)` is true for `luisjacho.dev`, `www.luisjacho.dev`, `localhost`, `127.0.0.1`; evaluated in the lazily loaded panel (client only) when it opens, never during render of `ChatWidget`.
- **Rationale**: the hostname is unknown on the server and during hydration; reading it in render would cause a mismatch (the 007 lesson). Evaluating after open keeps the launcher markup identical on server and client.
- **Result when false**: the panel shows the localized "Assistant available on luisjacho.dev", no input, no network request (SC-010).
- **Rejected**: hiding the launcher on previews (owner decision 2026-11-17: visible); reading `VERCEL_ENV` (build-time, would diverge from the real CORS rule, which is origin-based).

## R6. Panel element: native `<dialog>` with `showModal()`

- **Decision**: native `<dialog>`; `showModal()` gives a focus trap, inert page behind, Esc handling and modal semantics with no dependency.
- **Focus**: on open, focus the textarea (or the close button when the panel has no input); on `close` event, call `launcherRef.current.focus()` explicitly because the launcher is hidden while open and re-mounted visibility toggles can defeat the browser's automatic restore.
- **Consequence (accepted)**: the page and the WhatsApp button are inert while the panel is open; on desktop the panel also covers the corner where both buttons sit. The panel's budget and error messages point the visitor to the existing contact options (copy in `translations.ts`, no new facts).
- **Rejected**: custom focus-trap code, a modal library (Principle I), a non-modal panel (spec FR-005 requires focus to stay inside).
- **Layout**: mobile `fixed inset-0`, height `100dvh`, no radius; from `md` `fixed bottom-6 right-6 w-[400px]`, height `min(640px, 100dvh - 3rem)`, radius 14px, `border border-border-strong bg-surface`, no shadow, no `backdrop-blur`, transparent `::backdrop`. Native `<dialog>` default `margin`, `max-width` and `padding` are reset.

## R7. Launcher placement (owner decision 2026-11-17, option B)

- **Decision**: neutral outline pill, `fixed right-4 sm:right-6 z-50`, stacked directly above the WhatsApp button.
- **Offsets** (derived from `WhatsAppButton.tsx`: container `bottom-4 right-4 sm:bottom-6 sm:right-6`, circle `h-12 w-12 sm:h-14 sm:w-14`): `bottom = 16 + 48 + 12 = 76px` on mobile, `24 + 56 + 12 = 92px` from `sm`. Pill `min-h-[44px]`. Launcher top edge at 120px (mobile) and 136px (sm).
- **Coupling**: the numbers are copied from `WhatsAppButton`, which is not edited. A comment in `ChatWidget.tsx` names the coupling.
- **Footer**: `Footer` gets `pt-8 pb-36` (144px bottom padding, above the 136px worst case) so the last footer links are never under the floating buttons at 360px. This is a small visual change (more empty space under the footer) and is listed for the owner in the hand-off.
- **Rejected**: A (icon-only, less discoverable), C (side by side, tight at 360px). Mock: `mocks/launcher-layout.html`.

## R8. Safe markdown rendering

- **Decision**: `react-markdown` with `skipHtml`, `allowedElements = ["p","strong","em","ul","ol","li","a","code","br"]`, `unwrapDisallowed` (verified present in `react-markdown/lib/index.d.ts`), no `remark-gfm`, no `rehype-raw`. Custom `urlTransform` returns the URL only if its protocol is `http:`, `https:` or `mailto:`, otherwise `""`.
- **Why a custom `urlTransform`**: the library default (`defaultUrlTransform`, verified in `lib/index.js`) allows `https?|ircs?|mailto|xmpp`; FR-015 allows only web and email links.
- **Links**: `http(s)` get `target="_blank" rel="noopener noreferrer"`; `mailto:` plain. Link text style: `text-accent underline underline-offset-[3px] hover:text-accent-hover` (links are the one place the accent is allowed).
- **Why no remark-gfm**: tables, strikethrough and autolinks are not part of "bold, lists, links", and every extra feature is attack surface.
- **Hostile samples to test** (all must render inert): `<script>`, `<img onerror>`, `<a href="javascript:...">`, `[x](javascript:alert(1))`, `[x](data:text/html,...)`, `![x](https://evil/x.png)` (image dropped), nested raw HTML, HTML entities.
- **Visitor text**: rendered as plain text in a `whitespace-pre-wrap` element, never through markdown.

## R9. A11y of streaming

- **Decision**: the message list is not a live region. A separate visually hidden `role="status" aria-live="polite"` element announces short states ("searching", "answering") and the final answer text once the answer completes. Errors use `role="alert"`. The in-progress bubble has `aria-busy="true"`.
- **Rationale**: a live region over text that grows token by token produces unusable repeated announcements.
- **Controls**: 44x44px minimum hit area, global `:focus-visible` outline (2px `--focus-ring`, offset 2px) already in `globals.css`, no `outline: none`.
- **Contrast pairs** (all from `DESIGN.md`): foreground on surface 19.28; muted on surface 7.52; accent on surface 6.04 (links); `border-strong` on surface 3.99 (control outlines, needs 3).
- **Input size**: `text-base` (16px) on mobile to avoid iOS zoom on focus.

## R10. State lifetime and the stream

- **Decision**: the `useChat` hook lives in `ChatWidget` (always mounted). Closing the dialog does not abort an in-flight stream; the answer keeps streaming into state and the reopened panel shows the current text or the completed answer. The stream is aborted on unmount, on "Start a new conversation" and when a new request replaces it. `AbortError` is not shown as an error.
- **Rationale**: spec edge case (close mid-answer, reopen coherent) and US5 scenario 3 (conversation survives close/reopen, lost on reload).
- **Render rate**: appended text is coalesced per animation frame (`requestAnimationFrame`) to avoid re-parsing markdown on every network chunk; on done/replace the buffer is flushed synchronously.

## R11. Limits and failure rules

- **Send rule**: allowed while `messages.length <= 19` and `1 <= text.length <= 2000` (trimmed non-empty). At 20 messages the status is `full`; the input is disabled and "Start a new conversation" is offered.
- **Never send empty content**: an assistant turn with no text is not appended to the conversation (the service would reject empty content). If a stream ends with no text the visitor sees the "no answer, try again" message.
- **Errors map by status only** (server text never displayed): 422 -> "invalid input" (message removed from the conversation and its text restored to the input); 429 -> wait N seconds from `Retry-After`, send disabled until the countdown ends, message kept with Retry; 503 -> daily budget message with contact pointers; any other status, `TypeError` (network or CORS) -> "service unavailable" with Retry. Stream ends without `done` -> keep partial text, mark incomplete, offer Retry; without text -> "no answer" error.
- **Retry-After**: integer seconds, or an HTTP date converted to seconds; clamped to 1..3600; missing or invalid -> 30 s (defensive default, kept). The service exposes the header to browsers via `Access-Control-Expose-Headers: Retry-After` (owner-confirmed 2026-11-17), so the real value is readable cross-origin.
- **Timeouts (owner, 2026-11-17)**: real latency is a tool call (3 to 10 s) then a stream; full answers take 10 to 45 s, so a total request timeout would kill normal answers and is rejected. Use an **idle timeout of 30 s** (`IDLE_TIMEOUT_MS = 30000` in `chatStream.ts`): a timer armed at send and re-armed on every `reader.read()` that returns bytes; when it fires the hook aborts the request with a flag distinguishing it from a user abort. No bytes and no text -> `error(timeout)`; partial text -> `error(incomplete)`. The visitor message is kept (`failed = true`) and Retry resends it. The timer is cleared on done, error, abort and unmount.
- **Searching feedback**: the client does not wait for the `tool` event (3 to 10 s away). From send until the first `text` or `replace`, the in-progress bubble shows the Searching state, so feedback appears within 1 s (SC-002).
- **Requests**: `credentials: "omit"`, `cache: "no-store"`, no custom headers other than `Content-Type: application/json` (keeps it a simple-ish CORS request apart from the JSON content type, which triggers a preflight the service already handles per the contract).

## R12. Motion

- **Decision**: CSS `transition: opacity` (<= 150 ms) on the dialog. The global `prefers-reduced-motion` block in `globals.css` collapses transitions (verified), so no JS is needed.
- **Rejected**: Framer Motion for the panel (extra JS in the lazy chunk, conflicts with the native dialog top layer, no benefit for a fade). Framer Motion remains the stack's animation library for anything that needs more than a fade.

## R13. Rejected alternatives (summary)

- Third-party chat UI kits (Principle I, Principle IV, bundle weight).
- Persisting the conversation in `localStorage` or `sessionStorage` (spec FR-012; owner: no stored conversation).
- A route `/chat` (out of scope).
- Server components for any chat part (needs state, effects, dialog API).
- Adding `zod` validation of events on the client (already a dependency, but event validation is four small type guards; avoids shipping zod to the client).

## R14. Verification approach without a test framework

- No test runner exists and none is added (not requested; Principle I minimalism). Pure logic (`chatStream.ts`) is exercised from a scratch script in `.tmp/` using Node 24 native TypeScript type stripping; the UI is driven against a local mock agent server in `.tmp/` that emits every event and error case. Both stay out of git (`.tmp/` is gitignored, verified). Details in `quickstart.md`.

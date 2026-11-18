# Contract: Portfolio agent API (consumed, read-only)

The service is already deployed. This feature consumes it and MUST NOT change it. The text below restates the
contract given by the owner on 2026-11-17; nothing here is inferred beyond it. Where the owner did not specify
a behavior, it is listed under "Not specified".

## Request

`POST {NEXT_PUBLIC_AGENT_API_URL}/chat` (production: `https://api.luisjacho.dev/chat`)

```json
{ "messages": [ { "role": "user" | "assistant", "content": "string" } ] }
```

- The client keeps the whole conversation and sends all of it every turn.
- The last message MUST be from the visitor (`user`).
- At most 20 messages; at most 2000 characters per message.
- CORS allows only `https://luisjacho.dev` and `https://www.luisjacho.dev`.

## Success response: Server-Sent Events

One JSON object per `data:` line:

| Event | Shape | Client behavior |
|-------|-------|-----------------|
| text | `{"type":"text","text":"..."}` | Append to the current answer |
| tool | `{"type":"tool","name":"..."}` | Show the subtle "Searching Luis's profile…" state (the `name` is not shown) |
| replace | `{"type":"replace","text":"..."}` | Discard the streamed answer; show exactly this text |
| done | `{"type":"done"}` | Answer complete |

## Error responses

JSON `{"error":"..."}`:

| Status | Meaning | Client behavior |
|--------|---------|-----------------|
| 422 | Invalid input | Localized "invalid input" message; the server text is not shown |
| 429 | Rate limited; `Retry-After` header | Localized message with the wait; sending blocked for that time |
| 503 | Daily budget reached | Localized message with contact pointers |

The server's `error` text is never displayed (FR-017); the client shows its own localized strings keyed by status.

## Latency and CORS headers (owner-confirmed 2026-11-17)

- The service first calls a tool (3 to 10 s), then streams the answer. Full answers take 10 to 45 s. First answer text is typically under 15 s (owner observation on production, not a guarantee).
- The `tool` event can therefore arrive several seconds after the request; the client shows its own "Searching" feedback within 1 s of sending, without waiting for it.
- The service sends `Access-Control-Expose-Headers: Retry-After` (owner-confirmed 2026-11-17, deployed the same day), so the browser can read `Retry-After` on a cross-origin 429.

## Not specified (client defaults, recorded so they are not mistaken for service facts)

- No total request timeout (it would kill normal answers). The client uses an idle timeout: 30 seconds without receiving any bytes aborts the request and shows a "took too long" error; the visitor's message is kept for one-action Retry (FR-026).
- `Retry-After` format: the client accepts integer seconds or an HTTP date; missing or invalid falls back to 30 seconds; clamped to 1..3600. The fallback stays even though the header is now exposed (defensive: older deployments, proxies, malformed values).
- Behavior when the stream ends without `done`: the client treats the answer as incomplete (partial text kept and marked) and offers a retry.
- Any other status or a network or CORS failure: treated as "service unavailable".
- Unknown event types and malformed `data:` lines are ignored.

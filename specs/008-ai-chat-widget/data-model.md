# Data Model: "Ask about Luis" AI Chat Widget

All data is in-memory React state. Nothing is persisted (FR-011, FR-012).

## Message

| Field | Type | Rules |
|-------|------|-------|
| `role` | `"user"` or `"assistant"` | Sent to the service as is |
| `content` | `string` | 1 to 2000 characters after trimming for visitor messages; never empty for any message sent to the service |
| `id` | `string` (client only) | Local React key; not sent to the service |
| `failed` | `boolean` (client only, visitor messages) | True when the turn failed and a Retry is offered; not sent |
| `incomplete` | `boolean` (client only, assistant messages) | True when the stream ended without `done`; the flag is not sent, but the partial text stays in the conversation and is sent as an assistant turn if the visitor writes a new message instead of using Retry (Retry drops it) |

The request body contains only `{ role, content }` per message.

## Conversation

- Ordered list of `Message`, 0 to 20 items.
- The last item sent to the service is always a visitor message.
- A visitor can send only while `messages.length <= 19` (so the request has at most 20 items).
- Lifetime: until page reload or "Start a new conversation".

## In-progress answer (not part of the Conversation until it completes)

| Field | Type | Rules |
|-------|------|-------|
| `text` | `string` | Appended by `text` events; set exactly to the payload of a `replace` event, discarding earlier text |
| `searching` | `boolean` | True from the moment of sending (feedback within 1 s) until the first `text` (or `replace`); a `tool` event keeps it true |

On `done` the answer becomes an assistant `Message` if `text` is non-empty; if empty the status becomes `error:empty`.

## ChatStatus

```text
idle                      ready for input (conversation has room)
streaming                 request in flight; input and send disabled; Esc/close allowed
rate-limited(until)       429; send disabled until `until`; countdown shown
error(kind)               kind: invalid | budget | unavailable | incomplete | empty | timeout
full                      20 messages; input disabled; "Start a new conversation"
```

`unavailable-here` (non-production origin) is not a ChatStatus: it is a panel-level view computed from the
hostname when the panel opens, and it never reaches the hook.

## Transitions

```text
idle --send (valid)--> streaming        (a failed, unanswered last visitor message is replaced by the new one)
streaming --text/tool/replace--> streaming (answer updated)
streaming --done, text non-empty--> idle (or full if messages.length == 20)
streaming --done, text empty--> error(empty)
streaming --stream ends, no done, text--> error(incomplete)  (partial kept, marked)
streaming --stream ends, no done, no text--> error(unavailable)
streaming --422--> error(invalid)       (visitor message removed, text restored to input)
streaming --429--> rate-limited(until)  (visitor message kept, failed=true)
streaming --503--> error(budget)        (visitor message kept, failed=true)
streaming --other status / TypeError--> error(unavailable) (kept, failed=true)
streaming --30 s with no bytes (idle timeout), no text--> error(timeout)    (kept, failed=true)
streaming --30 s with no bytes (idle timeout), text--> error(incomplete)   (partial kept, marked)
streaming --abort (new conversation / unmount)--> idle, no error shown
rate-limited --countdown ends--> idle (Retry available)
error(*) --send (valid)--> streaming  (error cleared; a failed last visitor message is replaced)
error(*) --Retry--> streaming (resends the same conversation; no duplicate message)
error(*) / idle / full --Start a new conversation--> idle, messages = []
```

## Validation rules (from spec)

- Visitor text: trimmed non-empty and at most 2000 characters (FR-013). The counter shows `used / 2000`.
- Conversation size: at most 20 messages (FR-014).
- Markdown in assistant text: allow-list and URL filter in `ChatMarkdown` (FR-015, research R8).

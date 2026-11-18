# Data Model: Chat Launcher Redesign

No persisted data, no new API fields, no new storage (spec FR-014; 008 data model unchanged).

## Component state (existing, unchanged)

| State | Owner | Meaning |
|-------|-------|---------|
| `open` | `ChatWidget` | Panel is open; the dock is not rendered while true |
| `everOpened` | `ChatWidget` | Panel chunk has been requested; also gates returning focus to the assistant segment |
| `available` | `ChatWidget` | Result of the hostname check, set in the click handler |
| chat state | `useChat` (008) | Untouched |

## New strings (the only data this feature adds)

| Key | EN | ES |
|-----|----|----|
| `chat.launcherInput` | Ask anything about Luis… | Pregunta lo que quieras sobre Luis… |
| `chat.launcherHint` | AI | IA |

Reused: `chat.launcher` ("Ask about Luis" / "Pregunta sobre Luis"), `a11y.whatsapp`, `contact.whatsappMessage`.

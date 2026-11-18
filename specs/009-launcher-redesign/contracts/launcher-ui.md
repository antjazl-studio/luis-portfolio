# UI Contract: Launcher dock

The agent API contract (`specs/008-ai-chat-widget/contracts/agent-api.md`) is unchanged. This file is the contract of the one new UI surface.

## Structure

One fixed container (bottom-right, `z-50`) containing, in DOM and tab order:

1. **Assistant segment**: `<button type="button">`, `aria-haspopup="dialog"`, `aria-expanded`. Name = its visible text.
2. **Divider**: decorative, not focusable, not announced.
3. **WhatsApp segment**: `<a>`, `target="_blank"`, `rel="noopener noreferrer"`, `aria-label` = `a11y.whatsapp`.

Rendered only while the chat panel is closed.

## Behaviour

| Event | Result |
|-------|--------|
| Click, tap, Enter or Space on assistant | Panel opens, textarea focused, no text prefilled; hostname check runs in the handler |
| Pointer enter or focus on assistant | Panel chunk prefetched (as today) |
| Panel closes (Esc or close control) | Dock reappears, focus on the assistant segment |
| Activate WhatsApp | `https://wa.me/593960138279?text=<encoded contact.whatsappMessage>` in a new tab |

## Visual states (tokens only)

| Property | Value |
|----------|-------|
| Height | 48px; 56px from `sm` |
| Margin from edges | 16px; 24px from `sm` |
| Segment target | >= 44×44px |
| Surface / hover | `surface` / `surface-2` |
| Outline | 1px `border-strong`, pill radius |
| Compact (< 768px) | sparkle + `chat.launcher` |
| Input-style (>= 768px) | sparkle + `chat.launcherInput` (muted) + chip `chat.launcherHint`, min width about 300px |
| WhatsApp glyph | `foreground`, no brand fill |
| Prohibited | shadow, glow, gradient, blur, pulse, accent fill, tinted chip |

## Invariants

- Exactly one fixed element in the bottom-right corner when the panel is closed.
- No horizontal overflow at 360px in EN and ES.
- Dock plus margin never exceeds the Footer's 144px bottom clearance.

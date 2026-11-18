# Research: Chat Launcher Redesign

Decisions made inside the constitution; owner decisions are marked.

## R1. Layout option (owner decision 2026-11-17)

**Decision**: Option D of `mocks/launcher-options.html`: one dock; compact A1 form below `md`, input-style assistant segment from `md`; WhatsApp stays an icon segment.
**Rationale**: Assistant becomes primary and the typing cue appears where recruiters browse (laptops, PRODUCT.md) without B's costs (WhatsApp 2+ taps, new Contact content, a panel change).
**Alternatives**: A (no typing cue on desktop), B (WhatsApp demoted, panel/Contact changes, large footprint), C (assistant behind two taps, most new behaviour). Rejected in the mock review.

## R2. WhatsApp treatment (owner decision 2026-11-17)

**Decision**: Neutral white glyph on the dock surface, no green fill.
**Rationale**: The green was the main complaint; the glyph shape stays recognisable and the accessible name is unchanged. The constitution's `#25D366` exemption is permissive ("MAY keep"), so not using it needs no amendment.
**Alternatives**: Green segment (A2): more recognisable but pulls attention again.

## R3. Keep `WhatsAppButton.tsx`, compose from `ChatWidget`

**Decision**: Keep the file and export name; make it a non-fixed segment; `ChatWidget` renders it inside the dock; `layout.tsx` no longer renders it.
**Rationale**: The constitution's structure list names the file; keeping it avoids an amendment. One component (`ChatWidget`) owns the dock, so the shared offsets/heights live in one place and the old coupling comment (008 R7) disappears.
**Alternatives**: New `LauncherDock.tsx` (allowed without amendment, but leaves `ChatWidget` as a thin wrapper and moves `launcherRef` ownership across files for no gain); delete `WhatsAppButton` (would leave the constitution list stale); keep two fixed elements aligned by constants (the current fragile coupling).

## R4. Accessible name per breakpoint

**Decision**: Two sibling text spans toggled with `md:hidden` and `hidden md:inline` (both `display: none` when hidden); no `aria-label` on the button.
**Rationale**: The computed name equals the visible text at each width (WCAG 2.5.3 label-in-name) and screen-reader users never hear both strings. The hint chip is part of the name ("… AI"), which is acceptable and matches the visible text.
**Alternatives**: `aria-label` fixed to "Ask about Luis" (violates label-in-name at `md` where the visible text differs).

## R5. Contrast (computed from the DESIGN.md token table)

| Pair | Ratio | Needs |
|------|-------|-------|
| `foreground` on `surface` (label, glyph, sparkle) | 19.28 | 4.5 / 3 |
| `muted` on `surface` (input-style text, hint chip text) | 7.52 | 4.5 |
| `border-strong` on `background` (dock outline, divider seen against the page) | 4.22 | 3 |
| `border-strong` on `surface` (divider inside the dock) | 3.99 | 3 |
| `focus-ring` on `surface` | 6.04 | 3 |
| `foreground` on `surface-2` (hover) | 17.72 | 4.5 |

The chip hairline uses `border`, which is decorative only; the chip is not a control, so the Hairline Rule is respected.

## R6. Focus ring inside the pill

**Decision**: No `overflow-hidden` on the dock. The container is a `rounded-full` outlined box; the assistant segment has `rounded-l-full` and the WhatsApp segment `rounded-r-full`, so hover backgrounds match the pill and the outline (which follows `border-radius`) is never clipped. Segments use a negative `outline-offset` (inset ring) so the ring stays inside the dock. The global `:focus-visible` rule (2px, `--focus-ring`) is reused.
**Rationale**: An inset rectangular ring inside an `overflow-hidden` pill would be clipped at the rounded ends; matching radii avoid that without clipping. Confirmed visually at implementation time (T011).

## R7. Footer clearance and breakpoints

**Decision**: No Footer change. Dock bottom extent is 16 + 48 = 64px (mobile) and 24 + 56 = 80px (`sm+`), both inside the 144px `pb-36`. Spacing uses the same `sm:` step as today (`bottom-4/right-4`, `sm:bottom-6/sm:right-6`); the input-style form starts at `md` (768px) per the spec.
**Rationale**: The mock showed the dock sitting inside the reserved space. Verified again by DOM measurement at page end.

## R8. Motion

**Decision**: None added. Hover is an instant colour change; no `transition-*` or `animate-*` utility on the dock.
**Rationale**: Principle IV and the brand ("restraint is the brand").

## R10. Spanish input-style text (owner decision 2026-11-17)

**Decision**: "Pregunta lo que quieras sobre Luis…" for `chat.launcherInput` (ES).
**Rationale**: Equivalent to the English "Ask anything about Luis…" and distinct from the compact label "Pregunta sobre Luis". It only appears from `md`, where the segment has room (`min-w` is a minimum, the segment grows).
**Alternatives**: "Pregunta sobre Luis…" (the mock text): shorter but loses "anything" and nearly repeats the compact label.

## R9. No prefill, no real input

**Decision**: The input-style text is a label inside a button; no text can be typed in the dock.
**Rationale**: Out of scope per the spec. A real page-level input would raise the keyboard before the panel exists and bypass the lazy loading. Activating opens the panel, whose textarea already receives focus (008).

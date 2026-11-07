---
name: Luis Jacho Portfolio
description: Calm, precise, senior. Ink black with paper-white type and one sparing cornflower accent.
colors:
  ink-black: "#050505"
  paper-white: "#FFFFFF"
  cornflower: "#548CFF"
  cornflower-light: "#7DA8FF"
  background: "#050505"
  surface: "#0E0E10"
  surface-2: "#18181B"
  text: "#FFFFFF"
  text-muted: "#A1A1AA"
  border: "#27272A"
  border-strong: "#71717A"
  accent: "#548CFF"
  accent-hover: "#7DA8FF"
  focus-ring: "#548CFF"
  status-available: "#34D399"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5.4vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.025em"
  subline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.9vw, 1.375rem)"
    fontWeight: 400
    lineHeight: 1.4
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.text}"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.md}"
    padding: "0 22px"
    height: "44px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "0 22px"
    height: "44px"
---

<!-- IMPLEMENTED in feature 005 (2026-11-06). Theme: DARK. Token values in src/app/globals.css equal constitution v1.1.0 and this file; the constitution wins if they ever diverge. Differences between this draft and the shipped code are listed in "Implemented as built" below. -->

## Implemented as built (005)

Shipped on branch `005-design-refresh`. Everything above holds except these deliberate differences:

- **Breakpoint:** the hero is two columns from Tailwind `md` (768px), not 800px, because the constitution requires Tailwind's standard breakpoints.
- **Touch targets:** all interactive elements are at least 44x44px, so the language buttons are 44px (the mock drew them at 28px) and nav links have a 44px hit area.
- **Selection:** text selection is a neutral white highlight, not the mock's blue, because the accent is for links and focus rings only.
- **Motion:** the hero has one CSS fade-in (0.5s, 8px rise) and nothing loops; the previous float animation and the WhatsApp pulse were removed. All animation is disabled under `prefers-reduced-motion`.
- **Portrait:** `public/pic.png` is 1086x1448 (3:4) shown in a 4:5 frame with `object-cover object-top`.
- **Color exceptions, now in the constitution (v1.1.1, owner decision 2026-11-06):** the availability dot is the `--status-available` token (`#34D399`); the WhatsApp brand green `#25D366` and the Azure logo's own SVG gradient are third-party brand marks exempt from the token table. The accent rule is unchanged: `--status-available` never colors text, buttons or borders.
- **Not changed:** section content, the experience and project prose, and the skill group names remain English-only in both languages (pre-existing; out of scope for this feature).

# Design System: Luis Jacho Portfolio

## Overview

**Creative North Star: "The Plain Statement"** *(proposed, to be confirmed by the owner)*

A senior engineer's portfolio says what it has to say once, clearly, and lets the evidence stand. The page is ink black with white type, one family of type, hairline rules instead of boxes, and one cool blue used only where something is a link or has focus. Hierarchy comes from size, weight and space, never from color or effects.

Density is low to medium and the reading path is short: who he is, the proof, how to reach him, all inside the first screen. Nothing implies more work than exists (one blog post, no case studies yet), so there are no empty card grids or placeholder galleries. Motion is a single quiet entrance and always yields to `prefers-reduced-motion`.

**Key Characteristics:**
- Two neutrals plus one accent; accent below roughly 5% of any screen.
- Type does the work; decoration is removed, not styled.
- Hairline borders, no shadows, no glass, no gradients.
- Dark only, matching the constitution's dark-only rule.
- Every text pair meets WCAG AA.

## Colors

Ink and paper with a single cool accent. Contrast ratios are WCAG 2.x, computed from the hex values.

### Primary
- **Cornflower Blue** (#548CFF): the accent. Links and the focus ring.
- **Cornflower Light** (#7DA8FF): link hover.

### Neutral
- **Ink Black** (#050505): the page and the text on the primary button.
- **Paper White** (#FFFFFF): body and heading text, and the primary button fill.

### Token table

| Role | Token | Hex | Contrast on background / surface / surface-2 | Use |
|------|-------|-----|----------------------------------------------|-----|
| Background | `background` | #050505 | n/a | Page |
| Surface | `surface` | #0E0E10 | n/a | Panels, secondary button hover |
| Surface 2 | `surface-2` | #18181B | n/a | Hover of a surface |
| Text | `text` | #FFFFFF | 20.38 / 19.28 / 17.72 | Headings, body |
| Muted text | `text-muted` | #A1A1AA | 7.95 / 7.52 / 6.91 | Subline, secondary copy, captions |
| Accent | `accent` | #548CFF | 6.38 / 6.04 / 5.54 | Links only |
| Accent hover | `accent-hover` | #7DA8FF | 8.65 / 8.19 / n/a | Link hover |
| Focus ring | `focus-ring` | #548CFF | 6.38 / 6.04 / n/a | 2px ring, 2px offset (needs 3:1) |
| Status available | `status-available` | #34D399 | 10.60 / n/a / n/a | Static 6px availability dot only, next to plain text (graphic, needs 3:1) |
| Border | `border` | #27272A | 1.37 / n/a / n/a | Decorative hairline dividers only |
| Border strong | `border-strong` | #71717A | 4.22 / 3.99 / n/a | Outline of controls (needs 3:1) |

Primary CTA is neutral: Paper White fill with Ink Black text (20.38:1). Secondary CTA is a `border-strong` outline with `text` color. Portrait ring: white at 7% (`ring-1 ring-white/[0.07]`).

### Named Rules
**The One Voice Rule.** The accent colors links and focus, nothing else: no buttons, badges, headings or backgrounds. If a screen has more than a handful of accent pixels, remove some.

**The Hairline Rule.** `border` is a decorative divider (1.37:1) and may not be the only indicator of a control's boundary; controls use `border-strong` (at least 3:1).

## Typography

**Display and Body Font:** Geist (variable, already self-hosted; fallback system-ui, sans-serif)
**Mono Font:** Geist Mono, only for code and measurements

**Character:** One family, weight and size carrying every step. Calm and exact, no display face and no letterspacing tricks.

### Hierarchy
- **Display** (600, clamp(2.5rem, 5.4vw, 4rem), 1.06, tracking -0.025em): the hero title only, "Senior .NET & Azure engineer."
- **Subline** (400, clamp(1.125rem, 1.9vw, 1.375rem), 1.4, muted): the sentence under the display title.
- **Title** (500, 1.125rem, 1.4): the name line, section headings.
- **Body** (400, 1rem, 1.6): copy; measure 65–75ch.
- **Label** (500, 0.875rem, 1.4): buttons, nav, small metadata.
- **Mono** (400, 0.8125rem): code and technical tokens inside blog posts.

### Named Rules
**The No Eyebrow Rule.** Headings stand alone; no kicker or label above them.

## Layout

Single column of content on a max-width 72rem container with 24px side padding on phones. The hero is two columns from 800px up (text left, portrait right, text first in reading order) and stacks text then portrait below. Vertical rhythm uses the 8px scale: 16 within groups, 24–48 between groups, 96 between sections; more space above a heading than below. The first screen at 1280×800 and 390×844 must show the title, subline, proof line and both CTAs without scrolling.

## Elevation & Depth

Flat. Depth is tonal (background, surface, surface-2) and hairline rules; there are no shadows. The only "raised" state is focus: a 2px ring with a 2px offset. The portrait's 1px white-7% ring is a border, not a shadow.

## Shapes

Quiet, slightly rounded: 10px on buttons and inputs, 14px on images, 6px on small controls. The portrait gets a 1px ring at white/7%, never a colored border. No pills for content.

## Components

### Buttons
- **Primary:** Paper White fill, Ink Black text, 44px high, 0 22px padding, 10px radius, weight 500. Hover steps to #E4E4E7; never to accent.
- **Secondary:** transparent, 1px `border-strong`, text color; hover fills `surface`.
- **Focus:** the focus ring on every interactive element; never removed.

### Links
- **Style:** accent color, underline offset 3px, always underlined in body and contact lines; hover moves to `accent-hover`.

### Navigation
- **Style:** wordmark left, plain text links in muted text, EN/ES toggle as plain text with the active language in full text color. Fixed, `background` fill with a hairline bottom rule. The active section is indicated by text color, not by an accent.

### Portrait
- **Style:** 14px radius, 1px ring at white/7% (the approved `ring-1 ring-white/[0.07]` pattern). The ring is kept because the photograph's own background is almost the page color, so without it the lower and right edges dissolve into the page and the rounded shape disappears. No float or parallax; one quiet fade-in on load.

### Availability line
- **Style:** a static 6px dot (no animation) plus plain text, e.g. "Open to senior remote roles and consulting" (ES to add to translations: "Disponible para puestos remotos senior y consultoría").

## Do's and Don'ts

### Do:
- **Do** set the hero title to "Senior .NET & Azure engineer." with the muted subline "Nine years shipping for US teams. Now building AI agents."
- **Do** use "9 years" wherever experience duration appears.
- **Do** keep tech stack as inline text separated by `·`.
- **Do** respect `prefers-reduced-motion`: the only entrance animation is disabled.
- **Do** check every new color pair against the ratios above before use.

### Don't:
- **Don't** use gradients, glows, frosted cards, tinted pills, shadows or accent-colored CTAs.
- **Don't** imply content that does not exist: no "latest posts" grid, no case-study cards, no testimonials, no invented metrics.
- **Don't** add attention-seeking motion (looping float, parallax, scroll-jacking).
- **Don't** change theme values in code without amending the constitution first.

## Considered and Rejected

### Light theme (rejected 2026-11-06)
Rejected because the portrait is photographed on a near-black background and only reads as intended on a dark page, and because light mode needs a second, darker accent (`#1461FF`) since Cornflower #548CFF is only 3.20:1 on white. The dark proposal needs no extra derived accent. Kept here for reference; the light tokens were:

| Role | Hex | Contrast on white / `#F4F4F5` |
|------|-----|-------------------------------|
| Background | #FFFFFF | n/a |
| Surface / Surface 2 | #F4F4F5 / #E9E9EB | n/a |
| Text | #050505 | 20.38 / 18.54 |
| Muted text | #52525B | 7.73 / 7.03 |
| Cornflower (large text and graphics only) | #548CFF | 3.20 / 2.91 |
| Accent text, focus ring (derived) | #1461FF | 5.02 / 4.57 |
| Accent hover (derived) | #0B4AD9 | 7.01 / 6.38 |
| Border / Border strong | #E4E4E7 / #8A8A93 | 1.27 / 3.42 |

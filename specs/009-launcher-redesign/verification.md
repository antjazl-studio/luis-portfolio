# Verification: Chat Launcher Redesign

Run 2026-11-18 on the production build (`npm run build`, `next start -p 3109`) with headless Chrome (scratch scripts under `.tmp/verify/`, gitignored) and `npx lighthouse`. Evidence files are under `.tmp/` (not committed).

## Results

| Quickstart check | Result | Evidence |
|------------------|--------|----------|
| 1. `npm run lint`, `npm run build` | Pass at every checkpoint; route table identical to baseline (`/`, `/_not-found`, `/blog`, `/blog/[slug]` all static) | `.tmp/routes-before.txt` |
| 2. Screenshots 360/767/768/1280, EN and ES | One dock; compact label at 360 and 767; input-style field with hint at 768 and 1280; looked at 360 EN and 1280 ES by eye | `.tmp/after/*.png` |
| 3. Sizes and overflow | Segments: assistant 158×46 (EN) / 192×46 (ES) at 360; WhatsApp 48×46 at 360, 56×54 from `sm`; all ≥ 44px. Dock height 48 / 56. No horizontal overflow at 360, 767, 768, 1280 in EN and ES, and at 640×400 ES | `.tmp/after/measure.json` |
| 4. Fixed elements | Dock is the only fixed element in the bottom-right corner (the other fixed element is the top Navbar) | `check.mjs` |
| 5. Accessible names (accessibility tree) | 360/767: "Ask about Luis" / "Pregunta sobre Luis"; 768 and up: "Ask anything about Luis… AI" / "Pregunta lo que quieras sobre Luis… IA"; WhatsApp: "Chat on WhatsApp" / "Escríbeme por WhatsApp" | `check.mjs` output |
| 6. Tab order and focus ring | Tab stops: assistant, then WhatsApp; ring follows the pill shape and is not clipped (looked at assistant 1280 and WhatsApp 360) | `.tmp/after/focus-*.png` |
| 7. Open and close | Click opens the panel with the textarea focused and empty; Esc closes; focus returns to the assistant button | `check2.mjs` |
| 8. WhatsApp link | `href`, `rel`, `target`, `aria-label` identical to the baseline in EN and ES | `.tmp/baseline-whatsapp.json` |
| 9. Reduced motion | No dock transition or animation (only the global reduced-motion override durations) | `check2.mjs` |
| 10. Diff grep | No `#25D366`, `shadow`, `blur`, `gradient`, `transition`, `animate-` or `accent` added; matches are only lines removed from the old WhatsApp button | `git diff upstream/master -- src` |
| 11. Panel chunk | Initial `_next` requests: 15 before, 15 after; the panel chunk is requested on hover of the assistant, not on load | `.tmp/baseline-requests.txt`, `.tmp/after-requests.txt` |
| 12. Lighthouse (best of 3, mobile emulation) | Before: Performance 100, Accessibility 100. After: Performance 100 (runs 100, 99, 100), Accessibility 100 | `.tmp/lighthouse-baseline009.json`, `.tmp/lighthouse-after009.json` |
| 13. Non-production host | On `http://172.27.16.1:3109` the panel shows "Assistant available on luisjacho.dev" and 0 requests go to the agent service address. With no agent service running on localhost the existing "not available right now" message appears after sending, with the contact links | `check3.mjs` |
| Footer and Contact clearance | At the end of `/`, `/blog`, a post and a 404, at 360×640, 1280×800 and 640×360, no Footer or main link overlaps the dock | `check2.mjs` |
| Contrast | Ratios recomputed from the token hex values equal the research R5 table (19.28, 7.52, 4.22, 3.99, 6.04, 17.72); computed colours in the browser are the expected tokens | `.tmp/verify/contrast.mjs`, `check3.mjs` |

## Deviations

- The assistant segment is 46px tall (dock 48px minus its 1px border) at the smallest size; this is above the 44px minimum.
- In Spanish at 768px and up the assistant segment grows to about 341px (the 300px is a minimum, not a fixed width); the dock is about 400px wide and still clear of the Footer.
- Decision, 2026-11-17 (owner): the Spanish input-style text is "Pregunta lo que quieras sobre Luis…"; the constitution descriptor "(floating contact button)" is left unchanged (waiver).

## Not verified

- A real phone (thumb reach, touch feel) and a screen reader (the names above come from Chrome's accessibility tree, not from NVDA, JAWS or VoiceOver).
- Browsers other than Chrome (Firefox, Safari), including the focus-ring shape on rounded ends in Safari.
- The Vercel preview itself (fork PR previews need the owner's authorization); the `luisjacho.dev` production origin was not tested.
- Real browser zoom to 200% (approximated with a 640px-wide viewport).
- Lighthouse uses the default mobile emulation only; the desktop preset was not run.

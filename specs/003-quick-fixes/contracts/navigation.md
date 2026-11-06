# UI Contract: Navigation, Footer and Active State

Observable behavior of the top navigation, per current page. Used by the quickstart checks.

## Click behavior

| Control | On `/` | On `/blog`, `/blog/<slug>`, any 404 |
|---|---|---|
| About / Experience / Skills / Projects / Contact | Smooth-scrolls to `#<id>`; URL unchanged; drawer closes | Navigates client-side to `/#<id>`; lands scrolled to the section; drawer closes |
| "LJ" monogram | Smooth-scrolls to top | Navigates to `/` at the top |
| Blog | Navigates to `/blog` | Stays on / returns to `/blog` |
| EN/ES switcher | Toggles language | Toggles language |

Language selected before any navigation above is still selected afterward (no full reload).

## Active state

| Current path | Active nav item |
|---|---|
| `/` | The section in the viewport middle band, or none at the top of the page |
| `/blog` | Blog |
| `/blog/<any>` (existing post or unknown slug) | Blog |
| Any other path (generic 404) | None |

Applies to the desktop bar and the mobile drawer. When Blog is active the Blog link has
`aria-current="page"`, and no section item is highlighted.

After navigating from a blog page to `/` and scrolling, section highlighting works as on a
fresh load.

## Footer

| Page | Footer count |
|---|---|
| `/` | 1 |
| `/blog` | 1 |
| `/blog/<existing slug>` | 1 |
| `/blog/<unknown slug>` | 1 |
| Generic 404 (e.g. `/nope`) | 1 |

Footer content and EN/ES text are identical to the home page's footer.

## Accessibility

Section items and the monogram are anchors (links) reachable by keyboard and announced as links;
Enter activates them. No change to visual styling.

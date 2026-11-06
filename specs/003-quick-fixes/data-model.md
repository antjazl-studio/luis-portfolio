# Data Model: 003 Quick Fixes

No persisted data. The only structures are static, typed content and derived UI state.

## Navigation state (derived, not stored)

| Field | Source | Rule |
|---|---|---|
| `onHome` | `usePathname() === "/"` | Enables smooth-scroll handlers and scroll-spy |
| `onBlog` | `pathname === "/blog"` or starts with `/blog/` | Blog item active; no section item active |
| `active` (section id or null) | IntersectionObserver on the 5 sections | Only set while `onHome`; cleared to `null` on route change away from `/` |

Navigation item: `{ id: about | experience | skills | projects | contact, label (EN/ES from translations), href: "/#<id>" }`; plus the Blog item (`/blog`) and the monogram (`/`).

## Experience entry (second timeline entry)

Added to `Translation.experience`:

```text
logiztik: {
  role:    string        // EN "Full Stack Developer"      | ES "Desarrollador Full Stack"
  period:  string        // EN "Oct 2019 – Apr 2020"       | ES "Oct 2019 – Abr 2020"
  bullets: [string, string]   // tuple: exactly 2, EN and ES as in spec FR-014
}
```

Company ("Logiztik Alliance Group") is not translated and stays in `Experience.tsx`.

Validation rules:

- Both `en` and `es` MUST define all three fields; the `Translation` type enforces presence in
  both languages and, via the `[string, string]` tuple, exactly two bullets.
- `bullets` has exactly the two owner-supplied bullets (spec FR-014); no other facts added.
- Entry order stays newest first: MyWork (Jun 2020 – Present), Logiztik (Oct 2019 – Apr 2020),
  IESS (2017 – 2019).

## Audit finding (documentation only)

`{ package, severity, scope (runtime | build | dev), fixable without major (yes/no) }` — recorded
in research.md R-04; not stored in code.

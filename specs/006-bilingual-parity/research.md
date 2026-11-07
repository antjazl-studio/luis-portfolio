# Research: EN/ES Parity

Decisions taken by the supervisor inside the constitution, with facts checked in the repository.

## R1. What is English-only today (survey of `src/`)

| Where | What |
|-------|------|
| `Experience.tsx` | role titles (MyWork, IESS), MyWork location "Quito, Ecuador (Remote)", 6 MyWork bullets, 2 IESS bullets (Logiztik is already in `translations.ts`) |
| `Projects.tsx` | 3 titles, 3 descriptions |
| `Skills.tsx` | 5 group names and skill labels (the "also" label is already translated) |
| `Contact.tsx` | location line "Quito, Ecuador (UTC−5)" |
| `WhatsAppButton.tsx` | prefilled messages (translated, but a local map outside `translations.ts`, baseline D-046) |
| `layout.tsx`, `blog/page.tsx`, `blog/[slug]/page.tsx` | static English metadata (title, description, OG) |

Everything else visible is already served through `translations.ts`.

## R2. Single source and the compile-time guarantee

- **Decision**: add typed groups to the existing `Translation` type in `translations.ts`:
  `experience.mywork`, `experience.iess`, `projects.items`, `skills.groups`, `contact.location`,
  `contact.whatsappMessage`, `meta`. Use tuple types for lists whose length is fixed (bullets,
  project items, skill items).
- **Rationale**: `translations` is already `Record<Language, Translation>`, so a key missing in one
  language is a type error, and `next build` runs the type check. Tuples extend that to counts, which
  is what "same number of bullets" (FR-007) needs.
- **Alternatives**: a runtime check script in CI (rejected: new tooling and files); arrays without
  tuple types (rejected: counts could drift silently).
- **Demonstrated (T020, 2026-11-06)**: with one ES string property removed, `npx tsc --noEmit` exits 2
  and `npm run build` exits 1 with `TS2741: Property 'location' is missing in type ...`. With one ES
  bullet removed from the six-bullet MyWork list it fails with `TS2322: Type '[string, string,
  string, string, string]' is not assignable to type 'Six<string>'. Source has 5 element(s) but target
  requires 6.` The unmodified file passes and the restored file passes (tree clean afterwards).
- **Limit of the guarantee**: the type system cannot tell "translated" from "copied English". That
  is checked by the `.tmp` scan (every identical EN/ES pair must be on the FR-010 allowlist).

## R3. What stays outside the table (language-neutral)

Exactly the FR-010 list: the owner's name, organization names, technology and product names,
brand names (LinkedIn, WhatsApp), certification names (Azure Developer Associate), technical
loanwords used unchanged in Spanish (Blog, Backend, Frontend, DevOps), place names, numerals and
years. Today's identical EN/ES pairs in `translations.ts` (`nav.blog`, `blog.title`, `hero.who`,
`about.azure_badge`, `a11y.linkedin`) are all covered by it. Hero `TECH_STACK`, Projects `tech` arrays, the "Jun 2020" start and
the IESS period "2017 – 2019" stay as constants. Neutral names are repeated inside each language's
skill list so each language is one self-contained list.

**Result of the prose search (T021)**: a script searched `src/components`, `src/app`, `src/context` and
`src/hooks` for literals of 3 or more words outside `translations.ts`. Of 18 hits: 9 are Tailwind class
strings, a `sizes` attribute or an empty `alt` fallback; 2 are organization names (Logiztik Alliance
Group, IESS and its Spanish name); 1 is a template that already uses `t.experience.present`; 6 are the
static page metadata in `layout.tsx` and `blog/page.tsx` (title, description, author name), covered by
the accepted Principle VI deviation and, for the title, followed on the client by the tab-title logic
(R4). No user-facing prose remains in components.

## R4. Tab title

- **Decision** (owner, 2026-11-06): the tab title follows the language and survives client-side
  navigation (the owner noted Next resets `document.title` from metadata on route change).
- **Design: one owner of the title, no race.** `LanguageProvider` (already in the root layout) holds a
  `pageTitle` value and exposes `setPageTitle(title | null)` through the existing context. The
  provider computes the desired title: the registered `pageTitle`, or `meta.home` when
  `usePathname()` is `/`, or none. When a desired title exists it (1) sets `document.title`, and (2)
  installs a `MutationObserver` on the `<title>` element / `document.head` that re-applies the desired
  title whenever something else (Next's route-metadata update) changes it. The observer ignores
  changes that already equal the desired title, so it cannot loop, and it is disconnected on
  cleanup. Pages register in effects: `BlogIndex` (`meta.blog`), `LocalizedPost` (the post title in
  the active language; cleanup resets to none), `BlogNotFound` (`meta.home`, so the English 404
  title is unchanged), each with explicit dependencies (`[language]`, `[post.title]`, `[language]`).
- **Facts verified in the repo**: home and blog titles are static `metadata`; post titles come from
  `generateMetadata` with `post.en.title`; the 404 renders `BlogNotFound` and inherits the root title;
  the initial language is `en`, so effects after hydration cannot cause a hydration mismatch.
  Child effects run before the provider's effect, which is why registration goes through state in the
  provider and not through direct `document.title` writes in children.
- **Why not effects alone**: a late metadata update after the child's mount effect (for example
  `/blog` to a post in ES) would overwrite the Spanish title and the effect would never re-run;
  `useLayoutEffect` fires even earlier. The observer is the deterministic guarantee.
- **Cost**: no new dependency and no new file; a short flicker of the English title during navigation
  is possible and accepted; the steady state must be Spanish.
- **Verification (mandatory, task T027)**: headless browser against `next start`: ES selected, home to
  `/blog` to a post to `/blog` to home through in-app links, with the title sampled over time after
  each navigation (it must settle on the Spanish value within 1 second and stay), a language switch
  on each page, a missing URL, back to EN. The result is recorded here after implementation.
- **Accepted deviation**: the meta description and Open Graph text stay English (Principle VI
  deviation, owner 2026-11-06; plan.md Complexity Tracking). Per-language URLs are on the backlog.

## R5. Spanish glossary and style

Derived from the Spanish the owner reviewed in feature 005 (which must not change): first-person
past tense for achievements ("Desarrollé...", "lideré..."), "full stack" in lowercase, "API" as
feminine ("las API"), "." as thousands separator ("30.000"), "~60 %" with a space, "despliegues" for
releases or deployments, "tiempo de inactividad" for downtime, "pipelines de CI/CD", "senior" after
the noun.

| English | Spanish (draft for the owner) |
|---------|-------------------------------|
| Senior Full Stack Consultant | Consultor full stack senior |
| .NET Developer | Desarrollador .NET |
| Quito, Ecuador (Remote) | Quito, Ecuador (remoto) |
| Cloud & DevOps | Nube y DevOps |
| Databases | Bases de datos |
| Tools & Methods | Herramientas y métodos |
| REST APIs | API REST |
| Microservices | Microservicios |
| Agile/Scrum | Ágil/Scrum |
| Layered Architecture | Arquitectura en capas |
| MyWork — Workforce Management Platform | MyWork — Plataforma de gestión de personal |
| Azure Functions Migration | Migración a Azure Functions |
| Dynamic Forms Engine | Motor de formularios dinámicos |

Backend and Frontend stay as they are in both languages (common usage in Spanish technical
writing). Facts are identical in both languages: every number, name, date, and the number and order
of bullets. All Spanish strings are drafts and are listed for the owner's review in the PR.

## R6. WhatsApp message

Move the two prefilled messages from `WhatsAppButton.tsx` into `translations.ts`
(`contact.whatsappMessage`) with the text unchanged. This closes baseline deviation D-046 and keeps
one source for all strings.

## R7. Verification approach

Scripts in `.tmp/` (gitignored), no framework, no new files in the repo:

1. EN/ES key parity and "identical pairs must be on the allowlist" (transpile `translations.ts`).
2. ES text scan with a headless browser on home, `/blog`, a post and a 404: collect visible text and
   flag English sentences.
3. Facts invariants: digits, years and percentages extracted from the EN and ES sections, compared as
   multisets.
4. SC-003 demonstration: delete one ES key, run `npx tsc --noEmit`, show the failure, restore.
5. Tab title checks (R4 risk), 360px overflow in ES on 4 page types, ES first screen at both
   viewports, and the existing 005 browser scripts rerun.
6. Lighthouse baseline before changes and after, best of 3.

## R8. Process facts

- Branch `006-bilingual-parity` was created from `upstream/master` after PR #8 (feature 005) was
  merged (`b5145b1`), so constitution v1.2.0 and the 005 code are the base.
- Out of scope and untouched: per-language URLs, Spanish search metadata, blog content, the 14
  owner-reviewed Spanish strings, constitution, design.

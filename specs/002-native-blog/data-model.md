# Data Model: Native Blog

No persistent store; entities are derived from files at build time.

## PostVersion (one per language file)

| Field | Type | Source / rule |
|-------|------|---------------|
| `lang` | `"en" \| "es"` | file name (`en.md` / `es.md`) |
| `title` | string | frontmatter; required, non-empty |
| `summary` | string | frontmatter; required, non-empty |
| `date` | string (ISO `YYYY-MM-DD` or full ISO) | frontmatter; required; must parse to a valid date; `Date` objects from YAML are normalised to ISO |
| `draft` | boolean | frontmatter; optional, default `false` |
| `body` | string (Markdown) | file content after frontmatter; non-empty |
| `readingTime` | integer ≥ 1 (minutes) | derived: `ceil(words / 200)` |

## Post

| Field | Type | Rule |
|-------|------|------|
| `slug` | string | directory name; `^[a-z0-9]+(?:-[a-z0-9]+)*$`; unique (case-insensitive) |
| `draft` | boolean | equal in both versions, else build error |
| `en`, `es` | `PostVersion` | both required |

## Collections

- **All posts**: validated set (drafts included) — used for validation.
- **Visible posts**: all posts minus drafts when `VERCEL_ENV === "production"`; sorted by EN
  `date` descending, ties by `slug` ascending. Feeds the index, `generateStaticParams`, metadata.

## State

`draft: true → draft: false` (edit both files) is the only transition (FR-092). Visibility is a
function of (`draft`, build environment); nothing is stored.

## Validation errors (all fail the build)

| Condition | Message shape |
|-----------|---------------|
| Missing language file | `post "<slug>": missing <lang>.md` |
| Missing/invalid field | `post "<slug>" [<lang>] <field>: <reason>` |
| Draft mismatch | `post "<slug>": draft differs between en and es` |
| Invalid slug | `post "<slug>": directory name must be lowercase letters, digits and hyphens` |
| Duplicate slug | `post "<slug>": duplicate identifier` |
| Unexpected file in post dir | `post "<slug>": unexpected file <name>` |

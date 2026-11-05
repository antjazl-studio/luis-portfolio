# Contract: Blog module, routes and metadata

## `src/lib/blog.ts`

```ts
export type Lang = "en" | "es";
export type PostVersion = {
  title: string; summary: string; date: string; body: string; readingTime: number;
};
export type Post = { slug: string; draft: boolean; en: PostVersion; es: PostVersion };

export function loadPosts(rootDir?: string, opts?: { includeDrafts?: boolean }): Post[];
export function getVisiblePosts(): Post[];          // env-aware, sorted newest first
export function getPost(slug: string): Post | undefined; // visible posts only
export function isProductionBuild(): boolean;      // VERCEL_ENV === "production"
```

- `loadPosts` validates everything (drafts included) and throws on any error; filtering by
  `includeDrafts` happens afterwards. `includeDrafts` defaults to `!isProductionBuild()`.
- Results are memoised per process so the build parses files once.

## Routes

| Route | Type | Behaviour |
|-------|------|-----------|
| `/blog` | static server page | `BlogIndex` with visible posts; empty state if none |
| `/blog/[slug]` | static, `dynamicParams = false` | one page per visible post; others → root `not-found.tsx` (post-not-found wording) |

## Metadata

- `/blog`: static title + description (EN).
- `/blog/[slug]`: `generateMetadata` → `title`, `description` = EN title/summary;
  `openGraph: { type: "article", title, description, url: "/blog/<slug>", publishedTime }`.
  Draft posts produce none in production (the route does not exist).

## Translations (`lib/translations.ts`, new `blog` group, EN + ES)

`title`, `intro`, `empty`, `readingTime` (e.g. "{n} min read" / "{n} min de lectura"), `back`,
`notFoundTitle`, `notFoundBody`, `notFoundLink`, date locale (`en-US` / `es-EC`).

## Client component props (serialisable)

- `BlogIndex({ posts: { slug; en: Card; es: Card }[] })`
- `LocalizedPost({ slug; en: { header; content: ReactNode }; es: { header; content: ReactNode } })`

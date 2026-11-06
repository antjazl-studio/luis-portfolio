import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

export type Lang = "en" | "es";
export const LANGS: Lang[] = ["en", "es"];

export type PostVersion = {
  title: string;
  summary: string;
  date: string;
  body: string;
  readingTime: number;
};

export type Post = {
  slug: string;
  draft: boolean;
  en: PostVersion;
  es: PostVersion;
};

const WORDS_PER_MINUTE = 200;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DEFAULT_ROOT = path.join(process.cwd(), "content", "blog");

const dateField = z
  .union([z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v))
  .refine((v) => /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(v) && !Number.isNaN(Date.parse(v)), {
    message: "must be a valid ISO date (YYYY-MM-DD)",
  });

const frontmatterSchema = z.object({
  title: z.string().trim().min(1, "required"),
  summary: z.string().trim().min(1, "required"),
  date: dateField,
  draft: z.boolean().default(false),
});

export function isProductionBuild(): boolean {
  return process.env.VERCEL_ENV === "production";
}

function readingTime(body: string): number {
  const text = body.replace(/<!--[\s\S]*?-->/g, " ").trim();
  const words = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

function readVersion(dir: string, slug: string, lang: Lang): PostVersion & { draft: boolean } {
  const raw = fs.readFileSync(path.join(dir, `${lang}.md`), "utf8");
  const { data, content } = matter(raw);
  const parsed = frontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue.path.length ? issue.path.join(".") : "frontmatter";
    const reason =
      issue.code === "invalid_type" && (data as Record<string, unknown>)[field] === undefined
        ? "required"
        : issue.message;
    throw new Error(`post "${slug}" [${lang}] ${field}: ${reason}`);
  }
  const body = content.trim();
  if (!body) throw new Error(`post "${slug}" [${lang}] body: required`);
  const { title, summary, date, draft } = parsed.data;
  return { title, summary, date, body, readingTime: readingTime(body), draft };
}

function loadPost(rootDir: string, slug: string): Post {
  if (!SLUG_RE.test(slug)) {
    throw new Error(
      `post "${slug}": directory name must be lowercase letters, digits and hyphens`,
    );
  }
  const dir = path.join(rootDir, slug);
  const files = fs.readdirSync(dir);
  for (const lang of LANGS) {
    if (!files.includes(`${lang}.md`)) throw new Error(`post "${slug}": missing ${lang}.md`);
  }
  for (const f of files) {
    if (f !== "en.md" && f !== "es.md") throw new Error(`post "${slug}": unexpected file ${f}`);
  }
  const { draft: enDraft, ...en } = readVersion(dir, slug, "en");
  const { draft: esDraft, ...es } = readVersion(dir, slug, "es");
  if (enDraft !== esDraft) throw new Error(`post "${slug}": draft differs between en and es`);
  return { slug, draft: enDraft, en, es };
}

/** Validates every post (drafts included); throws on the first problem. */
export function loadPosts(
  rootDir: string = DEFAULT_ROOT,
  opts: { includeDrafts?: boolean } = {},
): Post[] {
  const includeDrafts = opts.includeDrafts ?? !isProductionBuild();
  if (!fs.existsSync(/*turbopackIgnore: true*/ rootDir)) return [];
  const slugs = fs
    .readdirSync(/*turbopackIgnore: true*/ rootDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  const seen = new Set<string>();
  for (const slug of slugs) {
    const key = slug.toLowerCase();
    if (seen.has(key)) throw new Error(`post "${slug}": duplicate identifier`);
    seen.add(key);
  }

  return slugs
    .map((slug) => loadPost(rootDir, slug))
    .filter((p) => includeDrafts || !p.draft)
    .sort((a, b) => b.en.date.localeCompare(a.en.date) || a.slug.localeCompare(b.slug));
}

let cache: Post[] | undefined;

export function getVisiblePosts(): Post[] {
  if (process.env.NODE_ENV === "development") return loadPosts();
  return (cache ??= loadPosts());
}

export function getPost(slug: string): Post | undefined {
  return getVisiblePosts().find((p) => p.slug === slug);
}

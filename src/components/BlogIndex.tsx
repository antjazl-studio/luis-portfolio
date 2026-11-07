"use client";

import { BlogCard, type BlogCardData } from "@/components/BlogCard";
import { useLanguage } from "@/hooks/useLanguage";
import translations from "@/lib/translations";

export type BlogIndexItem = { slug: string; en: BlogCardData; es: BlogCardData };

export function BlogIndex({ posts }: { posts: BlogIndexItem[] }) {
  const { language } = useLanguage();
  const t = translations[language].blog;

  return (
    <main id="main" tabIndex={-1} className="min-h-svh bg-background pb-20 pt-24 focus:outline-none">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-10">
          <h1 className="mb-2 text-3xl font-semibold text-foreground">{t.title}</h1>
          <p className="text-sm text-muted">{t.intro}</p>
        </div>

        {posts.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">{t.empty}</p>
        ) : (
          <div>
            {posts.map((p) => (
              <BlogCard key={p.slug} slug={p.slug} post={p[language]} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

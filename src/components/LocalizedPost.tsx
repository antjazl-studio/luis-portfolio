"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { formatPostDate } from "@/components/BlogCard";
import { useLanguage } from "@/hooks/useLanguage";
import translations from "@/lib/translations";

type Version = { title: string; date: string; readingTime: number; content: ReactNode };

export function LocalizedPost({ en, es }: { en: Version; es: Version }) {
  const { language } = useLanguage();
  const t = translations[language].blog;
  const post = language === "en" ? en : es;

  return (
    <main className="min-h-screen bg-[var(--background)] pb-20 pt-24">
      <article className="mx-auto max-w-3xl px-6">
        <Link
          href="/blog"
          className="mb-8 inline-block text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          ← {t.back}
        </Link>
        <h1 className="mb-3 text-3xl font-semibold text-white">{post.title}</h1>
        <p className="mb-10 text-xs text-[var(--muted)]">
          {formatPostDate(post.date, t.dateLocale)} ·{" "}
          {t.readingTime.replace("{n}", String(post.readingTime))}
        </p>
        {post.content}
      </article>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import translations from "@/lib/translations";

export type BlogCardData = {
  title: string;
  summary: string;
  date: string;
  readingTime: number;
};

export function formatPostDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(
    new Date(iso),
  );
}

export function BlogCard({ slug, post }: { slug: string; post: BlogCardData }) {
  const { language } = useLanguage();
  const t = translations[language].blog;

  return (
    <Link
      href={`/blog/${slug}`}
      className="group block border-b border-[var(--border)] py-6 first:pt-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
    >
      <p className="mb-2 text-xs text-[var(--muted)]">
        {formatPostDate(post.date, t.dateLocale)} · {t.readingTime.replace("{n}", String(post.readingTime))}
      </p>
      <h2 className="mb-2 text-lg font-medium text-white group-hover:text-neutral-300">
        {post.title}
      </h2>
      <p className="text-sm leading-relaxed text-[var(--muted)]">{post.summary}</p>
    </Link>
  );
}

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
      className="group block border-b border-border py-6 first:pt-0"
    >
      <p className="mb-2 text-xs text-muted">
        {formatPostDate(post.date, t.dateLocale)} · {t.readingTime.replace("{n}", String(post.readingTime))}
      </p>
      <h2 className="mb-2 text-lg font-medium text-foreground group-hover:underline group-hover:underline-offset-[3px]">
        {post.title}
      </h2>
      <p className="text-sm leading-relaxed text-muted">{post.summary}</p>
    </Link>
  );
}

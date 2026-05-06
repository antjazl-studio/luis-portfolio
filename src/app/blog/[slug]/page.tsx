"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Article } from "@/components/BlogCard";

function HeaderSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-3 w-16 bg-[#1a1a1a] rounded-full" />
      <div className="h-8 w-3/4 bg-[#1a1a1a] rounded-md" />
      <div className="h-3 w-32 bg-[#1a1a1a] rounded-full" />
      <div className="border-t border-white/[0.06] mt-8 mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-4 bg-[#1a1a1a] rounded-md" style={{ width: `${90 - i * 8}%` }} />
        ))}
      </div>
    </div>
  );
}

export default function ArticlePage() {
  const { slug } = useParams() as { slug: string };

  const [article,  setArticle]  = useState<Article | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("blog-articles") ?? "[]") as Article[];
    const found  = stored.find((a) => a.slug === slug);

    if (!found) {
      setNotFound(true);
    } else {
      setArticle(found);
    }
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-20">
        <div className="mx-auto max-w-2xl px-6">
          <BackLink />
          <HeaderSkeleton />
        </div>
      </main>
    );
  }

  if (notFound || !article) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-20">
        <div className="mx-auto max-w-2xl px-6">
          <BackLink />
          <p className="text-neutral-500 text-sm mt-8">Article not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-20">
      <div className="mx-auto max-w-2xl px-6">

        <BackLink />

        {/* Category pill */}
        <span className="inline-block text-[10px] uppercase tracking-wider text-cyan-400 border border-cyan-400/20 px-2 py-0.5 rounded-full mb-4">
          {article.category}
        </span>

        {/* Title */}
        <h1 className="text-3xl font-medium text-zinc-100 leading-snug">
          {article.title}
        </h1>

        {/* Meta */}
        <p className="text-xs text-zinc-600 mt-3">
          {article.source} · {article.date}
        </p>

        {/* Divider */}
        <div className="border-t border-white/[0.06] mt-8 mb-8" />

        {/* Thumbnail */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {article.thumbnail && (
          <img
            src={article.thumbnail}
            alt=""
            className="w-full rounded-lg max-h-64 object-cover mb-8"
          />
        )}

        {/* Article body */}
        <div
          className="
            prose prose-invert prose-sm max-w-none
            prose-p:text-zinc-400 prose-p:leading-relaxed
            prose-h2:text-zinc-100 prose-h2:font-medium
            prose-h3:text-zinc-200 prose-h3:font-medium
            prose-a:text-cyan-400 prose-a:no-underline
            hover:prose-a:text-cyan-300
            prose-code:text-cyan-300 prose-code:bg-white/5
            prose-code:px-1 prose-code:rounded
            prose-pre:bg-[#141414] prose-pre:border
            prose-pre:border-white/[0.06]
            prose-img:rounded-lg prose-img:my-6
            prose-strong:text-zinc-200
            prose-li:text-zinc-400
          "
          dangerouslySetInnerHTML={{ __html: article.fullContent ?? article.summary }}
        />

        {/* Footer */}
        <div className="border-t border-white/[0.06] mt-12 pt-6">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors duration-150"
          >
            Read original article on Dev.to →
          </a>
        </div>

      </div>
    </main>
  );
}

function BackLink() {
  return (
    <Link
      href="/blog"
      className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors duration-150 mb-12"
    >
      ← Back to Blog
    </Link>
  );
}

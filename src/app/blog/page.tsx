"use client";

import { useEffect, useState, useCallback } from "react";
import { BlogCard, type Article } from "@/components/BlogCard";

const RSS_URL =
  "https://api.rss2json.com/v1/api.json?rss_url=https://dev.to/feed";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function formatDate(raw: string): string {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function slugify(title: string): string {
  return encodeURIComponent(
    title.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60),
  );
}

function toArticle(item: Record<string, string>): Article {
  const categories = (item as unknown as { categories: string[] }).categories ?? [];
  const title      = item.title ?? "Untitled";
  const rawSummary = stripHtml(item.description ?? item.content ?? "");
  return {
    title,
    summary:     rawSummary.slice(0, 150) + (rawSummary.length > 150 ? "..." : ""),
    category:    categories[0] ?? "Dev",
    date:        formatDate(item.pubDate ?? ""),
    source:      item.author ?? "Dev.to",
    url:         item.link ?? "#",
    thumbnail:   item.thumbnail || undefined,
    slug:        slugify(title),
    fullContent: item.content || "",
  };
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-24 bg-[#141414] rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(RSS_URL);
      const data = await res.json();
      if (data.status !== "ok") throw new Error("Feed error");
      const items: Article[] = (data.items as Record<string, string>[])
        .slice(0, 6)
        .map(toArticle);
      localStorage.setItem("blog-articles", JSON.stringify(items));
      setArticles(items);
    } catch {
      setError("Could not load articles. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  return (
    <main className="min-h-screen bg-[#0d1117] pt-24 pb-20">
      <div className="mx-auto max-w-3xl px-6">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-cyan-400 mb-3">Blog</p>
          <h1 className="text-3xl font-semibold text-white mb-2">Latest in Tech</h1>
          <p className="text-sm text-neutral-500">Latest posts from the Dev.to community</p>
        </div>

        {loading && <Skeleton />}

        {error && (
          <div className="text-sm text-neutral-500 py-10 text-center">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div>
              {articles.map((article, i) => (
                <BlogCard key={article.url} article={article} index={i} />
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={fetchFeed}
                className="text-xs text-neutral-500 border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-md transition-colors duration-150"
              >
                Refresh
              </button>
            </div>
          </>
        )}

      </div>
    </main>
  );
}

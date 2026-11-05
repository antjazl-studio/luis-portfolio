"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import translations from "@/lib/translations";

/** Localized 404. Shows the "post not found" wording for /blog/* URLs. */
export function BlogNotFound() {
  const { language } = useLanguage();
  const pathname = usePathname() ?? "";
  const t = translations[language].blog;
  const isPost = pathname.startsWith("/blog/");

  return (
    <main className="min-h-screen bg-[var(--background)] pb-20 pt-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h1 className="mb-3 text-2xl font-semibold text-white">
          {isPost ? t.notFoundTitle : t.pageNotFoundTitle}
        </h1>
        <p className="mb-6 text-sm text-[var(--muted)]">
          {isPost ? t.notFoundBody : t.pageNotFoundBody}
        </p>
        <Link
          href={isPost ? "/blog" : "/"}
          className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          {isPost ? t.notFoundLink : t.pageNotFoundLink}
        </Link>
      </div>
    </main>
  );
}

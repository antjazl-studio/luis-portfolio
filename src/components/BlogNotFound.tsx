"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import translations from "@/lib/translations";

/** Localized 404. Shows the "post not found" wording for /blog/* URLs. */
export function BlogNotFound() {
  const { language, setPageTitle } = useLanguage();
  const pathname = usePathname() ?? "";
  const t = translations[language].blog;
  const isPost = pathname.startsWith("/blog/");
  const title = translations[language].meta.home;

  // The 404 keeps today's English title in EN; in ES it follows the language like the rest of the site.
  useEffect(() => {
    setPageTitle(title);
    return () => setPageTitle(null);
  }, [title, setPageTitle]);

  return (
    <main id="main" tabIndex={-1} className="min-h-svh bg-background pb-20 pt-24 focus:outline-none">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h1 className="mb-3 text-2xl font-semibold text-foreground">
          {isPost ? t.notFoundTitle : t.pageNotFoundTitle}
        </h1>
        <p className="mb-6 text-sm text-muted">
          {isPost ? t.notFoundBody : t.pageNotFoundBody}
        </p>
        <Link
          href={isPost ? "/blog" : "/"}
          className="inline-flex min-h-11 items-center text-sm text-accent underline underline-offset-[3px] hover:text-accent-hover"
        >
          {isPost ? t.notFoundLink : t.pageNotFoundLink}
        </Link>
      </div>
    </main>
  );
}

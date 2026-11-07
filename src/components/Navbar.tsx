"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import translations from "@/lib/translations";
import type { Language } from "@/context/LanguageContext";

const NAV_IDS = ["about", "experience", "skills", "projects", "contact"] as const;
type NavId = typeof NAV_IDS[number];

// Smooth scrolling is motion: honour the visitor's reduced-motion preference.
const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

export function Navbar() {
  const [active,     setActive]     = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { language, toggleLanguage } = useLanguage();
  const reduce = useReducedMotion();
  const dur = (seconds: number) => (reduce ? 0 : seconds);
  const t        = translations[language];
  const pathname = usePathname() ?? "";
  const onHome   = pathname === "/";
  const onBlog   = pathname === "/blog" || pathname.startsWith("/blog/");

  const navLinks = NAV_IDS.map((id) => ({
    id,
    label: t.nav[id as NavId],
    href:  `/#${id}`,
  }));

  // Plain left click on the home page keeps the smooth scroll; modified clicks
  // (new tab/window) and clicks on other pages use normal link navigation.
  const isPlainClick = (e: React.MouseEvent) =>
    e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

  const handleSectionClick = (e: React.MouseEvent, id: string) => {
    setMobileOpen(false);
    if (onHome && isPlainClick(e)) {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: scrollBehavior() });
    }
  };

  const handleMonogramClick = (e: React.MouseEvent) => {
    setMobileOpen(false);
    if (onHome && isPlainClick(e)) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: scrollBehavior() });
    }
  };

  useEffect(() => {
    // Section elements exist only on the home page; re-subscribe on route change.
    if (pathname !== "/") return;
    const observers: IntersectionObserver[] = [];
    NAV_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => {
      observers.forEach((o) => o.disconnect());
      setActive(null); // clear the highlight when leaving the home page
    };
  }, [pathname]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
    {/* First focusable element on every page: jumps past the navigation to <main id="main">. */}
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-[10px] focus:bg-white focus:px-[22px] focus:text-sm focus:font-medium focus:text-neutral-900"
    >
      {t.a11y.skip}
    </a>
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">

        {/* Wordmark */}
        <Link
          href="/"
          onClick={handleMonogramClick}
          className="inline-flex min-h-11 items-center text-[0.9375rem] font-semibold tracking-tight text-foreground"
        >
          Luis Jacho Zambrano
        </Link>

        {/* Right group: desktop */}
        <div className="hidden items-center gap-7 md:flex">
          <nav className="flex items-center gap-7">
            {navLinks.map(({ id, label, href }) => {
              const isActive = active === id && !onBlog;
              return (
                <Link
                  key={id}
                  href={href}
                  onClick={(e) => handleSectionClick(e, id)}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center text-sm font-medium transition-colors duration-150 ${
                    isActive ? "text-foreground" : "text-muted hover:text-foreground"
                  }`}
                >
                  {label}
                </Link>
              );
            })}

            {/* Blog link */}
            <Link
              href="/blog"
              aria-current={onBlog ? "page" : undefined}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center text-sm font-medium transition-colors duration-150 ${
                onBlog ? "text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {t.nav.blog}
            </Link>
          </nav>

          {/* Language switcher */}
          <LangSwitcher language={language} onToggle={toggleLanguage} label={t.a11y.language} divided />
        </div>

        {/* Mobile: language switcher + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <LangSwitcher language={language} onToggle={toggleLanguage} label={t.a11y.language} />

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={t.a11y.menu}
            aria-expanded={mobileOpen}
            className="flex h-11 w-11 flex-col items-center justify-center gap-[5px]"
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: dur(0.18) }}
              className="block h-px w-5 origin-center bg-muted"
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: dur(0.12) }}
              className="block h-px w-5 bg-muted"
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: dur(0.18) }}
              className="block h-px w-5 origin-center bg-muted"
            />
          </button>
        </div>

      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: dur(0.2), ease: "easeInOut" }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <nav className="flex flex-col px-6 py-3">
              {navLinks.map(({ id, label, href }) => (
                <Link
                  key={id}
                  href={href}
                  onClick={(e) => handleSectionClick(e, id)}
                  className={`flex min-h-11 items-center border-b border-border py-3 text-left text-sm font-medium transition-colors duration-150 ${
                    active === id && !onBlog ? "text-foreground" : "text-muted"
                  }`}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/blog"
                aria-current={onBlog ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={`flex min-h-11 items-center py-3 text-left text-sm font-medium transition-colors duration-150 ${
                  onBlog ? "text-foreground" : "text-muted"
                }`}
              >
                {t.nav.blog}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    </>
  );
}

function LangSwitcher({
  language,
  onToggle,
  label,
  divided = false,
}: {
  language: Language;
  onToggle: () => void;
  label: string;
  divided?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`flex items-center ${divided ? "border-l border-border pl-4" : ""}`}
    >
      {(["en", "es"] as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => { if (lang !== language) onToggle(); }}
          aria-pressed={language === lang}
          className={`inline-flex min-h-11 min-w-11 items-center justify-center text-sm font-medium uppercase transition-colors duration-150 ${
            language === lang ? "text-foreground" : "text-muted hover:text-foreground"
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}

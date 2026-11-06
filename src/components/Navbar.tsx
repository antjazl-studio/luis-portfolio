"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import translations from "@/lib/translations";
import type { Language } from "@/context/LanguageContext";

const NAV_IDS = ["about", "experience", "skills", "projects", "contact"] as const;
type NavId = typeof NAV_IDS[number];

export function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [active,     setActive]     = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { language, toggleLanguage } = useLanguage();
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
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleMonogramClick = (e: React.MouseEvent) => {
    setMobileOpen(false);
    if (onHome && isPlainClick(e)) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Section elements exist only on the home page; re-subscribe on route change.
    if (pathname !== "/") {
      setActive(null);
      return;
    }
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
    return () => observers.forEach((o) => o.disconnect());
  }, [pathname]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">

        {/* Monogram */}
        <Link
          href="/"
          onClick={handleMonogramClick}
          className="font-mono text-sm font-semibold text-cyan-400 transition-colors duration-150 hover:text-cyan-300"
        >
          LJ
        </Link>

        {/* Right group — desktop */}
        <div className="hidden items-center gap-7 md:flex">
          <nav className="flex items-center gap-7">
            {navLinks.map(({ id, label, href }) => {
              const isActive = active === id && !onBlog;
              return (
                <Link
                  key={id}
                  href={href}
                  onClick={(e) => handleSectionClick(e, id)}
                  className={`relative text-sm font-medium transition-colors duration-150 ${
                    isActive ? "text-white" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute -bottom-0.5 left-0 right-0 h-px bg-white/50"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Blog link */}
            <Link
              href="/blog"
              aria-current={onBlog ? "page" : undefined}
              className={`relative text-sm font-medium transition-colors duration-150 ${
                onBlog ? "text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              {t.nav.blog}
              {onBlog && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute -bottom-0.5 left-0 right-0 h-px bg-white/50"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          </nav>

          {/* Language switcher */}
          <LangSwitcher language={language} onToggle={toggleLanguage} />
        </div>

        {/* Mobile: language switcher + hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <LangSwitcher language={language} onToggle={toggleLanguage} />

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="flex h-8 w-8 flex-col items-center justify-center gap-[5px]"
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.18 }}
              className="block h-px w-5 origin-center bg-neutral-400"
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.12 }}
              className="block h-px w-5 bg-neutral-400"
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.18 }}
              className="block h-px w-5 origin-center bg-neutral-400"
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
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/5 bg-black/90 backdrop-blur-md md:hidden"
          >
            <nav className="flex flex-col px-6 py-3">
              {navLinks.map(({ id, label, href }) => (
                <Link
                  key={id}
                  href={href}
                  onClick={(e) => handleSectionClick(e, id)}
                  className={`border-b border-white/5 py-3.5 text-left text-sm font-medium transition-colors duration-150 ${
                    active === id && !onBlog ? "text-white" : "text-neutral-400"
                  }`}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/blog"
                aria-current={onBlog ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={`py-3.5 text-left text-sm font-medium transition-colors duration-150 ${
                  onBlog ? "text-white" : "text-neutral-400"
                }`}
              >
                {t.nav.blog}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function LangSwitcher({ language, onToggle }: { language: Language; onToggle: () => void }) {
  return (
    <div className="relative flex rounded-full border border-white/10 bg-white/5 p-0.5">
      {(["en", "es"] as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => { if (lang !== language) onToggle(); }}
          className={`relative z-10 rounded-full px-2.5 py-1 text-xs font-medium uppercase transition-colors duration-150 ${
            language === lang ? "text-white" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          {language === lang && (
            <motion.span
              layoutId="lang-pill"
              className="absolute inset-0 rounded-full bg-white/10"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          {lang}
        </button>
      ))}
    </div>
  );
}

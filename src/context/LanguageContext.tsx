"use client";

import { createContext, useEffect, useState, useSyncExternalStore, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MotionConfig } from "framer-motion";
import translations from "@/lib/translations";

export type Language = "en" | "es";

type LanguageContextType = {
  language:       Language;
  toggleLanguage: () => void;
  /** True when the visitor prefers reduced motion. Always false on the server and during
   *  hydration (so markup matches), then follows the OS setting. */
  reduceMotion:   boolean;
  /** Pages register the tab title they want (null to clear). The provider applies it and keeps it. */
  setPageTitle:   (title: string | null) => void;
};

export const LanguageContext = createContext<LanguageContextType>({
  language:       "en",
  toggleLanguage: () => {},
  reduceMotion:   false,
  setPageTitle:   () => {},
});

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const toggleLanguage = () => setLanguage((prev) => (prev === "en" ? "es" : "en"));
  const pathname = usePathname();
  const [pageTitle, setPageTitle] = useState<string | null>(null);
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );

  // Keep <html lang> in sync with the language on screen. The initial state ("en") matches the
  // server-rendered markup, so this cannot cause a hydration mismatch.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Tab title (owner decision 2026-11-06): the title follows the language. Next resets document.title
  // from route metadata on client navigation, so the provider both applies the wanted title and
  // re-applies it whenever something else changes the <title>. Effects only: the server HTML keeps the
  // existing English metadata, so there is no hydration mismatch.
  const desiredTitle = pageTitle ?? (pathname === "/" ? translations[language].meta.home : null);
  useEffect(() => {
    if (desiredTitle === null) return;
    const apply = () => {
      if (document.title !== desiredTitle) document.title = desiredTitle;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [desiredTitle, pathname]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, reduceMotion, setPageTitle }}>
      {/* reducedMotion="user": Framer Motion skips transform and layout animations when the
          visitor prefers reduced motion. Opacity-only entrances are handled per component. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LanguageContext.Provider>
  );
}

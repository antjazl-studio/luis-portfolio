"use client";

import { createContext, useEffect, useState, useSyncExternalStore, ReactNode } from "react";
import { MotionConfig } from "framer-motion";

export type Language = "en" | "es";

type LanguageContextType = {
  language:       Language;
  toggleLanguage: () => void;
  /** True when the visitor prefers reduced motion. Always false on the server and during
   *  hydration (so markup matches), then follows the OS setting. */
  reduceMotion:   boolean;
};

export const LanguageContext = createContext<LanguageContextType>({
  language:       "en",
  toggleLanguage: () => {},
  reduceMotion:   false,
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

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, reduceMotion }}>
      {/* reducedMotion="user": Framer Motion skips transform and layout animations when the
          visitor prefers reduced motion. Opacity-only entrances are handled per component. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LanguageContext.Provider>
  );
}

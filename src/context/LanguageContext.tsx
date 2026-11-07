"use client";

import { createContext, useEffect, useState, ReactNode } from "react";
import { MotionConfig } from "framer-motion";

export type Language = "en" | "es";

type LanguageContextType = {
  language:       Language;
  toggleLanguage: () => void;
};

export const LanguageContext = createContext<LanguageContextType>({
  language:       "en",
  toggleLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const toggleLanguage = () => setLanguage((prev) => (prev === "en" ? "es" : "en"));

  // Keep <html lang> in sync with the language on screen. The initial state ("en") matches the
  // server-rendered markup, so this cannot cause a hydration mismatch.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {/* reducedMotion="user": Framer Motion skips transform and layout animations when the
          visitor prefers reduced motion. Opacity-only entrances are handled per component. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LanguageContext.Provider>
  );
}

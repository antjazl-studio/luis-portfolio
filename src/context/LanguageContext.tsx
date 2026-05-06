"use client";

import { createContext, useState, ReactNode } from "react";

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

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { translations, Language, TranslationKey } from "./translations";

type LanguageContextType = {
  language: Language;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  function toggleLanguage() {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
  }

  function t(key: TranslationKey): string {
    return translations[language][key];
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
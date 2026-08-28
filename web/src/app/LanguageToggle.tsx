"use client";

import { useLanguage } from "./LanguageContext";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="fixed top-5 right-30 z-50 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-navy-light"
    >
      {language === "en" ? "हिंदी" : "English"}
    </button>
  );
}
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { translations, type Lang, type Translations } from "@/translations";

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: Translations;
  isAr: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem("bb-lang") as Lang) || "en";
  });

  const isAr = lang === "ar";

  useEffect(() => {
    localStorage.setItem("bb-lang", lang);
    document.documentElement.dir = isAr ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.title = isAr
      ? "بتر بيكري — رمز الفخامة والطعم الذي لا يُنسى"
      : "Butter Bakery — A Symbol of Luxury & Unmistakable Taste";
  }, [lang, isAr]);

  const toggleLang = () => setLang((l) => (l === "en" ? "ar" : "en"));
  const t = translations[lang] as Translations;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, isAr }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}

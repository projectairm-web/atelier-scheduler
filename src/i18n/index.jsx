import { createContext, useContext, useState } from "react";
import { translations } from "./translations.js";

const LangContext = createContext(null);

const SUPPORTED = ["it", "en", "es"];
const LANG_KEY  = "atelier-lang";

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(LANG_KEY);
    return SUPPORTED.includes(saved) ? saved : "it";
  });

  const setLang = (newLang) => {
    if (!SUPPORTED.includes(newLang)) return;
    localStorage.setItem(LANG_KEY, newLang);
    setLangState(newLang);
  };

  const t = translations[lang] ?? translations.it;

  return (
    <LangContext.Provider value={{ t, lang, setLang, SUPPORTED }}>
      {children}
    </LangContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LangContext);
}

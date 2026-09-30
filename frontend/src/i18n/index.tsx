// LanguageProvider — the localization system for the whole app.
// Usage anywhere in the app:
//   const { lang, setLang, t } = useLanguage();
//   t.greeting                       // translated string
//   lesson.title[lang]               // localized content from the API
//
// The chosen language is saved with the offline storage helper, so the app
// opens in the same language next time. Default: English (user's choice).

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { storage } from "@/src/utils/storage";
import en, { Dict } from "./en";
import hi from "./hi";
import mr from "./mr";
import gu from "./gu";

export type LangCode = "en" | "hi" | "mr" | "gu";

// Native names shown in the language switcher (a language name is always
// written in that language, so these are NOT translated).
export const LANGUAGES: { code: LangCode; nativeName: string }[] = [
  { code: "en", nativeName: "English" },
  { code: "hi", nativeName: "हिन्दी" },
  { code: "mr", nativeName: "मराठी" },
  { code: "gu", nativeName: "ગુજરાતી" },
];

// Dictionaries keyed by language code — adding a language = add a file + entry.
export const DICTS: Record<LangCode, Dict> = { en, hi, mr, gu };

const STORAGE_KEY = "surakshit.language";

interface LanguageContextValue {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: Dict; // the active dictionary
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  // Restore the saved language once on app start.
  useEffect(() => {
    storage.getItem(STORAGE_KEY, "en").then((saved) => {
      if (saved && saved in DICTS) setLangState(saved as LangCode);
    });
  }, []);

  const setLang = (next: LangCode) => {
    setLangState(next);
    storage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo(
    () => ({ lang, setLang, t: DICTS[lang] }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

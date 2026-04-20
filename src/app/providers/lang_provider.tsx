'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Lang = 'en' | 'kh';
type Translations = Record<string, string>;

interface LangContextShape {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  loading: boolean;
}

const LangContext = createContext<LangContextShape>({
  lang: 'en',
  setLang: () => {},
  t: (k: string) => k,
  loading: true,
});

export const LangProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Lang>('en');
  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(true);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('lang', l);
    } catch {}
  };

  // load stored language
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lang') as Lang | null;
      if (stored === 'kh' || stored === 'en') {
        setLangState(stored);
      }
    } catch {}
  }, []);

  // fetch translations when lang changes
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        // IMPORTANT: Next.js must load from /public
        const res = await fetch(`/locales/${lang}.json`, { cache: 'no-store' });

        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

        const text = await res.text(); // read raw text first

        if (!text || text.trim().length === 0) {
          throw new Error(`Translation file '${lang}.json' is EMPTY`);
        }

        let data: Translations;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Invalid JSON in ${lang}.json`);
        }

        if (!cancelled) setTranslations(data);
      } catch {
        console.error('LangProvider: failed to load translations:');
        if (!cancelled) setTranslations({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [lang]);

  const t = (key: string) => translations[key] ?? key;

  return (
    <LangContext.Provider value={{ lang, setLang, t, loading }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { en, type TranslationKey } from './en';
import { tl } from './tl';
import type { Language, Localized } from './types';

export * from './types';
export type { TranslationKey } from './en';

const STORAGE_KEY = 'gunita:language';
const DEFAULT_LANGUAGE: Language = 'en';

const dictionaries: Record<Language, Record<TranslationKey, string>> = { en, tl };

type Params = Record<string, string | number>;

type LanguageContextValue = {
  loaded: boolean;
  language: Language;
  setLanguage: (language: Language) => void;
  /** Looks up UI text, e.g. t('deck.cardCount', { count: 12 }). */
  t: (key: TranslationKey, params?: Params) => string;
  /** Picks the current language from content like card questions. */
  pick: (content: Localized) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) =>
        setLanguageState(value === 'en' || value === 'tl' ? value : DEFAULT_LANGUAGE),
      )
      .catch(() => setLanguageState(DEFAULT_LANGUAGE));
  }, []);

  const current = language ?? DEFAULT_LANGUAGE;

  const value: LanguageContextValue = {
    loaded: language !== null,
    language: current,
    setLanguage: (next) => {
      setLanguageState(next);
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
    },
    t: (key, params) => {
      const text = dictionaries[current][key];
      if (!params) return text;
      return text.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in params ? String(params[name]) : match,
      );
    },
    pick: (content) => content[current],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}

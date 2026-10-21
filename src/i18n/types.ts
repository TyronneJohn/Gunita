export type Language = 'en' | 'tl';

/** A piece of content written in every supported language. */
export type Localized = Record<Language, string>;

export const languageNames: Record<Language, string> = {
  en: 'English',
  tl: 'Taglish',
};

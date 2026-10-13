export const languages = ['ru', 'en'] as const;

export type Language = (typeof languages)[number];

/** Russian is the source language: interface keys and story lines are written in it. */
export const defaultLanguage: Language = 'ru';

/** Each language by its own name, the same in every interface language. */
export const languageNames: Record<Language, string> = {
  ru: 'Русский',
  en: 'English',
};

export const languages = ['ru', 'en'] as const;

export type Language = (typeof languages)[number];

/** Russian is the source language: interface keys and story lines are written in it. */
export const defaultLanguage: Language = 'ru';

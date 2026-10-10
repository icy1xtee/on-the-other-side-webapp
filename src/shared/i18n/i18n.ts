import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { defaultLanguage, languages, type Language } from './languages';
import { en } from './locales/en';
import { ru } from './locales/ru';

/** Story translations by language. Russian needs none: its lines are the keys themselves. */
export type StoryTranslations = Partial<Record<Language, Readonly<Record<string, string>>>>;

/**
 * Two namespaces: `ui` — interface strings with flat keys, `story` — translations of the
 * story keyed by the Russian lines themselves (gettext-style), so scenes stay readable. A
 * line with no translation falls back to the Russian key, which is the line itself.
 * `language` is the player's, from the settings.
 */
export function initI18n(story: StoryTranslations, language: Language = defaultLanguage) {
  void i18next.use(initReactI18next).init({
    lng: language,
    fallbackLng: defaultLanguage,
    supportedLngs: languages,
    ns: ['ui', 'story'],
    defaultNS: 'ui',
    resources: Object.fromEntries(
      languages.map((language) => [
        language,
        { ui: language === 'ru' ? ru : en, story: story[language] ?? {} },
      ]),
    ),
    // Story keys are sentences: dots and colons in them are text, not key paths or namespaces.
    keySeparator: false,
    nsSeparator: false,
    returnEmptyString: false,
    // React escapes on its own.
    interpolation: { escapeValue: false },
    // Resources are bundled, so there is nothing to wait for: be ready before the first render.
    initAsync: false,
  });

  document.documentElement.lang = i18next.language;
  i18next.on('languageChanged', (language) => {
    document.documentElement.lang = language;
  });
}

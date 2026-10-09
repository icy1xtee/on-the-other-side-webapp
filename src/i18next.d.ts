import 'i18next';
import type { ru } from '@/shared/i18n/locales/ru';

// `t()` knows every interface key and its interpolation values; story keys are free-form lines.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'ui';
    keySeparator: false;
    nsSeparator: false;
    resources: {
      ui: typeof ru;
      story: Record<string, string>;
    };
  }
}

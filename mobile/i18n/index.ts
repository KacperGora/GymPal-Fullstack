import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import pl from './locales/pl.json';

const deviceLocale = getLocales()[0]?.languageCode ?? 'en';
const supportedLocale = deviceLocale === 'pl' ? 'pl' : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pl: { translation: pl },
  },
  lng: supportedLocale,
  fallbackLng: 'en',
  interpolation: {
    // Match next-intl syntax: {variable} instead of i18next default {{variable}}
    prefix: '{',
    suffix: '}',
    escapeValue: false,
  },
});

export default i18n;
export { supportedLocale };

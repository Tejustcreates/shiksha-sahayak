import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './utils/en.json';
import mrTranslation from './utils/mr.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation.translation },
      mr: { translation: mrTranslation.translation }
    },
    lng: "en", // Default language when the app loads
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
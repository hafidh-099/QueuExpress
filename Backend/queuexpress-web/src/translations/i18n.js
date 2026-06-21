import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import sw from './sw.json';

const resources = {
  en: { translation: en },
  sw: { translation: sw },
};

const savedLanguage = localStorage.getItem('queuexpress-language') || 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
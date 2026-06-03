import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import sw from './sw.json';

const resources = {
  en: { translation: en },
  sw: { translation: sw },
};

const initI18n = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('@queuexpress:language');
    const language = savedLanguage || 'en';
    
    i18n.use(initReactI18next).init({
      resources,
      lng: language,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
  } catch (error) {
    console.error('i18n init error:', error);
    i18n.use(initReactI18next).init({
      resources,
      lng: 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
  }
};

initI18n();

export default i18n;
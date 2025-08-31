import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import axios from 'axios';

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

const loadTranslations = async (language: string) => {
  try {
    const response = await axios.get(`/api/translations?language=${language}`);
    const translations = response.data.reduce(
      (
        acc: { [key: string]: string },
        item: { key: string; value: string }
      ) => {
        acc[item.key] = item.value;
        return acc;
      },
      {}
    );
    return translations;
  } catch (error) {
    console.error('Failed to load translations:', error);
    return {};
  }
};

const initializeI18n = async () => {
  const defaultLanguage = localStorage.getItem('language') || 'en';
  const translations = await loadTranslations(defaultLanguage);
  await i18n.use(initReactI18next).init({
    lng: defaultLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: translations },
      es: { translation: {} },
      fr: { translation: {} },
    },
  });
  isInitialized = true;
};

// Initialize i18n on first load
initializationPromise = initializeI18n();

export const changeLanguage = async (lng: string) => {
  if (!isInitialized) {
    await initializationPromise;
  }
  const translations = await loadTranslations(lng);
  i18n.addResourceBundle(lng, 'translation', translations, true, true);
  await i18n.changeLanguage(lng);
  localStorage.setItem('language', lng);
};

export const isI18nInitialized = () => isInitialized;

export default i18n;

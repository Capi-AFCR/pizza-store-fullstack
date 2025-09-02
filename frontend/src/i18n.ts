import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import axios from 'axios';

const fetchTranslations = async (language: string) => {
  try {
    const response = await axios.get(`/api/translations?language=${language}`);
    return response.data.reduce(
      (acc: { [key: string]: string }, t: { key: string; value: string }) => {
        acc[t.key] = t.value;
        return acc;
      },
      {}
    );
  } catch (error) {
    console.error('Failed to fetch translations:', error);
    return {};
  }
};

export const isI18nInitialized = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (i18n.isInitialized) {
      resolve(true);
    } else {
      i18n.on('initialized', () => resolve(true));
    }
  });
};

const initializeI18n = async () => {
  const languages = ['en', 'es', 'fr'];
  const resources: {
    [key: string]: { translation: { [key: string]: string } };
  } = {};

  for (const lang of languages) {
    resources[lang] = { translation: await fetchTranslations(lang) };
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
};

initializeI18n();

export default i18n;

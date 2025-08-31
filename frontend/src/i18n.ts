import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import { Translation } from './types';

i18next
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/api/translations?language={{lng}}',
      parse: (data: string) => {
        try {
          const translations = JSON.parse(data) as Translation[];
          const resources: { [key: string]: string } = {};
          translations.forEach((t: Translation) => {
            resources[t.key] = t.value;
          });
          return resources;
        } catch (error) {
          console.error('Failed to parse translations:', error);
          return {
            'navbar.title': 'Pizza Store',
            'navbar.login': 'Login',
            'navbar.register': 'Register',
            'navbar.orders': 'Orders',
            'navbar.logout': 'Logout',
            'navbar.language_en': 'English',
            'navbar.language_es': 'Spanish',
            'navbar.language_fr': 'French',
          };
        }
      },
    },
  })
  .catch((error) => {
    console.error('Failed to initialize i18next:', error);
    i18next.init({
      lng: 'en',
      fallbackLng: 'en',
      resources: {
        en: {
          translation: {
            'navbar.title': 'Pizza Store',
            'navbar.login': 'Login',
            'navbar.register': 'Register',
            'navbar.orders': 'Orders',
            'navbar.logout': 'Logout',
            'navbar.language_en': 'English',
            'navbar.language_es': 'Spanish',
            'navbar.language_fr': 'French',
          },
        },
      },
    });
  });

export default i18next;

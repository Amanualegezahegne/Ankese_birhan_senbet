import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import amTranslation from './locales/am/translation.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: enTranslation,
            },
            am: {
                translation: amTranslation,
            },
        },
        fallbackLng: 'en',
        debug: true, // Set to false in production
        interpolation: {
            escapeValue: false, // React already safe from xss
        },
    });

export default i18n;

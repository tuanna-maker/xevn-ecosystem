import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import vi from './locales/vi.json';
import en from './locales/en.json';
import zh from './locales/zh.json';
import lo from './locales/lo.json';
import km from './locales/km.json';
import my from './locales/my.json';

// Get saved language with fallback
const getSavedLanguage = () => {
  try {
    return localStorage.getItem('language') || 'en';
  } catch {
    return 'vi';
  }
};

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    en: { translation: en },
    zh: { translation: zh },
    lo: { translation: lo },
    km: { translation: km },
    my: { translation: my },
  },
  lng: getSavedLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  returnEmptyString: false,
  returnNull: false,
  keySeparator: '.',
  nsSeparator: ':',
});

export const languages = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'lo', name: 'ພາສາລາວ', flag: '🇱🇦' },
  { code: 'km', name: 'ភាសាខ្មែរ', flag: '🇰🇭' },
  { code: 'my', name: 'မြန်မာဘာသာ', flag: '🇲🇲' },
];

export default i18n;

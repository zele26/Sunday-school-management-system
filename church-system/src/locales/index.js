// src/locales/index.js
import amMessages from './am.json';
import enMessages from './en.json';

/**
 * 🌍 Scalable Language Registry
 * To add a new language in the future:
 * 1. Create a `src/locales/<langCode>.json` file with translated strings.
 * 2. Import it here and add it to `availableLanguages` and `messagesMap`.
 */
export const availableLanguages = [
  {
    code: 'am',
    name: 'አማርኛ',
    englishName: 'Amharic',
    flag: '🇪🇹',
    dir: 'ltr',
    isDefault: true,
  },
  {
    code: 'en',
    name: 'English',
    englishName: 'English',
    flag: '🇬🇧',
    dir: 'ltr',
    isDefault: false,
  },
  // 🔮 Future expansion ready:
  // { code: 'om', name: 'Afaan Oromoo', flag: '🇪🇹', dir: 'ltr' },
  // { code: 'ti', name: 'ትግርኛ', flag: '🇪🇹', dir: 'ltr' },
  // { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  // { code: 'gez', name: 'ግዕዝ', flag: '📜', dir: 'ltr' },
];

export const messagesMap = {
  am: amMessages,
  en: enMessages,
};

export const defaultLocale = 'am';

export const getMessagesForLocale = (locale) => {
  return messagesMap[locale] || messagesMap[defaultLocale];
};

export default {
  availableLanguages,
  messagesMap,
  defaultLocale,
  getMessagesForLocale,
};

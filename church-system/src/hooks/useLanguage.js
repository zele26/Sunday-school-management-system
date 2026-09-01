// src/hooks/useLanguage.js
import { useState, useEffect } from 'react';
import { translations } from '../utils/translations';

export const useLanguage = () => {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('app_lang') || 'am'; // Default to Amharic for Church portal
  });

  const setLang = (newLang) => {
    localStorage.setItem('app_lang', newLang);
    setLangState(newLang);
  };

  const toggleLang = () => {
    const nextLang = lang === 'am' ? 'en' : 'am';
    setLang(nextLang);
  };

  const t = (key) => {
    if (translations[key] && translations[key][lang]) {
      return translations[key][lang];
    }
    return key;
  };

  return {
    lang,
    setLang,
    toggleLang,
    t,
    isAmharic: lang === 'am',
  };
};

export default useLanguage;

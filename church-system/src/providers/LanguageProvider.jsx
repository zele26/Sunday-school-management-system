'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { IntlProvider, createIntl, createIntlCache } from 'react-intl';
import { availableLanguages, getMessagesForLocale, defaultLocale } from '../locales';
import { translations } from '../utils/translations';

export const LanguageContext = createContext(null);

// Cache for intl formatting instances
const cache = createIntlCache();

export function LanguageProvider({ children, defaultLang = defaultLocale }) {
  const [locale, setLocaleState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('app_lang');
        const isValid = availableLanguages.some((lang) => lang.code === stored);
        if (isValid) {
          return stored;
        }
      } catch (err) {
        console.warn('Could not read app_lang from localStorage', err);
      }
    }
    return defaultLang;
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      const currentLang = availableLanguages.find((l) => l.code === locale);
      if (currentLang?.dir) {
        document.documentElement.dir = currentLang.dir;
      }
    }
  }, [locale]);

  // Sync across browser tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'app_lang' && e.newValue) {
        const isValid = availableLanguages.some((lang) => lang.code === e.newValue);
        if (isValid) {
          setLocaleState(e.newValue);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setLanguage = useCallback((newLocale) => {
    const isValid = availableLanguages.some((lang) => lang.code === newLocale);
    if (!isValid) return;

    try {
      localStorage.setItem('app_lang', newLocale);
    } catch (err) {
      console.warn('Could not save app_lang to localStorage', err);
    }

    setLocaleState(newLocale);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
      const currentLang = availableLanguages.find((l) => l.code === newLocale);
      if (currentLang?.dir) {
        document.documentElement.dir = currentLang.dir;
      }
    }
  }, []);

  // Backward-compatible alias
  const setLang = setLanguage;

  const toggleLang = useCallback(() => {
    setLanguage(locale === 'am' ? 'en' : 'am');
  }, [locale, setLanguage]);

  // Load active messages dictionary
  const messages = useMemo(() => getMessagesForLocale(locale), [locale]);

  // Memoized react-intl instance for programmatic translation lookups
  const intl = useMemo(
    () =>
      createIntl(
        {
          locale,
          messages,
          defaultLocale,
        },
        cache
      ),
    [locale, messages]
  );

  /**
   * Flexible translation helper:
   * 1. Checks react-intl messages dictionary
   * 2. Checks legacy translations dictionary
   * 3. Falls back to defaultText, then key
   */
  const t = useCallback(
    (key, defaultText, values) => {
      if (messages && messages[key]) {
        if (values) {
          try {
            return intl.formatMessage({ id: key, defaultMessage: messages[key] }, values);
          } catch {
            return messages[key];
          }
        }
        return messages[key];
      }

      // Legacy dictionary fallback
      if (translations[key] && translations[key][locale]) {
        return translations[key][locale];
      }

      return defaultText !== undefined ? defaultText : key;
    },
    [messages, locale, intl]
  );

  const currentLanguageMeta = useMemo(
    () => availableLanguages.find((l) => l.code === locale) || availableLanguages[0],
    [locale]
  );

  const value = {
    locale,
    lang: locale, // Backward compatibility alias
    setLanguage,
    setLang, // Backward compatibility alias
    toggleLang,
    t,
    intl,
    availableLanguages,
    currentLanguage: currentLanguageMeta,
    isAmharic: locale === 'am',
    isEnglish: locale === 'en',
    mounted,
  };

  return (
    <LanguageContext.Provider value={value}>
      <IntlProvider locale={locale} defaultLocale={defaultLocale} messages={messages}>
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (!context) {
    const fallbackLocale = defaultLocale;
    const fallbackMessages = getMessagesForLocale(fallbackLocale);
    return {
      locale: fallbackLocale,
      lang: fallbackLocale,
      setLanguage: () => {},
      setLang: () => {},
      toggleLang: () => {},
      t: (key, defaultText) => {
        if (fallbackMessages[key]) return fallbackMessages[key];
        if (translations[key] && translations[key][fallbackLocale]) {
          return translations[key][fallbackLocale];
        }
        return defaultText !== undefined ? defaultText : key;
      },
      availableLanguages,
      currentLanguage: availableLanguages[0],
      isAmharic: true,
      isEnglish: false,
      mounted: true,
    };
  }
  return context;
}

export default LanguageProvider;

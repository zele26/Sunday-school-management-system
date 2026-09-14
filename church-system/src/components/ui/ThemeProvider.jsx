'use client';

import React, { createContext, useContext, useEffect, useLayoutEffect, useState, useMemo, useCallback } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  resolvedTheme: 'light',
  themes: ['light', 'dark', 'system'],
  systemTheme: 'light',
});

export const useTheme = () => useContext(ThemeContext);

const MEDIA = '(prefers-color-scheme: dark)';

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'theme',
  enableSystem = true,
  attribute = 'class',
  disableTransitionOnChange = false,
}) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) return stored;
      } catch (e) {
        // ignore storage errors
      }
    }
    return defaultTheme;
  });

  const [systemTheme, setSystemTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(MEDIA).matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const resolvedTheme = useMemo(() => {
    if (theme === 'system' && enableSystem) {
      return systemTheme;
    }
    return theme;
  }, [theme, systemTheme, enableSystem]);

  // Update DOM attributes
  const applyTheme = useCallback(
    (targetTheme) => {
      if (typeof document === 'undefined') return;
      const root = document.documentElement;

      if (disableTransitionOnChange) {
        const css = document.createElement('style');
        css.appendChild(
          document.createTextNode(
            '*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}'
          )
        );
        document.head.appendChild(css);
        setTimeout(() => {
          if (document.head.contains(css)) {
            document.head.removeChild(css);
          }
        }, 1);
      }

      if (attribute === 'class') {
        root.classList.remove('light', 'dark');
        if (targetTheme) {
          root.classList.add(targetTheme);
        }
      } else {
        if (targetTheme) {
          root.setAttribute(attribute, targetTheme);
        } else {
          root.removeAttribute(attribute);
        }
      }
    },
    [attribute, disableTransitionOnChange]
  );

  // Sync with system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia(MEDIA);
    const handleChange = (e) => {
      const nextSystem = e.matches ? 'dark' : 'light';
      setSystemTheme(nextSystem);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Sync across tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorage = (e) => {
      if (e.key === storageKey && e.newValue) {
        setThemeState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [storageKey]);

  // Apply theme synchronously before paint
  useIsomorphicLayoutEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme, applyTheme]);

  const setTheme = useCallback(
    (newTheme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (e) {
        // ignore
      }
    },
    [storageKey]
  );

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      themes: enableSystem ? ['light', 'dark', 'system'] : ['light', 'dark'],
      systemTheme,
    }),
    [theme, setTheme, resolvedTheme, enableSystem, systemTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export default ThemeProvider;

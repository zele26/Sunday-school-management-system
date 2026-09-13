'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { cn } from './utils';
import { useLanguage } from '../../hooks/useLanguage';

export function LanguageToggle({ className, variant = 'button', showLabel = false }) {
  const {
    locale,
    setLanguage,
    toggleLang,
    isAmharic,
    isEnglish,
    availableLanguages,
    currentLanguage,
    mounted,
  } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  if (!mounted) {
    return (
      <div className={cn('w-10 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse', className)} />
    );
  }

  // Segmented Pill Variant (e.g. for settings or modal dialogs)
  if (variant === 'segmented') {
    return (
      <div
        className={cn(
          'inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
          className
        )}
      >
        {availableLanguages.map((lang) => {
          const isActive = locale === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer active:opacity-85',
                isActive
                  ? 'bg-white dark:bg-slate-900 text-[#1657b8] dark:text-amber-400 shadow-xs ring-1 ring-black/5 dark:ring-white/10'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              )}
              title={lang.name}
            >
              <span className="text-sm">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Multi-Language Dropdown Variant (Future-proof for 3+ languages)
  if (variant === 'dropdown' || availableLanguages.length > 2) {
    return (
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'inline-flex items-center justify-between gap-1.5 px-2.5 py-1.5 h-9 rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95 cursor-pointer select-none text-xs font-bold',
            className
          )}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className="text-sm">{currentLanguage.flag}</span>
          <span className="uppercase text-[11px] font-black">{currentLanguage.code}</span>
          <ChevronDown className={cn('w-3 h-3 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-36 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
            {availableLanguages.map((lang) => {
              const isCurrent = locale === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-colors cursor-pointer text-left',
                    isCurrent
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-amber-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                  {isCurrent && <Check className="w-3.5 h-3.5 text-[#1657b8] dark:text-amber-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Default Quick Dual-Language Toggle Pill
  return (
    <button
      type="button"
      onClick={toggleLang}
      className={cn(
        'relative inline-flex items-center justify-center gap-1.5 px-2.5 h-9 rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md hover:border-amber-400/50 text-slate-700 dark:text-slate-200 transition-all duration-150 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95 cursor-pointer select-none',
        className
      )}
      aria-label="Language Switcher"
      title={isAmharic ? 'Switch to English (ወደ English ቀይር)' : 'ወደ አማርኛ ቀይር (Switch to Amharic)'}
    >
      <span className="text-xs leading-none">{isAmharic ? '🇪🇹' : '🇬🇧'}</span>
      <span className="text-[11px] font-black tracking-tight uppercase">
        {isAmharic ? 'አማ' : 'EN'}
      </span>
      {showLabel && (
        <span className="text-xs font-semibold hidden md:inline ml-0.5 text-slate-500 dark:text-slate-400">
          {isAmharic ? 'አማርኛ' : 'English'}
        </span>
      )}
    </button>
  );
}

export default LanguageToggle;

'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Send, Sparkles, Phone, UserPlus, LogIn, ArrowRight, Home, Globe, BookOpen, ExternalLink } from 'lucide-react';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp';
import useAuthStore from '../store/authStore';
import { useLanguage } from '../hooks/useLanguage';

/**
 * Check if a route should be exempt from Telegram auth blocking.
 * Public, registration, status checking, and login pages must always render freely.
 */
const isExemptPath = (path) => {
  if (!path) return true;
  const cleanPath = path.toLowerCase().split('?')[0].split('#')[0];

  // Exact match for root / landing page
  if (cleanPath === '' || cleanPath === '/') return true;

  // Registration & Public & Auth paths
  const exemptPrefixes = [
    '/register',
    '/student-register',
    '/register-student',
    '/register-regular',
    '/register-distance',
    '/continue-registration',
    '/check-status',
    '/login',
    '/forgot-password',
    '/change-password',
    '/about',
    '/announcements',
    '/certificates',
    '/classes',
    '/contact',
    '/distance-education',
    '/gallery',
    '/verify-certificate',
  ];

  return exemptPrefixes.some((prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`));
};

const getTranslations = (isAmharic, firstName) => ({
  authTitle: isAmharic
    ? 'በቴሌግራም ደህንነቱ በተጠበቀ ሁኔታ በመግባት ላይ...'
    : 'Authenticating via Telegram...',
  authDesc: isAmharic
    ? `ሰላም ${firstName}፣ የተማሪ ማህደርዎ እየተረጋገጠ ነው`
    : `Welcome ${firstName}, verifying your student credentials`,
  linkTitle: isAmharic
    ? 'የቴሌግራም አካውንትዎን ያገናኙ ወይም አዲስ ይመዝገቡ'
    : 'Link Account or Register as New Student',
  linkDesc: isAmharic
    ? `ሰላም ${firstName}፣ ይህ የቴሌግራም አካውንት እስካሁን ከተማሪ መረጃ ጋር አልተገናኘም።`
    : `Hello ${firstName}, this Telegram account is not yet linked to a student profile.`,
  newStudentHeading: isAmharic
    ? '✨ አዲስ ተማሪ ነዎት?'
    : '✨ Are You a New Student?',
  newStudentDesc: isAmharic
    ? 'በሰንበት ት/ቤታችን ለመማር አዲስ ከሆኑ አሁኑኑ ይመዝገቡ፦'
    : 'If you want to join our Sunday School, register now:',
  registerRegularBtn: isAmharic
    ? '📝 የመደበኛ ተማሪዎች ምዝገባ (Register Regular)'
    : '📝 Regular Student Registration',
  registerDistanceBtn: isAmharic
    ? '🌐 የርቀት ትምህርት ምዝገባ (Distance Education)'
    : '🌐 Distance Education Registration',
  existingStudentHeading: isAmharic
    ? '🔐 ቀድመው የተመዘገቡ ተማሪ ነዎት?'
    : '🔐 Already Registered?',
  howToLink: isAmharic ? 'እንዴት ማገናኘት ይቻላል?' : 'How to Link:',
  steps: isAmharic
    ? [
      'ወደ ቴሌግራም ቦቱ ውይይት (Chat) ይመለሱ።',
      '"📱 ስልክ ቁጥር ያገናኙ (Link Phone)" የሚለውን ይጫኑ።',
      'ከዚያ ይህን ፖርታል በድጋሚ ይክፈቱ።',
    ]
    : [
      'Return to the Telegram bot chat.',
      'Tap "📱 Link Phone" and share your registered number.',
      'Then reopen this student portal.',
    ],
  goToBotBtn: isAmharic
    ? '✈️ ወደ ቴሌግራም ቦት ተመለስ (Go to Bot)'
    : '✈️ Go Back to Telegram Bot',
  loginBtn: isAmharic
    ? '🔑 በስልክና በፓስዎርድ ይግቡ (Login with Password)'
    : '🔑 Login with Password',
  homeBtn: isAmharic
    ? '🌐 ወደ ዋናው ገጽ ተመለስ (Go to Home Page)'
    : '🌐 Go to Home Page',
});

export default function TelegramWebAppInitializer({ children }) {
  const pathname = usePathname() || (typeof window !== 'undefined' ? window.location.pathname : '');
  const { isTelegram, telegramUser, isAuthenticating, authError, closeTelegramApp } = useTelegramWebApp();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const { isAmharic } = useLanguage();

  const firstName = telegramUser?.first_name || '';
  const t = useMemo(() => getTranslations(isAmharic, firstName), [isAmharic, firstName]);

  // 1. If not running inside Telegram at all (i.e. standard web browser), ALWAYS render children!
  if (!isTelegram) {
    return <>{children}</>;
  }

  // 2. If the user is on any public, registration, or login route, ALWAYS render children!
  // This allows new users to register and existing users to login without being blocked.
  if (isExemptPath(pathname)) {
    return <>{children}</>;
  }

  // State 1: Inside Telegram and authenticating on a protected route
  if (isTelegram && isAuthenticating && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-white font-sans antialiased relative overflow-hidden">
        {/* Subtle Ambient Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Integrated Icon & Spinner */}
          <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-slate-700/50"></div>
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 border-r-amber-400/50 animate-spin"
              role="status"
              aria-label="Authenticating"
            >
              <span className="sr-only">Loading...</span>
            </div>
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.15)]">
              <Send className="w-7 h-7 text-amber-400 transform -rotate-12 translate-x-0.5" aria-hidden="true" />
            </div>
          </div>

          {/* Typography */}
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
            {t.authTitle}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-sm leading-relaxed">
            {t.authDesc}
          </p>
        </div>
      </div>
    );
  }

  // State 2: Inside Telegram, not logged in, trying to access protected area (e.g. /dashboard)
  if (isTelegram && !isLoggedIn && (authError === 'not_linked' || !isAuthenticating)) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 sm:p-6 text-white font-sans antialiased relative overflow-y-auto">
        {/* Subtle Ambient Background Glows */}
        <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-white/10 shadow-2xl relative z-10 flex flex-col items-center text-center my-auto space-y-6">

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-500/5 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
            <Phone className="w-8 h-8" aria-hidden="true" />
          </div>

          {/* Typography */}
          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">{t.linkTitle}</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{t.linkDesc}</p>
          </div>

          {/* Section 1: NEW STUDENT REGISTRATION (Prominent Primary Action) */}
          <div className="w-full bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent rounded-2xl p-4 sm:p-5 border border-amber-500/30 text-left space-y-3 shadow-inner">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-amber-300 text-sm tracking-wide">{t.newStudentHeading}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.newStudentDesc}
            </p>
            <div className="grid grid-cols-1 gap-2 pt-1">
              <Link
                href="/register-regular"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 active:scale-98"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t.registerRegularBtn}</span>
              </Link>
              <Link
                href="/register-distance"
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Globe className="w-3.5 h-3.5 text-blue-300" />
                <span>{t.registerDistanceBtn}</span>
              </Link>
            </div>
          </div>

          {/* Section 2: EXISTING STUDENT ACCOUNT LINKING */}
          <div className="w-full bg-black/30 rounded-2xl p-4 sm:p-5 border border-white/5 text-left space-y-3 shadow-inner">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-300" />
              <span className="font-semibold text-slate-200 text-xs sm:text-sm tracking-wide">{t.existingStudentHeading}</span>
            </div>
            <ul className="space-y-2">
              {t.steps.map((step, index) => (
                <li key={index} className="flex items-start text-slate-300 text-xs">
                  <span className="flex-shrink-0 flex items-center justify-center w-4 h-4 rounded-full bg-white/10 text-white/70 text-[10px] font-mono mr-2.5 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>

            <div className="pt-1 grid grid-cols-1 gap-2">
              <button
                onClick={closeTelegramApp}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600/30 hover:bg-blue-600/40 text-blue-200 border border-blue-400/30 font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.goToBotBtn}</span>
              </button>
              <Link
                href="/login"
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-xs border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.loginBtn}</span>
              </Link>
            </div>
          </div>

          {/* Bottom Link: Go to Main Site */}
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 py-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t.homeBtn}</span>
          </Link>
        </div>
      </div>
    );
  }

  // State 3: Normal pass-through render
  return <>{children}</>;
}
'use client';

import React, { useMemo } from 'react';
import { Send, Sparkles, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp';
import useAuthStore from '../store/authStore';
import { useLanguage } from '../hooks/useLanguage';

const getTranslations = (isAmharic, firstName) => ({
  authTitle: isAmharic
    ? 'በቴሌግራም ደህንነቱ በተጠበቀ ሁኔታ በመግባት ላይ...'
    : 'Authenticating via Telegram Mini App...',
  authDesc: isAmharic
    ? `ሰላም ${firstName}፣ የተማሪ ማህደርዎ እየተረጋገጠ ነው...`
    : `Welcome ${firstName}, verifying your student credentials...`,
  linkTitle: isAmharic
    ? 'የቴሌግራም አካውንትዎን ያገናኙ'
    : 'Link Your Telegram Account',
  linkDesc: isAmharic
    ? `ሰላም ${firstName}፣ ይህ የቴሌግራም አካውንት እስካሁን ከተማሪ መረጃዎ ጋር አልተገናኘም።`
    : `Hello ${firstName}, this Telegram account is not yet linked to a student profile.`,
  howToLink: isAmharic ? 'እንዴት ማገናኘት ይቻላል?' : 'How to Link:',
  steps: isAmharic
    ? [
      'ወደ ቴሌግራም ቦቱ ውይይት (Chat) ይመለሱ።',
      '"📱 ስልክ ቁጥር ያገናኙ (Link Phone)" የሚለውን ይጫኑ።',
      'ከዚያ ይህን ፖርታል በድጋሚ ይክፈቱ።',
    ]
    : [
      'Go back to the Telegram Bot chat.',
      'Tap the "📱 Link Phone" button.',
      'Then reopen this portal.',
    ],
  loginBtn: isAmharic
    ? 'በስልክና በፓስዎርድ ይግቡ (Login with Password)'
    : 'Login with Password',
  botBtn: isAmharic
    ? 'ወደ ቴሌግራም ቦት ተመለስ (Go to Bot)'
    : 'Return to Telegram Bot',
});

// --- View 1: Fast Loading / Authenticating Animation ---
const AuthenticatingView = ({ t }) => (
  <main className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-white font-sans antialiased relative overflow-hidden">
    {/* Ambient Glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

    <section className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-sm">
      {/* Dynamic Telegram Flying Paper Plane */}
      <div className="relative w-22 h-22 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-blue-500/30" aria-hidden="true" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 border-r-blue-400/50 animate-spin"
          role="status"
          aria-label="Authenticating"
        />
        <div className="w-16 h-16 rounded-full bg-blue-500/15 border border-blue-400/30 flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.25)]">
          <Send className="w-7 h-7 text-blue-400 transform -rotate-12 translate-x-0.5 animate-pulse" aria-hidden="true" />
        </div>
      </div>

      <div className="space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
          {t.authTitle}
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          {t.authDesc}
        </p>
      </div>
    </section>
  </main>
);

// --- View 2: Account Not Linked Guidance & Instant Action ---
const AccountNotLinkedView = ({ t, closeTelegramApp }) => (
  <main className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 sm:p-6 text-white font-sans antialiased relative overflow-hidden">
    {/* Ambient Ambient Background Lights */}
    <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />
    <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

    <section className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative z-10 flex flex-col items-center text-center space-y-6">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-500/5 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
        <Phone className="w-8 h-8" aria-hidden="true" />
      </div>

      {/* Title */}
      <header className="space-y-1.5">
        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">{t.linkTitle}</h3>
        <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">{t.linkDesc}</p>
      </header>

      {/* 3 Step Guide */}
      <div className="w-full bg-black/30 rounded-2xl p-4 sm:p-5 border border-white/5 text-left shadow-inner space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" aria-hidden="true" />
          <h4 className="font-bold text-amber-300 text-xs sm:text-sm tracking-wide m-0">{t.howToLink}</h4>
        </div>

        <ol className="space-y-2.5 text-xs">
          {t.steps.map((step, index) => (
            <li key={index} className="flex items-start text-slate-200">
              <span
                className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold mr-2.5 mt-0.5 border border-amber-400/40"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-2.5 pt-1">
        <button
          onClick={closeTelegramApp}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>{t.botBtn}</span>
        </button>

        <a
          href="/login"
          className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs transition-all border border-white/10 flex items-center justify-center gap-1.5"
        >
          <span>{t.loginBtn}</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-70" />
        </a>
      </div>
    </section>
  </main>
);

// --- Main Telegram WebApp Initializer ---
export default function TelegramWebAppInitializer({ children }) {
  const { isTelegram, telegramUser, isAuthenticating, authError, closeTelegramApp } = useTelegramWebApp();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const { isAmharic } = useLanguage();

  const firstName = telegramUser?.first_name || '';
  const t = useMemo(() => getTranslations(isAmharic, firstName), [isAmharic, firstName]);

  // State 1: Inside Telegram and authenticating
  if (isTelegram && isAuthenticating && !isLoggedIn) {
    return <AuthenticatingView t={t} />;
  }

  // State 2: Inside Telegram, not logged in, account not linked
  if (isTelegram && !isLoggedIn && authError === 'not_linked') {
    return <AccountNotLinkedView t={t} closeTelegramApp={closeTelegramApp} />;
  }

  // State 3: Normal pass-through render
  return <>{children}</>;
}
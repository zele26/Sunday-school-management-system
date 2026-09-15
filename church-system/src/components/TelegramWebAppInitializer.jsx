// src/components/TelegramWebAppInitializer.jsx
'use client';

import React from 'react';
import { Send, Sparkles, Phone, Lock, ExternalLink, RefreshCw } from 'lucide-react';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp';
import useAuthStore from '../store/authStore';
import { useLanguage } from '../hooks/useLanguage';
import { Button } from './ui/Button';

export default function TelegramWebAppInitializer({ children }) {
  const { isTelegram, telegramUser, isAuthenticating, authError } = useTelegramWebApp();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const { isAmharic } = useLanguage();

  // If inside Telegram and authenticating
  if (isTelegram && isAuthenticating && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-white text-center font-sans">
        <div className="w-16 h-16 rounded-3xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mb-5 animate-pulse shadow-lg">
          <Send className="w-8 h-8 text-blue-400 transform -rotate-12" />
        </div>
        <h2 className="text-xl font-black tracking-tight mb-2">
          {isAmharic ? 'በቴሌግራም ደህንነቱ በተጠበቀ ሁኔታ በመግባት ላይ...' : 'Authenticating via Telegram Mini App...'}
        </h2>
        <p className="text-sm text-slate-300 max-w-xs mb-6">
          {isAmharic
            ? `ሰላም ${telegramUser?.first_name || ''}፣ የተማሪ ማህደርዎ እየተረጋገጠ ነው`
            : `Welcome ${telegramUser?.first_name || ''}, verifying student credentials`}
        </p>
        <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If inside Telegram, not logged in, and account is not yet linked
  if (isTelegram && !isLoggedIn && authError === 'not_linked') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-300/40 text-amber-300 flex items-center justify-center mx-auto shadow-inner">
            <Phone className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-black">
              {isAmharic ? 'የቴሌግራም አካውንትዎን ያገናኙ' : 'Link Your Telegram Account'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isAmharic
                ? `ሰላም ${telegramUser?.first_name || ''}፣ ይህ የቴሌግራም አካውንት እስካሁን ከተማሪ መረጃዎ ጋር አልተገናኘም።`
                : `Hello ${telegramUser?.first_name || ''}, this Telegram account is not yet linked to a student profile.`}
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-left text-xs space-y-2">
            <p className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{isAmharic ? 'እንዴት ማገናኘት ይቻላል?' : 'How to Link:'}</span>
            </p>
            <p className="text-slate-200">
              {isAmharic
                ? '1. ወደ ቴሌግራም ቦቱ ይመለሱ።'
                : '1. Go back to the Telegram Bot.'}
            </p>
            <p className="text-slate-200">
              {isAmharic
                ? '2. "📱 ስልክ ቁጥር ያገናኙ" የሚለውን አዝራር ይጫኑ።'
                : '2. Tap the "📱 Link Phone" button.'}
            </p>
            <p className="text-slate-200">
              {isAmharic
                ? '3. ከዚያ ይህን ፖርታል በድጋሚ ይክፈቱ።'
                : '3. Then reopen this portal.'}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <a
              href="/login"
              className="block w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-md transition-all active:scale-95"
            >
              {isAmharic ? 'በስልክና በፓስዎርድ ይግቡ (Login with Password)' : 'Login with Password'}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
    </>
  );
}

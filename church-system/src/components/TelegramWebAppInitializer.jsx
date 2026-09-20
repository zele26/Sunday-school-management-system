// // src/components/TelegramWebAppInitializer.jsx
// // 'use client';

// // import React from 'react';
// // import { Send, Sparkles, Phone, Lock, ExternalLink, RefreshCw } from 'lucide-react';
// // import { useTelegramWebApp } from '../hooks/useTelegramWebApp';
// // import useAuthStore from '../store/authStore';
// // import { useLanguage } from '../hooks/useLanguage';
// // import { Button } from './ui/Button';

// // export default function TelegramWebAppInitializer({ children }) {
// //   const { isTelegram, telegramUser, isAuthenticating, authError } = useTelegramWebApp();
// //   const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
// //   const { isAmharic } = useLanguage();

// //   // If inside Telegram and authenticating
// //   if (isTelegram && isAuthenticating && !isLoggedIn) {
// //     return (
// //       <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-white text-center font-sans">
// //         <div className="w-16 h-16 rounded-3xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mb-5 animate-pulse shadow-lg">
// //           <Send className="w-8 h-8 text-blue-400 transform -rotate-12" />
// //         </div>
// //         <h2 className="text-xl font-black tracking-tight mb-2">
// //           {isAmharic ? 'በቴሌግራም ደህንነቱ በተጠበቀ ሁኔታ በመግባት ላይ...' : 'Authenticating via Telegram Mini App...'}
// //         </h2>
// //         <p className="text-sm text-slate-300 max-w-xs mb-6">
// //           {isAmharic
// //             ? `ሰላም ${telegramUser?.first_name || ''}፣ የተማሪ ማህደርዎ እየተረጋገጠ ነው`
// //             : `Welcome ${telegramUser?.first_name || ''}, verifying student credentials`}
// //         </p>
// //         <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
// //       </div>
// //     );
// //   }

// //   // If inside Telegram, not logged in, and account is not yet linked
// //   if (isTelegram && !isLoggedIn && authError === 'not_linked') {
// //     return (
// //       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-6 text-white font-sans">
// //         <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl text-center space-y-5">
// //           <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-300/40 text-amber-300 flex items-center justify-center mx-auto shadow-inner">
// //             <Phone className="w-8 h-8" />
// //           </div>

// //           <div className="space-y-1.5">
// //             <h3 className="text-xl font-black">
// //               {isAmharic ? 'የቴሌግራም አካውንትዎን ያገናኙ' : 'Link Your Telegram Account'}
// //             </h3>
// //             <p className="text-xs text-slate-300 leading-relaxed">
// //               {isAmharic
// //                 ? `ሰላም ${telegramUser?.first_name || ''}፣ ይህ የቴሌግራም አካውንት እስካሁን ከተማሪ መረጃዎ ጋር አልተገናኘም።`
// //                 : `Hello ${telegramUser?.first_name || ''}, this Telegram account is not yet linked to a student profile.`}
// //             </p>
// //           </div>

// //           <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-left text-xs space-y-2">
// //             <p className="font-bold text-amber-300 flex items-center gap-1.5">
// //               <Sparkles className="w-4 h-4" />
// //               <span>{isAmharic ? 'እንዴት ማገናኘት ይቻላል?' : 'How to Link:'}</span>
// //             </p>
// //             <p className="text-slate-200">
// //               {isAmharic
// //                 ? '1. ወደ ቴሌግራም ቦቱ ይመለሱ።'
// //                 : '1. Go back to the Telegram Bot.'}
// //             </p>
// //             <p className="text-slate-200">
// //               {isAmharic
// //                 ? '2. "📱 ስልክ ቁጥር ያገናኙ" የሚለውን አዝራር ይጫኑ።'
// //                 : '2. Tap the "📱 Link Phone" button.'}
// //             </p>
// //             <p className="text-slate-200">
// //               {isAmharic
// //                 ? '3. ከዚያ ይህን ፖርታል በድጋሚ ይክፈቱ።'
// //                 : '3. Then reopen this portal.'}
// //             </p>
// //           </div>

// //           <div className="space-y-2 pt-2">
// //             <a
// //               href="/login"
// //               className="block w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-md transition-all active:scale-95"
// //             >
// //               {isAmharic ? 'በስልክና በፓስዎርድ ይግቡ (Login with Password)' : 'Login with Password'}
// //             </a>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <>
// //       {children}
// //     </>
// //   );
// // }


// 'use client';

// import React, { useMemo } from 'react';
// import { Send, Sparkles, Phone } from 'lucide-react';
// import { useTelegramWebApp } from '../hooks/useTelegramWebApp';
// import useAuthStore from '../store/authStore';
// import { useLanguage } from '../hooks/useLanguage';

// const getTranslations = (isAmharic, firstName) => ({
//   authTitle: isAmharic
//     ? 'በቴሌግራም ደህንነቱ በተጠበቀ ሁኔታ በመግባት ላይ...'
//     : 'Authenticating via Telegram...',
//   authDesc: isAmharic
//     ? `ሰላም ${firstName}፣ የተማሪ ማህደርዎ እየተረጋገጠ ነው`
//     : `Welcome ${firstName}, verifying your student credentials`,
//   linkTitle: isAmharic
//     ? 'የቴሌግራም አካውንትዎን ያገናኙ'
//     : 'Link Your Telegram Account',
//   linkDesc: isAmharic
//     ? `ሰላም ${firstName}፣ ይህ የቴሌግራም አካውንት እስካሁን ከተማሪ መረጃዎ ጋር አልተገናኘም።`
//     : `Hello ${firstName}, this Telegram account is not yet linked to a student profile.`,
//   howToLink: isAmharic ? 'እንዴት ማገናኘት ይቻላል?' : 'How to Link:',
//   steps: isAmharic
//     ? [
//       'ወደ ቴሌግራም ቦቱ ይመለሱ።',
//       '"📱 ስልክ ቁጥር ያገናኙ" የሚለውን አዝራር ይጫኑ።',
//       'ከዚያ ይህን ፖርታል በድጋሚ ይክፈቱ።',
//     ]
//     : [
//       'Go back to the Telegram Bot.',
//       'Tap the "📱 Link Phone" button.',
//       'Then reopen this portal.',
//     ],
//   loginBtn: isAmharic
//     ? 'በስልክና በፓስዎርድ ይግቡ (Login with Password)'
//     : 'Login with Password',
// });

// export default function TelegramWebAppInitializer({ children }) {
//   const { isTelegram, telegramUser, isAuthenticating, authError } = useTelegramWebApp();
//   const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
//   const { isAmharic } = useLanguage();

//   const firstName = telegramUser?.first_name || '';
//   const t = useMemo(() => getTranslations(isAmharic, firstName), [isAmharic, firstName]);

//   // State 1: Inside Telegram and authenticating
//   if (isTelegram && isAuthenticating && !isLoggedIn) {
//     return (
//       <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-white font-sans antialiased relative overflow-hidden">
//         {/* Subtle Ambient Background Glow */}
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

//         <div className="relative z-10 flex flex-col items-center text-center">
//           {/* Integrated Icon & Spinner */}
//           <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
//             <div className="absolute inset-0 rounded-full border border-slate-700/50"></div>
//             <div
//               className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-500/50 animate-spin"
//               role="status"
//               aria-label="Authenticating"
//             >
//               <span className="sr-only">Loading...</span>
//             </div>
//             <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.15)]">
//               <Send className="w-7 h-7 text-blue-400 transform -rotate-12 translate-x-0.5" aria-hidden="true" />
//             </div>
//           </div>

//           {/* Elegant Typography */}
//           <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
//             {t.authTitle}
//           </h2>
//           <p className="text-slate-400 text-sm sm:text-base max-w-sm leading-relaxed">
//             {t.authDesc}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // State 2: Inside Telegram, not logged in, account not linked
//   if (isTelegram && !isLoggedIn && authError === 'not_linked') {
//     return (
//       <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 sm:p-6 text-white font-sans antialiased relative overflow-hidden">
//         {/* Subtle Ambient Background Glows */}
//         <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
//         <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

//         <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 shadow-2xl relative z-10 flex flex-col items-center text-center">

//           {/* Icon */}
//           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-500/5 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6 shadow-inner">
//             <Phone className="w-8 h-8" aria-hidden="true" />
//           </div>

//           {/* Typography */}
//           <div className="space-y-2 mb-8">
//             <h3 className="text-2xl font-bold tracking-tight text-white">{t.linkTitle}</h3>
//             <p className="text-sm text-slate-400 leading-relaxed">{t.linkDesc}</p>
//           </div>

//           {/* Instructions Box */}
//           <div className="w-full bg-black/20 rounded-2xl p-5 border border-white/5 text-left mb-8 shadow-inner">
//             <div className="flex items-center gap-2 mb-4">
//               <Sparkles className="w-4 h-4 text-amber-400" aria-hidden="true" />
//               <span className="font-semibold text-amber-400 text-sm tracking-wide">{t.howToLink}</span>
//             </div>
//             <ul className="space-y-3">
//               {t.steps.map((step, index) => (
//                 <li key={index} className="flex items-start text-slate-300 text-sm">
//                   <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-white/70 text-xs font-mono mr-3 mt-0.5">
//                     {index + 1}
//                   </span>
//                   <span className="leading-relaxed">{step}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Action Button */}
//           <a
//             href="/login"
//             className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(251,191,36,0.15)] hover:shadow-[0_0_25px_rgba(251,191,36,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center"
//           >
//             {t.loginBtn}
//           </a>
//         </div>
//       </div>
//     );
//   }

//   // State 3: Normal pass-through render
//   return <>{children}</>;
// }





'use client';

import React, { useMemo } from 'react';
import { Send, Sparkles, Phone } from 'lucide-react';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp';
import useAuthStore from '../store/authStore';
import { useLanguage } from '../hooks/useLanguage';

const getTranslations = (isAmharic, firstName) => ({
  authTitle: isAmharic
    ? 'በቴሌግራም ደህንነቱ በተጠበቀ ሁኔታ በመግባት ላይ...'
    : 'Authenticating via Telegram...',
  authDesc: isAmharic
    ? `ሰላም ${firstName}፣ የተማሪ ማህደርዎ እየተረጋገጠ ነው`
    : `Welcome ${firstName}, verifying your student credentials`,
  linkTitle: isAmharic
    ? 'የቴሌግራም አካውንትዎን ያገናኙ'
    : 'Link Your Telegram Account',
  linkDesc: isAmharic
    ? `ሰላም ${firstName}፣ ይህ የቴሌግራም አካውንት እስካሁን ከተማሪ መረጃዎ ጋር አልተገናኘም።`
    : `Hello ${firstName}, this Telegram account is not yet linked to a student profile.`,
  howToLink: isAmharic ? 'እንዴት ማገናኘት ይቻላል?' : 'How to Link:',
  steps: isAmharic
    ? [
      'ወደ ቴሌግራም ቦቱ ይመለሱ።',
      '"📱 ስልክ ቁጥር ያገናኙ" የሚለውን አዝራር ይጫኑ።',
      'ከዚያ ይህን ፖርታል በድጋሚ ይክፈቱ።',
    ]
    : [
      'Go back to the Telegram Bot.',
      'Tap the "📱 Link Phone" button.',
      'Then reopen this portal.',
    ],
  loginBtn: isAmharic
    ? 'በስልክና በፓስዎርድ ይግቡ (Login with Password)'
    : 'Login with Password',
});

// --- Extracted UI Components ---

const AuthenticatingView = ({ t }) => (
  <main className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-white font-sans antialiased relative overflow-hidden">
    {/* Subtle Ambient Background Glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

    <section className="relative z-10 flex flex-col items-center text-center">
      {/* Integrated Icon & Spinner */}
      <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-slate-700/50" aria-hidden="true" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-500/50 animate-spin"
          role="status"
          aria-label="Authenticating"
        >
          <span className="sr-only">Loading...</span>
        </div>
        <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          <Send className="w-7 h-7 text-blue-400 transform -rotate-12 translate-x-0.5" aria-hidden="true" />
        </div>
      </div>

      {/* Elegant Typography */}
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
        {t.authTitle}
      </h2>
      <p className="text-slate-400 text-sm sm:text-base max-w-sm leading-relaxed">
        {t.authDesc}
      </p>
    </section>
  </main>
);

const AccountNotLinkedView = ({ t }) => (
  <main className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 sm:p-6 text-white font-sans antialiased relative overflow-hidden">
    {/* Subtle Ambient Background Glows */}
    <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />
    <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

    <section className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 shadow-2xl relative z-10 flex flex-col items-center text-center">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-500/5 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6 shadow-inner">
        <Phone className="w-8 h-8" aria-hidden="true" />
      </div>

      {/* Typography */}
      <header className="space-y-2 mb-8">
        <h3 className="text-2xl font-bold tracking-tight text-white">{t.linkTitle}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{t.linkDesc}</p>
      </header>

      {/* Instructions Box */}
      <div className="w-full bg-black/20 rounded-2xl p-5 border border-white/5 text-left mb-8 shadow-inner">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-amber-400" aria-hidden="true" />
          <h4 className="font-semibold text-amber-400 text-sm tracking-wide m-0">{t.howToLink}</h4>
        </div>

        {/* Changed to an ordered list for better semantic meaning */}
        <ol className="space-y-3">
          {t.steps.map((step, index) => (
            <li key={index} className="flex items-start text-slate-300 text-sm">
              <span
                className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-white/70 text-xs font-mono mr-3 mt-0.5"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Action Button */}
      <a
        href="/login"
        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(251,191,36,0.15)] hover:shadow-[0_0_25px_rgba(251,191,36,0.3)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 active:translate-y-0 active:scale-[0.98] flex items-center justify-center"
      >
        {t.loginBtn}
      </a>
    </section>
  </main>
);

// --- Main Component ---

export default function TelegramWebAppInitializer({ children }) {
  const { isTelegram, telegramUser, isAuthenticating, authError } = useTelegramWebApp();
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
    return <AccountNotLinkedView t={t} />;
  }

  // State 3: Normal pass-through render
  return <>{children}</>;
}
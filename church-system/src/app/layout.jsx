import Script from 'next/script';
import './globals.css';
import AppInitializer from '../components/AppInitializer';
import TelegramWebAppInitializer from '../components/TelegramWebAppInitializer';
import NextRouterAdapter from '../components/NextRouterAdapter';
import { ToastContainer } from '../utils/toast';
import { Toaster } from '../components/ui/sonner';
import { ThemeProvider } from '../components/ui/ThemeProvider';
import { LanguageProvider } from '../providers/LanguageProvider';
import { QueryProvider } from '../providers/QueryProvider';

export const metadata = {
  title: {
    default: 'ተክለሳዊሮስ ሰንበት ትምህርት ቤት',
    template: '%s | ተክለሳዊሮስ ሰንበት ትምህርት ቤት',
  },
  description: 'የተክለሳዊሮስ ሰንበት ትምህርት ቤት የተማሪዎች፣ የመምህራን እና የርቀት ትምህርት መከታተያና ማስተዳደሪያ ሥርዓት',
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/church-logo.png', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="am" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="shortcut icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+Ethiopic:wght@400;600;700;800&family=Outfit:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Telegram Mini App WebApp SDK */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <Script
          id="telegram-webapp-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
                  window.Telegram.WebApp.ready();
                  window.Telegram.WebApp.expand();
                  if (window.Telegram.WebApp.setHeaderColor) window.Telegram.WebApp.setHeaderColor('#0f172a');
                  if (window.Telegram.WebApp.setBackgroundColor) window.Telegram.WebApp.setBackgroundColor('#0f172a');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)] antialiased font-sans selection:bg-[var(--brand-gold)] selection:text-slate-950">
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <LanguageProvider defaultLang="am">
              <NextRouterAdapter>
                <TelegramWebAppInitializer>
                  <AppInitializer>
                    {children}
                    <ToastContainer />
                    <Toaster position="top-right" richColors />
                  </AppInitializer>
                </TelegramWebAppInitializer>
              </NextRouterAdapter>
            </LanguageProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

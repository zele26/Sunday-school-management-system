import './globals.css';
import AppInitializer from '../components/AppInitializer';
import NextRouterAdapter from '../components/NextRouterAdapter';
import { ToastContainer } from '../utils/toast';
import { Toaster } from '../components/ui/sonner';
import { ThemeProvider } from '../components/ui/ThemeProvider';
import { QueryProvider } from '../providers/QueryProvider';

export const metadata = {
  title: {
    default: 'ተክለሳዊሮስ ሰንበት ትምህርት ቤት | Sunday School Management System',
    template: '%s | ተክለሳዊሮስ ሰንበት ትምህርት ቤት',
  },
  description: 'የተክለሳዊሮስ ሰንበት ትምህርት ቤት የተማሪዎች፣ የአስተማሪዎች እና የርቀት ትምህርት መከታተያ ሥርዓት (Sunday School Management System)',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="am" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+Ethiopic:wght@400;600;700;800&family=Outfit:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)] antialiased font-sans selection:bg-[var(--brand-gold)] selection:text-slate-950">
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <NextRouterAdapter>
              <AppInitializer>
                {children}
                <ToastContainer />
                <Toaster position="top-right" richColors />
              </AppInitializer>
            </NextRouterAdapter>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

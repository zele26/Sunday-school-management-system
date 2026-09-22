// src/hooks/useTelegramWebApp.js
'use client';

import { useEffect, useState, useCallback } from 'react';
import useAuthStore from '../store/authStore';
import { apiFetch } from '../api/apiClient';

/**
 * Strict verification if the client is ACTUALLY running inside a Telegram Mini App.
 * In standard web browsers, window.Telegram.WebApp exists because the SDK script is loaded in layout.jsx,
 * but initData is empty, initDataUnsafe.user is undefined, and platform is 'unknown'.
 */
const checkIsActuallyTelegram = () => {
  if (typeof window === 'undefined') return false;

  const tg = window.Telegram?.WebApp;
  const hasInitData = Boolean(tg?.initData && tg.initData.length > 0);
  const hasTgUser = Boolean(tg?.initDataUnsafe?.user);
  const isTgPlatform = Boolean(tg?.platform && tg.platform !== 'unknown');
  const hasTgHash = window.location.hash.includes('tgWebAppData') || window.location.hash.includes('tgWebAppPlatform');
  const hasTgQuery = window.location.search.includes('tgWebApp=1') || window.location.search.includes('tgWebAppVersion');

  return hasInitData || hasTgUser || (isTgPlatform && (hasTgHash || hasTgQuery)) || (hasTgHash && hasTgQuery);
};

export function useTelegramWebApp() {
  const [isTelegram, setIsTelegram] = useState(() => checkIsActuallyTelegram());
  const [telegramUser, setTelegramUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    return checkIsActuallyTelegram() ? (window.Telegram?.WebApp?.initDataUnsafe?.user || null) : null;
  });
  const [isAuthenticating, setIsAuthenticating] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isTg = checkIsActuallyTelegram();
    const token = localStorage.getItem('token');
    const isManuallyLoggedOut = sessionStorage.getItem('tg_manual_logout') === 'true';
    return isTg && !token && !isManuallyLoggedOut;
  });
  const [authError, setAuthError] = useState(null);
  const [themeParams, setThemeParams] = useState({});

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const login = useAuthStore((state) => state.login);

  const authenticateWithTelegram = useCallback(async (initData, userObj) => {
    setIsAuthenticating(true);
    setAuthError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const payload = {
        initData: initData || undefined,
        telegramUserId: userObj?.id || undefined,
      };

      const res = await apiFetch('/api/telegram/auth', {
        method: 'POST',
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.accessToken && data.user) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('tg_manual_logout');
        }
        login(data.accessToken, data.user);
        try {
          window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success');
        } catch (e) {}
      } else {
        setAuthError(data.isLinked === false ? 'not_linked' : (data.message || 'not_linked'));
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('Telegram auto-login notice:', err);
      setAuthError('not_linked');
    } finally {
      setIsAuthenticating(false);
    }
  }, [login]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let checkInterval = null;
    let attempts = 0;

    const initTelegram = () => {
      const isTg = checkIsActuallyTelegram();
      const tg = window.Telegram?.WebApp;

      if (!isTg) {
        setIsTelegram(false);
        setIsAuthenticating(false);
        setTelegramUser(null);
        return false;
      }

      setIsTelegram(true);

      if (tg) {
        try {
          tg.ready();
          tg.expand();
          tg.enableClosingConfirmation?.();

          if (tg.setHeaderColor) tg.setHeaderColor('#0f172a');
          if (tg.setBackgroundColor) tg.setBackgroundColor('#0f172a');
        } catch (e) {
          console.warn('Telegram WebApp setup notice:', e);
        }

        const hasInitData = Boolean(tg.initData && tg.initData.length > 0);
        const hasTgUser = Boolean(tg.initDataUnsafe?.user);
        const isManuallyLoggedOut = sessionStorage.getItem('tg_manual_logout') === 'true';

        if (hasTgUser) {
          setTelegramUser(tg.initDataUnsafe.user);
        }
        if (tg.themeParams) {
          setThemeParams(tg.themeParams);
        }

        // Auto-authenticate ONLY if inside Telegram, not logged in, and NOT manually logged out
        if (!isLoggedIn && (hasInitData || hasTgUser) && !isManuallyLoggedOut) {
          authenticateWithTelegram(tg.initData, tg.initDataUnsafe?.user);
        } else if (isManuallyLoggedOut) {
          setIsAuthenticating(false);
          setAuthError('not_linked');
        }

        return true;
      }

      return false;
    };

    if (!initTelegram()) {
      checkInterval = setInterval(() => {
        attempts++;
        if (initTelegram() || attempts > 20) {
          clearInterval(checkInterval);
        }
      }, 50);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [isLoggedIn, authenticateWithTelegram]);

  const triggerHaptic = useCallback((type = 'medium') => {
    try {
      if (['light', 'medium', 'heavy', 'rigid', 'soft'].includes(type)) {
        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.(type);
      } else if (['error', 'success', 'warning'].includes(type)) {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.(type);
      } else if (type === 'selection') {
        window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.();
      }
    } catch (e) {}
  }, []);

  const closeTelegramApp = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.close) {
        window.Telegram.WebApp.close();
      }
    } catch (e) {}
  }, []);

  const openTelegramLink = useCallback((url) => {
    try {
      if (window.Telegram?.WebApp?.openTelegramLink) {
        window.Telegram.WebApp.openTelegramLink(url);
      } else {
        window.open(url, '_blank');
      }
    } catch (e) {
      window.open(url, '_blank');
    }
  }, []);

  const setBackButton = useCallback((show, onClick) => {
    try {
      const backBtn = window.Telegram?.WebApp?.BackButton;
      if (!backBtn) return;
      backBtn.offClick?.();
      if (show) {
        backBtn.show();
        if (typeof onClick === 'function') {
          backBtn.onClick(onClick);
        }
      } else {
        backBtn.hide();
      }
    } catch (e) {}
  }, []);

  const retryAuth = useCallback(() => {
    const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
    if (tg && checkIsActuallyTelegram()) {
      authenticateWithTelegram(tg.initData, tg.initDataUnsafe?.user);
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, [authenticateWithTelegram]);

  const scanQrCode = useCallback((textPrompt, callback) => {
    try {
      const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
      if (tg?.showScanQrPopup) {
        tg.showScanQrPopup(
          { text: textPrompt || 'የተማሪውን QR ባጅ እዚህ ላይ ያሳዩ (Scan Student QR Badge)' },
          (scannedText) => {
            if (typeof callback === 'function') {
              const shouldClose = callback(scannedText);
              return shouldClose !== false;
            }
            return true;
          }
        );
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Telegram scanQrCode error:', e);
      return false;
    }
  }, []);

  const closeQrScanner = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.closeScanQrPopup) {
        window.Telegram.WebApp.closeScanQrPopup();
      }
    } catch (e) {}
  }, []);

  return {
    isTelegram,
    telegramUser,
    isAuthenticating,
    authError,
    themeParams,
    triggerHaptic,
    setBackButton,
    closeTelegramApp,
    openTelegramLink,
    scanQrCode,
    closeQrScanner,
    retryAuth,
    webApp: typeof window !== 'undefined' ? window.Telegram?.WebApp : null,
  };
}

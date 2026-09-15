// src/hooks/useTelegramWebApp.js
'use client';

import { useEffect, useState, useCallback } from 'react';
import useAuthStore from '../store/authStore';
import { apiFetch } from '../api/apiClient';

export function useTelegramWebApp() {
  const [isTelegram, setIsTelegram] = useState(false);
  const [telegramUser, setTelegramUser] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    const hasInitData = Boolean(tg.initData && tg.initData.length > 0);
    const hasTgUser = Boolean(tg.initDataUnsafe?.user);

    if (hasInitData || hasTgUser) {
      setIsTelegram(true);
      setTelegramUser(tg.initDataUnsafe?.user || null);

      // Expand to full height inside Telegram
      try {
        tg.ready();
        tg.expand();
        tg.enableClosingConfirmation?.();
      } catch (e) {
        console.warn('Telegram WebApp expansion warning:', e);
      }

      // Auto-authenticate via Telegram initData if not currently logged in
      if (!isLoggedIn && (hasInitData || hasTgUser)) {
        authenticateWithTelegram(tg.initData, tg.initDataUnsafe?.user);
      }
    }
  }, [isLoggedIn]);

  const authenticateWithTelegram = async (initData, userObj) => {
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const payload = {
        initData: initData || undefined,
        telegramUserId: userObj?.id || undefined,
      };

      const res = await apiFetch('/api/telegram/auth', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.accessToken && data.user) {
        login(data.accessToken, data.user);
        // Trigger haptic feedback on successful auto-login
        try {
          window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success');
        } catch (e) {}
      } else {
        if (data.isLinked === false) {
          setAuthError('not_linked');
        } else {
          setAuthError(data.message || 'Authentication failed');
        }
      }
    } catch (err) {
      console.warn('Telegram auto-login error:', err);
      setAuthError(err.message || 'Connection error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const triggerHaptic = useCallback((type = 'medium') => {
    try {
      if (['light', 'medium', 'heavy', 'rigid', 'soft'].includes(type)) {
        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.(type);
      } else if (['error', 'success', 'warning'].includes(type)) {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.(type);
      }
    } catch (e) {}
  }, []);

  const closeTelegramApp = useCallback(() => {
    try {
      window.Telegram?.WebApp?.close?.();
    } catch (e) {}
  }, []);

  return {
    isTelegram,
    telegramUser,
    isAuthenticating,
    authError,
    triggerHaptic,
    closeTelegramApp,
    webApp: typeof window !== 'undefined' ? window.Telegram?.WebApp : null,
  };
}

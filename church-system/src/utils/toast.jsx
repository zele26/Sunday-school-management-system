'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

let toastListeners = [];

export const showToast = {
  success: (message, title = 'ተሳክቷል (Success)') => notify({ type: 'success', message, title }),
  error: (message, title = 'ስህተት (Error)') => notify({ type: 'error', message, title }),
  warning: (message, title = 'ማስጠንቀቂያ (Warning)') => notify({ type: 'warning', message, title }),
  info: (message, title = 'መረጃ (Info)') => notify({ type: 'info', message, title }),
};

export const toast = showToast;

function notify(toastItem) {
  const id = Date.now() + Math.random();
  const newToast = { ...toastItem, id };
  toastListeners.forEach((fn) => fn(newToast));
}

export function useToastListener(callback) {
  useEffect(() => {
    toastListeners.push(callback);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== callback);
    };
  }, [callback]);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useToastListener((newToast) => {
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  });

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getToastConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          border: 'border-emerald-500/40',
          bg: 'bg-slate-900/95 shadow-emerald-950/40',
          titleColor: 'text-emerald-400',
        };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          border: 'border-rose-500/40',
          bg: 'bg-slate-900/95 shadow-rose-950/40',
          titleColor: 'text-rose-400',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          border: 'border-amber-500/40',
          bg: 'bg-slate-900/95 shadow-amber-950/40',
          titleColor: 'text-amber-400',
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
          border: 'border-sky-500/40',
          bg: 'bg-slate-900/95 shadow-sky-950/40',
          titleColor: 'text-sky-400',
        };
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0">
      {toasts.map((item) => {
        const config = getToastConfig(item.type);
        return (
          <div
            key={item.id}
            className={`pointer-events-auto backdrop-blur-xl border ${config.border} ${config.bg} rounded-2xl p-4 shadow-2xl transition-all duration-300 transform animate-in slide-in-from-bottom-3 fade-in flex items-start gap-3 text-white`}
          >
            {config.icon}
            <div className="flex-1 min-w-0">
              <h5 className={`text-xs font-extrabold ${config.titleColor} tracking-tight`}>
                {item.title}
              </h5>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">
                {item.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
              aria-label="Close Notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default toast;

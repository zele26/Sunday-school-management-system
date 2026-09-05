'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, ArrowRight, Sparkles } from 'lucide-react';
import bgImage from '../../assets/Lidetachurch.jpg';
import { apiFetch } from '../../api/apiClient';
import { forgotPasswordSchema } from '../../schemas';
import { BackButton } from '../../components/ui';

export default function ForgotPassword() {
  const [msg, setMsg] = useState({ type: '', text: '' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: '',
    },
  });

  const onSubmit = async (data) => {
    setMsg({ type: '', text: '' });

    const val = data.identifier.trim();

    try {
      const res = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ identifier: val }),
      });

      const resData = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg({
          type: 'success',
          text: resData.message || 'ለአስተዳዳሪው የፓስዎርድ ቅያሬ ጥያቄ ተልኳል! አስተዳዳሪው መረጃዎን አረጋግጦ ሲያጸድቀው በጊዜያዊ ፓስዎርድ መግባት ይችላሉ።',
        });
        reset();
      } else {
        setMsg({ type: 'error', text: resData.message || 'ጥያቄውን መላክ አልተቻለም' });
      }
    } catch {
      setMsg({ type: 'error', text: 'የአውታረ መረብ ስህተት ተፈጥሯል (Network error)' });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center p-4 sm:p-6 bg-gradient-to-br from-blue-50/90 via-[#fdfdfc] to-amber-50/70 dark:from-[#050c1a] dark:via-[#09152b] dark:to-[#030710] font-sans selection:bg-[var(--brand-gold)] selection:text-slate-950 relative overflow-x-hidden">
      {/* Background Church Atmosphere */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <img
          src={bgImage?.src || bgImage}
          alt="Lideta Church"
          className="w-full h-full object-cover object-center filter blur-[2px] scale-105 opacity-25 dark:opacity-15 brightness-[1.08] dark:brightness-[0.45]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-amber-50/70 dark:from-[#050c1a]/95 dark:via-[#09152b]/92 dark:to-[#030710]/95" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[450px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/25 via-yellow-200/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Top Header with BackButton */}
      <header className="relative z-30 w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <BackButton href="/login" label="ወደ መግቢያ ተመለስ" subLabel="Back to Login" variant="glass" />
      </header>

      {/* Main Card */}
      <main className="relative z-10 max-w-md w-full my-auto py-6">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 22, stiffness: 240 }}
          className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-3xl sm:rounded-4xl shadow-2xl shadow-blue-950/10 dark:shadow-black/50 overflow-hidden p-8 border border-slate-200/80 dark:border-slate-800 space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-50 to-amber-50 dark:from-slate-800 dark:to-blue-950 text-[#1657b8] dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 dark:border-slate-700 shadow-sm">
              <KeyRound className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              የይለፍ ቃል ለመቀየር <span className="text-[#1657b8] dark:text-amber-400 text-lg block sm:inline">(Forgot Password)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              ኢሜይል፣ ስልክ ቁጥር ወይም የተማሪ መለያ ያስገቡ። አስተዳዳሪው መረጃዎን አረጋግጦ ጊዜያዊ ፓስዎርድ ያዘጋጅልዎታል።
            </p>
          </div>

          {msg.text && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-start gap-2.5 leading-relaxed shadow-xs ${
                msg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}
            >
              <span className="text-base shrink-0">{msg.type === 'success' ? '✅' : '⚠️'}</span>
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                ኢሜይል / ስልክ ቁጥር / የተማሪ መለያ *
              </label>
              <input
                type="text"
                {...register('identifier')}
                placeholder="09... / example@gmail.com / TKD-..."
                className={`w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 transition-all outline-none font-medium ${
                  errors.identifier
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-[#1657b8] focus:ring-[#1657b8]/20'
                }`}
              />
              {errors.identifier && (
                <p className="text-[11px] text-rose-500 font-medium mt-1">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-[#1657b8] to-[#0f4699] hover:from-[#124796] hover:to-[#0c377a] text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer border border-blue-400/30"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>ጥያቄ ላክ (Send Request to Admin)</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </>
              )}
            </motion.button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              href="/login"
              className="text-xs text-[#1657b8] dark:text-amber-400 hover:underline font-bold transition-colors"
            >
              ← ወደ መግቢያ ገጽ ተመለስ (Back to Login)
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-4 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
        ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት • የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን
      </footer>
    </div>
  );
}
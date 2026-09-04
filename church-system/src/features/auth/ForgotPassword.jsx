import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import bgImage from '../../assets/Lidetachurch.jpg';
import { apiFetch } from '../../api/apiClient';
import { forgotPasswordSchema } from '../../schemas';

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
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center fixed inset-0 font-sans selection:bg-indigo-500 selection:text-white"
      style={{ backgroundImage: `url(${bgImage?.src || bgImage})` }}
    >
      {/* Top Floating Back Button */}
      <Link
        href="/login"
        className="fixed top-5 left-5 z-30 inline-flex items-center gap-2 bg-slate-900/70 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold backdrop-blur-md border border-white/20 shadow-lg transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>ወደ መግቢያ ተመለስ (Back to Login)</span>
      </Link>

      {/* Background Overlay */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md"></div>

      {/* Card Container */}
      <div className="max-w-md w-full bg-white/95 text-slate-800 rounded-3xl shadow-2xl overflow-hidden p-8 relative z-10 border border-white/60 backdrop-blur-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold border border-indigo-100 shadow-sm">
            🔑
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            የይለፍ ቃል ለመቀየር (Forgot Password)
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            ኢሜይል፣ ስልክ ቁጥር ወይም የተማሪ መለያ ያስገቡ። የአስተዳዳሪው ክፍል መረጃዎን አረጋግጦ ጊዜያዊ ፓስዎርድ ያዘጋጅልዎታል።
          </p>
        </div>

        {msg.text && (
          <div
            className={`p-4 rounded-2xl text-xs font-medium flex items-start gap-2.5 leading-relaxed ${
              msg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border border-rose-200 text-rose-700'
            }`}
          >
            <span className="text-base shrink-0">{msg.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              ኢሜይል / ስልክ ቁጥር / የተማሪ መለያ *
            </label>
            <input
              type="text"
              {...register('identifier')}
              placeholder="example@gmail.com / 0911... / STU-..."
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 transition-all outline-none ${
                errors.identifier
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20'
              }`}
            />
            {errors.identifier && (
              <p className="text-[11px] text-rose-500 font-medium mt-1">
                {errors.identifier.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>ጥያቄ ላክ (Send Request to Admin)</span>
                <span>➔</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <Link href="/login" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
            ← ወደ መግቢያ ገጽ ተመለስ (Back to Login)
          </Link>
        </div>
      </div>
    </div>
  );
}
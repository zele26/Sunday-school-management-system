'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Check
} from 'lucide-react';
import { apiFetch } from '../api/apiClient';
import { changePasswordSchema } from '../schemas';
import { BackButton, Card } from '../components/ui';
import { useLanguage } from '../hooks/useLanguage';

const ChangePassword = () => {
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { t, isAmharic } = useLanguage();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const currentPassword = watch('currentPassword') || '';
  const newPassword = watch('newPassword') || '';
  const confirmPassword = watch('confirmPassword') || '';

  // Real-time dynamic checks before submission
  const isMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isMinLength = newPassword.length >= 6;
  const isSameAsCurrent = currentPassword.length > 0 && newPassword.length > 0 && currentPassword === newPassword;

  const onSubmit = async (data) => {
    setMessage({ text: '', type: '' });

    if (data.newPassword !== data.confirmPassword) {
      setMessage({
        text: t('passwordMismatchError', 'የይለፍ ቃሉ አይዛመድም! እባክዎ በትክክል ያረጋግጡ ✕'),
        type: 'error',
      });
      return;
    }

    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage({
          text: resData.message || t('passwordChangedSuccess', 'የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል!'),
          type: 'success',
        });
        reset();
      } else {
        setMessage({
          text: resData.message || (isAmharic ? 'ለውጡ አልተሳካም' : 'Password change failed'),
          type: 'error',
        });
      }
    } catch (err) {
      setMessage({
        text: t('networkError', 'የአውታረ መረብ ስህተት'),
        type: 'error',
      });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card variant="glass" padding="lg" className="w-full max-w-md mx-auto transition-all space-y-6 font-sans shadow-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-5">
          <div className="flex items-center gap-3.5">
            <span className="p-3 bg-blue-50 dark:bg-slate-800 text-[#1657b8] dark:text-amber-400 rounded-2xl shadow-sm">
              <KeyRound className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                {t('changePasswordTitle', 'የይለፍ ቃል ቀይር')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isAmharic ? 'የይለፍ ቃልዎን ደህንነቱ በተጠበቀ ሁኔታ ይቀይሩ' : 'Update your password securely'}
              </p>
            </div>
          </div>
          <BackButton
            href="/dashboard"
            label={t('home', 'መነሻ')}
            variant="glass"
            className="text-xs py-1.5 px-3"
          />
        </div>

        {/* Global Feedback Banner */}
        {message.text && (
          <div
            className={`p-4 rounded-2xl text-sm font-medium shadow-sm border flex items-start gap-3 transition-all animate-fadeIn ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <span className="leading-snug">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* 1. Current Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="currentPassword"
              className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block"
            >
              {t('currentPasswordLabel', 'አሁን ያለው የይለፍ ቃል')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1657b8] transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder={t('enterCurrentPassword', 'የአሁኑን የይለፍ ቃል ያስገቡ')}
                autoComplete="current-password"
                {...register('currentPassword')}
                className={`w-full pl-10 pr-11 py-3 bg-slate-50/70 dark:bg-slate-800 border rounded-xl text-sm font-medium text-slate-800 dark:text-white shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.currentPassword
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-[#1657b8] focus:ring-[#1657b8]/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                title={showCurrentPassword ? t('hidePassword', 'የይለፍ ቃል ደብቅ') : t('showPassword', 'የይለፍ ቃል አሳይ')}
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* 2. New Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="newPassword"
              className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block"
            >
              {t('newPasswordLabel', 'አዲስ የይለፍ ቃል')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1657b8] transition-colors">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder={t('enterNewPassword', 'አዲስ የይለፍ ቃል (ቢያንስ 6 ቁምፊዎች)')}
                autoComplete="new-password"
                {...register('newPassword')}
                className={`w-full pl-10 pr-11 py-3 bg-slate-50/70 dark:bg-slate-800 border rounded-xl text-sm font-medium text-slate-800 dark:text-white shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.newPassword
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-[#1657b8] focus:ring-[#1657b8]/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                title={showNewPassword ? t('hidePassword', 'የይለፍ ቃል ደብቅ') : t('showPassword', 'የይለፍ ቃል አሳይ')}
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Live Length & Difference Guidance */}
            {newPassword.length > 0 && (
              <div className="space-y-1 pt-1 animate-fadeIn">
                <div
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    isMinLength
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {isMinLength ? (
                    <Check className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>
                    {isMinLength
                      ? t('passwordMinLengthMet', 'የይለፍ ቃል ርዝመት ትክክል ነው (ቢያንስ 6)')
                      : t('passwordMinLengthRequired', 'አዲሱ የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት')}
                  </span>
                </div>

                {isSameAsCurrent && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('passwordMustBeDifferent', 'አዲሱ የይለፍ ቃል ከአሁኑ ጋር አንድ አይነት መሆን የለበትም')}</span>
                  </div>
                )}
              </div>
            )}

            {errors.newPassword && !isSameAsCurrent && (
              <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* 3. Confirm New Password Field with REAL-TIME LIVE MATCHING FEEDBACK */}
          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block"
            >
              {t('confirmNewPasswordLabel', 'አዲሱን የይለፍ ቃል ያረጋግጡ')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1657b8] transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('reenterNewPassword', 'አዲሱን የይለፍ ቃል በድጋሚ ያስገቡ')}
                autoComplete="new-password"
                {...register('confirmPassword')}
                className={`w-full pl-10 pr-11 py-3 bg-slate-50/70 dark:bg-slate-800 border rounded-xl text-sm font-medium text-slate-800 dark:text-white shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  isMatch
                    ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : isMismatch || errors.confirmPassword
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-[#1657b8] focus:ring-[#1657b8]/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                title={showConfirmPassword ? t('hidePassword', 'የይለፍ ቃል ደብቅ') : t('showPassword', 'የይለፍ ቃል አሳይ')}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* LIVE REAL-TIME MATCH STATUS INDICATOR (Tells user before they submit) */}
            {confirmPassword.length > 0 && (
              <div
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition-all animate-fadeIn ${
                  isMatch
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300/80 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300/80 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                }`}
              >
                {isMatch ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{t('passwordMatchSuccess', 'የይለፍ ቃሉ በትክክል ተዛምዷል ✓')}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{t('passwordMismatchError', 'የይለፍ ቃሉ አይዛመድም! እባክዎ በትክክል ያረጋግጡ ✕')}</span>
                  </>
                )}
              </div>
            )}

            {errors.confirmPassword && !confirmPassword && (
              <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || (confirmPassword.length > 0 && isMismatch)}
            className="w-full bg-[#1657b8] hover:bg-[#124796] active:scale-[0.99] text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none mt-2 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{t('signingIn', 'በመቀየር ላይ…')}</span>
              </div>
            ) : (
              <span>{t('savePasswordBtn', 'የይለፍ ቃል ቀይር')}</span>
            )}
          </button>
        </form>

        {message.type === 'success' && (
          <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToHome', 'ወደ መነሻ ገጽ ተመለስ')}</span>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChangePassword;
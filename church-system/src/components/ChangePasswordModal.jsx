// src/components/ChangePasswordModal.jsx
'use client';

import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  ShieldCheck
} from 'lucide-react';
import { apiFetch } from '../api/apiClient';
import useAuthStore from '../store/authStore';
import { useLanguage } from '../hooks/useLanguage';

const ChangePasswordModal = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalClosed, setModalClosed] = useState(false);
  const { t, isAmharic } = useLanguage();

  const updateUser = useAuthStore((state) => state.updateUser);

  // Real-time live status calculations
  const isMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isMinLength = newPassword.length >= 6;
  const isSameAsCurrent = currentPassword.length > 0 && newPassword.length > 0 && currentPassword === newPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      return setError(t('passwordMismatchError', 'የይለፍ ቃሉ አይዛመድም! እባክዎ በትክክል ያረጋግጡ ✕'));
    }
    if (newPassword.length < 6) {
      return setError(t('passwordMinLengthRequired', 'አዲሱ የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት።'));
    }
    if (currentPassword === newPassword) {
      return setError(t('passwordMustBeDifferent', 'አዲሱ የይለፍ ቃል ከአሁኑ ጋር አንድ አይነት መሆን የለበትም'));
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(t('passwordChangedSuccess', 'የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል!'));

        // Update the Zustand store to clear the flag
        try {
          updateUser({ mustChangePassword: false });
        } catch (storeErr) {
          console.warn('Could not update user state:', storeErr);
        }

        // Always close the modal – even if the store update fails
        setTimeout(() => {
          setModalClosed(true);
        }, 1500);
      } else {
        setError(data.message || (isAmharic ? 'ለውጡ አልተሳካም' : 'Password change failed'));
      }
    } catch (err) {
      setError(t('networkError', 'የአውታረ መረብ ስህተት'));
    } finally {
      setLoading(false);
    }
  };

  // Don't render the modal if it's already closed
  if (modalClosed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Container Card */}
      <div className="relative max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-slate-800 p-6 md:p-8 overflow-hidden font-sans">
        
        {/* Glowing Decorative Background Orbs */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10">
          
          {/* Top Header Badge & Title */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 mb-1">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-amber-400" />
              </div>
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('firstTimePasswordTitle', 'የመጀመሪያ የይለፍ ቃል ለውጥ')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
              {t('firstTimePasswordSubtitle', 'እባክዎ ለደህንነትዎ ሲባል አሁን ያለውን እና አዲሱን የይለፍ ቃል ያስገቡ')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 font-medium shadow-sm animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 rounded-2xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 font-semibold shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 1. Current Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide block">
                {t('currentPasswordLabel', 'አሁን ያለው የይለፍ ቃል')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  placeholder={t('enterCurrentPassword', 'የአሁኑን የይለፍ ቃል ያስገቡ')}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-xs md:text-sm font-medium focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 shadow-inner transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                  title={showCurrent ? t('hidePassword', 'የይለፍ ቃል ደብቅ') : t('showPassword', 'የይለፍ ቃል አሳይ')}
                  aria-label={showCurrent ? 'Hide password' : 'Show password'}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 2. New Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide block">
                {t('newPasswordLabel', 'አዲስ የይለፍ ቃል')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder={t('enterNewPassword', 'አዲስ የይለፍ ቃል (ቢያንስ 6 ቁምፊዎች)')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-xs md:text-sm font-medium focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 shadow-inner transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                  title={showNew ? t('hidePassword', 'የይለፍ ቃል ደብቅ') : t('showPassword', 'የይለፍ ቃል አሳይ')}
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
            </div>

            {/* 3. Confirm Password Field with LIVE MATCHING STATUS */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide block">
                {t('confirmNewPasswordLabel', 'አዲሱን የይለፍ ቃል ያረጋግጡ')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder={t('reenterNewPassword', 'አዲሱን የይለፍ ቃል በድጋሚ ያስገቡ')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-xs md:text-sm font-medium focus:bg-white dark:focus:bg-slate-800 shadow-inner transition-all outline-none ${
                    isMatch
                      ? 'border-emerald-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-emerald-50/20 dark:bg-emerald-950/20'
                      : isMismatch
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                  title={showConfirm ? t('hidePassword', 'የይለፍ ቃል ደብቅ') : t('showPassword', 'የይለፍ ቃል አሳይ')}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* LIVE REAL-TIME MATCH STATUS INDICATOR */}
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (confirmPassword.length > 0 && isMismatch)}
              className="w-full mt-2 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-950 hover:to-indigo-950 active:scale-[0.99] text-white py-3.5 rounded-xl font-extrabold text-sm shadow-md transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t('signingIn', 'በመቀየር ላይ…')}</span>
                </div>
              ) : (
                <>
                  <span>{t('savePasswordBtn', 'የይለፍ ቃል ቀይር')}</span>
                  <span className="text-base leading-none">➔</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
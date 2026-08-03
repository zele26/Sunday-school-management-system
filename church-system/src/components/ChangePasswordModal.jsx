// src/components/ChangePasswordModal.jsx
import React, { useState } from 'react';
import { apiFetch } from '../api/apiClient';
import useAuthStore from '../store/authStore';

const ChangePasswordModal = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalClosed, setModalClosed] = useState(false);

  const updateUser = useAuthStore((state) => state.updateUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      return setError('አዲሶቹ ፓስዎርዶች አይዛመዱም።');
    }
    if (newPassword.length < 6) {
      return setError('አዲሱ ፓስዎርድ ቢያንስ 6 ፊደላት ሊሆን ይገባል።');
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess('ፓስዎርድ ተቀይሯል!');

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
        setError(data.message || 'ለውጡ አልተሳካም');
      }
    } catch (err) {
      setError('የአውታረ መረብ ስህተት');
    } finally {
      setLoading(false);
    }
  };

  // Don't render the modal if it's already closed
  if (modalClosed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Container Card with Subtle Top Accent Glow */}
      <div className="relative max-w-md w-full bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-white/80 p-6 md:p-8 overflow-hidden font-sans">
        
        {/* Glowing Decorative Background Orbs */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10">
          
          {/* Top Header Badge & Title */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 mb-1">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              የመጀመሪያ ፓስዎርድ ለውጥ
            </h2>
            <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
              እባክዎ ለደህንነትዎ ሲባል አሁን ያለውን እና አዲሱን ፓስዎርድ ያስገቡ
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200/80 rounded-2xl text-rose-700 text-xs flex items-center gap-2.5 font-medium shadow-sm animate-shake">
              <span className="text-base leading-none">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-emerald-700 text-xs flex items-center gap-2.5 font-semibold shadow-sm">
              <span className="text-base leading-none">✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Current Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 tracking-wide block">
                አሁን ያለው ፓስዎርድ
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 0121 9z" />
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs md:text-sm font-medium focus:bg-white focus:border-blue-700 focus:ring-4 focus:ring-blue-700/10 shadow-inner transition-all outline-none"
                />
              </div>
            </div>

            {/* New Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 tracking-wide block">
                አዲስ ፓስዎርድ (ቢያንስ 6)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs md:text-sm font-medium focus:bg-white focus:border-blue-700 focus:ring-4 focus:ring-blue-700/10 shadow-inner transition-all outline-none"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 tracking-wide block">
                አዲሱን ያረጋግጡ
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs md:text-sm font-medium focus:bg-white focus:border-blue-700 focus:ring-4 focus:ring-blue-700/10 shadow-inner transition-all outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-950 hover:to-indigo-950 text-white py-3.5 rounded-xl font-extrabold text-sm shadow-xl shadow-blue-950/25 hover:shadow-2xl active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>በመቀየር ላይ…</span>
                </div>
              ) : (
                <>
                  <span>ፓስዎርድ ቀይር</span>
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
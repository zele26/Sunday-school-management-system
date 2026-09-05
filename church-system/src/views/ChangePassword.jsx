import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiFetch } from '../api/apiClient';
import { changePasswordSchema } from '../schemas';

const ChangePassword = () => {
  const [message, setMessage] = useState({ text: '', type: '' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setMessage({ text: '', type: '' });

    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      const resData = await res.json();
      if (res.ok) {
        setMessage({ text: 'ፓስዎርድ በተሳካ ሁኔታ ተቀይሯል!', type: 'success' });
        reset();
      } else {
        setMessage({ text: resData.message || 'ለውጡ አልተሳካም', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'የአውታረ መረብ ስህተት', type: 'error' });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 transition-all space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </span>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">ፓስዎርድ ቀይር</h2>
        </div>
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50 px-3.5 py-2 rounded-xl transition-all border border-slate-200/60 flex items-center gap-1.5"
        >
          <span>←</span> ዳሽቦርድ
        </Link>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium shadow-sm border flex items-center gap-2.5 transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">አሁን ያለው ፓስዎርድ</label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('currentPassword')}
            className={`w-full px-4 py-3 bg-slate-50/50 border rounded-xl text-sm font-medium text-slate-700 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
              errors.currentPassword
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
            }`}
          />
          {errors.currentPassword && (
            <p className="text-[11px] text-rose-500 font-medium">{errors.currentPassword.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">አዲስ ፓስዎርድ</label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('newPassword')}
            className={`w-full px-4 py-3 bg-slate-50/50 border rounded-xl text-sm font-medium text-slate-700 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
              errors.newPassword
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
            }`}
          />
          {errors.newPassword && (
            <p className="text-[11px] text-rose-500 font-medium">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">አዲሱን ያረጋግጡ</label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            className={`w-full px-4 py-3 bg-slate-50/50 border rounded-xl text-sm font-medium text-slate-700 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
              errors.confirmPassword
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-[11px] text-rose-500 font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#1657b8] hover:bg-[#124796] active:opacity-90 text-white py-3.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:pointer-events-none mt-2 cursor-pointer"
        >
          {isSubmitting ? 'በመቀየር ላይ…' : 'ፓስዎርድ ቀይር'}
        </button>
      </form>

      {message.type === 'success' && (
        <div className="pt-2 text-center border-t border-slate-100">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            ወደ ዳሽቦርድ ሂድ
          </Link>
        </div>
      )}
    </div>
  );
};

export default ChangePassword;
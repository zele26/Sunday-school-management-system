'use client';

// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useAuthStore from '../store/authStore';
import { apiFetch } from '../api/apiClient';
import { loginSchema } from '../schemas';
import bgImage from '../assets/Lidetachurch.jpg';
import logoImage from '../assets/ChurchLogo.png';

const Login = () => {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const currentUser = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      credential: '',
      password: '',
    },
  });

  // Helper to determine destination path based on role
  const getDestinationPath = (role) => {
    const normalizedRole = role?.toLowerCase() || '';
    if (['admin', 'superadmin', 'department_admin'].includes(normalizedRole)) {
      return '/admin';
    }
    if (normalizedRole === 'teacher') {
      return '/teacher';
    }
    return '/dashboard';
  };

  // Redirect if already logged in and hydrated
  useEffect(() => {
    if (hasHydrated && isLoggedIn && currentUser) {
      const destination = getDestinationPath(currentUser.role);
      router.replace(destination);
    }
  }, [hasHydrated, isLoggedIn, currentUser, router]);

  const onSubmit = async (data) => {
    setError('');

    const credential = data.credential.trim();
    const payload = { password: data.password };

    if (credential.includes('@')) {
      payload.email = credential.toLowerCase();
    } else if (
      credential.toUpperCase().startsWith('TKR-') ||
      credential.toUpperCase().startsWith('TKD-')
    ) {
      payload.studentId = credential;
    } else {
      payload.phone = credential;
    }

    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const resData = await response.json().catch(() => ({ message: 'Invalid server response.' }));

      if (response.ok) {
        loginStore(resData.accessToken, resData.user);
        const destination = getDestinationPath(resData.user?.role);
        router.replace(destination);
      } else {
        if (response.status === 403) {
          setError(resData.message || 'Your account is not yet approved or has been rejected.');
        } else {
          setError(resData.message || 'Login failed');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center fixed inset-0 font-sans selection:bg-amber-400 selection:text-slate-950"
      style={{ backgroundImage: `url(${bgImage?.src || bgImage})` }}
    >
      {/* Top Floating Back Button */}
      <Link
        href="/"
        className="fixed top-5 left-5 z-30 inline-flex items-center gap-2 bg-slate-950/80 hover:bg-slate-950 text-white px-4 py-2.5 rounded-xl text-xs font-semibold backdrop-blur-md border border-white/20 shadow-lg transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>ወደ ዋናው ገጽ (Back to Home)</span>
      </Link>

      {/* Deep Royal Blue & Dark Frosted Background Overlay */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"></div>

      {/* Clean, Light-Themed Card with Amber/Royal Blue accents */}
      <div className="max-w-4xl w-full bg-white text-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/60">

        {/* Left Branding - Official Royal Blue & Gold Theme with Centered Logo */}
        <div className="md:w-5/12 bg-gradient-to-b from-blue-950 via-[#0a2558] to-blue-950 p-8 text-white flex flex-col justify-between items-center text-center border-r border-blue-900/40">
          <div className="space-y-6 my-auto py-6 w-full flex flex-col items-center">

            {/* Perfectly Centered Official Logo */}
            <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto flex items-center justify-center group cursor-pointer">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 blur-md opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative w-full h-full p-2 rounded-full bg-white border-2 border-amber-400 shadow-2xl flex items-center justify-center overflow-hidden">
                <img
                  src={logoImage?.src || logoImage}
                  alt="የተክለ ሳዊሮስ ሰንበት ትምህርት ቤት አርማ"
                  className="w-full h-full object-contain rounded-full transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-amber-300/90 font-bold uppercase tracking-wider block">
                የደብረ ገነት ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን
              </span>
              <h1 className="text-2xl font-extrabold tracking-wide text-white leading-snug">
                ተክለ ሳዊሮስ ሰንበት ት/ቤት
              </h1>
              <div className="h-0.5 w-14 bg-amber-400 mx-auto rounded-full"></div>
              <p className="text-xs text-blue-200 font-medium pt-1">
                የተማሪዎች፣ የመምህራን እና የአስተዳደር መድረክ
              </p>
            </div>
          </div>

          <div className="hidden md:block text-xs text-amber-200/90 font-medium italic border-t border-white/10 pt-4 w-full">
            "ሕፃኑንም በሚሄድበት መንገድ ምራው"
          </div>
        </div>

        {/* Right Form */}
        <div className="md:w-7/12 p-8 md:p-10 bg-white flex flex-col justify-center">
          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center gap-2.5 font-medium shadow-sm">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                የአባል መግቢያ <span className="text-amber-600 font-semibold text-base ml-1">(Sign In)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                ኢሜይል፣ ስልክ ቁጥር ወይም የተማሪ መለያ ያስገቡ
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  ኢሜይል / ስልክ / የተማሪ መለያ
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    {...register('credential')}
                    placeholder="example@gmail.com / 0911... / TKD-2026-..."
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 transition-all outline-none ${
                      errors.credential
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-blue-700 focus:ring-blue-700/20'
                    }`}
                  />
                </div>
                {errors.credential && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">
                    {errors.credential.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  ፓስዎርድ (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    {...register('password')}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 transition-all outline-none ${
                      errors.password
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-blue-700 focus:ring-blue-700/20'
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 hover:from-blue-950 hover:to-slate-900 text-amber-400 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none border border-amber-400/30"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>ይግቡ (Sign In)</span>
                    <span>➔</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
              <Link
                href="/forgot-password"
                className="hover:text-blue-700 transition-colors py-1 font-semibold"
              >
                ፓስዎርድ ረስተዋል?
              </Link>
              <Link
                href="/student-register"
                className="text-amber-600 hover:text-amber-700 font-bold hover:underline underline-offset-4 transition-all py-1"
              >
                አዲስ አካውንት ይክፈቱ (ይመዝገቡ)
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
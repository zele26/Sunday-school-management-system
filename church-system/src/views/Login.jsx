'use client';

// src/views/Login.jsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, User, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { apiFetch } from '../api/apiClient';
import { loginSchema } from '../schemas';
import logoImage from '../assets/ChurchLogo.png';
import churchBg from '../assets/Lidetachurch2.jpg';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { BackButton } from '../components/ui';

// Authentic Ethiopian Orthodox Cross (Meskel) Motif
const EthiopianCrossIcon = ({ className = 'w-6 h-6', ...props }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className} {...props}>
    {/* Main Cross Beams */}
    <rect x="44" y="6" width="12" height="88" rx="2" />
    <rect x="6" y="32" width="88" height="12" rx="2" />
    {/* Diamond Interlace Structure at Center */}
    <polygon points="50,16 70,38 50,60 30,38" fill="none" stroke="currentColor" strokeWidth="4" />
    <polygon points="50,26 62,38 50,50 38,38" fill="currentColor" opacity="0.25" />
    <circle cx="50" cy="38" r="3.5" fill="currentColor" />
    {/* Sacred Finials */}
    <circle cx="50" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="50" cy="92" r="5" fill="none" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="8" cy="38" r="5" fill="none" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="92" cy="38" r="5" fill="none" stroke="currentColor" strokeWidth="2.5" />
    {/* Corner Quadrant Radiance Accents */}
    <circle cx="28" cy="18" r="2.5" fill="currentColor" opacity="0.6" />
    <circle cx="72" cy="18" r="2.5" fill="currentColor" opacity="0.6" />
    <circle cx="28" cy="58" r="2.5" fill="currentColor" opacity="0.6" />
    <circle cx="72" cy="58" r="2.5" fill="currentColor" opacity="0.6" />
  </svg>
);

const Login = () => {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const currentUser = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

      let resData = null;
      try {
        resData = await response.json();
      } catch (parseErr) {
        if (response.status === 502 || response.status === 504 || response.status === 503) {
          setError('የሰርቨር ግንኙነት ለጊዜው ተቋርጧል። እባክዎ ጥቂት ቆይተው እንደገና ይሞክሩ።');
        } else if (response.status === 404) {
          setError('የመግቢያ አገልግሎት አልተገኘም።');
        } else {
          setError('የሰርቨር ምላሽ ስህተት አጋጥሟል።');
        }
        return;
      }

      if (response.ok) {
        loginStore(resData.accessToken, resData.user);
        const destination = getDestinationPath(resData.user?.role);
        router.replace(destination);
      } else {
        if (response.status === 403) {
          setError(resData?.message || 'አካውንትዎ ገና በአስተዳዳሪ አልተረጋገጠም።');
        } else if (response.status === 401) {
          setError(resData?.message || 'የተሳሳተ የተጠቃሚ ስም ወይም የይለፍ ቃል።');
        } else {
          setError(resData?.message || `መግባት አልተሳካም (ስህተት ${response.status})`);
        }
      }
    } catch (err) {
      setError(err?.message || 'የኔትወርክ ግንኙነት ችግር አጋጥሟል። እባክዎ ግንኙነትዎን ያረጋግጡ።');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center p-4 sm:p-6 font-sans bg-gradient-to-br from-slate-100/90 via-[#f3f6fb] to-amber-50/70 dark:from-[#050c1a] dark:via-[#09152b] dark:to-[#030710] text-slate-800 dark:text-slate-100 selection:bg-[var(--brand-gold)] selection:text-slate-950 relative overflow-x-hidden transition-colors duration-300">
      {/* 🌟 1. Background Atmosphere: Luminous Church Exterior with Adaptive Glassmorphism */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <Image
          src={churchBg}
          alt="የቅድስት ልደታ ለማርያም ቤተክርስቲያን"
          fill
          priority
          className="object-cover object-center filter blur-[1px] scale-105 opacity-25 dark:opacity-15 brightness-105 dark:brightness-90 contrast-95 dark:contrast-105 pointer-events-none transition-all duration-300"
        />

        {/* Adaptive Glassmorphic Layer (Luminous white in light mode, deep navy in dark mode) */}
        <div className="absolute inset-0 bg-white/75 dark:bg-slate-950/85 backdrop-blur-[2px] transition-colors duration-300" />

        {/* Divine Golden & Sapphire Radiant Halos */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/20 via-blue-500/10 to-transparent dark:from-amber-500/15 dark:via-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/15 via-transparent to-transparent dark:from-blue-700/15 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle Concentric Sacred Geometry Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] border border-amber-500/20 dark:border-amber-400/10 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[920px] h-[920px] border border-blue-500/15 dark:border-blue-400/10 rounded-full pointer-events-none" />

        {/* Traditional Meskel Watermarks on Sides */}
        <div className="absolute top-1/2 -left-12 -translate-y-1/2 opacity-10 dark:opacity-5 text-amber-800 dark:text-amber-300 pointer-events-none select-none hidden xl:block">
          <EthiopianCrossIcon className="w-96 h-96" />
        </div>
        <div className="absolute top-1/2 -right-12 -translate-y-1/2 opacity-10 dark:opacity-5 text-amber-800 dark:text-amber-300 pointer-events-none select-none hidden xl:block">
          <EthiopianCrossIcon className="w-96 h-96" />
        </div>
      </div>

      {/* 🌟 2. Top Header Navigation Bar */}
      <header className="relative z-30 w-full max-w-5xl mx-auto flex items-center justify-between py-2 pt-2">
        <BackButton href="/" label="ወደ ዋናው ገጽ" variant="glass" />

        {/* Sacred Orthodox Invocation */}
        <div className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-amber-400/50 dark:border-amber-400/30 text-slate-800 dark:text-amber-200 text-xs font-bold shadow-xs">
          <span className="text-amber-500 dark:text-amber-400 text-sm">✝️</span>
          <span>በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ አሜን</span>
        </div>

        <div>
          <ThemeToggle className="bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-700/80 shadow-xs backdrop-blur-md hover:border-amber-400/50" />
        </div>
      </header>

      {/* 🌟 3. Main Central Two-Column Split Card */}
      <main className="relative z-10 w-full flex items-center justify-center my-auto py-6">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          className="max-w-4xl lg:max-w-5xl w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-3xl sm:rounded-4xl shadow-2xl shadow-blue-950/10 dark:shadow-black/70 overflow-hidden flex flex-col md:flex-row border border-slate-200/90 dark:border-slate-800 transition-colors duration-300"
        >
          {/* Left Brand Banner (45% Width on Desktop) */}
          <div className="md:w-5/12 bg-gradient-to-br from-[#0c326b] via-[#1657b8] to-[#0a2754] dark:from-[#092247] dark:via-[#0f3871] dark:to-[#081a36] p-8 sm:p-10 text-white flex flex-col justify-between items-center text-center relative overflow-hidden">
            {/* Ambient internal soft lighting */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Top Logo & Church Header */}
            <div className="space-y-6 my-auto py-3 w-full flex flex-col items-center relative z-10">
              {/* Circular Sunday School Logo with Golden Glow */}
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto flex items-center justify-center group">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.7, 0.35] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                  className="absolute -inset-2 rounded-full bg-gradient-to-tr from-amber-400/50 via-yellow-300/30 to-white/20 blur-xl"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 45, ease: 'linear' }}
                  className="absolute -inset-2 rounded-full border border-dashed border-amber-300/40 pointer-events-none"
                />
                <div className="relative w-full h-full p-2 rounded-full bg-white border-2 border-amber-400 shadow-2xl flex items-center justify-center overflow-hidden ring-4 ring-amber-400/30">
                  <Image
                    src={logoImage}
                    alt="የተክለ ሳዊሮስ ሰንበት ትምህርት ቤት አርማ"
                    width={144}
                    height={144}
                    priority
                    className="w-full h-full object-contain rounded-full transform group-hover:scale-105 transition-transform duration-500"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                </div>
              </div>

              {/* Church Parish Title & School Heading */}
              <div className="space-y-2">
                <p className="text-[11px] sm:text-xs text-amber-300 font-bold tracking-wide leading-relaxed px-2">
                  ማህደረ ስብሐት ቅድስት ልደታ ለማርያም ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን
                </p>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  ተክለ ሳዊሮስ ሰንበት ት/ቤት
                </h1>
                <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-yellow-300 mx-auto rounded-full mt-2 mb-3" />

                {/* Role Clarification: Refined Descriptor Badge (Non-clickable) */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 dark:bg-black/20 border border-white/15 text-amber-100 text-xs font-semibold backdrop-blur-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>የተማሪዎች፣ የመምህራን እና የአስተዳዳሪዎች የተጠቃሚ መድረክ</span>
                </div>
              </div>
            </div>

            {/* Scripture Verse Footer */}
            <div className="text-xs text-amber-200/90 font-medium italic border-t border-white/15 pt-3.5 w-full relative z-10 leading-relaxed">
              «ልጅን በሚሄድበት መንገድ ምራው፥ በሸመገለም ጊዜ ከእርሱ ፈቀቅ አይልም።» (ምሳሌ ፳፪፥፮)
            </div>
          </div>

          {/* Right Form Panel (55% Width on Desktop) */}
          <div className="md:w-7/12 p-7 sm:p-10 lg:p-12 bg-white dark:bg-slate-900 flex flex-col justify-center">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3 font-bold shadow-xs"
              >
                <span className="text-base shrink-0">⚠️</span>
                <span>{error}</span>
              </motion.div>
            )}

            <div className="max-w-md mx-auto w-full space-y-5">
              {/* Form Title & Subtitle */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1657b8] dark:text-blue-300 text-xs font-black border border-blue-200 dark:border-blue-800/80 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>እንኳን ደህና መጡ</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  የአባላት መግቢያ
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  እባክዎትን ስልክ ቁጥር፣ ኢሜይል ወይም የተማሪ መለያ ቁጥርዎን ያስገቡ
                </p>
              </div>

              {/* Controlled Authentication Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
                {/* Input 1: Identifier */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    የተጠቃሚ መለያ
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4 text-[#1657b8] dark:text-amber-400" />
                    </div>
                    <input
                      type="text"
                      {...register('credential')}
                      placeholder="ስልክ ቁጥር፣ ኢሜይል ወይም መለያ ቁጥር (TKD-...)"
                      className={`w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 transition-all outline-none font-medium ${
                        errors.credential
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                          : 'border-slate-200 dark:border-slate-700 focus:border-[#1657b8] focus:ring-[#1657b8]/20'
                      }`}
                    />
                  </div>
                  {errors.credential && (
                    <p className="text-[11px] text-rose-500 font-medium mt-1 pl-1">
                      {errors.credential.message}
                    </p>
                  )}
                </div>

                {/* Input 2: Password with Integrated Forgot Password Link */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      የይለፍ ቃል
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-bold text-[#1657b8] dark:text-amber-400 hover:underline transition-colors"
                    >
                      የይለፍ ቃልዎን ረስተዋል?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4 text-[#1657b8] dark:text-amber-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-11 py-3.5 bg-slate-50 dark:bg-slate-800/80 border rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 transition-all outline-none font-medium ${
                        errors.password
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                          : 'border-slate-200 dark:border-slate-700 focus:border-[#1657b8] focus:ring-[#1657b8]/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#1657b8] dark:hover:text-amber-400 cursor-pointer transition-colors"
                      aria-label={showPassword ? 'የይለፍ ቃል ደብቅ' : 'የይለፍ ቃል አሳይ'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-rose-500 font-medium mt-1 pl-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit CTA Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-2 bg-gradient-to-r from-[#1657b8] to-[#0f4699] hover:from-[#124796] hover:to-[#0c377a] active:opacity-90 text-white py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer border border-blue-400/30"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>ይግቡ</span>
                      <ArrowRight className="w-4 h-4 text-amber-300" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* 🌟 4. Dedicated Registration & Applicant Section */}
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="p-4 bg-slate-50/90 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span className="text-slate-800 dark:text-slate-200 font-extrabold text-xs">
                      አዲስ ተመዝጋቢ ነዎት?
                    </span>
                    <Link
                      href="/check-status"
                      className="text-xs font-bold text-[#1657b8] dark:text-amber-400 hover:underline flex items-center gap-1 transition-colors"
                    >
                      <span>የምዝገባ ሁኔታ ያረጋግጡ</span>
                      <span>➔</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <Link
                      href="/register-regular"
                      className="px-3 py-2 rounded-xl bg-blue-600/10 text-[#1657b8] dark:text-blue-300 hover:bg-blue-600/20 border border-blue-500/30 font-bold text-xs text-center transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>🏛️</span>
                      <span>የመደበኛ ምዝገባ</span>
                    </Link>
                    <Link
                      href="/register-distance"
                      className="px-3 py-2 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 font-bold text-xs text-center transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>🌐</span>
                      <span>የርቀት ምዝገባ</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* 🌟 5. Subtle Footer Attribution */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-4 py-4 text-center text-xs text-slate-400 dark:text-slate-500 select-none">
        <p>© 2026 ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት • የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን (EOTC)</p>
      </footer>
    </div>
  );
};

export default Login;
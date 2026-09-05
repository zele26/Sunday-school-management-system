'use client';

// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
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
          setError('የሰርቨር ግንኙነት ተቋርጧል (Backend server is currently waking up. Please wait a moment and try again).');
        } else if (response.status === 404) {
          setError('የመግቢያ አገልግሎት አልተገኘም (API endpoint not found).');
        } else {
          setError(`Invalid server response (HTTP ${response.status}).`);
        }
        return;
      }

      if (response.ok) {
        loginStore(resData.accessToken, resData.user);
        const destination = getDestinationPath(resData.user?.role);
        router.replace(destination);
      } else {
        if (response.status === 403) {
          setError(resData?.message || 'አካውንትዎ ገና አልተረጋገጠም (Your account is pending approval).');
        } else if (response.status === 401) {
          setError(resData?.message || 'የተሳሳተ የመግቢያ መረጃ (Invalid username or password).');
        } else {
          setError(resData?.message || `Login failed (Status ${response.status})`);
        }
      }
    } catch (err) {
      setError(err?.message || 'Network error. Please check your connection.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center p-4 sm:p-6 font-sans bg-gradient-to-br from-blue-50/90 via-[#fdfdfc] to-amber-50/70 dark:from-[#050c1a] dark:via-[#09152b] dark:to-[#030710] selection:bg-[var(--brand-gold)] selection:text-slate-950 relative overflow-x-hidden">
      {/* 🌟 1. Luminous & Eye-Catching Ethiopian Orthodox Church Atmosphere */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Soft, bright Lideta Church photograph backdrop with gentle aura */}
        <img
          src={churchBg?.src || churchBg}
          alt="Lideta Church"
          className="w-full h-full object-cover object-center filter blur-[2px] scale-105 opacity-25 dark:opacity-15 brightness-[1.08] contrast-[1.02] dark:brightness-[0.45] transition-all duration-700"
        />

        {/* Luminous Light Veil with Royal Blue & Gold Warmth */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-amber-50/70 dark:from-[#050c1a]/95 dark:via-[#09152b]/92 dark:to-[#030710]/95" />

        {/* Celestial Divine Golden Aura & Soft Halos */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[550px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/25 via-yellow-200/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Concentric Sacred Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] border border-amber-400/25 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[950px] border border-blue-400/15 rounded-full pointer-events-none" />

        {/* Subtle Traditional Ethiopian Orthodox Cross Watermarks on Left & Right */}
        <div className="absolute top-1/2 -left-10 -translate-y-1/2 opacity-15 dark:opacity-10 text-amber-600 dark:text-amber-400 pointer-events-none select-none hidden lg:block">
          <EthiopianCrossIcon className="w-80 h-80" />
        </div>
        <div className="absolute top-1/2 -right-10 -translate-y-1/2 opacity-15 dark:opacity-10 text-amber-600 dark:text-amber-400 pointer-events-none select-none hidden lg:block">
          <EthiopianCrossIcon className="w-80 h-80" />
        </div>
      </div>

      {/* 🌟 2. Top Header Navigation Bar with Professional Back Button */}
      <header className="relative z-30 w-full max-w-7xl mx-auto flex items-center justify-between py-2 pt-2">
        <BackButton href="/" label="ወደ ዋናው ገጽ" subLabel="Back to Home" variant="glass" />

        {/* Sacred Orthodox Invocation (Pill badge) */}
        <div className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-amber-400/50 dark:border-amber-500/30 text-slate-800 dark:text-amber-300 text-xs font-black shadow-sm">
          <span className="text-amber-500 text-sm">✝️</span>
          <span>በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ አሜን</span>
        </div>

        <div>
          <ThemeToggle className="bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-800 shadow-sm backdrop-blur-md hover:border-amber-400/50" />
        </div>
      </header>

      {/* 🌟 3. Main Central Login Card */}
      <main className="relative z-10 w-full flex items-center justify-center my-auto py-6">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          className="max-w-4xl w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-3xl sm:rounded-4xl shadow-2xl shadow-blue-950/10 dark:shadow-black/50 overflow-hidden flex flex-col md:flex-row border border-slate-200/80 dark:border-slate-800"
        >
          {/* Left Branding Panel */}
          <div className="md:w-5/12 bg-gradient-to-br from-[#0c326b] via-[#1657b8] to-[#0a2754] p-8 sm:p-10 text-white flex flex-col justify-between items-center text-center relative overflow-hidden">
            {/* Ambient internal light */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Top Logo & Church Header */}
            <div className="space-y-6 my-auto py-4 w-full flex flex-col items-center relative z-10">
              {/* Centered Church Logo with Golden Halo */}
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto flex items-center justify-center group cursor-pointer">
                <motion.div
                  animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.75, 0.4] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                  className="absolute -inset-2 rounded-full bg-gradient-to-tr from-amber-400/60 via-yellow-300/40 to-white/30 blur-xl"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
                  className="absolute -inset-2 rounded-full border border-dashed border-amber-300/50 pointer-events-none"
                />
                <div className="relative w-full h-full p-2.5 rounded-full bg-white border-2 border-amber-400 shadow-2xl flex items-center justify-center overflow-hidden ring-4 ring-amber-400/30">
                  <img
                    src={logoImage?.src || logoImage}
                    alt="የተክለ ሳዊሮስ ሰንበት ትምህርት ቤት አርማ"
                    className="w-full h-full object-contain rounded-full transform group-hover:scale-108 transition-transform duration-500"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="text-[10px] sm:text-[11px] text-amber-300 font-bold tracking-wide uppercase px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs inline-block">
                  የማህደረ ስብሐት ቅድስት ልደታ ለማርያም
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  ተክለ ሳዊሮስ ሰንበት ት/ቤት
                </h1>
                <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-yellow-300 mx-auto rounded-full"></div>
                <p className="text-xs text-blue-100 font-medium pt-1">
                  የተማሪዎች፣ የመምህራን እና የአስተዳደር መድረክ
                </p>
              </div>

              {/* Quick Role Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-bold text-amber-200">
                <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15">👤 ተማሪ</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15">👨‍🏫 መምህር</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15">🛡️ አስተዳዳሪ</span>
              </div>
            </div>

            {/* Scripture Verse Footer */}
            <div className="text-xs text-amber-200/90 font-semibold italic border-t border-white/15 pt-3 w-full relative z-10">
              «ሕፃኑንም በሚሄድበት መንገድ ምራው...»
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="md:w-7/12 p-8 sm:p-12 bg-white dark:bg-slate-900 flex flex-col justify-center">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3 font-semibold shadow-xs"
              >
                <span className="text-base">⚠️</span>
                <span>{error}</span>
              </motion.div>
            )}

            <div className="max-w-md mx-auto w-full space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-blue-300 text-xs font-black border border-blue-200 dark:border-blue-800 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>እንኳን ደህና መጡ</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  የአባል መግቢያ <span className="text-[#1657b8] dark:text-amber-400 font-bold text-lg">(Sign In)</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  ኢሜይል፣ ስልክ ቁጥር ወይም የተማሪ መለያ ቁጥር ያስገቡ
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
                {/* Username / Email / ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    ኢሜይል / ስልክ / የተማሪ መለያ (Username / ID)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4 text-[#1657b8] dark:text-amber-400" />
                    </div>
                    <input
                      type="text"
                      {...register('credential')}
                      placeholder="ምሳሌ፡ 09XXXXXXXX / example@gmail.com / TKD-..."
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

                {/* Password with Visibility Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    የይለፍ ቃል (Password)
                  </label>
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
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
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

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-2 bg-gradient-to-r from-[#1657b8] to-[#0f4699] hover:from-[#124796] hover:to-[#0c377a] active:opacity-90 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer border border-blue-400/30"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>ይግቡ (Sign In)</span>
                      <ArrowRight className="w-4 h-4 text-amber-300" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Bottom Links */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <Link
                  href="/forgot-password"
                  className="hover:text-[#1657b8] dark:hover:text-amber-400 transition-colors py-1 font-bold"
                >
                  ፓስዎርድ ረስተዋል? (Forgot Password)
                </Link>
                <Link
                  href="/student-register"
                  className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-black hover:underline underline-offset-4 transition-all py-1 flex items-center gap-1"
                >
                  <span>አዲስ አካውንት ይመዝገቡ</span>
                  <span>➔</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* 🌟 4. Sacred Church Parish Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-4 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 space-y-1 select-none">
        <div className="flex flex-wrap items-center justify-center gap-2 text-[#1657b8] dark:text-amber-400 font-bold">
          <span>⛪ የማህደረ ስብሐት ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት • የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን (EOTC)
        </p>
      </footer>
    </div>
  );
};

export default Login;

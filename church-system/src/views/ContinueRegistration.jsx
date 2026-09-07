'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../api/apiClient';
import { BackButton, Card } from '../components/ui';
import ChurchLogo from '../assets/ChurchLogo.png';

const ContinueRegistrationContent = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registration, setRegistration] = useState(null);

  const [transactionRef, setTransactionRef] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);

  // Loading states
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/registrations/payment-info`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.message) setPaymentInfo(data);
      })
      .catch((err) => console.warn('Could not fetch payment info:', err));
  }, []);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setMessage('');
    setError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), password }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.studentType !== 'distance') {
          setError('ይህ የመደበኛ ተማሪ ምዝገባ ነው። ክፍያ አያስፈልገውም። (Regular stream registration does not require receipt upload)');
          setIsLoggingIn(false);
          return;
        }
        setRegistration(data);
      } else {
        setError(data.message || 'ትክክለኛ ያልሆነ ስልክ ቁጥር ወይም የይለፍ ቃል (Login Failed)');
      }
    } catch (err) {
      setError('የአውታረ መረብ ስህተት እባክዎ እንደገና ይሞክሩ (Network Error)');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('የፋይል መጠን ከ 5MB መብለጥ የለበትም (File too large)');
      return;
    }

    setReceiptFile(file);
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations/upload-receipt`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setReceiptUrl(data.receiptUrl);
        setMessage('ደረሰኝ በተሳካ ሁኔታ ተጭኗል (Receipt uploaded successfully)');
      } else {
        setError(data.message || 'ደረሰኝ መጫን አልተሳካም');
      }
    } catch (err) {
      setError('የአውታረ መረብ ስህተት በደረሰኝ ጭነት ወቅት');
    } finally {
      setUploading(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e?.preventDefault();
    if (!transactionRef.trim()) {
      setError('እባክዎ የክፍያ ማጣቀሻ ቁጥር (Transaction Ref) ያስገቡ');
      return;
    }
    if (!receiptUrl) {
      setError('እባክዎ የደረሰኝ ፎቶ ይጫኑ');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations/submit-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: registration.phone,
          transactionRef: transactionRef.trim(),
          receiptUrl,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.message || 'ክፍያ ማረጋገጥ አልተሳካም');
      }
    } catch (err) {
      setError('የአውታረ መረብ ስህተት እባክዎ እንደገና ይሞክሩ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1657b8] transition-all text-slate-900 dark:text-white text-sm placeholder:text-slate-400 font-medium';
  const labelClass = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1';

  // ───────────────────────── 1. SUBMITTED SUCCESS SCREEN ─────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/90 via-[#f8fafc] to-amber-50/70 dark:from-[#050c1a] dark:via-[#09152b] dark:to-[#030710] flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
        <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 relative z-10">
          <BackButton href="/" label="ወደ ዋናው ገጽ" subLabel="Back to Home" variant="glass" />
        </header>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl sm:rounded-4xl shadow-2xl border border-emerald-200 dark:border-emerald-800/60 p-6 sm:p-10 text-center my-auto relative z-10 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/60 rounded-3xl flex items-center justify-center mx-auto mb-5 border-2 border-emerald-200 dark:border-emerald-800 shadow-inner text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-500/10">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            የክፍያ ደረሰኝዎ ተልኳል!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
            የክፍያ ማረጋገጫዎ በተሳካ ሁኔታ ደርሶናል፤ በአስተዳዳሪዎች ክለሳ ይደረግበታል።
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">የማመልከቻ ቁጥርዎ (Reg No.)</p>
            <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-widest">
              {registration?.registrationNumber}
            </p>
          </div>

          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 mb-6 text-left">
            <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-300 leading-relaxed font-medium">
              💡 ማረጋገጫው በትምህርት ቤቱ አስተዳደር ሲጸድቅ በስልክዎ እና በይለፍ ቃልዎ ወደ ኦንላይን መማሪያ ፖርታል ገብተው ትምህርትዎን መጀመር ይችላሉ።
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/check-status"
              className="block w-full bg-gradient-to-r from-[#1657b8] to-[#0d3f8a] hover:from-[#124796] hover:to-[#0a316b] text-white py-3.5 sm:py-4 rounded-2xl font-black shadow-lg shadow-blue-600/25 transition-all text-sm cursor-pointer"
            >
              የምዝገባ ሁኔታ ይከታተሉ (Check Status) ➔
            </Link>
            <Link
              href="/login"
              className="block w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3.5 rounded-2xl font-bold transition-all text-sm cursor-pointer"
            >
              ወደ መግቢያ ገጽ ይመለሱ (Back to Login)
            </Link>
          </div>
        </motion.div>

        <footer className="py-4 text-center text-xs font-bold text-slate-400 dark:text-slate-500 relative z-10">
          ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት • የማህደረ ስብሐት ቅድስት ልደታ ለማርያም
        </footer>
      </div>
    );
  }

  // ───────────────────────── 2. LOGGED OUT STATE (LOGIN FORM) ─────────────────────────
  if (!registration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/90 via-[#f8fafc] to-amber-50/70 dark:from-[#050c1a] dark:via-[#09152b] dark:to-[#030710] flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden selection:bg-[var(--brand-gold)] selection:text-slate-950">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[350px] bg-amber-400/10 dark:bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 relative z-10">
          <BackButton href="/" label="ወደ ዋናው ገጽ" subLabel="Back to Home" variant="glass" />
          <Link
            href="/check-status"
            className="text-xs font-bold text-[#1657b8] dark:text-blue-400 hover:text-blue-800 transition-colors flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-2xs backdrop-blur-xs cursor-pointer"
          >
            <span>ሁኔታ አረጋግጥ (Check Status)</span>
            <span>➔</span>
          </Link>
        </header>

        <main className="w-full max-w-5xl my-auto py-6 relative z-10 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="max-w-4xl w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-3xl sm:rounded-4xl shadow-2xl shadow-blue-950/15 dark:shadow-black/60 overflow-hidden flex flex-col md:flex-row border border-slate-200/90 dark:border-slate-800"
          >
            {/* Left Sacred Church Branding */}
            <div className="md:w-5/12 bg-gradient-to-br from-[#0c326b] via-[#1657b8] to-[#0a2754] p-8 sm:p-10 text-white flex flex-col justify-between items-center text-center relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-6 my-auto py-4 w-full flex flex-col items-center relative z-10">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto flex items-center justify-center group">
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
                    <Image
                      src={ChurchLogo}
                      alt="Church Logo"
                      width={128}
                      height={128}
                      priority
                      className="w-full h-full object-contain rounded-full transform group-hover:scale-108 transition-transform duration-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] sm:text-[11px] text-amber-300 font-bold tracking-wide uppercase px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs inline-block">
                    የርቀት ትምህርት መድረክ
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                    ቀጥል ምዝገባ
                  </h1>
                  <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-yellow-300 mx-auto rounded-full" />
                  <p className="text-xs text-blue-100 font-medium pt-1">
                    የርቀት ተማሪዎች የክፍያ ደረሰኝ ማያያዣ እና ማረጋገጫ
                  </p>
                </div>

                <div className="w-full space-y-2 pt-2 text-left text-xs font-semibold text-blue-100/90">
                  <div className="flex items-center gap-2.5 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">1</span>
                    <span>ስልክ እና የይለፍ ቃልዎን ያስገቡ</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">2</span>
                    <span>የባንክ ደረሰኝዎን ይጫኑ</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">3</span>
                    <span>የተማሪ መለያዎን ተቀብለው ይማሩ</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-amber-200/90 font-semibold italic border-t border-white/15 pt-3 w-full relative z-10">
                «ሕፃኑንም በሚሄድበት መንገድ ምራው»
              </div>
            </div>

            {/* Right Form Panel */}
            <div className="md:w-7/12 p-8 sm:p-12 bg-white dark:bg-slate-900 flex flex-col justify-center">
              <div className="mb-6 space-y-1.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    💳 የክፍያ ማረጋገጫ (Payment Completion)
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  ምዝገባዎን ይቀጥሉ
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  የርቀት ትምህርት ማመልከቻዎን ለማጠናቀቅ በምዝገባ ወቅት የተጠቀሙትን መረጃ ያስገቡ።
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 p-4 bg-rose-50 dark:bg-rose-950/40 border-l-4 border-rose-500 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-bold rounded-r-2xl flex items-center gap-3 shadow-xs"
                >
                  <span className="text-lg shrink-0">⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                    የተመዘገቡበት ስልክ ቁጥር (Phone Number) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <svg className="w-5 h-5 text-[#1657b8] dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </span>
                    <input
                      type="tel"
                      placeholder="09... ወይም 07..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1657b8] transition-all text-slate-900 dark:text-white text-sm font-medium placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                    የይለፍ ቃል (Password) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <svg className="w-5 h-5 text-[#1657b8] dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1657b8] transition-all text-slate-900 dark:text-white text-sm font-medium placeholder:text-slate-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoggingIn || !phone || !password}
                    className="w-full bg-gradient-to-r from-[#1657b8] to-[#0f4699] hover:from-[#124796] hover:to-[#0c377a] active:scale-98 text-white py-3.5 sm:py-4 rounded-2xl font-black shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm sm:text-base border border-blue-400/30"
                  >
                    {isLoggingIn ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>በማረጋገጥ ላይ...</span>
                      </>
                    ) : (
                      <>
                        <span>ቀጥል (Continue)</span>
                        <span className="text-amber-300 text-lg font-black">➔</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs text-center">
                <div className="flex flex-wrap items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                  <span>አዲስ ተማሪ ነዎት?</span>
                  <Link href="/register-distance" className="font-extrabold text-[#1657b8] dark:text-blue-400 hover:underline">
                    አሁን ይመዝገቡ ➔
                  </Link>
                  <span>•</span>
                  <Link href="/check-status" className="font-extrabold text-amber-700 dark:text-amber-400 hover:underline">
                    ሁኔታ ይፈትሹ ➔
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </main>

        <footer className="py-4 text-center text-xs font-bold text-slate-400 dark:text-slate-500 relative z-10">
          ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት • የማህደረ ስብሐት ቅድስት ልደታ ለማርያም
        </footer>
      </div>
    );
  }

  // ───────────────────────── 3. LOGGED IN: ATTACH RECEIPT FLOW ─────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/90 via-[#f8fafc] to-amber-50/70 dark:from-[#050c1a] dark:via-[#09152b] dark:to-[#030710] py-8 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-6 relative z-10">
        <header className="flex items-center justify-between pb-2">
          <BackButton href="/" label="ወደ ዋናው ገጽ" subLabel="Back to Home" variant="glass" />
          <button
            type="button"
            onClick={() => setRegistration(null)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            ← ውጣ (Switch Account)
          </button>
        </header>

        <div className="text-center mb-6">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 mb-2">
            ✨ የርቀት ትምህርት ምዝገባ ማጠናቀቂያ
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            የክፍያ ደረሰኝ ማያያዣ
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            ክፍያዎን በማረጋገጥ ምዝገባዎን ያጠናቁ
          </p>
        </div>

        <Card variant="default" padding="lg" className="bg-white dark:bg-slate-900 rounded-3xl sm:rounded-4xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8">
          {/* User Detail Banner */}
          <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">የተማሪ ሙሉ ስም</p>
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{registration.fullName}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">የምዝገባ ቁጥር</p>
              <p className="font-mono font-black text-[#1657b8] dark:text-amber-400 text-sm sm:text-base">
                {registration.registrationNumber}
              </p>
            </div>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border-l-4 border-rose-500 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-bold rounded-r-xl">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-500 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-bold rounded-r-xl">
              {message}
            </div>
          )}

          {/* State: Pending Payment Form */}
          {registration.status === 'Pending Payment' && (
            <div className="space-y-6">
              {/* Payment Instructions */}
              {paymentInfo && (
                <div className="bg-gradient-to-br from-blue-50 to-amber-50/50 dark:from-blue-950/40 dark:to-slate-800/40 rounded-2xl p-5 sm:p-6 border border-blue-200 dark:border-blue-900/60 relative overflow-hidden">
                  <h3 className="font-black text-blue-950 dark:text-blue-200 mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <span>💰</span> የክፍያ መመሪያ እና የሂሳብ ቁጥር
                  </h3>
                  <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-4 bg-white/70 dark:bg-slate-900/70 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <div className="flex justify-between border-b border-slate-200/70 dark:border-slate-800 pb-2">
                      <span className="font-medium">የምዝገባ ክፍያ መጠን:</span>
                      <span className="font-bold">{paymentInfo.contributionAmount} ብር</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/70 dark:border-slate-800 pb-2">
                      <span className="font-medium">የትምህርት ቁሳቁስ ድጋፍ:</span>
                      <span className="font-bold">{paymentInfo.resourceFee} ብር</span>
                    </div>
                    <div className="flex justify-between pt-1 font-black text-slate-900 dark:text-white">
                      <span>ጠቅላላ የሚከፈል:</span>
                      <span className="text-[#1657b8] dark:text-amber-400 text-base">{paymentInfo.totalAmount} ብር</span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed font-medium">
                    {paymentInfo.instructions}
                  </p>
                </div>
              )}

              {/* Upload Form */}
              <div className="space-y-5 pt-2">
                <div>
                  <label className={labelClass}>
                    የክፍያ ማጣቀሻ ቁጥር (Transaction Reference / FT Number) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ለምሳሌ፡ FT23456789 ወይም CBE/BOA Ref"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                  <label className={labelClass}>
                    የክፍያ ደረሰኝ (ምስል ወይም PDF) <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-2 flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setReceiptFile(e.target.files[0])}
                      className="block w-full text-xs sm:text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-100 dark:file:bg-blue-950/70 file:text-[#1657b8] dark:file:text-blue-300 hover:file:bg-blue-200 transition-all cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={handleFileUpload}
                      disabled={uploading || !receiptFile}
                      className="w-full sm:w-auto whitespace-nowrap bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-xs transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-md cursor-pointer"
                    >
                      {uploading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>በመጫን ላይ...</span>
                        </>
                      ) : (
                        'አፕሎድ (Upload)'
                      )}
                    </button>
                  </div>
                  {receiptUrl && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-2 rounded-xl font-bold border border-emerald-200 dark:border-emerald-800">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>ደረሰኝ በተሳካ ሁኔታ ተያይዟል (Receipt attached)</span>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting || !receiptUrl || !transactionRef}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white py-4 rounded-2xl font-black text-sm sm:text-base shadow-xl shadow-emerald-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>በማስገባት ላይ...</span>
                      </>
                    ) : (
                      <>
                        <span>ምዝገባውን አጠናቅቅ (Finalize Registration)</span>
                        <span className="text-amber-300 font-black">➔</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* State: Pending Verification */}
          {registration.status === 'Pending Verification' && (
            <div className="bg-amber-50/70 dark:bg-amber-950/40 rounded-2xl p-6 border border-amber-200 dark:border-amber-800/60 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-2xl animate-pulse">
                ⏳
              </div>
              <h3 className="text-lg font-black text-amber-950 dark:text-amber-200">ማረጋገጫ በመጠበቅ ላይ</h3>
              <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-300 leading-relaxed max-w-md mx-auto">
                ደረሰኝዎ ደርሶናል። በትምህርት ቤቱ አስተዳደር ታይቶ ማረጋገጫ እስኪሰጥዎ ድረስ እባክዎ በትዕግስት ይጠብቁ።
              </p>
              <div className="pt-2">
                <Link
                  href="/check-status"
                  className="inline-block bg-amber-500 hover:bg-amber-600 text-slate-950 px-6 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer"
                >
                  የምዝገባ ሁኔታን ይከታተሉ ➔
                </Link>
              </div>
            </div>
          )}

          {/* State: Approved */}
          {registration.status === 'Approved' && (
            <div className="bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                🎉
              </div>
              <h3 className="text-lg font-black text-emerald-950 dark:text-emerald-200">ምዝገባዎ ጸድቋል!</h3>
              <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-300 max-w-md mx-auto">
                ወደ ሲስተሙ በመግባት የመማሪያ ክፍለ-ጊዜዎችንና ትምህርቶችን መከታተል ይችላሉ።
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  ወደ መማሪያ ፖርታል ይግቡ ➔
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ContinueRegistrationContent;
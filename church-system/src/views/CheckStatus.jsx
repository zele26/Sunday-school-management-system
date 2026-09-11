'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../api/apiClient';
import { BackButton } from '../components/ui';
import ChurchLogo from '../assets/ChurchLogo.png';

// Helper: translate raw status + studentType into a clear Amharic message
const getStatusMessage = (status, studentType) => {
  if (studentType === 'regular') {
    switch (status) {
      case 'Pending Payment':
      case 'Pending Verification':
        return 'ማመልከቻዎ ደርሶናል፤ በአስተዳዳሪዎች ማረጋገጫ በመጠበቅ ላይ ነው። ምዝገባዎ ሲጸድቅ ይፋዊ የተማሪ መለያ ቁጥር ይላክልዎታል።';
      case 'Approved':
        return 'እንኳን ደስ አዎት! ምዝገባዎ ጸድቋል። ከታች የተሰጠዎትን የተማሪ መለያ ቁጥር እና ፓስዎርድዎን ተጠቅመው ወደ ሲስተሙ መግባት ይችላሉ።';
      case 'Rejected':
        return 'ምዝገባዎ ውድቅ ተደርጓል። እባክዎ ለተጨማሪ ማብራሪያ የሰንበት ትምህርት ቤቱን አስተዳደር ያግኙ።';
      default:
        return 'የምዝገባ ሁኔታዎ እየተዘመነ ነው።';
    }
  } else {
    // distance student
    switch (status) {
      case 'Pending Payment':
        return 'የምዝገባ ክፍያ ደረሰኝ በመጠበቅ ላይ ነው። ክፍያዎን ከፍለው "ደረሰኝ ያያይዙ" በሚለው አማራጭ ደረሰኝዎን ይጫኑ።';
      case 'Pending Verification':
        return 'የክፍያ ደረሰኝዎ ደርሶናል፤ በሂሳብ ክፍል በመረጋገጥ ላይ ነው። እንደተረጋገጠ የተማሪ መለያዎ ዝግጁ ይሆናል።';
      case 'Approved':
        return 'እንኳን ደስ አዎት! ምዝገባዎ ጸድቋል። የተማሪ መለያ ቁጥርዎን እና ፓስዎርድዎን ተጠቅመው ወደ ኦንላይን መማሪያ ፖርታል መግባት ይችላሉ።';
      case 'Rejected':
        return 'ምዝገባዎ ውድቅ ተደርጓል። እባክዎ ለተጨማሪ መረጃ ትምህርት ቤቱን ያግኙ።';
      default:
        return 'የምዝገባ ሁኔታዎ እየተዘመነ ነው።';
    }
  }
};

const CheckStatusContent = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const handleCheck = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), password }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError(data.message || 'ትክክለኛ ያልሆነ ስልክ ቁጥር ወይም የይለፍ ቃል (Invalid credentials)');
      }
    } catch (err) {
      setError('የአውታረ መረብ ስህተት እባክዎ እንደገና ይሞክሩ (Network connection error)');
    } finally {
      setLoading(false);
    }
  };

  const copyStudentId = () => {
    if (result?.studentId) {
      navigator.clipboard.writeText(result.studentId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  const resetForm = () => {
    setResult(null);
    setPhone('');
    setPassword('');
    setError('');
    setCopiedId(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/90 via-[#f8fafc] to-amber-50/70 dark:from-[#050c1a] dark:via-[#09152b] dark:to-[#030710] flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden selection:bg-[var(--brand-gold)] selection:text-slate-950">
      {/* Sacred Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[350px] bg-amber-400/10 dark:bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Navigation */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 relative z-10">
        <BackButton href="/" label="ወደ ዋናው ገጽ" subLabel="Back to Home" variant="glass" />
        <Link
          href="/login"
          className="text-xs font-bold text-[#1657b8] dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-2xs backdrop-blur-xs cursor-pointer"
        >
          <span>የተማሪ መግቢያ (Login)</span>
          <span>➔</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl my-auto py-6 relative z-10 flex flex-col items-center justify-center">
        {result ? (
          /* ───────────────────────── RESULT VIEW ───────────────────────── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl sm:rounded-4xl shadow-2xl shadow-blue-950/15 dark:shadow-black/60 border border-slate-200/90 dark:border-slate-800 overflow-hidden relative"
          >
            {/* Top Status Accent Ribbon */}
            <div
              className={`h-2 w-full ${
                result.status === 'Approved'
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600'
                  : result.status === 'Rejected'
                  ? 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-600'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500'
              }`}
            />

            <div className="p-6 sm:p-10 space-y-6 text-center">
              {/* Status Header Badge & Icon */}
              <div className="space-y-3">
                <div
                  className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-lg border-2 ${
                    result.status === 'Approved'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-500/10'
                      : result.status === 'Rejected'
                      ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 ring-8 ring-rose-500/10'
                      : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 ring-8 ring-amber-500/10'
                  }`}
                >
                  {result.status === 'Approved' ? (
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : result.status === 'Rejected' ? (
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>

                <div className="space-y-1">
                  <span
                    className={`inline-block px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${
                      result.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : result.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300'
                    }`}
                  >
                    {result.status === 'Approved'
                      ? '🟢 ምዝገባዎ ጸድቋል (Application Approved)'
                      : result.status === 'Rejected'
                      ? '🔴 ምዝገባው ውድቅ ሆኗል (Application Rejected)'
                      : '⏳ ማመልከቻው በመረጋገጥ ላይ (Pending Verification)'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    የምዝገባ ሁኔታ መረጃ
                  </h2>
                </div>
              </div>

              {/* 🎓 OFFICIAL STUDENT ID CARD (If Approved) */}
              {result.status === 'Approved' && result.studentId ? (
                <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0c326b] via-[#1657b8] to-[#091e42] text-white shadow-2xl border-2 border-amber-400/60 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

                  {/* ID Header */}
                  <div className="flex items-center justify-between border-b border-white/20 pb-4 mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center shadow-md">
                        <Image src={ChurchLogo} alt="Logo" width={36} height={36} className="object-contain" />
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                          ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት
                        </span>
                        <span className="text-xs font-black text-white">ይፋዊ የተማሪ መለያ ካርድ</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-400/20 border border-amber-300/40 text-amber-200">
                      {result.studentType === 'distance' ? '🌐 ርቀት (Distance)' : '🏛️ መደበኛ (Regular)'}
                    </span>
                  </div>

                  {/* ID Body */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 mb-4">
                    <div>
                      <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider block">
                        የተማሪ ሙሉ ስም
                      </span>
                      <span className="text-lg font-black text-white block mt-0.5">{result.fullName}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider block">
                        የማመልከቻ ቁጥር (Reg No.)
                      </span>
                      <span className="text-sm font-black font-mono text-amber-300 block mt-0.5">
                        {result.registrationNumber}
                      </span>
                    </div>
                  </div>

                  {/* Official ID Box with Copy Button */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
                    <div>
                      <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block">
                        የተማሪ መለያ ቁጥር (OFFICIAL STUDENT ID)
                      </span>
                      <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-widest block mt-0.5">
                        {result.studentId}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={copyStudentId}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      {copiedId ? (
                        <>
                          <svg className="w-4 h-4 text-emerald-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>ተቀድቷል (Copied!)</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>መለያ ኮፒ አድርግ</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-blue-100/80 text-center mt-3 relative z-10">
                    💡 ወደ መማሪያ ፖርታል ለመግባት ይህንን መለያ ቁጥር እና በምዝገባ ወቅት ያስገቡትን የይለፍ ቃል ይጠቀሙ።
                  </p>
                </div>
              ) : (
                /* Student Info Summary Box (If not approved or regular) */
                <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 text-left space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">የተማሪ ሙሉ ስም</span>
                      <span className="text-base font-black text-slate-900 dark:text-white">{result.fullName}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 dark:bg-blue-950/60 text-[#1657b8] dark:text-blue-300">
                      {result.studentType === 'distance' ? '🌐 ርቀት (Distance)' : '🏛️ መደበኛ (Regular)'}
                    </span>
                  </div>

                  <div className="h-px bg-slate-200 dark:bg-slate-700" />

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">የማመልከቻ ቁጥር (Reg No.)</span>
                      <span className="text-sm font-black font-mono text-[#1657b8] dark:text-blue-400">{result.registrationNumber}</span>
                    </div>
                    {result.batch && (
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ክፍል / ባች</span>
                        <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{result.batch}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step Progress Tracker (If Pending Verification) */}
              {result.status === 'Pending Verification' && (
                <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-left space-y-4">
                  <div className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                    📋 የምዝገባ ሂደት ደረጃዎች (Progress Stages)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-2">
                      <span>✅</span>
                      <span>1. ማመልከቻ ተልኳል</span>
                    </div>
                    <div className="bg-amber-100/80 dark:bg-amber-900/50 p-3 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-black flex items-center gap-2 animate-pulse">
                      <span>⏳</span>
                      <span>2. በክለሳ ላይ ይገኛል</span>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 font-medium flex items-center gap-2">
                      <span>🔒</span>
                      <span>3. የተማሪ መለያ መስጠት</span>
                    </div>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed pt-1">
                    ማመልከቻዎ በአስተዳደር ቡድናችን እየታየ ነው። ማረጋገጫው ከ24-48 ሰዓታት ውስጥ ይጠናቀቃል።
                  </p>
                </div>
              )}

              {/* Status Message Explainer */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border text-left ${
                  result.status === 'Approved'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                    : result.status === 'Rejected'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
                    : 'bg-amber-50/70 border-amber-200 text-amber-950 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0 mt-0.5">
                    {result.status === 'Approved' ? '🎉' : result.status === 'Rejected' ? '⚠️' : 'ℹ️'}
                  </span>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed">
                    {getStatusMessage(result.status, result.studentType)}
                  </p>
                </div>
              </div>

              {/* Dynamic Action Buttons */}
              <div className="space-y-3 pt-2">
                {result.status === 'Approved' && (
                  <Link
                    href="/login"
                    className="w-full bg-gradient-to-r from-[#1657b8] to-[#0d3f8a] hover:from-[#124796] hover:to-[#0a316b] active:scale-98 text-white py-4 px-6 rounded-2xl font-black shadow-xl shadow-blue-600/30 transition-all text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>ወደ መማሪያ ፖርታል ይግቡ (Login to Student LMS)</span>
                    <span className="text-amber-300 font-black">➔</span>
                  </Link>
                )}

                {result.studentType === 'distance' && result.status === 'Pending Payment' && (
                  <Link
                    href="/continue-registration"
                    className="w-full bg-[var(--brand-gold)] hover:bg-[#dfa500] active:scale-98 text-slate-950 py-4 px-6 rounded-2xl font-black shadow-lg transition-all text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>ደረሰኝ ያያይዙና ምዝገባዎን ያጠናቁ ➔</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full py-3.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  ← ሌላ ማመልከቻ ለመፈተሽ ይመለሱ (Check Another Status)
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ───────────────────────── MAIN FORM VIEW (SPLIT SACRED DESIGN) ───────────────────────── */
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="max-w-4xl w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-3xl sm:rounded-4xl shadow-2xl shadow-blue-950/15 dark:shadow-black/60 overflow-hidden flex flex-col md:flex-row border border-slate-200/90 dark:border-slate-800"
          >
            {/* Left Sacred Branding Panel */}
            <div className="md:w-5/12 bg-gradient-to-br from-[#0c326b] via-[#1657b8] to-[#0a2754] p-8 sm:p-10 text-white flex flex-col justify-between items-center text-center relative overflow-hidden">
              {/* Ambient internal light */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

              {/* Top Logo & Church Header */}
              <div className="space-y-6 my-auto py-4 w-full flex flex-col items-center relative z-10">
                {/* Centered Church Logo with Golden Halo */}
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
                      alt="የተክለ ሳዊሮስ ሰንበት ትምህርት ቤት አርማ"
                      width={128}
                      height={128}
                      priority
                      className="w-full h-full object-contain rounded-full transform group-hover:scale-108 transition-transform duration-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] sm:text-[11px] text-amber-300 font-bold tracking-wide px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs inline-block leading-normal">
                    የማህደረ ስብሐት ቅድስት ልደታ ለማርያም ደብረ መድኃኒት መድኃኒዓለም ቤተክርስቲያን
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                    ተክለ ሳዊሮስ ሰንበት ት/ቤት
                  </h1>
                  <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-yellow-300 mx-auto rounded-full" />
                  <p className="text-xs text-blue-100 font-medium pt-1">
                    የተማሪዎች ማመልከቻ እና የምዝገባ ሁኔታ ማረጋገጫ
                  </p>
                </div>

                {/* Step-by-Step Guidance Badges */}
                <div className="w-full space-y-2 pt-2 text-left text-xs font-semibold text-blue-100/90">
                  <div className="flex items-center gap-2.5 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">1</span>
                    <span>ስልክ ቁጥርዎን ያስገቡ</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">2</span>
                    <span>የይለፍ ቃልዎን ያስገቡ</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">3</span>
                    <span>ውጤትና የተማሪ መለያ ቁጥርዎን ያግኙ</span>
                  </div>
                </div>
              </div>

              {/* Scripture Verse Footer */}
              <div className="text-xs text-amber-200/90 font-semibold italic border-t border-white/15 pt-3 w-full relative z-10">
                «ልጅን በሚሄድበት መንገድ ምራው፤ በሸመገለም ጊዜ ከእርሱ ፈቀቅ አይልም።» (ምሳ. ፳፪፥፮)
              </div>
            </div>

            {/* Right Form Panel */}
            <div className="md:w-7/12 p-8 sm:p-12 bg-white dark:bg-slate-900 flex flex-col justify-center">
              {/* Header Title & Subtitle */}
              <div className="mb-6 space-y-1.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#1657b8] dark:text-blue-400">
                    ✨ የተማሪዎች ማረጋገጫ (Verification)
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  የምዝገባ ሁኔታ ማረጋገጫ
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  የማመልከቻዎን ወይም የምዝገባዎን ወቅታዊ ደረጃ ለመከታተል መረጃዎን ያስገቡ።
                </p>
              </div>

              {/* Error Notification */}
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

              {/* Interactive Form */}
              <form onSubmit={handleCheck} className="space-y-5">
                {/* Phone Input */}
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

                {/* Password Input with Show/Hide Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 ml-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      የይለፍ ቃል (Password) <span className="text-rose-500">*</span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-[11px] font-bold text-[#1657b8] dark:text-blue-400 hover:underline"
                    >
                      የይለፍ ቃል ረሱ?
                    </Link>
                  </div>
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
                    disabled={loading || !phone || !password}
                    className="w-full bg-gradient-to-r from-[#1657b8] to-[#0f4699] hover:from-[#124796] hover:to-[#0c377a] active:scale-98 text-white py-3.5 sm:py-4 rounded-2xl font-black shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm sm:text-base border border-blue-400/30"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>በማረጋገጥ ላይ...</span>
                      </>
                    ) : (
                      <>
                        <span>ሁኔታ ያረጋግጡ</span>
                        <span className="text-amber-300 text-lg font-black">➔</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Bottom Quick Links & Shortcuts */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                  <span>አዲስ ተማሪ ነዎት?</span>
                  <Link href="/" className="font-extrabold text-[#1657b8] dark:text-blue-400 hover:underline">
                    አሁን ይመዝገቡ ➔
                  </Link>
                  <span>•</span>
                  <Link href="/continue-registration" className="font-extrabold text-amber-700 dark:text-amber-400 hover:underline">
                    ደረሰኝ ያያይዙ ➔
                  </Link>
                </div>
                <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
                  ትክክለኛውን የተመዘገቡበትን ስልክ ቁጥር እና የይለፍ ቃል ማስገባትዎን ያረጋግጡ።
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs font-bold text-slate-400 dark:text-slate-500 relative z-10">
        የማህደረ ስብሐት ቅድስት ልደታ ለማርያም ደብረ መድኃኒት መድኃኒዓለም ቤተክርስቲያን • ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት
      </footer>
    </div>
  );
};

export default CheckStatusContent;
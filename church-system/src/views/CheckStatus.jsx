'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Search,
  Lock,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { API_BASE_URL } from '../api/apiClient';
import { BackButton } from '../components/ui';
import ChurchLogo from '../assets/ChurchLogo.png';

// Helper: translate raw status + studentType into a clear Amharic message
const getStatusMessage = (status, studentType) => {
  if (studentType === 'regular') {
    switch (status) {
      case 'Pending Payment':
      case 'Pending Verification':
        return 'ማመልከቻዎ ደርሶናል፤ በአስተዳዳሪዎች ማረጋገጫ በመጠበቅ ላይ ነው። ምዝገባዎ ሲጸድቅ ይፋዊ የተማሪ መለያ ቁጥር ይዘጋጅልዎታል።';
      case 'Approved':
        return 'እንኳን ደስ አዎት! ምዝገባዎ ጸድቋል። ከታች የተሰጠዎትን የተማሪ መለያ ቁጥር እና የይለፍ ቃል ተጠቅመው ወደ ሲስተሙ መግባት ይችላሉ።';
      case 'Rejected':
        return 'ምዝገባዎ ውድቅ ተደርጓል። እባክዎ ለተጨማሪ ማብራሪያ የሰንበት ትምህርት ቤቱን አስተዳደር ያግኙ።';
      default:
        return 'የምዝገባ ሁኔታዎ እየተዘመነ ነው።';
    }
  } else {
    // distance student
    switch (status) {
      case 'Pending Payment':
        return 'የምዝገባ ክፍያ ደረሰኝ በመጠበቅ ላይ ነው። ክፍያዎን ከፍለው ደረሰኝዎን ይጫኑ።';
      case 'Pending Verification':
        return 'የክፍያ ደረሰኝዎ ደርሶናል፤ በሂሳብ ክፍል በመረጋገጥ ላይ ነው። እንደተረጋገጠ የተማሪ መለያዎ ዝግጁ ይሆናል።';
      case 'Approved':
        return 'እንኳን ደስ አዎት! ምዝገባዎ ጸድቋል። የተማሪ መለያ ቁጥርዎን እና የይለፍ ቃልዎን ተጠቅመው ወደ ኦንላይን መማሪያ ፖርታል መግባት ይችላሉ።';
      case 'Rejected':
        return 'ምዝገባዎ ውድቅ ተደርጓል። እባክዎ ለተጨማሪ መረጃ የሰንበት ትምህርት ቤቱን አስተዳደር ያግኙ።';
      default:
        return 'የምዝገባ ሁኔታዎ እየተዘመነ ነው።';
    }
  }
};

const CheckStatusContent = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const baseUrl = API_BASE_URL || '';
      const res = await fetch(`${baseUrl}/api/registrations/check-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setResult(data);
      } else {
        setError(data.message || 'ትክክለኛ ያልሆነ ስልክ ቁጥር ወይም የይለፍ ቃል');
      }
    } catch (err) {
      console.error('Check status error:', err);
      setError('የአውታረ መረብ ችግር ተፈጥሯል፤ እባክዎ እንደገና ይሞክሩ');
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-[#061024] flex flex-col justify-between items-center p-4 sm:p-6 font-sans">
      {/* Top Bar Navigation */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between py-2">
        <BackButton href="/" label="ወደ ዋናው ገጽ" variant="glass" />
        <Link
          href="/login"
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center gap-1 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs"
        >
          <span>የተማሪ መግቢያ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Single-Card Container */}
      <main className="w-full max-w-md my-auto py-4">
        {result ? (
          /* ───────────────────────── RESULT VIEW ───────────────────────── */
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden text-center p-6 sm:p-8 space-y-5"
          >
            {/* Status Icon */}
            <div
              className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-sm border ${
                result.status === 'Approved'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : result.status === 'Rejected'
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
              }`}
            >
              {result.status === 'Approved' ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : result.status === 'Rejected' ? (
                <AlertCircle className="w-8 h-8" />
              ) : (
                <Clock className="w-8 h-8 animate-pulse" />
              )}
            </div>

            {/* Status Title & Badge */}
            <div className="space-y-1.5">
              <span
                className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  result.status === 'Approved'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300'
                    : result.status === 'Rejected'
                    ? 'bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300'
                }`}
              >
                {result.status === 'Approved'
                  ? '✓ ምዝገባዎ ጸድቋል'
                  : result.status === 'Rejected'
                  ? '✕ ምዝገባው ውድቅ ሆኗል'
                  : '⏳ በክለሳ ላይ ይገኛል'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {result.fullName || 'የተማሪ መረጃ'}
              </h2>
            </div>

            {/* Approved: Student ID Display */}
            {result.status === 'Approved' && result.studentId ? (
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-left space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                  ይፋዊ የተማሪ መለያ ቁጥር (Student ID)
                </p>
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-blue-200/80 dark:border-slate-700">
                  <span className="font-mono text-base font-black text-slate-900 dark:text-white tracking-wider">
                    {result.studentId}
                  </span>
                  <button
                    type="button"
                    onClick={copyStudentId}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-600">ተገልብጧል</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>ገልብጥ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : null}

            {/* Explainer Note */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 text-left">
              {getStatusMessage(result.status, result.studentType)}
            </p>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              {result.status === 'Approved' && (
                <Link
                  href="/login"
                  className="w-full bg-[#1e3a8a] hover:bg-[#163177] active:scale-98 text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>ወደ መማሪያ ፖርታል ይግቡ</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              {result.studentType === 'distance' && result.status === 'Pending Payment' && (
                <Link
                  href="/continue-registration"
                  className="w-full bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>ደረሰኝ ያያይዙና ምዝገባዎን ያጠናቁ →</span>
                </Link>
              )}

              <button
                type="button"
                onClick={resetForm}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ← ሌላ ስልክ ቁጥር ለመፈተሽ
              </button>
            </div>
          </motion.div>
        ) : (
          /* ───────────────────────── SIMPLE CLEAN FORM VIEW ───────────────────────── */
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6"
          >
            {/* Church Branding Header */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-white p-1 border-2 border-amber-400 shadow-sm flex items-center justify-center overflow-hidden">
                <Image
                  src={ChurchLogo}
                  alt="አርማ"
                  width={60}
                  height={60}
                  priority
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  ተክለ ሳዊሮስ ሰንበት ት/ቤት
                </span>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                  የምዝገባ ሁኔታ ማረጋገጫ
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  የተመዘገቡበትን ስልክ ቁጥር እና የይለፍ ቃል ያስገቡ
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  የተመዘገቡበት ስልክ ቁጥር
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    placeholder="09... ወይም 07..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    የይለፍ ቃል
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    የይለፍ ቃል ረሱ?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="የይለፍ ቃል አሳይ/ደብቅ"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !phone || !password}
                className="w-full bg-[#1e3a8a] hover:bg-[#163177] active:scale-98 text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer pt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>ሁኔታን ፈትሽ</span>
                    <Search className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Links */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs space-y-2">
              <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                <span>አዲስ ተማሪ ነዎት?</span>
                <Link href="/" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                  አሁን ይመዝገቡ →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="py-3 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
        ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት
      </footer>
    </div>
  );
};

export default CheckStatusContent;
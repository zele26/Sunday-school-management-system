import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../api/apiClient';
import { BackButton } from '../components/ui';

// Helper: translate raw status + studentType into a clear Amharic message
const getStatusMessage = (status, studentType) => {
  if (studentType === 'regular') {
    switch (status) {
      case 'Pending Payment':
      case 'Pending Verification':
        return 'ማረጋገጫ በመጠበቅ ላይ ነው። ምዝገባዎ ሲጸድቅ በዚህ መለያ ቁጥር እና በፓስዎርድዎ ይግቡ።';
      case 'Approved':
        return 'ምዝገባዎ ጸድቋል! አሁን በዚህ መለያ ቁጥር እና በፓስዎርድዎ መግባት ይችላሉ።';
      case 'Rejected':
        return 'ምዝገባዎ ውድቅ ተደርጓል። እባክዎ ትምህርት ቤቱን ያግኙ።';
      default:
        return 'ሁኔታዎ እየተዘመነ ነው።';
    }
  } else {
    // distance student
    switch (status) {
      case 'Pending Payment':
        return 'ክፍያ በመጠበቅ ላይ ነው። ክፍያ ከፍለው "ምዝገባዎን ይቀጥሉ" በሚለው በኩል ደረሰኝ ያስገቡ።';
      case 'Pending Verification':
        return 'ደረሰኝዎ ተቀባይነት አግኝቷል። ማረጋገጫ በመጠበቅ ላይ ነው።';
      case 'Approved':
        return 'ምዝገባዎ ጸድቋል! አሁን በዚህ መለያ ቁጥር እና በፓስዎርድዎ መግባት ይችላሉ።';
      case 'Rejected':
        return 'ምዝገባዎ ውድቅ ተደርጓል። እባክዎ ትምህርት ቤቱን ያግኙ።';
      default:
        return 'ሁኔታዎ እየተዘመነ ነው።';
    }
  }
};

const CheckStatusContent = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheck = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError(data.message || 'ስህተት (Error occurred)');
      }
    } catch (err) {
      setError('የአውታረ መረብ ስህተት እባክዎ እንደገና ይሞክሩ (Network Error)');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setPhone('');
    setPassword('');
    setError('');
  };

  const inputClass =
    "w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-700 text-sm placeholder:text-slate-400 shadow-sm";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5 ml-1";

  // ───────────────────────── RESULT VIEW ─────────────────────────
  if (result) {
    const isApproved = result.status === 'Approved';
    const isRejected = result.status === 'Rejected';

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/90 via-[#fdfdfc] to-amber-50/70 dark:from-[#050c1a] dark:via-[#09152b] dark:to-[#030710] flex flex-col justify-between items-center p-4 sm:p-6 font-sans">
        <header className="w-full max-w-xl mx-auto flex items-center justify-between py-2">
          <BackButton href="/" label="ወደ ዋናው ገጽ" subLabel="Back to Home" variant="glass" />
        </header>

        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 text-center animate-in zoom-in-95 duration-500 my-auto">
          {/* Status Icon */}
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-inner ${
            isApproved ? 'bg-emerald-100 text-emerald-600' :
            isRejected ? 'bg-rose-100 text-rose-600' :
            'bg-amber-100 text-amber-600'
          }`}>
            {isApproved ? (
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            ) : isRejected ? (
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
          </div>

          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">የምዝገባ ሁኔታ</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">ከታች የተመዘገቡትን መረጃዎች ይመልከቱ</p>

          {/* User Details Card */}
          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 mb-6 text-left space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">ስም</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{result.fullName}</p>
            </div>
            <div className="h-px w-full bg-slate-200 dark:bg-slate-700"></div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">የምዝገባ ቁጥር</p>
              <p className="text-xl font-black text-[#1657b8] dark:text-amber-400 tracking-widest">{result.registrationNumber}</p>
            </div>
          </div>

          {/* School ID – only if approved */}
          {isApproved && result.studentId && (
            <div className="mb-8 p-5 bg-gradient-to-br from-blue-50 to-amber-50 dark:from-slate-800 dark:to-blue-950 border border-blue-100 dark:border-slate-700 rounded-2xl">
              <p className="text-sm font-bold text-blue-900 dark:text-amber-300 mb-2">🏫 የትምህርት ቤት መለያ (School ID)</p>
              <div className="bg-white dark:bg-slate-900 py-3 rounded-xl border border-blue-100 dark:border-slate-800 shadow-sm mb-4">
                <p className="text-3xl font-black font-mono text-[#1657b8] dark:text-amber-400 tracking-wider">{result.studentId}</p>
              </div>
              <p className="text-xs text-blue-800/80 dark:text-slate-300 font-medium">
                📌 ይህን መለያ ቁጥር እና ፓስዎርድዎን በመጠቀም ወደ ሲስተሙ ይግቡ።
              </p>
            </div>
          )}

          {/* Status Message */}
          <div className={`p-4 rounded-xl border mb-8 text-left ${
            isApproved ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300' :
            isRejected ? 'bg-rose-50/60 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300' :
            'bg-amber-50/60 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{isApproved ? '🎉' : isRejected ? '⚠️' : '⏳'}</span>
              <p className="text-sm font-medium leading-relaxed">
                {getStatusMessage(result.status, result.studentType)}
              </p>
            </div>
          </div>

          {/* Actions */}
          {isApproved && (
            <Link
              href="/login"
              className="block w-full bg-[#1657b8] hover:bg-[#124796] active:opacity-90 text-white py-3.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all mb-4 text-center"
            >
              ወደ ሲስተሙ ይግቡ (Login)
            </Link>
          )}

          {result.studentType === 'distance' && result.status === 'Pending Payment' && (
            <Link
              href="/continue-registration"
              className="block w-full bg-[#1657b8] hover:bg-[#124796] active:opacity-90 text-white py-3.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all mb-4 text-center"
            >
              ምዝገባዎን ይቀጥሉ (Continue Registration)
            </Link>
          )}

          <button
            onClick={resetForm}
            className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            ← ሌላ ለማረጋገጥ ይመለሱ (Check Another)
          </button>
        </div>

        <footer className="py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት
        </footer>
      </div>
    );
  }

  // ───────────────────────── FORM VIEW ─────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/90 via-[#fdfdfc] to-amber-50/70 dark:from-[#050c1a] dark:via-[#09152b] dark:to-[#030710] flex flex-col justify-between items-center p-4 sm:p-6 font-sans">
      <header className="w-full max-w-xl mx-auto flex items-center justify-between py-2">
        <BackButton href="/" label="ወደ ዋናው ገጽ" subLabel="Back to Home" variant="glass" />
      </header>

      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500 my-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-[#1657b8] dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-xs">
            🔍
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            የምዝገባ ሁኔታ ማረጋገጫ
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">የምዝገባዎን ደረጃ ለመከታተል መረጃዎን ያስገቡ</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border-l-4 border-rose-500 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-r-xl flex items-center gap-3 animate-in slide-in-from-top-2">
              <span className="text-base shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCheck} className="space-y-5">
            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">ስልክ ቁጥር</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <input
                  type="tel"
                  placeholder="09..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1657b8] transition-all text-slate-800 dark:text-white text-sm placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">ፓስዎርድ</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1657b8] transition-all text-slate-800 dark:text-white text-sm placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !phone || !password}
                className="w-full bg-[#1657b8] hover:bg-[#124796] active:opacity-90 text-white py-3.5 rounded-2xl font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    በማረጋገጥ ላይ...
                  </>
                ) : (
                  'አረጋግጥ (Check Status)'
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          ትክክለኛውን ስልክ ቁጥር እና ፓስዎርድ ማስገባትዎን ያረጋግጡ።
        </p>
      </div>

      <footer className="py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
        ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት
      </footer>
    </div>
  );
};

export default CheckStatusContent;
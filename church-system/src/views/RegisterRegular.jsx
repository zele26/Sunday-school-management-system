import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { API_BASE_URL } from '../api/apiClient';
import { regularRegistrationSchema } from '../schemas';
import { EthiopianDatePicker, BackButton } from '../components/ui';
import { calculateAgeFromDOB } from '../utils/ethiopianDate';
import { useRegistrationStatus } from '../hooks/queries';

const RegisterRegularContent = () => {
  const [step, setStep] = useState('info'); // 'info', 'form'
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(null);

  const { data: regStatus, isLoading: isStatusLoading } = useRegistrationStatus();
  const isMasterOpen = regStatus?.isRegistrationOpen !== false;
  const isRegularOpen = isMasterOpen && regStatus?.isRegularOpen !== false;
  const isDistanceOpen = isMasterOpen && regStatus?.isDistanceOpen !== false;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(regularRegistrationSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      educationLevel: '',
      profession: '',
      gender: 'Male',
      age: '',
      dateOfBirth: '',
      phone: '',
      grade: 'Grade 7',
      shift: 'weekend',
      subcity: '',
      woreda: '',
      kebele: '',
      address: '',
      email: '',
      password: '',
      confirmPassword: '',
      studentType: 'regular',
      emergencyFirstName: '',
      emergencyMiddleName: '',
      emergencyLastName: '',
      relationship: 'Father',
      emergencyPhone: '',
      emergencyEmail: '',
      emergencyAddress: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');

    const firstName = data.firstName.trim();
    const middleName = data.middleName.trim();
    const lastName = data.lastName.trim();

    try {
      const payload = {
        ...data,
        firstName,
        middleName,
        lastName,
        fullName: [firstName, middleName, lastName].filter(Boolean).join(' '),
      };

      const baseUrl = API_BASE_URL || '';
      const res = await fetch(`${baseUrl}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok) {
        setSuccess(resData.registration);
      } else {
        setServerError(resData.message || 'ምዝገባ አልተሳካም፤ እባክዎ መረጃዎን በትክክል ያስገቡ');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setServerError('የአውታረ መረብ ችግር ተፈጥሯል፤ እባክዎ እንደገና ይሞክሩ');
    }
  };

  const inputClass = "w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1657b8]/20 focus:border-[#1657b8] transition-all text-slate-700 text-sm placeholder:text-slate-400";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5 ml-1";

  // 🔒 REGISTRATION CLOSED SCREEN
  if (!isStatusLoading && !isRegularOpen) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4 flex items-center justify-center font-sans">
        <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 text-center shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-3xl border border-amber-200 dark:border-amber-800">
            ⏳
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              ምዝገባ ለጊዜው ተዘግቷል
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">የመደበኛ ተማሪዎች ምዝገባ</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {regStatus?.regularClosedMessage || regStatus?.generalClosedMessage || 'የመደበኛ ተማሪዎች ምዝገባ ለጊዜው ተዘግቷል። ቀጣይ የምዝገባ ጊዜ በቅርቡ ይገለጻል።'}
            </p>
          </div>

          <div className="pt-2 space-y-3">
            {isDistanceOpen && (
              <Link
                href="/register-distance"
                className="w-full bg-[#1657b8] hover:bg-[#124796] active:scale-98 text-white font-bold py-3.5 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>የርቀት ትምህርት ይመዝገቡ</span>
                <span>➔</span>
              </Link>
            )}
            <Link
              href="/check-status"
              className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-98 text-slate-800 dark:text-slate-100 font-bold py-3.5 px-6 rounded-2xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>የምዝገባ ሁኔታ ያረጋግጡ</span>
              <span>🔍</span>
            </Link>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:underline"
              >
                ← ወደ ዋናው ገጽ ይመለሱ
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- INFO STEP ----------
  if (step === 'info') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/90 via-[#fdfdfc] to-amber-50/70 dark:from-[#050c1a] dark:via-[#09152b] dark:to-[#030710] flex flex-col justify-between items-center p-4 sm:p-6 font-sans">
        <header className="w-full max-w-2xl mx-auto flex items-center justify-between py-2">
          <BackButton href="/" label="ወደ ዋናው ገጽ" variant="glass" />
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl w-full bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 my-auto"
        >
          <div className="text-center mb-8">
            <span className="inline-block bg-blue-100 text-[#1657b8] font-bold px-4 py-1.5 rounded-full text-xs tracking-wider mb-4">
              ተክለሳዊሮስ ሰንበት ትምህርት ቤት
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              የመደበኛ ተማሪ ምዝገባ መረጃ
            </h1>
            <p className="text-slate-500 dark:text-slate-400">እባክዎ ከመመዝገብዎ በፊት ያንብቡ</p>
          </div>

          <div className="space-y-6 text-left">
            <div className="bg-blue-50/50 dark:bg-blue-950/40 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/40">
              <h2 className="font-bold text-[#1657b8] dark:text-blue-300 mb-2 flex items-center gap-2">
                <span className="text-xl">📘</span> ለምን ይመዘገባሉ?
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                የመደበኛ ትምህርት በክፍል ደረጃ የሚሰጥ ሲሆን ተማሪዎች በሳምንቱ መጨረሻ (የቀን) ወይም በሳምንት ቀናት (የማታ) በአካል ተገኝተው ይማራሉ። ለመግባት መመዝገብ ግዴታ ነው።
              </p>
            </div>

            <div className="bg-amber-50/50 dark:bg-amber-950/40 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/40">
              <h2 className="font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                <span className="text-xl">🧭</span> እንዴት ይመዘገባሉ?
              </h2>
              <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                <li>ከታች ያለውን ቅጽ ይሙሉ።</li>
                <li>ዕድሜ፣ የመማሪያ ፈረቃ (የቀን ወይም የማታ) እና የመኖሪያ አድራሻ ይምረጡ።</li>
                <li>የ10 አሃዝ ስልክ ቁጥር እና የይለፍ ቃል ያስገቡ።</li>
                <li>የአደጋ ጊዜ ተጠሪ ስልክ ቁጥርም ግዴታ ነው።</li>
                <li>ከተመዘገቡ በኋላ ማረጋገጫ ይጠብቁ።</li>
              </ul>
            </div>

            <div className="bg-blue-50/50 dark:bg-blue-950/40 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/40">
              <h2 className="font-bold text-[#1657b8] dark:text-blue-300 mb-2 flex items-center gap-2">
                <span className="text-xl">🎯</span> ምን ያገኛሉ?
              </h2>
              <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                <li>ምዝገባዎን በቀጥታ በሲስተሙ ያከናውናሉ</li>
                <li>የሰንበት ትምህርት ቤቱን መለያ ቁጥር ያገኛሉ</li>
                <li>የግል መረጃዎን ያስተዳድራሉ</li>
                <li>ስለሚወስዷቸው ትምህርቶች መረጃ ያገኛሉ ያስተዳድራሉ</li>
                <li>ፈተናና የቤት ሥራ በሲስተሙ ይወስዳሉ</li>
                <li>የመገኘት ሁኔታዎን ይከታተላሉ</li>
                <li>የክፍል ውጤትዎን ይከታተላሉ</li>
                <li>የትምህርት ውጤት መግለጫ ይወስዳሉ</li>
                <li>የትምህርት ቁሳቁሶችን (መጻሕፍት፣ መንፈሳዊ ትምህርቶችና ዜናዎች) ያገኛሉ</li>
                <li>ከክፍል ወደ ክፍል ሲሸጋገሩ ይፋዊ የምስክር ወረቀት ያገኛሉ</li>
              </ul>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStep('form')}
            className="mt-8 w-full bg-[#1657b8] hover:bg-[#124796] active:opacity-90 text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            ወደ ምዝገባ ቅጽ ይቀጥሉ
          </motion.button>
        </motion.div>

        <footer className="py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት
        </footer>
      </div>
    );
  }

  // ---------- SUCCESS STEP ----------
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/90 via-[#fdfdfc] to-amber-50/70 dark:from-[#050c1a] dark:via-[#09152b] dark:to-[#030710] flex flex-col justify-between items-center p-4 sm:p-6 font-sans">
        <header className="w-full max-w-lg mx-auto flex items-center justify-between py-2">
          <BackButton href="/" label="ወደ ዋናው ገጽ" variant="glass" />
        </header>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="max-w-lg w-full bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 text-center my-auto space-y-6"
        >
          {/* Success Checkmark */}
          <div className="w-18 h-18 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 shadow-xs">
            <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ምዝገባዎ በተሳካ ሁኔታ ተልኳል!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
              አስተዳደሩ መረጃዎን አረጋግጦ ሲያጸድቀው በስልክ ቁጥርዎ እና በይለፍ ቃልዎ ወደ ሲስተሙ መግባት ይችላሉ።
            </p>
          </div>

          {/* Registered Credentials Reminder */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-left space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-500 dark:text-slate-400 font-medium">የተመዘገበ ስልክ ቁጥር:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{success?.phone || success?.studentPhone || 'በቅጹ ያስገቡት ስልክ'}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-500 dark:text-slate-400 font-medium">የመግቢያ ዘዴ:</span>
              <span className="font-semibold text-[#1e3a8a] dark:text-blue-400">ስልክ ቁጥር + የይለፍ ቃል</span>
            </div>
          </div>

          {/* 3-Step Clear Roadmap */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 text-left space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">ምዝገባ ተልኳል</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">የአባልነት መረጃዎ ለሰንበት ትምህርት ቤቱ አስተዳደር ደርሷል።</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">የአስተዳደር ማረጋገጫ</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">መረጃዎ ሲጸድቅ ይፋዊ የተማሪ መለያ (Student ID) ተዘጋጅቶ ይሰጥዎታል።</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">መግባትና መማር</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">በማንኛውም ሰዓት በስልክ ቁጥርዎ እና በይለፍ ቃልዎ ሁኔታውን መከታተል ወይም መግባት ይችላሉ።</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <Link
              href="/check-status"
              className="block w-full bg-[#1e3a8a] hover:bg-[#163177] active:scale-98 text-white py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all text-center min-h-[46px] flex items-center justify-center"
            >
              የምዝገባ ሁኔታዎን ያረጋግጡ →
            </Link>
            <Link
              href="/login"
              className="block w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all text-center border border-slate-200 dark:border-slate-700 min-h-[42px] flex items-center justify-center"
            >
              ወደ መግቢያ ገጽ ይሂዱ
            </Link>
          </div>
        </motion.div>

        <footer className="py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት
        </footer>
      </div>
    );
  }

  // ---------- FORM STEP ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/90 via-[#fdfdfc] to-amber-50/70 dark:from-[#050c1a] dark:via-[#09152b] dark:to-[#030710] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto mb-4">
        <BackButton href="/" label="ወደ ዋናው ገጽ" variant="glass" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-10">
          <span className="inline-block bg-blue-100 text-[#1657b8] font-bold px-4 py-1.5 rounded-full text-xs tracking-wider mb-4">
            ተክለሳዊሮስ ሰንበት ትምህርት ቤት
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            የመደበኛ ተማሪ ምዝገባ
          </h1>
          <p className="text-slate-500 dark:text-slate-400">እባክዎ ከታች ያለውን ቅጽ በትክክል ይሙሉ</p>
        </div>


        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl shadow-sm flex items-center gap-3"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{serverError}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Info */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1657b8] flex items-center justify-center text-lg font-bold">👤</div>
              <h2 className="text-lg font-bold text-slate-800">የግል መረጃ</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>የመጀመሪያ ስም <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="የመጀመሪያ ስም"
                  {...register('firstName')}
                  className={`${inputClass} ${errors.firstName ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.firstName && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>የአባት ስም <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="የአባት ስም"
                  {...register('middleName')}
                  className={`${inputClass} ${errors.middleName ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.middleName && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.middleName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>የአያት ስም <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="የአያት ስም"
                  {...register('lastName')}
                  className={`${inputClass} ${errors.lastName ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.lastName && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.lastName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>ዓለማዊ የትምህርት ደረጃ <span className="text-rose-500">*</span></label>
                <select
                  {...register('educationLevel')}
                  className={`${inputClass} ${errors.educationLevel ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                >
                  <option value="">ይምረጡ</option>
                  <option value="Grade 7">7ኛ ክፍል</option>
                  <option value="Grade 8">8ኛ ክፍል</option>
                  <option value="Grade 9">9ኛ ክፍል</option>
                  <option value="Grade 10">10ኛ ክፍል</option>
                  <option value="Grade 11">11ኛ ክፍል</option>
                  <option value="Grade 12">12ኛ ክፍል</option>
                  <option value="Diploma">ዲፕሎማ</option>
                  <option value="Degree">ዲግሪ</option>
                  <option value="Masters">ማስተርስ</option>
                </select>
                {errors.educationLevel && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.educationLevel.message}</p>}
              </div>
              <div>
                <label className={labelClass}>ሙያ <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="ሙያ"
                  {...register('profession')}
                  className={`${inputClass} ${errors.profession ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.profession && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.profession.message}</p>}
              </div>
              <div>
                <label className={labelClass}>ጾታ <span className="text-rose-500">*</span></label>
                <select {...register('gender')} className={inputClass}>
                  <option value="Male">ወንድ</option>
                  <option value="Female">ሴት</option>
                </select>
              </div>

              {/* Ethiopian Calendar Date of Birth */}
              <div className="md:col-span-2">
                <Controller
                  control={control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <EthiopianDatePicker
                      value={field.value}
                      onChange={(isoDate) => {
                        field.onChange(isoDate);
                        if (isoDate) {
                          const calculatedAge = calculateAgeFromDOB(isoDate);
                          if (calculatedAge) {
                            setValue('age', String(calculatedAge), { shouldValidate: true });
                          }
                        }
                      }}
                      label="የትውልድ ቀን በኢትዮጵያ የቀን አቆጣጠር"
                      error={errors.dateOfBirth?.message}
                    />
                  )}
                />
              </div>

              {/* ዕድሜ */}
              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="text-sm font-semibold text-slate-700">
                    ዕድሜ <span className="text-rose-500">*</span> <span className="text-xs font-normal text-slate-500">(ከ 14 ዓመት በላይ)</span>
                  </label>
                  {watch('age') && watch('dateOfBirth') && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-in fade-in">
                      በቀኑ የተሰላ፡ {watch('age')} ዓመት
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  placeholder="ምሳሌ፡ 18 (የትውልድ ቀን ሲመርጡ በራሱ ይሰላል)"
                  min="15"
                  max="120"
                  {...register('age')}
                  className={`${inputClass} ${errors.age ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.age && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.age.message}</p>}
              </div>

              <div>
                <label className={labelClass}>ስልክ ቁጥር (10 አሃዝ) <span className="text-rose-500">*</span></label>
                <input
                  type="tel"
                  placeholder="09XXXXXXXX"
                  {...register('phone')}
                  className={`${inputClass} ${errors.phone ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.phone && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className={labelClass}>ኢሜይል <span className="text-slate-400">(አማራጭ)</span></label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  {...register('email')}
                  className={`${inputClass} ${errors.email ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.email && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className={labelClass}>የሚገቡበት ክፍል <span className="text-rose-500">*</span></label>
                <select
                  {...register('grade')}
                  className={`${inputClass} ${errors.grade ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                >
                  {[
                    { label: '7ኛ ክፍል', value: 'Grade 7' },
                    { label: '8ኛ ክፍል', value: 'Grade 8' },
                    { label: '9ኛ ክፍል', value: 'Grade 9' },
                    { label: '10ኛ ክፍል', value: 'Grade 10' },
                    { label: '11ኛ ክፍል', value: 'Grade 11' },
                    { label: '12ኛ ክፍል', value: 'Grade 12' },
                  ].map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
                {errors.grade && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.grade.message}</p>}
              </div>

              {/* Study Shift */}
              <div>
                <label className={labelClass}>የመማሪያ ፈረቃ <span className="text-rose-500">*</span></label>
                <select
                  {...register('shift')}
                  className={`${inputClass} font-semibold`}
                >
                  <option value="weekend">የቀን (ቅዳሜ እና እሑድ)</option>
                  <option value="night">የማታ (በሳምንቱ ቀናት)</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Residential Address Information */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg font-bold">📍</div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">የመኖሪያ አድራሻ መረጃ</h2>
                <p className="text-xs text-slate-400">ክፍለ ከተማ፣ ወረዳ እና ቀበሌ</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>ክፍለ ከተማ</label>
                <select {...register('subcity')} className={inputClass}>
                  <option value="">ክፍለ ከተማ ይምረጡ</option>
                  <option value="ቦሌ">ቦሌ</option>
                  <option value="አራዳ">አራዳ</option>
                  <option value="ቂርቆስ">ቂርቆስ</option>
                  <option value="ልደታ">ልደታ</option>
                  <option value="የካ">የካ</option>
                  <option value="ኮልፌ ቀራኒዮ">ኮልፌ ቀራኒዮ</option>
                  <option value="አቃቂ ቃሊቲ">አቃቂ ቃሊቲ</option>
                  <option value="ንፋስ ስልክ ላፍቶ">ንፋስ ስልክ ላፍቶ</option>
                  <option value="ጉለሌ">ጉለሌ</option>
                  <option value="አዲስ ከተማ">አዲስ ከተማ</option>
                  <option value="ለሚ ኩራ">ለሚ ኩራ</option>
                  <option value="ከአዲስ አበባ ውጪ">ከአዲስ አበባ ውጪ</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>ወረዳ</label>
                <input
                  type="text"
                  placeholder="ወረዳ (ምሳሌ፡ 03)"
                  {...register('woreda')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>ቀበሌ / የቤት ቁጥር</label>
                <input
                  type="text"
                  placeholder="ቀበሌ / የቤት ቁጥር"
                  {...register('kebele')}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-3">
                <label className={labelClass}>ተጨማሪ አድራሻ</label>
                <input
                  type="text"
                  placeholder="የሰፈር ስም ወይም ልዩ ምልክት"
                  {...register('address')}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Emergency Info */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">👨‍👩‍👧</div>
              <h2 className="text-lg font-bold text-slate-800">የአደጋ ጊዜ ተጠሪ መረጃ</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>ስም <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="ስም"
                  {...register('emergencyFirstName')}
                  className={`${inputClass} ${errors.emergencyFirstName ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.emergencyFirstName && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.emergencyFirstName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>የአባት ስም</label>
                <input
                  type="text"
                  placeholder="የአባት ስም"
                  {...register('emergencyMiddleName')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>የአያት ስም</label>
                <input
                  type="text"
                  placeholder="የአያት ስም"
                  {...register('emergencyLastName')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>ዝምድና <span className="text-rose-500">*</span></label>
                <select {...register('relationship')} className={inputClass}>
                  <option value="Father">አባት</option>
                  <option value="Mother">እናት</option>
                  <option value="Brother">ወንድም</option>
                  <option value="Sister">እህት</option>
                  <option value="Relative">ዘመድ</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>ስልክ ቁጥር <span className="text-rose-500">*</span></label>
                <input
                  type="tel"
                  placeholder="09XXXXXXXX"
                  {...register('emergencyPhone')}
                  className={`${inputClass} ${errors.emergencyPhone ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.emergencyPhone && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.emergencyPhone.message}</p>}
              </div>
              <div>
                <label className={labelClass}>ኢሜይል</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  {...register('emergencyEmail')}
                  className={`${inputClass} ${errors.emergencyEmail ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.emergencyEmail && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.emergencyEmail.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>አድራሻ</label>
                <input
                  type="text"
                  placeholder="አድራሻ"
                  {...register('emergencyAddress')}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Login Info */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">🔐</div>
              <h2 className="text-lg font-bold text-slate-800">የመግቢያ መረጃ</h2>
            </div>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>የይለፍ ቃል <span className="text-rose-500">*</span></label>
                  <input
                    type="password"
                    placeholder="ቢያንስ 6 ፊደላት/ቁጥሮች"
                    {...register('password')}
                    className={`${inputClass} ${errors.password ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                  />
                  {errors.password && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>የይለፍ ቃል ማረጋገጫ <span className="text-rose-500">*</span></label>
                  <input
                    type="password"
                    placeholder="የይለፍ ቃሉን በድጋሚ ያስገቡ"
                    {...register('confirmPassword')}
                    className={`${inputClass} ${errors.confirmPassword ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                  />
                  {errors.confirmPassword && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100/60 flex items-start gap-3">
                <span className="text-xl">📌</span>
                <p className="text-sm text-slate-600 font-medium leading-relaxed mt-0.5">
                  በመለያዎ ወደ ሲስተሙ ለመግባት ከላይ ያስገቡትን <span className="text-blue-700 font-bold">ስልክ ቁጥር</span> እና ይህንን <span className="text-blue-700 font-bold">የይለፍ ቃል</span> ይጠቀሙ።
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full text-white py-4 rounded-2xl font-bold text-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer active:opacity-90 ${isSubmitting ? 'bg-blue-400 cursor-not-allowed shadow-none' : 'bg-[#1657b8] hover:bg-[#124796]'
                }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  በመጠበቅ ላይ...
                </>
              ) : (
                'ይመዝገቡ'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterRegularContent;
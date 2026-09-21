import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { API_BASE_URL } from '../api/apiClient';
import { regularRegistrationSchema } from '../schemas';
import { EthiopianDatePicker, BackButton, PhotoUploadField } from '../components/ui';
import { calculateAgeFromDOB } from '../utils/ethiopianDate';
import { useRegistrationStatus } from '../hooks/queries';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { useLanguage } from '../hooks/useLanguage';
import { EDUCATION_LEVEL_OPTIONS, PROFESSION_OPTIONS, RELATIONSHIP_OPTIONS } from '../constants/registrationOptions';

const RegisterRegularContent = () => {
  const [step, setStep] = useState('info'); // 'info', 'form'
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(null);
  const { t, isAmharic } = useLanguage();

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
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      christianName: '',
      photoUrl: '',
      educationLevel: '',
      profession: '',
      gender: 'Male',
      age: '',
      dateOfBirth: '',
      phone: '',
      grade: 'Grade 7',
      shift: 'weekend',
      hasConfessionFather: false,
      confessionFatherName: '',
      confessionFatherPhone: '',
      subcity: '',
      woreda: '',
      kebele: '',
      address: '',
      email: '',
      password: '',
      confirmPassword: '',
      studentType: 'regular',
      emergencyContactPhoto: '',
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
      const tgUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;
      const payload = {
        ...data,
        firstName,
        middleName,
        lastName,
        fullName: [firstName, middleName, lastName].filter(Boolean).join(' '),
        telegramChatId: tgUser?.id ? String(tgUser.id) : undefined,
        telegramUsername: tgUser?.username || undefined,
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
        setServerError(resData.message || t('regFailedCheckInfo', 'ምዝገባ አልተሳካም፤ እባክዎ መረጃዎን በትክክል ያስገቡ'));
      }
    } catch (err) {
      console.error('Registration error:', err);
      setServerError(t('networkErrorRetry', 'የአውታረ መረብ ችግር ተፈጥሯል፤ እባክዎ እንደገና ይሞክሩ'));
    }
  };

  const inputClass = "w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1657b8]/20 focus:border-[#1657b8] transition-all text-sm placeholder:text-slate-400";
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1";

  // ⏳ Loading State if status is not yet available in cache
  if (isStatusLoading && !regStatus) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 font-sans">
        <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 animate-pulse">
          {t('checkingRegistrationStatus', 'የምዝገባ ሁኔታን በማረጋገጥ ላይ...')}
        </p>
      </div>
    );
  }

  // 🔒 REGISTRATION CLOSED SCREEN
  if (!isRegularOpen) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4 flex flex-col justify-between items-center font-sans">
        <header className="w-full max-w-lg mx-auto flex items-center justify-between py-2">
          <BackButton href="/" label={t('backToHome', 'ወደ ዋናው ገጽ')} variant="glass" />
          <div className="flex items-center gap-2">
            <LanguageToggle className="bg-white/90 dark:bg-slate-900 text-xs shadow-xs" />
            <ThemeToggle className="bg-white/90 dark:bg-slate-900 text-xs shadow-xs" />
          </div>
        </header>

        <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 text-center shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-3xl border border-amber-200 dark:border-amber-800">
            ⏳
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              {t('registrationClosedBadge', 'ምዝገባ ለጊዜው ተዘግቷል')}
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {t('regularRegistrationTitle', 'የመደበኛ ተማሪዎች ምዝገባ')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {regStatus?.regularClosedMessage || regStatus?.generalClosedMessage || t('regularClosedNotice', 'የመደበኛ ተማሪዎች ምዝገባ ለጊዜው ተዘግቷል። ቀጣይ የምዝገባ ጊዜ በቅርቡ ይገለጻል።')}
            </p>
          </div>

          <div className="pt-2 space-y-3">
            {isDistanceOpen && (
              <Link
                href="/register-distance"
                className="w-full bg-[#1657b8] hover:bg-[#124796] active:scale-98 text-white font-bold py-3.5 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('distanceStudentRegistration', 'የርቀት ተማሪ ምዝገባ')}</span>
                <span>➔</span>
              </Link>
            )}
            <Link
              href="/check-status"
              className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-98 text-slate-800 dark:text-slate-100 font-bold py-3.5 px-6 rounded-2xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t('checkStatus', 'የምዝገባ ሁኔታ ያረጋግጡ')}</span>
              <span>🔍</span>
            </Link>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:underline"
              >
                {t('backToHomeLink', '← ወደ ዋናው ገጽ ይመለሱ')}
              </Link>
            </div>
          </div>
        </div>

        <footer className="py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          {t('sundaySchoolShortTitle', 'ተክለ ሳዊሮስ')} {t('sundaySchoolLabel', 'ሰንበት ትምህርት ቤት')}
        </footer>
      </div>
    );
  }

  // ---------- INFO STEP ----------
  if (step === 'info') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/90 via-[#fdfdfc] to-amber-50/70 dark:from-[#050c1a] dark:via-[#09152b] dark:to-[#030710] flex flex-col justify-between items-center p-4 sm:p-6 font-sans">
        <header className="w-full max-w-2xl mx-auto flex items-center justify-between py-2">
          <BackButton href="/" label={t('backToHome', 'ወደ ዋናው ገጽ')} variant="glass" />
          <div className="flex items-center gap-2">
            <LanguageToggle className="bg-white/90 dark:bg-slate-900 text-xs shadow-xs" />
            <ThemeToggle className="bg-white/90 dark:bg-slate-900 text-xs shadow-xs" />
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl w-full bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 my-auto"
        >
          <div className="text-center mb-8">
            <span className="inline-block bg-blue-100 dark:bg-blue-950/70 text-[#1657b8] dark:text-blue-300 font-bold px-4 py-1.5 rounded-full text-xs tracking-wider mb-4 border border-blue-200/60 dark:border-blue-800/60">
              {t('sundaySchoolShortTitle', 'ተክለ ሳዊሮስ')} {t('sundaySchoolLabel', 'ሰንበት ት/ቤት')}
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              {t('regularRegInfoTitle', 'የመደበኛ ተማሪ ምዝገባ መረጃ')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {t('readBeforeRegistering', 'እባክዎ ከመመዝገብዎ በፊት ያንብቡ')}
            </p>
          </div>

          <div className="space-y-6 text-left">
            <div className="bg-blue-50/50 dark:bg-blue-950/40 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/40">
              <h2 className="font-bold text-[#1657b8] dark:text-blue-300 mb-2 flex items-center gap-2">
                <span className="text-xl">📘</span> {t('whyRegisterTitle', 'ለምን ይመዘገባሉ?')}
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {t('whyRegisterDesc', 'የመደበኛ ትምህርት በክፍል ደረጃ የሚሰጥ ሲሆን ተማሪዎች በሳምንቱ መጨረሻ (የቀን) ወይም በሳምንት ቀናት (የማታ) በአካል ተገኝተው ይማራሉ። ለመግባት መመዝገብ ግዴታ ነው።')}
              </p>
            </div>

            <div className="bg-amber-50/50 dark:bg-amber-950/40 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/40">
              <h2 className="font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                <span className="text-xl">🧭</span> {t('howToRegisterTitle', 'እንዴት ይመዘገባሉ?')}
              </h2>
              <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                <li>{t('regularHowTo1', 'ከታች ያለውን ቅጽ ይሙሉ።')}</li>
                <li>{t('regularHowTo2', 'ዕድሜ፣ የመማሪያ ፈረቃ (የቀን ወይም የማታ) እና የመኖሪያ አድራሻ ይምረጡ።')}</li>
                <li>{t('regularHowTo3', 'የ10 አሃዝ ስልክ ቁጥር እና የይለፍ ቃል ያስገቡ።')}</li>
                <li>{t('regularHowTo4', 'የአደጋ ጊዜ ተጠሪ ስልክ ቁጥርም ግዴታ ነው።')}</li>
                <li>{t('regularHowTo5', 'ከተመዘገቡ በኋላ ማረጋገጫ ይጠብቁ።')}</li>
              </ul>
            </div>

            <div className="bg-blue-50/50 dark:bg-blue-950/40 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/40">
              <h2 className="font-bold text-[#1657b8] dark:text-blue-300 mb-2 flex items-center gap-2">
                <span className="text-xl">🎯</span> {t('whatYouGetTitle', 'ምን ያገኛሉ?')}
              </h2>
              <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                <li>{t('regBenefit1', 'ምዝገባዎን በቀጥታ በሲስተሙ ያከናውናሉ')}</li>
                <li>{t('regBenefit3', 'የግል መረጃዎን ያስተዳድራሉ')}</li>
                <li>{t('regBenefit4', 'ስለሚወስዷቸው ትምህርቶች መረጃ ያገኛሉ')}</li>
                <li>{t('regBenefit5', 'ፈተናና የቤት ሥራ በሲስተሙ ይወስዳሉ')}</li>
                <li>{t('regBenefit6', 'የመገኘት(Attendance) ሁኔታዎን ይከታተላሉ')}</li>
                <li>{t('regBenefit7', 'የክፍል ውጤትዎን ይከታተላሉ')}</li>
                <li>{t('regBenefit8', 'የትምህርት ውጤት መግለጫ ይወስዳሉ')}</li>
                <li>{t('regBenefit9', 'የትምህርት ቁሳቁሶችን (መጻሕፍት፣ መንፈሳዊ ትምህርቶችና ዜናዎች) ያገኛሉ')}</li>
                <li>{t('regBenefit10', 'ከክፍል ወደ ክፍል ሲሸጋገሩ ይፋዊ የምስክር ወረቀት ያገኛሉ')}</li>
              </ul>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStep('form')}
            className="mt-8 w-full bg-[#1657b8] hover:bg-[#124796] active:opacity-90 text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            {t('continueToFormBtn', 'ወደ ምዝገባ ቅጽ ይቀጥሉ')}
          </motion.button>
        </motion.div>

        <footer className="py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          {t('sundaySchoolShortTitle', 'ተክለ ሳዊሮስ')} {t('sundaySchoolLabel', 'ሰንበት ትምህርት ቤት')}
        </footer>
      </div>
    );
  }

  // ---------- SUCCESS STEP ----------
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/90 via-[#fdfdfc] to-amber-50/70 dark:from-[#050c1a] dark:via-[#09152b] dark:to-[#030710] flex flex-col justify-between items-center p-4 sm:p-6 font-sans">
        <header className="w-full max-w-lg mx-auto flex items-center justify-between py-2">
          <BackButton href="/" label={t('backToHome', 'ወደ ዋናው ገጽ')} variant="glass" />
          <div className="flex items-center gap-2">
            <LanguageToggle className="bg-white/90 dark:bg-slate-900 text-xs shadow-xs" />
            <ThemeToggle className="bg-white/90 dark:bg-slate-900 text-xs shadow-xs" />
          </div>
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
              {t('registrationSuccessfulTitle', 'ምዝገባዎ በተሳካ ሁኔታ ተጠናቋል!')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
              {t('regularSuccessDesc', 'ማመልከቻዎ በስኬት ደርሷል፤ በአስተዳዳሪው እየተገመገመ ይገኛል። ምዝገባዎ ሲጸድቅ ሲመዘገቡ ባስገቡት ስልክ ቁጥር እና የይለፍ ቃል ተጠቅመው ሲስተሙን መጠቀም ይችላሉ።')}
            </p>
          </div>

          {/* Registered Credentials Reminder */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-left space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {t('registeredPhoneLabel', 'የተመዘገበ ስልክ ቁጥር:')}
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {success?.phone || success?.studentPhone || (isAmharic ? 'በቅጹ ያስገቡት ስልክ' : 'Submitted Phone')}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {t('loginMethodLabel', 'የመግቢያ ዘዴ:')}
              </span>
              <span className="font-semibold text-[#1e3a8a] dark:text-blue-400">
                {t('phoneAndPasswordMethod', 'ስልክ ቁጥር + የይለፍ ቃል')}
              </span>
            </div>
          </div>

          {/* 3-Step Clear Roadmap */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 text-left space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {t('roadmapStep1Title', 'ምዝገባ ተልኳል')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('roadmapStep1Desc', 'የአባልነት መረጃዎ ለሰንበት ትምህርት ቤቱ አስተዳደር ደርሷል።')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {t('roadmapStep2Title', 'የአስተዳደር ማረጋገጫ')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('roadmapStep2Desc', 'መረጃዎ ሲጸድቅ በይፋ በስልክ ቁጥርዎ እና የይለፍ ቃል ተጠቅመው የተማሪነት በየነመረብ አገልግሎቱን ማግኘት ይችላሉ።')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {t('roadmapStep3Title', 'ወደ ትምህርት መግባት')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('roadmapStep3Desc', 'በስልክ ቁጥርዎ እና የይለፍ ቃል ተጠቅመው ወደ ተማሪዎች ፖርታል ገብተው ትምህርትዎን ይከታተላሉ።')}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <Link
              href="/check-status"
              className="block w-full bg-[#1e3a8a] hover:bg-[#163177] active:scale-98 text-white py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all text-center min-h-[46px] flex items-center justify-center"
            >
              {t('checkStatusBtnText', 'የምዝገባ ሁኔታዎን ያረጋግጡ →')}
            </Link>
            <Link
              href="/login"
              className="block w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all text-center border border-slate-200 dark:border-slate-700 min-h-[42px] flex items-center justify-center"
            >
              {t('proceedToLoginBtnText', 'ወደ መግቢያ ገጽ ይሂዱ')}
            </Link>
          </div>
        </motion.div>

        <footer className="py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          {t('sundaySchoolShortTitle', 'ተክለ ሳዊሮስ')} {t('sundaySchoolLabel', 'ሰንበት ትምህርት ቤት')}
        </footer>
      </div>
    );
  }

  // ---------- FORM STEP ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/90 via-[#fdfdfc] to-amber-50/70 dark:from-[#050c1a] dark:via-[#09152b] dark:to-[#030710] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between">
        <BackButton href="/" label={t('backToHome', 'ወደ ዋናው ገጽ')} variant="glass" />
        <div className="flex items-center gap-2">
          <LanguageToggle className="bg-white/90 dark:bg-slate-900 text-xs shadow-xs" />
          <ThemeToggle className="bg-white/90 dark:bg-slate-900 text-xs shadow-xs" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-10">
          <span className="inline-block bg-blue-100 dark:bg-blue-950/70 text-[#1657b8] dark:text-blue-300 font-bold px-4 py-1.5 rounded-full text-xs tracking-wider mb-4 border border-blue-200/60 dark:border-blue-800/60">
            {t('sundaySchoolShortTitle', 'ተክለ ሳዊሮስ')} {t('sundaySchoolLabel', 'ሰንበት ት/ቤት')}
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            {t('regularRegistrationTitle', 'የመደበኛ ተማሪ ምዝገባ')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {t('fillFormCarefully', 'እባክዎ ከታች ያለውን ቅጽ በትክክል ይሙሉ')}
          </p>
        </div>

        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border-l-4 border-rose-500 text-rose-700 dark:text-rose-300 rounded-r-xl shadow-sm flex items-center gap-3"
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
            className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md space-y-6"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1657b8] dark:text-blue-300 flex items-center justify-center text-lg font-bold">👤</div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {t('personalInfoSection', 'የግል መረጃ')}
              </h2>
            </div>

            {/* Student Photo Upload */}
            <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <Controller
                control={control}
                name="photoUrl"
                render={({ field }) => (
                  <PhotoUploadField
                    value={field.value}
                    onChange={field.onChange}
                    label={t('studentPhotoLabel', 'የተማሪው ፎቶ')}
                    helperText={t('studentPhotoHelp', 'የቅርብ ጊዜ የተማሪውን ፎቶ ይጫኑ (ፓስፖርት ሳይዝ ይመረጣል)')}
                    placeholderIcon="user"
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>
                  {t('firstNameLabel', 'ስም')} <span className="text-xs font-normal text-slate-400">({t('amharicOnlyHint', 'በአማርኛ ብቻ')})</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t('firstNamePlaceholder', 'ምሳሌ፡ ዮሐንስ')}
                  {...register('firstName')}
                  className={`${inputClass} ${errors.firstName ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.firstName && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>
                  {t('middleNameLabel', 'የአባት ስም')} <span className="text-xs font-normal text-slate-400">({t('amharicOnlyHint', 'በአማርኛ ብቻ')})</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t('middleNamePlaceholder', 'ምሳሌ፡ ተስፋዬ')}
                  {...register('middleName')}
                  className={`${inputClass} ${errors.middleName ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.middleName && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.middleName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>
                  {t('lastNameLabel', 'የአያት ስም')} <span className="text-xs font-normal text-slate-400">({t('amharicOnlyHint', 'በአማርኛ ብቻ')})</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t('lastNamePlaceholder', 'ምሳሌ፡ ገብሬ')}
                  {...register('lastName')}
                  className={`${inputClass} ${errors.lastName ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.lastName && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.lastName.message}</p>}
              </div>

              {/* Christian / Baptismal Name (የክርስትና ስም) */}
              <div>
                <label className={labelClass}>
                  {t('christianNameLabel', 'የክርስትና ስም')} <span className="text-xs font-normal text-slate-400">({t('amharicOnlyHint', 'በአማርኛ ብቻ')})</span> <span className="text-amber-600 dark:text-amber-400 text-xs font-normal">({t('emailOptional', 'አማራጭ')})</span>
                </label>
                <input
                  type="text"
                  placeholder={t('christianNamePlaceholder', 'ምሳሌ፡ ወልደ ማርያም / ወለተ ጊዮርጊስ')}
                  {...register('christianName')}
                  className={`${inputClass} ${errors.christianName ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.christianName && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.christianName.message}</p>}
              </div>

              <div>
                <label className={labelClass}>
                  {t('educationLevelLabel', 'ዓለማዊ የትምህርት ደረጃ')} <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register('educationLevel')}
                  className={`${inputClass} ${errors.educationLevel ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                >
                  <option value="">{t('selectEducationLevel', '-- የትምህርት ደረጃ ይምረጡ --')}</option>
                  {EDUCATION_LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isAmharic ? opt.labelAm : opt.labelEn}
                    </option>
                  ))}
                </select>
                {errors.educationLevel && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.educationLevel.message}</p>}
              </div>
              <div>
                <label className={labelClass}>
                  {t('professionLabel', 'የሥራ ዘርፍ / ሙያ')} <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register('profession')}
                  className={`${inputClass} ${errors.profession ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                >
                  <option value="">{t('selectProfession', '-- የሥራ ዘርፍ / ሙያ ይምረጡ --')}</option>
                  {PROFESSION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isAmharic ? opt.labelAm : opt.labelEn}
                    </option>
                  ))}
                </select>
                {errors.profession && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.profession.message}</p>}
              </div>
              <div>
                <label className={labelClass}>
                  {t('genderLabel', 'ጾታ')} <span className="text-rose-500">*</span>
                </label>
                <select {...register('gender')} className={inputClass}>
                  <option value="Male">{t('male', 'ወንድ')}</option>
                  <option value="Female">{t('female', 'ሴት')}</option>
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
                      label={t('dateOfBirthLabel', 'የትውልድ ቀን በኢትዮጵያ የቀን አቆጣጠር')}
                      error={errors.dateOfBirth?.message}
                    />
                  )}
                />
              </div>

              {/* Age */}
              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('ageLabel', 'ዕድሜ')} <span className="text-rose-500">*</span> <span className="text-xs font-normal text-slate-500">({t('ageMinNote', 'ከ 14 ዓመት በላይ')})</span>
                  </label>
                  {watch('age') && watch('dateOfBirth') && (
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
                      {isAmharic ? `በቀኑ የተሰላ፡ ${watch('age')} ዓመት` : `Calculated: ${watch('age')} yrs`}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  placeholder={t('agePlaceholder', 'ምሳሌ፡ 18 (የትውልድ ቀን ሲመርጡ በራሱ ይሰላል)')}
                  min="15"
                  max="120"
                  {...register('age')}
                  className={`${inputClass} ${errors.age ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.age && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.age.message}</p>}
              </div>

              <div>
                <label className={labelClass}>
                  {t('phoneNumberLabel', 'ስልክ ቁጥር (10 አሃዝ)')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="09XXXXXXXX / 07XXXXXXXX"
                  {...register('phone')}
                  className={`${inputClass} ${errors.phone ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.phone && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className={labelClass}>
                  {t('emailLabel', 'ኢሜይል')} <span className="text-slate-400">({t('emailOptional', 'አማራጭ')})</span>
                </label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  {...register('email')}
                  className={`${inputClass} ${errors.email ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.email && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className={labelClass}>
                  {t('gradeLevelLabel', 'የሚገቡበት ክፍል')} <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register('grade')}
                  className={`${inputClass} ${errors.grade ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                >
                  {[
                    { labelAm: '7ኛ ክፍል', labelEn: 'Grade 7', value: 'Grade 7' },
                    { labelAm: '8ኛ ክፍል', labelEn: 'Grade 8', value: 'Grade 8' },
                    { labelAm: '9ኛ ክፍል', labelEn: 'Grade 9', value: 'Grade 9' },
                    { labelAm: '10ኛ ክፍል', labelEn: 'Grade 10', value: 'Grade 10' },
                    { labelAm: '11ኛ ክፍል', labelEn: 'Grade 11', value: 'Grade 11' },
                    { labelAm: '12ኛ ክፍል', labelEn: 'Grade 12', value: 'Grade 12' },
                  ].map((g) => (
                    <option key={g.value} value={g.value}>
                      {isAmharic ? g.labelAm : g.labelEn}
                    </option>
                  ))}
                </select>
                {errors.grade && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.grade.message}</p>}
              </div>

              {/* Study Shift */}
              <div>
                <label className={labelClass}>
                  {t('studyShiftLabel', 'የመማሪያ ፈረቃ')} <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register('shift')}
                  className={`${inputClass} font-semibold`}
                >
                  <option value="weekend">{t('weekendDayShift', 'የቀን (ቅዳሜና እሑድ)')}</option>
                  <option value="night">{t('weekdayNightShift', 'የማታ (የሳምንቱ ቀናት)')}</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* ⛪ Confession Father (የንስሐ አባት) Section */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold">⛪</div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  {t('confessionFatherSection', 'የንስሐ አባት መረጃ')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('hasConfessionFatherQuestion', 'የንስሐ አባት አለዎት?')}
                </p>
              </div>
            </div>

            {/* Yes / No Toggle Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setValue('hasConfessionFather', true, { shouldValidate: true })}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${watch('hasConfessionFather') === true
                  ? 'border-[#1657b8] bg-blue-50/70 dark:bg-blue-950/40 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>✨</span>
                    <span>{t('hasConfessionFatherYes', 'አዎ / አለኝ')}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    የንስሐ አባት ስም እና ስልክ ያስገቡ
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${watch('hasConfessionFather') === true
                  ? 'border-[#1657b8] bg-[#1657b8] text-white'
                  : 'border-slate-300 dark:border-slate-600'
                  }`}>
                  {watch('hasConfessionFather') === true && <span className="text-xs">✓</span>}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setValue('hasConfessionFather', false, { shouldValidate: true });
                  setValue('confessionFatherName', '');
                  setValue('confessionFatherPhone', '');
                }}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${watch('hasConfessionFather') === false
                  ? 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/40 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🕊️</span>
                    <span>{t('hasConfessionFatherNo', 'የለኝም / አልያዝኩም')}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ሰንበት ት/ቤቱ ድጋፍ ያደርግልዎታል
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${watch('hasConfessionFather') === false
                  ? 'border-amber-500 bg-amber-500 text-white'
                  : 'border-slate-300 dark:border-slate-600'
                  }`}>
                  {watch('hasConfessionFather') === false && <span className="text-xs">✓</span>}
                </div>
              </button>
            </div>

            {/* Conditional Input Fields or Guidance Message */}
            <AnimatePresence mode="wait">
              {watch('hasConfessionFather') === true ? (
                <motion.div
                  key="confession-inputs"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2"
                >
                  <div>
                    <label className={labelClass}>
                      {t('confessionFatherNameLabel', 'የንስሐ አባት ስም')} <span className="text-xs font-normal text-slate-400">({t('amharicOnlyHint', 'በአማርኛ ብቻ')})</span> <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={t('confessionFatherNamePlaceholder', 'የንስሐ አባት ስም (ምሳሌ፡ አባ... / መጋቢ...)')}
                      {...register('confessionFatherName')}
                      className={`${inputClass} ${errors.confessionFatherName ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                    />
                    {errors.confessionFatherName && (
                      <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.confessionFatherName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>
                      {t('confessionFatherPhoneLabel', 'የንስሐ አባት ስልክ ቁጥር')}
                    </label>
                    <input
                      type="tel"
                      placeholder={t('confessionFatherPhonePlaceholder', '09XXXXXXXX / 07XXXXXXXX')}
                      {...register('confessionFatherPhone')}
                      className={`${inputClass} ${errors.confessionFatherPhone ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                    />
                    {errors.confessionFatherPhone && (
                      <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.confessionFatherPhone.message}</p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="confession-notice"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2.5"
                >
                  <span className="text-base shrink-0">💡</span>
                  <span>{t('noConfessionFatherGuidance', 'የንስሐ አባት ባይኖርዎትም መመዝገብ ይችላሉ፤ ሰንበት ትምህርት ቤቱ የንስሐ አባት እንዲይዙ አስፈላጊውን መንፈሳዊ ድጋፍና መመሪያ ይሰጥዎታል።')}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Residential Address Information */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold">📍</div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  {t('residentialAddressSection', 'የመኖሪያ አድራሻ መረጃ')}
                </h2>
                <p className="text-xs text-slate-400">
                  {t('residentialAddressSubtitle', 'ክፍለ ከተማ፣ ወረዳ እና ቀበሌ')}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>{t('subcityLabel', 'ክፍለ ከተማ')}</label>
                <select {...register('subcity')} className={`${inputClass} ${errors.subcity ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}>
                  <option value="">{t('selectSubcity', '-- ክፍለ ከተማ ይምረጡ --')}</option>
                  <option value="Bole">{isAmharic ? 'ቦሌ' : 'Bole'}</option>
                  <option value="Arada">{isAmharic ? 'አራዳ' : 'Arada'}</option>
                  <option value="Kirkos">{isAmharic ? 'ቂርቆስ' : 'Kirkos'}</option>
                  <option value="Lideta">{isAmharic ? 'ልደታ' : 'Lideta'}</option>
                  <option value="Yeka">{isAmharic ? 'የካ' : 'Yeka'}</option>
                  <option value="Kolfe Keranio">{isAmharic ? 'ኮልፌ ቀራኒዮ' : 'Kolfe Keranio'}</option>
                  <option value="Akaki Kality">{isAmharic ? 'አቃቂ ቃሊቲ' : 'Akaki Kality'}</option>
                  <option value="Nifas Silk Lafto">{isAmharic ? 'ንፋስ ስልክ ላፍቶ' : 'Nifas Silk Lafto'}</option>
                  <option value="Gullele">{isAmharic ? 'ጉለሌ' : 'Gullele'}</option>
                  <option value="Addis Ketema">{isAmharic ? 'አዲስ ከተማ' : 'Addis Ketema'}</option>
                  <option value="Lemi Kura">{isAmharic ? 'ለሚ ኩራ' : 'Lemi Kura'}</option>
                  <option value="Outside Addis Ababa">{isAmharic ? 'ከአዲስ አበባ ውጪ' : 'Outside Addis Ababa'}</option>
                </select>
                {errors.subcity && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.subcity.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{t('woredaLabel', 'ወረዳ')}</label>
                <input
                  type="text"
                  placeholder={t('woredaPlaceholder', 'ወረዳ (ምሳሌ፡ 03)')}
                  {...register('woreda')}
                  className={`${inputClass} ${errors.woreda ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.woreda && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.woreda.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{t('kebeleLabel', 'ቀበሌ / የቤት ቁጥር')}</label>
                <input
                  type="text"
                  placeholder={t('kebelePlaceholder', 'ቀበሌ / የቤት ቁጥር')}
                  {...register('kebele')}
                  className={`${inputClass} ${errors.kebele ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.kebele && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.kebele.message}</p>}
              </div>
              <div className="sm:col-span-3">
                <label className={labelClass}>{t('residentialAddressLabel', 'ተጨማሪ አድራሻ')}</label>
                <input
                  type="text"
                  placeholder={t('residentialAddressPlaceholder', 'የሰፈር ስም ወይም ልዩ ምልክት')}
                  {...register('address')}
                  className={`${inputClass} ${errors.address ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.address && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.address.message}</p>}
              </div>
            </div>
          </div>

          {/* Emergency Info */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg">👨‍👩‍👧</div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {t('emergencyContactSection', 'የአደጋ ጊዜ ተጠሪ መረጃ')}
              </h2>
            </div>

            {/* Emergency Contact Photo Upload (Optional) */}
            <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <Controller
                control={control}
                name="emergencyContactPhoto"
                render={({ field }) => (
                  <PhotoUploadField
                    value={field.value}
                    onChange={field.onChange}
                    label={t('emergencyContactPhotoLabel', 'የአደጋ ጊዜ ተጠሪ ፎቶ')}
                    helperText={t('emergencyContactPhotoHelp', 'የአደጋ ጊዜ ተጠሪውን ፎቶ ማያያዝ ይችላሉ (አማራጭ)')}
                    placeholderIcon="contact"
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>
                  {t('emergencyFirstNameLabel', 'የተጠሪ ስም')} <span className="text-xs font-normal text-slate-400">({t('amharicOnlyHint', 'በአማርኛ ብቻ')})</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t('emergencyFirstNamePlaceholder', 'ምሳሌ፡ በቀለ')}
                  {...register('emergencyFirstName')}
                  className={`${inputClass} ${errors.emergencyFirstName ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.emergencyFirstName && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.emergencyFirstName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>
                  {t('emergencyMiddleNameLabel', 'የተጠሪ የአባት ስም')} <span className="text-xs font-normal text-slate-400">({t('amharicOnlyHint', 'በአማርኛ ብቻ')})</span>
                </label>
                <input
                  type="text"
                  placeholder={t('emergencyMiddleNamePlaceholder', 'ምሳሌ፡ ታደሰ')}
                  {...register('emergencyMiddleName')}
                  className={`${inputClass} ${errors.emergencyMiddleName ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.emergencyMiddleName && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.emergencyMiddleName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>
                  {t('emergencyLastNameLabel', 'የተጠሪ የአያት ስም')} <span className="text-xs font-normal text-slate-400">({t('amharicOnlyHint', 'በአማርኛ ብቻ')})</span>
                </label>
                <input
                  type="text"
                  placeholder={t('emergencyLastNamePlaceholder', 'ምሳሌ፡ አሰፋ')}
                  {...register('emergencyLastName')}
                  className={`${inputClass} ${errors.emergencyLastName ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.emergencyLastName && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.emergencyLastName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>
                  {t('relationshipLabel', 'ዝምድና')} <span className="text-rose-500">*</span>
                </label>
                <select {...register('relationship')} className={`${inputClass} ${errors.relationship ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}>
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isAmharic ? opt.labelAm : opt.labelEn}
                    </option>
                  ))}
                </select>
                {errors.relationship && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.relationship.message}</p>}
              </div>
              <div>
                <label className={labelClass}>
                  {t('emergencyPhoneLabel', 'የተጠሪ ስልክ ቁጥር')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="09XXXXXXXX / 07XXXXXXXX"
                  {...register('emergencyPhone')}
                  className={`${inputClass} ${errors.emergencyPhone ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.emergencyPhone && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.emergencyPhone.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{t('emergencyEmailLabel', 'የተጠሪ ኢሜይል')}</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  {...register('emergencyEmail')}
                  className={`${inputClass} ${errors.emergencyEmail ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.emergencyEmail && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.emergencyEmail.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>{t('emergencyAddressLabel', 'የተጠሪ አድራሻ')}</label>
                <input
                  type="text"
                  placeholder={t('emergencyAddressLabel', 'የተጠሪ አድራሻ')}
                  {...register('emergencyAddress')}
                  className={`${inputClass} ${errors.emergencyAddress ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.emergencyAddress && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.emergencyAddress.message}</p>}
              </div>
            </div>
          </div>

          {/* Login Info */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">🔐</div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {t('accountSecuritySection', 'የመግቢያ መረጃ')}
              </h2>
            </div>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>
                    {t('password', 'የይለፍ ቃል')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder={t('passwordPlaceholder', 'ቢያንስ 6 ፊደላት/ቁጥሮች')}
                    {...register('password')}
                    className={`${inputClass} ${errors.password ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                  />
                  {errors.password && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>
                    {t('confirmPasswordLabel', 'የይለፍ ቃል ማረጋገጫ')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder={t('confirmPasswordPlaceholder', 'የይለፍ ቃሉን በድጋሚ ያስገቡ')}
                    {...register('confirmPassword')}
                    className={`${inputClass} ${errors.confirmPassword ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                  />
                  {errors.confirmPassword && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>
              <div className="bg-blue-50/60 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-100/60 dark:border-blue-900/40 flex items-start gap-3">
                <span className="text-xl">📌</span>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-0.5">
                  {t('loginCredentialNotice', 'በመለያዎ ወደ ሲስተሙ ለመግባት ከላይ ያስገቡትን ስልክ ቁጥር እና ይህንን የይለፍ ቃል ይጠቀሙ።')}
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
                  {t('submittingApplication', 'በመጠበቅ ላይ...')}
                </>
              ) : (
                t('submitApplicationBtn', 'ይመዝገቡ ➔')
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterRegularContent;

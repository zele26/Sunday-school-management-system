import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { API_BASE_URL } from '../api/apiClient';
import { distanceRegistrationSchema } from '../schemas';
import { EthiopianDatePicker, BackButton } from '../components/ui';
import { calculateAgeFromDOB } from '../utils/ethiopianDate';
import { useRegistrationStatus } from '../hooks/queries';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { useLanguage } from '../hooks/useLanguage';
import { EDUCATION_LEVEL_OPTIONS, PROFESSION_OPTIONS, RELATIONSHIP_OPTIONS } from '../constants/registrationOptions';

const RegisterDistanceContent = () => {
  const [step, setStep] = useState('info'); // 'info', 'form', 'success'
  const [serverError, setServerError] = useState('');
  const [result, setResult] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
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
    resolver: zodResolver(distanceRegistrationSchema),
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
      subcity: '',
      woreda: '',
      kebele: '',
      address: '',
      email: '',
      password: '',
      confirmPassword: '',
      studentType: 'distance',
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
        grade: 'Batch 1',
      };

      const baseUrl = API_BASE_URL || '';
      const res = await fetch(`${baseUrl}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resData = await res.json().catch(() => ({}));

      if (res.ok) {
        setResult(resData.registration);
        try {
          const piRes = await fetch(`${baseUrl}/api/registrations/payment-info`);
          if (piRes.ok) setPaymentInfo(await piRes.json().catch(() => null));
        } catch (piErr) {
          console.warn('Could not fetch payment info:', piErr);
        }
        setStep('success');
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
  if (!isDistanceOpen) {
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
              {t('distanceStudentRegistration', 'የርቀት ተማሪዎች ምዝገባ')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {regStatus?.distanceClosedMessage || regStatus?.generalClosedMessage || t('distanceClosedNotice', 'የርቀት ተማሪዎች ምዝገባ ለጊዜው ተዘግቷል። ቀጣይ የምዝገባ ጊዜ በቅርቡ ይገለጻል።')}
            </p>
          </div>

          <div className="pt-2 space-y-3">
            {isRegularOpen && (
              <Link
                href="/register-regular"
                className="w-full bg-[#1657b8] hover:bg-[#124796] active:scale-98 text-white font-bold py-3.5 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('regularRegistrationBtn', 'የመደበኛ ትምህርት ይመዝገቡ')}</span>
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
              {t('distanceInfoTitle', 'የርቀት ተማሪ ምዝገባ መረጃ')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {t('readBeforeRegistering', 'እባክዎ ከመመዝገብዎ በፊት ይህንን መረጃ ያንብቡ')}
            </p>
          </div>

          <div className="space-y-6 text-left">
            <div className="bg-blue-50/50 dark:bg-blue-950/40 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/40">
              <h2 className="font-bold text-[#1657b8] dark:text-blue-300 mb-2 flex items-center gap-2">
                <span className="text-xl">📘</span> {t('whyRegisterTitle', 'ለምን ይመዘገባሉ?')}
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {t('distanceInfoDesc', 'የርቀት ትምህርት በዙር የሚሰጥ ሲሆን አዲስ ተማሪ ከመጀመሪያው ዙር (ዙር 1) ይጀምራል። አንድ ዙር ሲያጠናቅቁ ወደ ቀጣዩ ዙር ያድጋሉ። በስርዓቱ ለመግባት መመዝገብ ግዴታ ነው።')}
              </p>
            </div>

            <div className="bg-amber-50/50 dark:bg-amber-950/40 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/40">
              <h2 className="font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                <span className="text-xl">🧭</span> {t('howToRegisterTitle', 'እንዴት ይመዘገባሉ?')}
              </h2>
              <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                <li>{t('regularHowTo1', 'ከታች ያለውን ቅጽ ይሙሉ።')}</li>
                <li>{t('distanceHowTo2', 'ዕድሜ እና የመኖሪያ አድራሻ (ክፍለ ከተማ፣ ወረዳ፣ ቀበሌ) ያስገቡ።')}</li>
                <li>{t('regularHowTo3', 'የ10 አሃዝ ስልክ ቁጥር እና የይለፍ ቃል ያስገቡ።')}</li>
                <li>{t('regularHowTo4', 'የአደጋ ጊዜ ተጠሪ ስልክ ቁጥርም ግዴታ ነው።')}</li>
                <li>{t('distanceHowTo5', 'ከተመዘገቡ በኋላ የክፍያ መመሪያ ይመጣል።')}</li>
              </ul>
            </div>

            <div className="bg-blue-50/50 dark:bg-blue-950/40 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/40">
              <h2 className="font-bold text-[#1657b8] dark:text-blue-300 mb-2 flex items-center gap-2">
                <span className="text-xl">💳</span> {t('paymentInstructionTitle', 'የክፍያ መረጃ')}
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {t('paymentInstructionDesc', 'ለርቀት ተማሪዎች የክፍያ መጠን እና የትምህርት ቁሳቁስ ክፍያ አለ። ክፍያውን ከፈጸሙ በኋላ ደረሰኝ በመላክ ምዝገባዎን ያጠናቅቃሉ። ትክክለኛው መጠን በቀጣዩ ገጽ ይታያል።')}
              </p>
            </div>

            <div className="bg-amber-50/50 dark:bg-amber-950/40 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/40">
              <h2 className="font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                <span className="text-xl">🎯</span> {t('whatYouGetTitle', 'ምን ያገኛሉ?')}
              </h2>
              <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                <li>{t('regBenefit1', 'ምዝገባዎን በቀጥታ በሲስተሙ ያከናውናሉ')}</li>
                <li>{t('regBenefit2', 'የሰንበት ትምህርት ቤቱን መለያ ቁጥር ያገኛሉ')}</li>
                <li>{t('regBenefit3', 'የግል መረጃዎን ያስተዳድራሉ')}</li>
                <li>{t('regBenefit4', 'ስለሚወስዷቸው ትምህርቶች መረጃ ያገኛሉ')}</li>
                <li>{t('regBenefit5', 'ፈተናና የቤት ሥራ በሲስተሙ ይወስዳሉ')}</li>
                <li>{t('regBenefit6', 'የመገኘት ሁኔታዎን ይከታተላሉ')}</li>
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
  if (step === 'success') {
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
          {/* Success Icon */}
          <div className="w-18 h-18 bg-amber-50 dark:bg-amber-950/60 rounded-2xl flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80 shadow-xs">
            <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('registrationSuccessfulTitle', 'ምዝገባዎ ተመዝግቧል!')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
              {t('distanceSuccessDesc', 'የርቀት ትምህርት ምዝገባዎን ለማጠናቀቅ እባክዎ ክፍያ ከፍለው ደረሰኝዎን ይላኩ።')}
            </p>
          </div>

          {/* Registered Phone Reminder */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-left space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {isAmharic ? 'የተመዘገበ ስልክ ቁጥር:' : 'Registered Phone:'}
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {result?.phone || result?.studentPhone || (isAmharic ? 'በቅጹ ያስገቡት ስልክ' : 'Submitted Phone')}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {isAmharic ? 'የመግቢያ ዘዴ:' : 'Login Method:'}
              </span>
              <span className="font-semibold text-[#1e3a8a] dark:text-blue-400">
                {isAmharic ? 'ስልክ ቁጥር + የይለፍ ቃል' : 'Phone Number + Password'}
              </span>
            </div>
          </div>

          {/* Payment Guidance Summary */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 text-left space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {paymentInfo && (
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-2.5">
                <span className="font-medium">
                  {isAmharic ? 'የክፍያ መጠን፦' : 'Required Fee:'}
                </span>
                <span className="font-bold text-base text-[#1e3a8a] dark:text-amber-400">
                  {paymentInfo.totalAmount || 1000} {isAmharic ? 'ብር' : 'ETB'}
                </span>
              </div>
            )}
            <div className="space-y-1.5">
              <p className="leading-relaxed">
                {paymentInfo?.instructions || t('distanceRegistrationInstructions', 'ክፍያውን በባንክ ወይም በሞባይል ባንኪንግ ከፈጸሙ በኋላ የደረሰኝ ፎቶ በማያያዝ ምዝገባዎን ያጠናቅቁ።')}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <Link
              href="/continue-registration"
              className="block w-full bg-[#1e3a8a] hover:bg-[#163177] active:scale-98 text-white py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all text-center min-h-[46px] flex items-center justify-center"
            >
              {t('submitReceiptBtn', 'የክፍያ ደረሰኝ ለመላክ ይቀጥሉ →')}
            </Link>
            <Link
              href="/check-status"
              className="block w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all text-center border border-slate-200 dark:border-slate-700 min-h-[42px] flex items-center justify-center"
            >
              {t('checkStatusBtnText', 'የምዝገባ ሁኔታዎን ያረጋግጡ')}
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

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="inline-block bg-blue-100 dark:bg-blue-950/70 text-[#1657b8] dark:text-blue-300 font-bold px-4 py-1.5 rounded-full text-xs tracking-wider mb-4 border border-blue-200/60 dark:border-blue-800/60">
            {t('sundaySchoolShortTitle', 'ተክለ ሳዊሮስ')} {t('sundaySchoolLabel', 'ሰንበት ት/ቤት')}
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            {t('distanceStudentRegistration', 'የርቀት ተማሪ ምዝገባ')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {t('distanceStudentRegistrationSubtitle', 'በርቀት ለሚማሩ ተማሪዎች የመመዝገቢያ ቅጽ')}
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border-l-4 border-rose-500 text-rose-700 dark:text-rose-300 rounded-r-xl shadow-sm flex items-center gap-3 animate-in slide-in-from-top-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Personal Info */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1657b8] dark:text-blue-300 flex items-center justify-center text-lg font-bold">👤</div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {t('personalInfoSection', 'የግል መረጃ')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>
                  {t('firstNameLabel', 'ስም')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t('firstNamePlaceholder', 'የመጀመሪያ ስም')}
                  {...register('firstName')}
                  className={`${inputClass} ${errors.firstName ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.firstName && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>
                  {t('middleNameLabel', 'የአባት ስም')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t('middleNamePlaceholder', 'የአባት ስም')}
                  {...register('middleName')}
                  className={`${inputClass} ${errors.middleName ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.middleName && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.middleName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>
                  {t('lastNameLabel', 'የአያት ስም')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t('lastNamePlaceholder', 'የአያት ስም')}
                  {...register('lastName')}
                  className={`${inputClass} ${errors.lastName ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.lastName && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.lastName.message}</p>}
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
                    {t('ageLabel', 'ዕድሜ')} <span className="text-rose-500">*</span> <span className="text-xs font-normal text-slate-500">({t('minAgeRequirement', 'ከ 14 ዓመት በላይ')})</span>
                  </label>
                  {watch('age') && watch('dateOfBirth') && (
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
                      {t('ageCalculatedFromDOB', 'በቀኑ የተሰላ፡')} {watch('age')} {t('yearsOldUnit', 'ዓመት')}
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
                  placeholder={t('phonePlaceholder', '09XXXXXXXX / 07XXXXXXXX')}
                  {...register('phone')}
                  className={`${inputClass} ${errors.phone ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.phone && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className={labelClass}>
                  {t('emailLabel', 'ኢሜይል')} <span className="text-slate-400">({t('optional', 'አማራጭ')})</span>
                </label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  {...register('email')}
                  className={`${inputClass} ${errors.email ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.email && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.email.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>
                  {t('curriculumBatchLabel', 'የትምህርት ዙር')}
                </label>
                <input
                  type="text"
                  value={t('batch1Foundations', 'ዙር 1 (Batch 1)')}
                  disabled
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {t('newStudentBatchNotice', 'አዲስ ተማሪ ከ ዙር 1 ይጀምራል')}
                </p>
              </div>
            </div>
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
                <select {...register('subcity')} className={inputClass}>
                  <option value="">{t('selectSubcity', 'ክፍለ ከተማ ይምረጡ')}</option>
                  <option value="Bole">{t('subcityBole', 'ቦሌ')}</option>
                  <option value="Arada">{t('subcityArada', 'አራዳ')}</option>
                  <option value="Kirkos">{t('subcityKirkos', 'ቂርቆስ')}</option>
                  <option value="Lideta">{t('subcityLideta', 'ልደታ')}</option>
                  <option value="Yeka">{t('subcityYeka', 'የካ')}</option>
                  <option value="Kolfe Keranio">{t('subcityKolfeKeranio', 'ኮልፌ ቀራኒዮ')}</option>
                  <option value="Akaki Kality">{t('subcityAkakiKality', 'አቃቂ ቃሊቲ')}</option>
                  <option value="Nifas Silk Lafto">{t('subcityNifasSilkLafto', 'ንፋስ ስልክ ላፍቶ')}</option>
                  <option value="Gullele">{t('subcityGullele', 'ጉለሌ')}</option>
                  <option value="Addis Ketema">{t('subcityAddisKetema', 'አዲስ ከተማ')}</option>
                  <option value="Lemi Kura">{t('subcityLemiKura', 'ለሚ ኩራ')}</option>
                  <option value="Outside Addis Ababa">{t('subcityOutsideAA', 'ከአዲስ አበባ ውጪ')}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('woredaLabel', 'ወረዳ')}</label>
                <input
                  type="text"
                  placeholder={t('woredaPlaceholder', 'ወረዳ (ምሳሌ፡ 03)')}
                  {...register('woreda')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('kebeleLabel', 'ቀበሌ / የቤት ቁጥር')}</label>
                <input
                  type="text"
                  placeholder={t('kebelePlaceholder', 'ቀበሌ / የቤት ቁጥር')}
                  {...register('kebele')}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-3">
                <label className={labelClass}>{t('residentialAddressLabel', 'ተጨማሪ አድራሻ')}</label>
                <input
                  type="text"
                  placeholder={t('residentialAddressPlaceholder', 'ከተማ፣ የሰፈር ስም ወይም ልዩ ምልክት')}
                  {...register('address')}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Emergency Info */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg">👨‍👩‍👧</div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {t('emergencyContactSection', 'የአደጋ ጊዜ ተጠሪ መረጃ')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>
                  {t('emergencyFirstNameLabel', 'ስም')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t('firstNamePlaceholder', 'የመጀመሪያ ስም')}
                  {...register('emergencyFirstName')}
                  className={`${inputClass} ${errors.emergencyFirstName ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.emergencyFirstName && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.emergencyFirstName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{t('emergencyMiddleNameLabel', 'የአባት ስም')}</label>
                <input
                  type="text"
                  placeholder={t('middleNamePlaceholder', 'የአባት ስም')}
                  {...register('emergencyMiddleName')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t('emergencyLastNameLabel', 'የአያት ስም')}</label>
                <input
                  type="text"
                  placeholder={t('lastNamePlaceholder', 'የአያት ስም')}
                  {...register('emergencyLastName')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  {t('relationshipLabel', 'ዝምድና')} <span className="text-rose-500">*</span>
                </label>
                <select {...register('relationship')} className={inputClass}>
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isAmharic ? opt.labelAm : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>
                  {t('emergencyPhoneLabel', 'ስልክ ቁጥር')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder={t('phonePlaceholder', '09XXXXXXXX / 07XXXXXXXX')}
                  {...register('emergencyPhone')}
                  className={`${inputClass} ${errors.emergencyPhone ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.emergencyPhone && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.emergencyPhone.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{t('emergencyEmailLabel', 'ኢሜይል')}</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  {...register('emergencyEmail')}
                  className={`${inputClass} ${errors.emergencyEmail ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.emergencyEmail && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.emergencyEmail.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>{t('emergencyAddressLabel', 'አድራሻ')}</label>
                <input
                  type="text"
                  placeholder={t('addressPlaceholder', 'አድራሻ')}
                  {...register('emergencyAddress')}
                  className={inputClass}
                />
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
                  {t('distanceLoginNotice', 'በርቀት ትምህርት ሲስተም ውስጥ ለመግባት፣ ከላይ የሰጡትን ስልክ ቁጥር እና የይለፍ ቃል ይጠቀማሉ።')}
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
      </div>
    </div>
  );
};

export default RegisterDistanceContent;
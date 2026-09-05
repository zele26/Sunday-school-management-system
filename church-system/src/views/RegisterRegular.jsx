import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { API_BASE_URL } from '../api/apiClient';
import { regularRegistrationSchema } from '../schemas';
import { EthiopianDatePicker } from '../components/ui';
import { calculateAgeFromDOB } from '../utils/ethiopianDate';

const RegisterRegularContent = () => {
  const [step, setStep] = useState('info'); // 'info', 'form'
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(null);

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

      const res = await fetch(`${API_BASE_URL}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();
      if (res.ok) {
        setSuccess(resData.registration);
      } else {
        setServerError(resData.message || 'ምዝገባ አልተሳካም');
      }
    } catch {
      setServerError('የአውታረ መረብ ስህተት እባክዎ እንደገና ይሞክሩ (Network Error)');
    }
  };

  const inputClass = "w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1657b8]/20 focus:border-[#1657b8] transition-all text-slate-700 text-sm placeholder:text-slate-400";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5 ml-1";

  // ---------- INFO STEP ----------
  if (step === 'info') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl w-full bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-blue-100"
        >
          <div className="text-center mb-8">
            <span className="inline-block bg-blue-100 text-[#1657b8] font-bold px-4 py-1.5 rounded-full text-xs tracking-wider mb-4">
              ተክለሳዊሮስ ሰንበት ትምህርት ቤት
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
              የመደበኛ ተማሪ ምዝገባ መረጃ
            </h1>
            <p className="text-slate-500">እባክዎ ከመመዝገብዎ በፊት ያንብቡ</p>
          </div>

          <div className="space-y-6 text-left">
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
              <h2 className="font-bold text-[#1657b8] mb-2 flex items-center gap-2">
                <span className="text-xl">📘</span> ለምን ይመዘገባሉ?
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                የመደበኛ ትምህርት በክፍል ደረጃ የሚሰጥ ሲሆን ተማሪዎች በሳምንቱ መጨረሻ (የቀን) ወይም በሳምንት ቀናት (የማታ) በአካል ተገኝተው ይማራሉ። ለመግባት መመዝገብ ግዴታ ነው።
              </p>
            </div>

            <div className="bg-yellow-50/50 p-5 rounded-2xl border border-yellow-100">
              <h2 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                <span className="text-xl">🧭</span> እንዴት ይመዘገባሉ?
              </h2>
              <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                <li>ከታች ያለውን ቅጽ ይሙሉ።</li>
                <li>ዕድሜ፣ የመማሪያ ፈረቃ (የቀን ወይም የማታ) እና የመኖሪያ አድራሻ ይምረጡ።</li>
                <li>የ10 አሃዝ ስልክ ቁጥር እና ፓስዎርድ ያስገቡ።</li>
                <li>የአደጋ ጊዜ ተጠሪ ስልክ ቁጥርም ግዴታ ነው።</li>
                <li>ከተመዘገቡ በኋላ ማረጋገጫ ይጠብቁ።</li>
              </ul>
            </div>

            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
              <h2 className="font-bold text-[#1657b8] mb-2 flex items-center gap-2">
                <span className="text-xl">🎯</span> ምን ያገኛሉ?
              </h2>
              <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                <li>ምዝገባዎን ኦንላይን ያከናውናሉ</li>
                <li>የሰንበት ትምህርት ቤቱን መለያ ኮድ (School ID) ያገኛሉ</li>
                <li>የግል መረጃዎን ያስተዳድራሉ</li>
                <li>ስለሚወስዷቸው ትምህርቶች መረጃ ያገኛሉ ያስተዳድራሉ</li>
                <li>ፈተና ፣ አሳይመንት ሲስተሙ ላይ ይወስዳሉ</li>
                <li>የመገኘት ሁኔታዎን (Attendance) ይሞላሉ ይከታተላሉ</li>
                <li>የክፍል ውጤት (Grade) ይከታተላሉ</li>
                <li>የክፍል ውጤት ሪፖርት (Grade Report) ይወስዳሉ</li>
                <li>የትምህርት ቁሳቁሶች (መጽሐፍትን ፣ ዩቱብ ቪዲዮ ፣ ወቅታዊ መንፈሳዊ ዜናዎችን) ያገኛሉ</li>
                <li>ከክፍል ወደ ክፍል ሲሸጋገሩ ሰርተፍኬት ኦንላይን ማግኘት ይችላሉ</li>
              </ul>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStep('form')}
            className="mt-8 w-full bg-[#1657b8] hover:bg-[#124796] active:opacity-90 text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            ወደ ምዝገባ ቀጥል (Proceed to Registration)
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ---------- SUCCESS STEP ----------
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="max-w-lg w-full bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-emerald-100 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.15 }}
            className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
          >
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2">ምዝገባ ተቀባይነት አግኝቷል</h2>
          <p className="text-slate-500 mb-6">እባክዎ የሚቀጥሉትን ደረጃዎች ይከተሉ</p>

          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 mb-6 text-sm text-slate-600">
            <span className="font-semibold text-emerald-600">የማመልከቻ ቁጥር፡</span>{' '}
            <span className="font-mono font-bold text-emerald-700">{success?.registrationNumber}</span>
            <br />
            <span className="text-xs text-slate-500">📌 ይህን ቁጥር ለክትትል ይጠቀሙ።</span>
          </div>

          <div className="text-left space-y-4 mb-8">
            <div className="flex items-start gap-3 bg-yellow-50/60 p-4 rounded-2xl border border-yellow-100">
              <span className="text-xl mt-0.5">1️⃣</span>
              <div>
                <p className="font-bold text-slate-800">ማረጋገጫ ይጠብቁ</p>
                <p className="text-sm text-slate-600 mt-1">
                  አስተዳደሩ መረጃዎን ከፈተሸ በኋላ ምዝገባዎ ይጸድቃል።
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
              <span className="text-xl mt-0.5">2️⃣</span>
              <div>
                <p className="font-bold text-slate-800">የትምህርት ቤት መለያ ያገኛሉ</p>
                <p className="text-sm text-slate-600 mt-1">
                  ምዝገባዎ ሲጸድቅ ትክክለኛውን የትምህርት ቤት መለያ (School ID) ይሰጥዎታል።
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-yellow-50/60 p-4 rounded-2xl border border-yellow-100">
              <span className="text-xl mt-0.5">3️⃣</span>
              <div>
                <p className="font-bold text-slate-800">ወደ ሲስተሙ ይግቡ</p>
                <p className="text-sm text-slate-600 mt-1">
                  በስልክ ቁጥርዎ እና በፓስዎርድዎ በመጠቀም ወደ ሲስተሙ መግባት ይችላሉ።
                </p>
              </div>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/login"
              className="block w-full bg-[#1657b8] hover:bg-[#124796] active:opacity-90 text-white py-3.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all text-center"
            >
              ወደ መግቢያ ይሂዱ (Go to Login)
            </Link>
          </motion.div>

          <p className="text-xs text-slate-400 mt-4">
            ሁኔታዎን ማየት ይፈልጋሉ? <Link href="/check-status" className="text-[#1657b8] font-bold underline">ሁኔታዎን ያረጋግጡ</Link>
          </p>
        </motion.div>
      </div>
    );
  }

  // ---------- FORM STEP ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
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
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            የመደበኛ ተማሪ ምዝገባ
          </h1>
          <p className="text-slate-500">እባክዎ ከታች ያለውን ቅጽ በትክክል ይሙሉ</p>
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
              <h2 className="text-lg font-bold text-slate-800">የግል መረጃ (Personal Info)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>የመጀመሪያ ስም (First Name) <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="የመጀመሪያ ስም"
                  {...register('firstName')}
                  className={`${inputClass} ${errors.firstName ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.firstName && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>የአባት ስም (Middle Name) <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="የመካከለኛ ስም"
                  {...register('middleName')}
                  className={`${inputClass} ${errors.middleName ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.middleName && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.middleName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>የአያት ስም (Last Name) <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="የአባት/የእናት ስም"
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
                      label="የትውልድ ቀን በኢትዮጵያ የቀን አቆጣጠር (Date of Birth - Ethiopian Calendar)"
                      error={errors.dateOfBirth?.message}
                    />
                  )}
                />
              </div>

              {/* ዕድሜ (Age) */}
              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="text-sm font-semibold text-slate-700">
                    ዕድሜ (Age) <span className="text-rose-500">*</span> <span className="text-xs font-normal text-slate-500">(ከ 14 ዓመት በላይ / &gt; 14)</span>
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
                <label className={labelClass}>ኢሜይል (Email) <span className="text-slate-400">(optional)</span></label>
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
                    { label: '7ኛ ክፍል (Grade 7)', value: 'Grade 7' },
                    { label: '8ኛ ክፍል (Grade 8)', value: 'Grade 8' },
                    { label: '9ኛ ክፍል (Grade 9)', value: 'Grade 9' },
                    { label: '10ኛ ክፍል (Grade 10)', value: 'Grade 10' },
                    { label: '11ኛ ክፍል (Grade 11)', value: 'Grade 11' },
                    { label: '12ኛ ክፍል (Grade 12)', value: 'Grade 12' },
                  ].map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
                {errors.grade && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.grade.message}</p>}
              </div>

              {/* Study Shift (የመማሪያ ፈረቃ) */}
              <div>
                <label className={labelClass}>የመማሪያ ፈረቃ (Study Shift) <span className="text-rose-500">*</span></label>
                <select
                  {...register('shift')}
                  className={`${inputClass} font-semibold`}
                >
                  <option value="weekend">የቀን (ቅዳሜ እና እሑድ) - Weekend</option>
                  <option value="night">የማታ - Night</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Residential Address Information (የመኖሪያ አድራሻ) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg font-bold">📍</div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">የመኖሪያ አድራሻ መረጃ (Address Info)</h2>
                <p className="text-xs text-slate-400">ክፍለ ከተማ፣ ወረዳ እና ቀበሌ</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>ክፍለ ከተማ (Subcity)</label>
                <select {...register('subcity')} className={inputClass}>
                  <option value="">ክፍለ ከተማ ይምረጡ</option>
                  <option value="ቦሌ (Bole)">ቦሌ (Bole)</option>
                  <option value="አራዳ (Arada)">አራዳ (Arada)</option>
                  <option value="ቂርቆስ (Kirkos)">ቂርቆስ (Kirkos)</option>
                  <option value="ልደታ (Lideta)">ልደታ (Lideta)</option>
                  <option value="የካ (Yeka)">የካ (Yeka)</option>
                  <option value="ኮልፌ ቀራኒዮ (Kolfe Keranio)">ኮልፌ ቀራኒዮ (Kolfe Keranio)</option>
                  <option value="አቃቂ ቃሊቲ (Akaki Kality)">አቃቂ ቃሊቲ (Akaki Kality)</option>
                  <option value="ንፋስ ስልክ ላፍቶ (Nifas Silk Lafto)">ንፋስ ስልክ ላፍቶ (Nifas Silk Lafto)</option>
                  <option value="ጉለሌ (Gulele)">ጉለሌ (Gulele)</option>
                  <option value="አዲስ ከተማ (Addis Ketema)">አዲስ ከተማ (Addis Ketema)</option>
                  <option value="ለሚ ኩራ (Lemi Kura)">ለሚ ኩራ (Lemi Kura)</option>
                  <option value="ከአዲስ አበባ ውጪ (Outside AA)">ከአዲስ አበባ ውጪ (Outside AA)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>ወረዳ (Woreda)</label>
                <input
                  type="text"
                  placeholder="ወረዳ (ምሳሌ፡ 03)"
                  {...register('woreda')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>ቀበሌ / የቤት ቁጥር (Kebele / House No)</label>
                <input
                  type="text"
                  placeholder="ቀበሌ / የቤት ቁጥር"
                  {...register('kebele')}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-3">
                <label className={labelClass}>ተጨማሪ አድራሻ (Additional Address Details)</label>
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
              <h2 className="text-lg font-bold text-slate-800">የአደጋ ጊዜ ተጠሪ መረጃ (Emergency Info)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>ስም (First Name) <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="ስም"
                  {...register('emergencyFirstName')}
                  className={`${inputClass} ${errors.emergencyFirstName ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.emergencyFirstName && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.emergencyFirstName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>የአባት ስም (Father Name)</label>
                <input
                  type="text"
                  placeholder="የአባት ስም"
                  {...register('emergencyMiddleName')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>የአያት ስም (Grandfather Name)</label>
                <input
                  type="text"
                  placeholder="የአያት ስም"
                  {...register('emergencyLastName')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>ዝምድና (Relationship) <span className="text-rose-500">*</span></label>
                <select {...register('relationship')} className={inputClass}>
                  <option value="Father">አባት (Father)</option>
                  <option value="Mother">እናት (Mother)</option>
                  <option value="Brother">ወንድም (Brother)</option>
                  <option value="Sister">እህት (Sister)</option>
                  <option value="Relative">ዘመድ (Relative)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>ስልክ (Phone) <span className="text-rose-500">*</span></label>
                <input
                  type="tel"
                  placeholder="09XXXXXXXX"
                  {...register('emergencyPhone')}
                  className={`${inputClass} ${errors.emergencyPhone ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.emergencyPhone && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.emergencyPhone.message}</p>}
              </div>
              <div>
                <label className={labelClass}>ኢሜይል (Email)</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  {...register('emergencyEmail')}
                  className={`${inputClass} ${errors.emergencyEmail ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                />
                {errors.emergencyEmail && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.emergencyEmail.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>አድራሻ (Address)</label>
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
              <h2 className="text-lg font-bold text-slate-800">የመግቢያ መረጃ (Login Info)</h2>
            </div>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>የምስጢር ቃል (ፓስዎርድ) <span className="text-rose-500">*</span></label>
                  <input
                    type="password"
                    placeholder="ቢያንስ 6 ፊደላት/ቁጥሮች"
                    {...register('password')}
                    className={`${inputClass} ${errors.password ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
                  />
                  {errors.password && <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>የይለፍ ቃል ማረጋገጫ (Confirm Password) <span className="text-rose-500">*</span></label>
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
                  በመለያዎ ወደ ሲስተሙ ለመግባት ከላይ ያስገቡትን <span className="text-blue-700 font-bold">ስልክ ቁጥር</span> እና ይህንን <span className="text-blue-700 font-bold">ፓስዎርድ</span> ይጠቀሙ።
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
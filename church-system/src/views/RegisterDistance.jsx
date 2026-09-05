import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { API_BASE_URL } from '../api/apiClient';
import { distanceRegistrationSchema } from '../schemas';

const RegisterDistanceContent = () => {
  const [step, setStep] = useState('info'); // 'info', 'form', 'success'
  const [serverError, setServerError] = useState('');
  const [result, setResult] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);

  const {
    register,
    handleSubmit,
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
      dateOfBirth: '',
      phone: '',
      address: '',
      email: '',
      password: '',
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

      const res = await fetch(`${API_BASE_URL}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();

      if (res.ok) {
        setResult(resData.registration);
        try {
          const piRes = await fetch(`${API_BASE_URL}/api/registrations/payment-info`);
          if (piRes.ok) setPaymentInfo(await piRes.json());
        } catch (piErr) {
          console.warn('Could not fetch payment info:', piErr);
        }
        setStep('success');
      } else {
        setServerError(resData.message || 'ምዝገባ አልተሳካም (Registration Failed)');
      }
    } catch {
      setServerError('የአውታረ መረብ ስህተት እባክዎ እንደገና ይሞክሩ (Network Error)');
    }
  };

  const inputClass = "w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 text-sm placeholder:text-slate-400";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5 ml-1";

  // ---------- INFO STEP ----------
  if (step === 'info') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-2xl w-full bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-blue-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <span className="inline-block bg-blue-100 text-blue-700 font-bold px-4 py-1.5 rounded-full text-xs tracking-wider mb-4">
              ተክለሳዊሮስ ሰንበት ትምህርት ቤት
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
              የርቀት ተማሪ ምዝገባ መረጃ
            </h1>
            <p className="text-slate-500">እባክዎ ከመመዝገብዎ በፊት ይህንን መረጃ ያንብቡ</p>
          </div>

          <div className="space-y-6 text-left">
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
              <h2 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <span className="text-xl">📘</span> ለምን ይመዘገባሉ?
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                የርቀት ትምህርት በባች የሚሰጥ ሲሆን አዲስ ተማሪ ከ Batch 1 ይጀምራል። አንድ ባች ሲያጠናቅቁ ወደ ቀጣዩ ባች ያድጋሉ። በስርዓቱ ለመግባት መመዝገብ ግዴታ ነው።
              </p>
            </div>

            <div className="bg-yellow-50/50 p-5 rounded-2xl border border-yellow-100">
              <h2 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                <span className="text-xl">🧭</span> እንዴት ይመዘገባሉ?
              </h2>
              <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                <li>ከታች ያለውን ቅጽ ይሙሉ።</li>
                <li>የ10 አሃዝ ስልክ ቁጥር እና ፓስዎርድ ያስገቡ።</li>
                <li>የአደጋ ጊዜ ተጠሪ ስልክ ቁጥርም ግዴታ ነው።</li>
                <li>ከተመዘገቡ በኋላ የክፍያ መመሪያ ይመጣል።</li>
              </ul>
            </div>

            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
              <h2 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <span className="text-xl">💳</span> የክፍያ መረጃ
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                ለርቀት ተማሪዎች የክፍያ መጠን እና የትምህርት ቁሳቁስ ክፍያ አለ። ክፍያውን ከፈጸሙ በኋላ ደረሰኝ በመላክ ምዝገባዎን ያጠናቅቃሉ። ትክክለኛው መጠን በቀጣዩ ገጽ ይታያል።
              </p>
            </div>

            <div className="bg-yellow-50/50 p-5 rounded-2xl border border-yellow-100">
              <h2 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
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

          <button
            onClick={() => setStep('form')}
            className="mt-8 w-full bg-[#1657b8] hover:bg-[#124796] active:opacity-90 text-white py-4 rounded-2xl font-bold text-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            ወደ ምዝገባ ቀጥል (Proceed to Registration)
          </button>
        </div>
      </div>
    );
  }

  // ---------- SUCCESS STEP ----------
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-lg w-full bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-blue-100 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2">ምዝገባ ተቀባይነት አግኝቷል</h2>
          <p className="text-slate-500 mb-6">እባክዎ የሚቀጥሉትን ደረጃዎች ይከተሉ</p>

          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200 mb-6 text-sm text-slate-600">
            <span className="font-semibold text-blue-600">የማመልከቻ ቁጥር፡</span>{' '}
            <span className="font-mono font-bold text-blue-700">{result?.registrationNumber}</span>
            <br />
            <span className="text-xs text-slate-500">📌 ይህን ቁጥር ለክትትል ይጠቀሙ።</span>
          </div>

          <div className="text-left space-y-4 mb-8">
            <div className="flex items-start gap-3 bg-yellow-50/60 p-4 rounded-2xl border border-yellow-100">
              <span className="text-xl mt-0.5">1️⃣</span>
              <div>
                <p className="font-bold text-slate-800">ክፍያ ይፈጽሙ</p>
                {paymentInfo ? (
                  <div className="text-sm text-slate-600 mt-1">
                    <p>ጠቅላላ፡ <span className="font-bold text-blue-600">{paymentInfo.totalAmount} ብር</span></p>
                    <p className="text-xs mt-1">{paymentInfo.instructions}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">የክፍያ መረጃ እየተጫነ ነው…</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
              <span className="text-xl mt-0.5">2️⃣</span>
              <div>
                <p className="font-bold text-slate-800">ደረሰኝ ያስገቡ</p>
                <p className="text-sm text-slate-600 mt-1">
                  ክፍያውን ከፈጸሙ በኋላ ደረሰኝዎን በመላክ ምዝገባዎን ያጠናቅቁ።
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-yellow-50/60 p-4 rounded-2xl border border-yellow-100">
              <span className="text-xl mt-0.5">3️⃣</span>
              <div>
                <p className="font-bold text-slate-800">ማረጋገጫ ይጠብቁ</p>
                <p className="text-sm text-slate-600 mt-1">
                  አስተዳደሩ ከፈተሸ በኋላ ትክክለኛውን የትምህርት ቤት መለያ (School ID) ያገኛሉ።
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/continue-registration"
            className="block w-full bg-[#1657b8] hover:bg-[#124796] active:opacity-90 text-white py-3.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all text-center"
          >
            ደረሰኝ ለመላክ ይቀጥሉ (Continue Registration)
          </Link>

          <p className="text-xs text-slate-400 mt-4">
            ቀድሞውኑ ከፍለዋል? <Link href="/check-status" className="text-[#1657b8] font-bold underline">ሁኔታዎን ያረጋግጡ</Link>
          </p>
        </div>
      </div>
    );
  }

  // ---------- FORM STEP ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="inline-block bg-blue-100 text-blue-700 font-bold px-4 py-1.5 rounded-full text-xs tracking-wider mb-4">
            ተክለሳዊሮስ ሰንበት ትምህርት ቤት
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            የርቀት ተማሪ ምዝገባ
          </h1>
          <p className="text-slate-500">በርቀት ለሚማሩ ተማሪዎች የመመዝገቢያ ቅጽ</p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl shadow-sm flex items-center gap-3 animate-in slide-in-from-top-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Personal Info */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">👤</div>
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
              <div>
                <label className={labelClass}>የትውልድ ዘመን</label>
                <input type="date" {...register('dateOfBirth')} className={inputClass} />
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
                <label className={labelClass}>የዙር (Batch) </label>
                <input
                  type="text"
                  value="Batch 1"
                  disabled
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">አዲስ ተማሪ ከ Batch 1 ይጀምራል</p>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>መኖሪያ አድራሻ</label>
                <input
                  type="text"
                  placeholder="ከተማ፣ ክፍለ ከተማ፣ ወረዳ..."
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
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100/60 flex items-start gap-3">
                <span className="text-xl">📌</span>
                <p className="text-sm text-slate-600 font-medium leading-relaxed mt-0.5">
                  በርቀት ትምህርት ሲስተም ውስጥ ለመግባት፣ ከላይ የሰጡትን <span className="text-blue-700 font-bold">ስልክ ቁጥር</span> እና <span className="text-blue-700 font-bold">ፓስዎርድ</span> ይጠቀማሉ።
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
                'ይመዝገቡ (Register)'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterDistanceContent;
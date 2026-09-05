// src/pages/StudentRegister.jsx
import React, { useState } from 'react';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { API_BASE_URL } from '../api/apiClient';
import { studentSelfRegisterSchema } from '../schemas';
import EthiopianDatePicker from '../components/ui/EthiopianDatePicker';

const ADDIS_ABABA_SUBCITIES = [
  'አዲስ ከተማ (Addis Ketema)',
  'አካቂ ቃሊቲ (Akaky Kaliti)',
  'አራዳ (Arada)',
  'ቦሌ (Bole)',
  'ጉለሌ (Gullele)',
  'ቂርቆስ (Kirkos)',
  'ኮልፌ ቀራኒዮ (Kolfe Keranio)',
  'ልደታ (Lideta)',
  'ንፋስ ስልክ ላፍቶ (Nifas Silk-Lafto)',
  'የካ (Yeka)',
  'ለሚ ኩራ (Lemi Kura)',
];

const StudentRegister = () => {
  const [step, setStep] = useState('form');
  const [receiptFile, setReceiptFile] = useState(null);
  const [serverError, setServerError] = useState('');
  const [result, setResult] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(studentSelfRegisterSchema),
    defaultValues: {
      fullName: '',
      gender: 'Male',
      age: '',
      dateOfBirth: '',
      shift: 'weekend',
      subcity: '',
      woreda: '',
      kebele: '',
      phone: '',
      grade: 'Grade 7',
      studentType: 'regular',
      address: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const studentType = watch('studentType');

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          fd.append(k, v);
        }
      });
      if (receiptFile) fd.append('receipt', receiptFile);

      const res = await fetch(`${API_BASE_URL}/api/registrations`, { method: 'POST', body: fd });
      const resData = await res.json();
      if (res.ok) {
        setResult(resData.registration);
        const piRes = await fetch(`${API_BASE_URL}/api/registrations/payment-info`);
        if (piRes.ok) setPaymentInfo(await piRes.json());
        setStep('success');
      } else {
        setServerError(resData.message || 'ምዝገባ አልተሳካም');
      }
    } catch (err) {
      setServerError('የአውታረ መረብ ስህተት');
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow border border-slate-100 dark:border-slate-800 text-center">
        <h2 className="text-2xl font-bold text-emerald-600 mb-4">✅ ምዝገባ ተሳክቷል</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-2">የምዝገባ ቁጥርዎ:</p>
        <p className="text-3xl font-mono font-bold text-[var(--brand-primary)]">{result?.registrationNumber}</p>
        <p className="text-sm text-slate-500 mt-2">ሁኔታ: {result?.status === 'Pending Payment' ? 'ክፍያ በመጠበቅ ላይ' : 'ማረጋገጫ በመጠበቅ ላይ'}</p>

        {paymentInfo && (
          <div className="mt-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-left border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">የክፍያ መመሪያ</h3>
            <p><strong>የክፍያ መጠን:</strong> {paymentInfo.contributionAmount || 1000} ብር</p>
            <p><strong>የትምህርት ቁሳቁስ:</strong> {paymentInfo.resourceFee || 0} ብር</p>
            <p className="font-bold text-lg mt-2 text-[var(--brand-primary)]">ጠቅላላ: {paymentInfo.totalAmount || 1000} ብር</p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{paymentInfo.instructions}</p>
          </div>
        )}

        <p className="mt-4 text-sm text-slate-500">ክፍያ ከፍለው ከሆነ ደረሰኝዎን እዚህ ያስገቡ:</p>
        <Link href="/continue-registration" className="mt-3 inline-block bg-[var(--brand-primary)] text-white px-6 py-2.5 rounded-xl font-semibold shadow-md hover:bg-[var(--brand-primary-hover)] transition">
          ቀጥል ምዝገባ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6 text-center">የተማሪ ምዝገባ</h1>
      {serverError && <div className="mb-4 p-3 bg-rose-100 text-rose-700 rounded-xl text-sm font-medium">{serverError}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow border border-slate-100 dark:border-slate-800">
        <h2 className="font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">የግል መረጃ</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ሙሉ ስም *</label>
            <input type="text" placeholder="ሙሉ ስም" {...register('fullName')} className={`w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors.fullName ? 'border-rose-400' : 'border-slate-200'}`} />
            {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ጾታ</label>
            <select {...register('gender')} className="w-full p-2.5 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white">
              <option value="Male">ወንድ (Male)</option>
              <option value="Female">ሴት (Female)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ዕድሜ (ከ 14 ዓመት በላይ / Age &gt; 14) *</label>
            <input
              type="number"
              min="15"
              placeholder="ምሳሌ: 18"
              {...register('age')}
              className={`w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors.age ? 'border-rose-400' : 'border-slate-200'}`}
            />
            {errors.age && <p className="text-xs text-rose-500 mt-1">{errors.age.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">የትውልድ ቀን (በኢትዮጵያ ዘመን አቆጣጠር)</label>
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <EthiopianDatePicker
                  value={field.value}
                  onChange={field.onChange}
                  name="dateOfBirth"
                />
              )}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ስልክ ቁጥር *</label>
            <input type="tel" placeholder="09... ወይም 07..." {...register('phone')} className={`w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors.phone ? 'border-rose-400' : 'border-slate-200'}`} />
            {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">የምዝገባ ዓይነት</label>
            <select {...register('studentType')} className="w-full p-2.5 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white">
              <option value="regular">መደበኛ (Regular)</option>
              <option value="distance">ርቀት (Distance)</option>
            </select>
          </div>
          {studentType === 'regular' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">የመማሪያ ፈረቃ (Study Shift)</label>
              <select {...register('shift')} className="w-full p-2.5 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                <option value="weekend">የቀን / ቅዳሜና እሁድ (Weekend)</option>
                <option value="night">የማታ (Night)</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ክፍል (Grade)</label>
            <select {...register('grade')} className="w-full p-2.5 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white">
              {['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ክፍለ ከተማ (Subcity)</label>
            <select {...register('subcity')} className="w-full p-2.5 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white">
              <option value="">-- ክፍለ ከተማ ይምረጡ --</option>
              {ADDIS_ABABA_SUBCITIES.map((sc) => (
                <option key={sc} value={sc}>{sc}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ወረዳ (Woreda)</label>
            <input type="text" placeholder="ምሳሌ: 03" {...register('woreda')} className="w-full p-2.5 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ቀበሌ / የቤት ቁጥር (Kebele / House No)</label>
            <input type="text" placeholder="ቀበሌ ወይም የቤት ቁጥር" {...register('kebele')} className="w-full p-2.5 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ልዩ አድራሻ (Detailed Address)</label>
            <input type="text" placeholder="አድራሻ" {...register('address')} className="w-full p-2.5 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
        </div>

        <h2 className="font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">ወላጅ / አሳዳጊ መረጃ</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input type="text" placeholder="የወላጅ ሙሉ ስም" {...register('parentName')} className="w-full p-2.5 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          <input type="tel" placeholder="የወላጅ ስልክ" {...register('parentPhone')} className="w-full p-2.5 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          <input type="email" placeholder="የወላጅ ኢሜይል" {...register('parentEmail')} className="w-full p-2.5 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
        </div>

        <h2 className="font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">የመግቢያ መረጃ</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ኢሜይል *</label>
            <input type="email" placeholder="ኢሜይል" {...register('email')} className={`w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors.email ? 'border-rose-400' : 'border-slate-200'}`} />
            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">የይለፍ ቃል *</label>
            <input type="password" placeholder="ፓስዎርድ" {...register('password')} className={`w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors.password ? 'border-rose-400' : 'border-slate-200'}`} />
            {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">የይለፍ ቃል ማረጋገጫ *</label>
            <input type="password" placeholder="ፓስዎርዱን በድጋሚ ያስገቡ" {...register('confirmPassword')} className={`w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors.confirmPassword ? 'border-rose-400' : 'border-slate-200'}`} />
            {errors.confirmPassword && <p className="text-xs text-rose-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">የክፍያ ደረሰኝ (PDF/ምስል) ካለ</label>
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setReceiptFile(e.target.files[0])} className="w-full p-2 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm" />
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-[var(--brand-primary)] text-white p-3.5 rounded-xl font-bold hover:bg-[var(--brand-primary-hover)] transition disabled:opacity-50 shadow-md">
          {isSubmitting ? 'በመጠበቅ ላይ…' : 'ይመዝገቡ (Submit Registration)'}
        </button>
      </form>
    </div>
  );
};

export default StudentRegister;
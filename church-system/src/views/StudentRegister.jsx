import React, { useState } from 'react';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { API_BASE_URL } from '../api/apiClient';
import { studentSelfRegisterSchema } from '../schemas';
import EthiopianDatePicker from '../components/ui/EthiopianDatePicker';
import { BackButton } from '../components/ui';
import { calculateAgeFromDOB } from '../utils/ethiopianDate';

const ADDIS_ABABA_SUBCITIES = [
  'አዲስ ከተማ',
  'አካቂ ቃሊቲ',
  'አራዳ',
  'ቦሌ',
  'ጉለሌ',
  'ቂርቆስ',
  'ኮልፌ ቀራኒዮ',
  'ልደታ',
  'ንፋስ ስልክ ላፍቶ',
  'የካ',
  'ለሚ ኩራ',
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
    setValue,
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
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
        <div className="mb-4 flex justify-start">
          <BackButton href="/" label="ወደ ዋናው ገጽ" variant="glass" />
        </div>
        <h2 className="text-2xl font-black text-emerald-600 mb-4">✅ ምዝገባ ተሳክቷል</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-2">የምዝገባ ቁጥርዎ:</p>
        <p className="text-3xl font-mono font-bold text-[#1657b8] dark:text-amber-400">{result?.registrationNumber}</p>
        <p className="text-sm text-slate-500 mt-2">ሁኔታ: {result?.status === 'Pending Payment' ? 'ክፍያ በመጠበቅ ላይ' : 'ማረጋገጫ በመጠበቅ ላይ'}</p>

        {paymentInfo && (
          <div className="mt-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-left border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">የክፍያ መመሪያ</h3>
            <p><strong>የክፍያ መጠን:</strong> {paymentInfo.contributionAmount || 1000} ብር</p>
            <p><strong>የትምህርት ቁሳቁስ:</strong> {paymentInfo.resourceFee || 0} ብር</p>
            <p className="font-bold text-lg mt-2 text-[#1657b8] dark:text-amber-400">ጠቅላላ: {paymentInfo.totalAmount || 1000} ብር</p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{paymentInfo.instructions}</p>
          </div>
        )}

        <p className="mt-4 text-sm text-slate-500">ክፍያ ከፍለው ከሆነ ደረሰኝዎን እዚህ ያስገቡ:</p>
        <Link href="/continue-registration" className="mt-3 inline-block bg-[#1657b8] hover:bg-[#124796] text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition">
          ምዝገባን ይቀጥሉ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <BackButton href="/" label="ወደ ዋናው ገጽ" variant="glass" />
      </div>

      <div className="text-center">
        <span className="inline-block bg-blue-100 dark:bg-slate-800 text-[#1657b8] dark:text-amber-400 font-bold px-4 py-1.5 rounded-full text-xs tracking-wider mb-2">
          ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት
        </span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">የተማሪ ምዝገባ</h1>
      </div>

      {serverError && <div className="mb-4 p-3 bg-rose-100 text-rose-700 rounded-xl text-sm font-medium">{serverError}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
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
              <option value="Male">ወንድ</option>
              <option value="Female">ሴት</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">የትውልድ ቀን (በኢትዮጵያ ዘመን አቆጣጠር)</label>
            <Controller
              name="dateOfBirth"
              control={control}
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
                  name="dateOfBirth"
                />
              )}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">ዕድሜ (ከ 14 ዓመት በላይ) *</label>
              {watch('age') && watch('dateOfBirth') && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  በቀኑ የተሰላ: {watch('age')} ዓመት
                </span>
              )}
            </div>
            <input
              type="number"
              min="15"
              placeholder="ምሳሌ: 18 (የትውልድ ቀን ሲመርጡ ይሰላል)"
              {...register('age')}
              className={`w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors.age ? 'border-rose-400' : 'border-slate-200'}`}
            />
            {errors.age && <p className="text-xs text-rose-500 mt-1">{errors.age.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ስልክ ቁጥር *</label>
            <input type="tel" placeholder="09... ወይም 07..." {...register('phone')} className={`w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors.phone ? 'border-rose-400' : 'border-slate-200'}`} />
            {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">የምዝገባ ዓይነት</label>
            <select {...register('studentType')} className="w-full p-2.5 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white">
              <option value="regular">መደበኛ</option>
              <option value="distance">የርቀት</option>
            </select>
          </div>
          {studentType === 'regular' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">የመማሪያ ፈረቃ</label>
              <select {...register('shift')} className="w-full p-2.5 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                <option value="weekend">የቀን / ቅዳሜና እሁድ</option>
                <option value="night">የማታ</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ክፍል</label>
            <select {...register('grade')} className="w-full p-2.5 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white">
              {[
                { val: 'Grade 7', label: '7ኛ ክፍል' },
                { val: 'Grade 8', label: '8ኛ ክፍል' },
                { val: 'Grade 9', label: '9ኛ ክፍል' },
                { val: 'Grade 10', label: '10ኛ ክፍል' },
                { val: 'Grade 11', label: '11ኛ ክፍል' },
                { val: 'Grade 12', label: '12ኛ ክፍል' },
              ].map((g) => (
                <option key={g.val} value={g.val}>{g.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ክፍለ ከተማ</label>
            <select {...register('subcity')} className="w-full p-2.5 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white">
              <option value="">-- ክፍለ ከተማ ይምረጡ --</option>
              {ADDIS_ABABA_SUBCITIES.map((sc) => (
                <option key={sc} value={sc}>{sc}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ወረዳ</label>
            <input type="text" placeholder="ምሳሌ: 03" {...register('woreda')} className="w-full p-2.5 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ቀበሌ / የቤት ቁጥር</label>
            <input type="text" placeholder="ቀበሌ ወይም የቤት ቁጥር" {...register('kebele')} className="w-full p-2.5 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">ልዩ አድራሻ</label>
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
            <input type="password" placeholder="የይለፍ ቃል" {...register('password')} className={`w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors.password ? 'border-rose-400' : 'border-slate-200'}`} />
            {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">የይለፍ ቃል ማረጋገጫ *</label>
            <input type="password" placeholder="የይለፍ ቃሉን በድጋሚ ያስገቡ" {...register('confirmPassword')} className={`w-full p-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors.confirmPassword ? 'border-rose-400' : 'border-slate-200'}`} />
            {errors.confirmPassword && <p className="text-xs text-rose-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">የክፍያ ደረሰኝ (ምስል ወይም ፒዲኤፍ) ካለ</label>
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setReceiptFile(e.target.files[0])} className="w-full p-2 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm" />
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-[var(--brand-primary)] text-white p-3.5 rounded-xl font-bold hover:bg-[var(--brand-primary-hover)] transition disabled:opacity-50 shadow-md">
          {isSubmitting ? 'በመጠበቅ ላይ…' : 'ይመዝገቡ'}
        </button>
      </form>
    </div>
  );
};

export default StudentRegister;
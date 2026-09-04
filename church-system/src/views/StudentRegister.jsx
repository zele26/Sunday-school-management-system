// src/pages/StudentRegister.jsx
import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { API_BASE_URL } from '../api/apiClient';
import { studentSelfRegisterSchema } from '../schemas';

const StudentRegister = () => {
  const [step, setStep] = useState('form');
  const [receiptFile, setReceiptFile] = useState(null);
  const [serverError, setServerError] = useState('');
  const [result, setResult] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(studentSelfRegisterSchema),
    defaultValues: {
      fullName: '',
      gender: 'Male',
      dateOfBirth: '',
      phone: '',
      grade: 'Grade 7',
      studentType: 'regular',
      address: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      email: '',
      password: '',
    },
  });

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
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow text-center">
        <h2 className="text-2xl font-bold text-emerald-700 mb-4">✅ ምዝገባ ተሳክቷል</h2>
        <p className="text-slate-600 mb-2">የምዝገባ ቁጥርዎ:</p>
        <p className="text-3xl font-mono font-bold text-blue-700">{result?.registrationNumber}</p>
        <p className="text-sm text-slate-500 mt-2">ሁኔታ: {result?.status === 'Pending Payment' ? 'ክፍያ በመጠበቅ ላይ' : 'ማረጋገጫ በመጠበቅ ላይ'}</p>

        {paymentInfo && (
          <div className="mt-6 bg-slate-50 p-4 rounded-xl text-left">
            <h3 className="font-semibold text-slate-700 mb-2">የክፍያ መመሪያ</h3>
            <p><strong>የክፍያ መጠን:</strong> {paymentInfo.contributionAmount}1000 ብር</p>
            <p><strong>የትምህርት ቁሳቁስ:</strong> {paymentInfo.resourceFee} ብር</p>
            <p className="font-bold text-lg mt-2">ጠቅላላ: {paymentInfo.totalAmount} ብር</p>
            <p className="mt-3 text-sm text-slate-600">{paymentInfo.instructions}</p>
          </div>
        )}

        <p className="mt-4 text-sm text-slate-500">ክፍያ ከፍለው ከሆነ ደረሰኝዎን እዚህ ያስገቡ:</p>
        <Link href="/continue-registration" className="mt-3 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold">
          ቀጥል ምዝገባ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">የተማሪ ምዝገባ</h1>
      {serverError && <div className="mb-4 p-3 bg-rose-100 text-rose-700 rounded-xl text-sm">{serverError}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-2xl shadow">
        <h2 className="font-semibold text-slate-600 border-b pb-2">የግል መረጃ</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <input type="text" placeholder="ሙሉ ስም *" {...register('fullName')} className={`w-full p-2 border rounded-xl ${errors.fullName ? 'border-rose-400' : ''}`} />
            {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName.message}</p>}
          </div>
          <div>
            <select {...register('gender')} className="w-full p-2 border rounded-xl">
              <option value="Male">ወንድ</option>
              <option value="Female">ሴት</option>
            </select>
          </div>
          <div>
            <input type="date" {...register('dateOfBirth')} placeholder="የትውልድ ቀን" className="w-full p-2 border rounded-xl" />
          </div>
          <div>
            <input type="tel" placeholder="ስልክ ቁጥር *" {...register('phone')} className={`w-full p-2 border rounded-xl ${errors.phone ? 'border-rose-400' : ''}`} />
            {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <select {...register('grade')} className="w-full p-2 border rounded-xl">
              {['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <select {...register('studentType')} className="w-full p-2 border rounded-xl">
              <option value="regular">መደበኛ (Regular)</option>
              <option value="distance">ርቀት (Distance)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <input type="text" placeholder="አድራሻ" {...register('address')} className="w-full p-2 border rounded-xl" />
          </div>
        </div>

        <h2 className="font-semibold text-slate-600 border-b pb-2">ወላጅ / አሳዳጊ መረጃ</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input type="text" placeholder="የወላጅ ሙሉ ስም" {...register('parentName')} className="w-full p-2 border rounded-xl" />
          <input type="tel" placeholder="የወላጅ ስልክ" {...register('parentPhone')} className="w-full p-2 border rounded-xl" />
          <input type="email" placeholder="የወላጅ ኢሜይል" {...register('parentEmail')} className="w-full p-2 border rounded-xl" />
        </div>

        <h2 className="font-semibold text-slate-600 border-b pb-2">የመግቢያ መረጃ</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <input type="email" placeholder="ኢሜይል *" {...register('email')} className={`w-full p-2 border rounded-xl ${errors.email ? 'border-rose-400' : ''}`} />
            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <input type="password" placeholder="ፓስዎርድ *" {...register('password')} className={`w-full p-2 border rounded-xl ${errors.password ? 'border-rose-400' : ''}`} />
            {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">የክፍያ ደረሰኝ (PDF/ምስል) ካለ</label>
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setReceiptFile(e.target.files[0])} className="w-full p-2 border rounded-xl" />
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white p-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50">
          {isSubmitting ? 'በመጠበቅ ላይ…' : 'ይመዝገቡ'}
        </button>
      </form>
    </div>
  );
};

export default StudentRegister;
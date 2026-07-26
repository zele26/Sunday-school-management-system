// src/pages/StudentRegister.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import bgImage from '../assets/Lidetachurch.jpg';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const StudentRegister = () => {
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({
    fullName: '', gender: 'Male', dateOfBirth: '', phone: '', grade: 'Grade 7',
    address: '', parentName: '', parentPhone: '', parentEmail: '',
    email: '', password: '', studentType: 'regular',
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      if (receiptFile) fd.append('receipt', receiptFile);

      const res = await fetch(`${API_BASE_URL}/api/registrations`, { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        setResult(data.registration);
        const piRes = await fetch(`${API_BASE_URL}/api/registrations/payment-info`);
        if (piRes.ok) setPaymentInfo(await piRes.json());
        setStep('success');
      } else {
        setError(data.message || 'ምዝገባ አልተሳካም');
      }
    } catch (err) {
      setError('የአውታረ መረብ ስህተት');
    } finally {
      setLoading(false);
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
            <p><strong>የክፍያ መጠን:</strong> {paymentInfo.contributionAmount} ብር</p>
            <p><strong>የትምህርት ቁሳቁስ:</strong> {paymentInfo.resourceFee} ብር</p>
            <p className="font-bold text-lg mt-2">ጠቅላላ: {paymentInfo.totalAmount} ብር</p>
            <p className="mt-3 text-sm text-slate-600">{paymentInfo.instructions}</p>
          </div>
        )}

        <p className="mt-4 text-sm text-slate-500">ክፍያ ከፍለው ከሆነ ደረሰኝዎን እዚህ ያስገቡ:</p>
        <Link to="/continue-registration" className="mt-3 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold">
          ቀጥል ምዝገባ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">የተማሪ ምዝገባ</h1>
      {error && <div className="mb-4 p-3 bg-rose-100 text-rose-700 rounded-xl text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow">
        <h2 className="font-semibold text-slate-600 border-b pb-2">የግል መረጃ</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <input type="text" name="fullName" placeholder="ሙሉ ስም *" required onChange={handleChange} className="w-full p-2 border rounded-xl" />
          <select name="gender" onChange={handleChange} className="w-full p-2 border rounded-xl">
            <option value="Male">ወንድ</option><option value="Female">ሴት</option>
          </select>
          <input type="date" name="dateOfBirth" placeholder="የትውልድ ቀን" onChange={handleChange} className="w-full p-2 border rounded-xl" />
          <input type="tel" name="phone" placeholder="ስልክ ቁጥር" onChange={handleChange} className="w-full p-2 border rounded-xl" />
          <select name="grade" onChange={handleChange} className="w-full p-2 border rounded-xl">
            {['Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'].map(g=><option key={g} value={g}>{g}</option>)}
          </select>
          <select name="studentType" onChange={handleChange} className="w-full p-2 border rounded-xl">
            <option value="regular">መደበኛ (Regular)</option>
            <option value="distance">ርቀት (Distance)</option>
          </select>
          <input type="text" name="address" placeholder="አድራሻ" onChange={handleChange} className="w-full p-2 border rounded-xl md:col-span-2" />
        </div>

        <h2 className="font-semibold text-slate-600 border-b pb-2">ወላጅ / አሳዳጊ መረጃ</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input type="text" name="parentName" placeholder="የወላጅ ሙሉ ስም" onChange={handleChange} className="w-full p-2 border rounded-xl" />
          <input type="tel" name="parentPhone" placeholder="የወላጅ ስልክ" onChange={handleChange} className="w-full p-2 border rounded-xl" />
          <input type="email" name="parentEmail" placeholder="የወላጅ ኢሜይል" onChange={handleChange} className="w-full p-2 border rounded-xl" />
        </div>

        <h2 className="font-semibold text-slate-600 border-b pb-2">የመግቢያ መረጃ</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <input type="email" name="email" placeholder="ኢሜይል *" required onChange={handleChange} className="w-full p-2 border rounded-xl" />
          <input type="password" name="password" placeholder="ፓስዎርድ *" required minLength={6} onChange={handleChange} className="w-full p-2 border rounded-xl" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">የክፍያ ደረሰኝ (PDF/ምስል) ካለ</label>
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setReceiptFile(e.target.files[0])} className="w-full p-2 border rounded-xl" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white p-3 rounded-xl font-bold hover:bg-emerald-700">
          {loading ? 'በመጠበቅ ላይ…' : 'ይመዝገቡ'}
        </button>
      </form>
    </div>
  );
};

export default StudentRegister;
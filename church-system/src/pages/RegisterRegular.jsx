import React, { useState } from 'react';
import { Link, MemoryRouter, useInRouterContext } from 'react-router-dom';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const RegisterRegularContent = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Male',
    dateOfBirth: '',
    phone: '',
    grade: 'Grade 7',
    address: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    email: '', // Kept in state for backend compatibility, but removed from UI
    password: '',
    studentType: 'regular',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.registration);
      } else {
        setError(data.message || 'ምዝገባ አልተሳካም');
      }
    } catch {
      setError('የአውታረ መረብ ስህተት እባክዎ እንደገና ይሞክሩ (Network Error)');
    } finally {
      setLoading(false);
    }
  };

  // Reusable input and label classes for clean, floating aesthetics
  const inputClass = "w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700 text-sm placeholder:text-slate-400";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5 ml-1";

 
  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="inline-block bg-emerald-100 text-emerald-700 font-bold px-4 py-1.5 rounded-full text-xs tracking-wider mb-4">
            ተክለሳዊሮስ ሰንበት ትምህርት ቤት
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            የመደበኛ ተማሪ ምዝገባ
          </h1>
          <p className="text-slate-500">እባክዎ ከታች ያለውን ቅጽ በትክክል ይሙሉ</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl shadow-sm flex items-center gap-3 animate-in slide-in-from-top-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Personal Info Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">👤</div>
              <h2 className="text-lg font-bold text-slate-800">የግል መረጃ</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>ሙሉ ስም <span className="text-rose-500">*</span></label>
                <input type="text" name="fullName" placeholder="የተማሪው ሙሉ ስም" required onChange={handleChange} className={inputClass} />
              </div>
              
              <div>
                <label className={labelClass}>ጾታ <span className="text-rose-500">*</span></label>
                <select name="gender" onChange={handleChange} className={inputClass}>
                  <option value="Male">ወንድ</option>
                  <option value="Female">ሴት</option>
                </select>
              </div>
              
              <div>
                <label className={labelClass}>የትውልድ ዘመን</label>
                <input type="date" name="dateOfBirth" onChange={handleChange} className={inputClass} />
              </div>
              
              <div>
                <label className={labelClass}>ስልክ ቁጥር <span className="text-rose-500">*</span></label>
                <input type="tel" name="phone" placeholder="09..." required onChange={handleChange} className={inputClass} />
              </div>
              
              <div>
                <label className={labelClass}>የሚገቡበት ክፍል <span className="text-rose-500">*</span></label>
                <select name="grade" onChange={handleChange} className={inputClass}>
                  {['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className={labelClass}>መኖሪያ አድራሻ</label>
                <input type="text" name="address" placeholder="የክፍለ ከተማ፣ ወረዳ እና የቤት ቁጥር መረጃ" onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Parent Info Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">👨‍👩‍👧</div>
              <h2 className="text-lg font-bold text-slate-800">ወላጅ / አሳዳጊ መረጃ</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>የወላጅ ሙሉ ስም</label>
                <input type="text" name="parentName" placeholder="ስም" onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>የወላጅ ስልክ</label>
                <input type="tel" name="parentPhone" placeholder="09..." onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>የወላጅ ኢሜይል</label>
                <input type="email" name="parentEmail" placeholder="email@example.com" onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Login Info Card - PHONE ONLY */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">🔐</div>
              <h2 className="text-lg font-bold text-slate-800">የመግቢያ መረጃ</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className={labelClass}>የምስጢር ቃል (ፓስዎርድ) <span className="text-rose-500">*</span></label>
                <input type="password" name="password" placeholder="ቢያንስ 6 ፊደላት/ቁጥሮች" required minLength={6} onChange={handleChange} className={inputClass} />
              </div>
              
              {/* Highlighted Helper Text for Phone Login */}
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100/60 flex items-start gap-3">
                <span className="text-xl">📌</span>
                <p className="text-sm text-slate-600 font-medium leading-relaxed mt-0.5">
                  በመለያዎ ወደ ሲስተሙ ለመግባት ከላይ ያስገቡትን <span className="text-blue-700 font-bold">ስልክ ቁጥር</span> እና ይህንን <span className="text-blue-700 font-bold">ፓስዎርድ</span> ይጠቀሙ።
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                loading 
                  ? 'bg-emerald-400 cursor-not-allowed shadow-none' 
                  : 'bg-emerald-600 hover:bg-emerald-500 hover:-translate-y-1 hover:shadow-emerald-600/30'
              }`}
            >
              {loading ? (
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
      </div>
    </div>
  );
};

// Wrapper to prevent crashes in isolated preview environments
const RegisterRegular = () => {
  const inRouterContext = useInRouterContext();
  if (!inRouterContext) {
    return (
      <MemoryRouter>
        <RegisterRegularContent />
      </MemoryRouter>
    );
  }
  return <RegisterRegularContent />;
};

export default RegisterRegular;
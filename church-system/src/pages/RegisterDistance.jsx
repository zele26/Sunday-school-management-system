import React, { useState } from 'react';
import { Link, MemoryRouter, useInRouterContext } from 'react-router-dom';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const RegisterDistanceContent = () => {
  const [step, setStep] = useState('form');
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
    email: '', // Kept in state for backend compatibility, removed from UI
    password: '',
    studentType: 'distance',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);

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
        setResult(data.registration);
        try {
          const piRes = await fetch(`${API_BASE_URL}/api/registrations/payment-info`);
          if (piRes.ok) setPaymentInfo(await piRes.json());
        } catch (piErr) {
          console.warn("Could not fetch payment info:", piErr);
        }
        setStep('success');
      } else {
        setError(data.message || 'ምዝገባ አልተሳካም (Registration Failed)');
      }
    } catch {
      setError('የአውታረ መረብ ስህተት እባክዎ እንደገና ይሞክሩ (Network Error)');
    } finally {
      setLoading(false);
    }
  };

  // Reusable input and label classes for clean, floating aesthetics
  const inputClass = "w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 text-sm placeholder:text-slate-400";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5 ml-1";

  if (step === 'success') {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50/50 font-sans">
      <div className="max-w-lg w-full bg-white p-8 rounded-3xl shadow-xl border border-blue-100 text-center animate-in zoom-in-95 duration-500">

        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2">ምዝገባ ተቀባይነት አግኝቷል</h2>
        <p className="text-slate-500 mb-6 leading-relaxed">
          የምዝገባ ጥያቄዎ በተሳካ ሁኔታ ተልኳል። ለማጠናቀቅ ክፍያ መፈጸም ያስፈልጋል።
        </p>

        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">የምዝገባ ቁጥርዎ</p>
            <p className="text-2xl font-black text-blue-600 tracking-widest">{result?.registrationNumber || 'N/A'}</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <p className="text-xs font-bold text-amber-700 uppercase">ክፍያ በመጠበቅ ላይ</p>
          </div>
        </div>

        {/* SCHOOL ID */}
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200 mb-8">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">የትምህርት ቤት መለያ (School ID)</p>
          <p className="text-3xl font-black text-blue-700 tracking-widest">{result?.studentId}</p>
          <p className="text-sm text-blue-600 mt-3">
            📌 ምዝገባዎ ሲጸድቅ በዚህ መለያ ቁጥር እና በፓስዎርድዎ ይግቡ።
          </p>
        </div>

        {/* Payment Information Card (unchanged) */}
        {paymentInfo && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-sm mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
              <span className="text-xl">💰</span> የክፍያ መመሪያ
            </h3>
            <div className="space-y-3 text-sm text-slate-600 mb-5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span>የክፍያ መጠን (Contribution):</span>
                <span className="font-semibold text-slate-800">{paymentInfo.contributionAmount} ብር</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span>የትምህርት ቁሳቁስ (Resource Fee):</span>
                <span className="font-semibold text-slate-800">{paymentInfo.resourceFee} ብር</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-slate-800 text-base">ጠቅላላ (Total):</span>
                <span className="font-black text-blue-600 text-xl">{paymentInfo.totalAmount} ብር</span>
              </div>
            </div>
            <div className="bg-blue-50/50 p-4 rounded-xl text-sm text-slate-600 leading-relaxed border border-blue-100/50">
              <p className="font-semibold text-blue-800 mb-1">መመሪያ፡</p>
              {paymentInfo.instructions}
            </div>
          </div>
        )}

        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 mb-6 text-left">
          <p className="text-sm text-amber-800 font-medium flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">ℹ️</span>
            <span>
              ክፍያውን ከፈጸሙ በኋላ የክፍያ ማረጋገጫ (ደረሰኝ) ለማስገባት ከታች 
              <strong className="font-bold mx-1 text-amber-900">"ቀጥል ምዝገባ"</strong> 
              የሚለውን ይጫኑ።
            </span>
          </p>
        </div>

        <Link
          to="/continue-registration"
          className="block w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5"
        >
          ቀጥል ምዝገባ (Continue Registration)
        </Link>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="inline-block bg-blue-100 text-blue-700 font-bold px-4 py-1.5 rounded-full text-xs tracking-wider mb-4">
            ተክለሳዊሮስ ሰንበት ትምህርት ቤት
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            የርቀት ተማሪ ምዝገባ
          </h1>
          <p className="text-slate-500">Distance Learning Registration Form</p>
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
              <h2 className="text-lg font-bold text-slate-800">የግል መረጃ (Personal Info)</h2>
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
                <input type="text" name="address" placeholder="ከተማ፣ ክፍለ ከተማ፣ ወረዳ..." onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Parent Info Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">👨‍👩‍👧</div>
              <h2 className="text-lg font-bold text-slate-800">ወላጅ / አሳዳጊ መረጃ (Parent Info)</h2>
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
              <h2 className="text-lg font-bold text-slate-800">የመግቢያ መረጃ (Login Info)</h2>
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
                  በርቀት ትምህርት ሲስተም ውስጥ ለመግባት፣ ከላይ የሰጡትን <span className="text-blue-700 font-bold">ስልክ ቁጥር</span> እና <span className="text-blue-700 font-bold">ፓስዎርድ</span> ይጠቀማሉ።
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
                  ? 'bg-blue-400 cursor-not-allowed shadow-none' 
                  : 'bg-blue-600 hover:bg-blue-500 hover:-translate-y-1 hover:shadow-blue-600/30'
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
                'ይመዝገቡ (Register)'
              )}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

// Wrapper to prevent crashes in isolated preview environments
const RegisterDistance = () => {
  const inRouterContext = useInRouterContext();
  if (!inRouterContext) {
    return (
      <MemoryRouter>
        <RegisterDistanceContent />
      </MemoryRouter>
    );
  }
  return <RegisterDistanceContent />;
};

export default RegisterDistance;
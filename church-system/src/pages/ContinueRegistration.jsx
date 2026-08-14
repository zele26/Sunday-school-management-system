import React, { useState, useEffect } from 'react';
import { Link, MemoryRouter, useInRouterContext } from 'react-router-dom';

import { API_BASE_URL } from '../api/apiClient';

const ContinueRegistrationContent = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [registration, setRegistration] = useState(null);
  
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);
  
  // Loading states
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/registrations/payment-info`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.message) setPaymentInfo(data);
      })
      .catch((err) => console.warn("Could not fetch payment info:", err));
  }, []);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setMessage('');
    setError('');
    setIsLoggingIn(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        if (data.studentType !== 'distance') {
          setError('ይህ የመደበኛ ተማሪ ምዝገባ ነው። ክፍያ አያስፈልገውም። (Not a distance student)');
          setIsLoggingIn(false);
          return;
        }
        setRegistration(data);
      } else {
        setError(data.message || 'የመግቢያ ውድቀት (Login Failed)');
      }
    } catch (err) {
      setError('የአውታረ መረብ ስህተት እባክዎ እንደገና ይሞክሩ (Network Error)');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFileUpload = async () => {
  if (!receiptFile) {
    setError('እባክዎ ደረሰኝ ይምረጡ (Please select a receipt)');
    return;
  }
  setError('');
  setMessage('');
  setUploading(true);

  const fd = new FormData();
  fd.append('file', receiptFile);
  fd.append('registrationNumber', registration.registrationNumber);   // ← ADD THIS LINE

  try {
    const res = await fetch(`${API_BASE_URL}/api/upload/receipt`, {
      method: 'POST',
      body: fd,
    });
    const data = await res.json();

    if (data.url) {
      setReceiptUrl(data.url);
      setMessage(data.message || 'ደረሰኝ በተሳካ ሁኔታ ተልኳል (Receipt uploaded successfully)');
    } else {
      setError(data.message || 'ደረሰኝ መላክ አልተሳካም (Upload failed)');
    }
  } catch (err) {
    setError('የአውታረ መረብ ስህተት (Network error during upload)');
  } finally {
    setUploading(false);
  }
};

  const handleSubmitReceipt = async () => {
    if (!receiptUrl) {
      setError('ደረሰኝ በመጀመሪያ ይላኩ (Please upload receipt first)');
      return;
    }
    setError('');
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations/upload-receipt`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: registration.registrationNumber,
          transactionRef,
          receiptUrl,
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || 'ደረሰኝ ማስገባት አልተሳካም (Failed to finalize)');
      }
    } catch (err) {
      setError('የአውታረ መረብ ስህተት (Network error)');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 text-sm placeholder:text-slate-400";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5 ml-1";

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50/50 font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-emerald-100 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">ምዝገባዎ ተጠናቋል</h2>
          <p className="text-slate-500 mb-6 leading-relaxed">
            የክፍያ ማረጋገጫዎ በተሳካ ሁኔታ ተልኳል።
          </p>
          
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">የምዝገባ ቁጥርዎ</p>
            <p className="text-2xl font-black text-emerald-600 tracking-widest">{registration.registrationNumber}</p>
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 mb-8 text-left">
            <p className="text-sm text-emerald-800 leading-relaxed">
              ማረጋገጫው በትምህርት ቤቱ ኃላፊ ሲጸድቅ በስልክዎና በፓስዎርድዎ ገብተው የሲስተሙን ሙሉ አገልግሎት ማግኘት ይችላሉ።
            </p>
          </div>

          <div className="space-y-3">
            <Link to="/login" className="block w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all">
              አሁን ይግቡ (Login)
            </Link>
            <Link to="/check-status" className="block w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3.5 rounded-xl font-bold transition-all">
              የምዝገባ ሁኔታ አረጋግጥ (Check Status)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center pt-20 px-4 font-sans">
        <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
              🔄
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              ቀጥል ምዝገባ
            </h1>
            <p className="text-slate-500">የርቀት ተማሪዎች ክፍያ ማጠናቀቂያ</p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-100">
            {error && (
              <div className="mb-6 p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm font-medium rounded-r-xl">
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className={labelClass}>ስልክ ቁጥር</label>
                <input
                  type="tel"
                  placeholder="09..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>ፓስዎርድ</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : 'ግባ (Login)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            የምዝገባ ማጠናቀቂያ
          </h1>
          <p className="text-slate-500">ክፍያዎን በማረጋገጥ ምዝገባዎን ያጠናቅቁ</p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
          
          {/* User Detail Banner */}
          <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">ተማሪ</p>
              <p className="text-lg font-bold text-slate-800">{registration.fullName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">የምዝገባ ቁጥር</p>
              <p className="font-mono font-bold text-blue-600">{registration.registrationNumber}</p>
            </div>
            <div className="w-full h-px bg-slate-200 my-1 sm:hidden"></div>
            <div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                registration.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                registration.status === 'Pending Verification' ? 'bg-amber-100 text-amber-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  registration.status === 'Approved' ? 'bg-emerald-500' :
                  registration.status === 'Pending Verification' ? 'bg-amber-500 animate-pulse' :
                  'bg-blue-500'
                }`}></span>
                {registration.status}
              </span>
            </div>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm font-medium rounded-r-xl">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm font-medium rounded-r-xl">
              {message}
            </div>
          )}

          {/* State: Pending Payment Form */}
          {registration.status === 'Pending Payment' && (
            <div className="space-y-8 border-t border-slate-100 pt-6">
              
              {/* Payment Instructions */}
              {paymentInfo && (
                <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">💰</span> የክፍያ መረጃ
                  </h3>
                  <div className="space-y-2 text-sm text-slate-700 mb-4">
                    <div className="flex justify-between border-b border-blue-100/50 pb-2">
                      <span>የክፍያ መጠን:</span>
                      <span className="font-semibold">{paymentInfo.contributionAmount} ብር</span>
                    </div>
                    <div className="flex justify-between border-b border-blue-100/50 pb-2">
                      <span>የትምህርት ቁሳቁስ:</span>
                      <span className="font-semibold">{paymentInfo.resourceFee} ብር</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="font-bold">ጠቅላላ:</span>
                      <span className="font-black text-blue-700 text-lg">{paymentInfo.totalAmount} ብር</span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-800/80 leading-relaxed bg-white/60 p-3 rounded-lg">
                    {paymentInfo.instructions}
                  </p>
                </div>
              )}

              {/* Upload Form */}
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>የክፍያ ማጣቀሻ ቁጥር (Transaction Reference) <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    placeholder="ለምሳሌ፡ FT23456789"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className={inputClass}
                  />
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed">
                  <label className={labelClass}>የክፍያ ደረሰኝ (ምስል ወይም PDF) <span className="text-rose-500">*</span></label>
                  <div className="mt-2 flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setReceiptFile(e.target.files[0])}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
                    />
                    <button
                      onClick={handleFileUpload}
                      disabled={uploading || !receiptFile}
                      className="w-full sm:w-auto whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-md"
                    >
                      {uploading ? (
                         <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : 'አፕሎድ (Upload)'}
                    </button>
                  </div>
                  {receiptUrl && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg font-medium">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      ደረሰኝ ተልኳል
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSubmitReceipt}
                    disabled={isSubmitting || !receiptUrl}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? 'በማስገባት ላይ...' : 'ምዝገባውን አጠናቅቅ (Finalize Registration)'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* State: Pending Verification */}
          {registration.status === 'Pending Verification' && (
            <div className="mt-8 bg-amber-50 rounded-2xl p-6 border border-amber-100 text-center">
              <div className="text-4xl mb-3">⏳</div>
              <h3 className="text-lg font-bold text-amber-900 mb-2">ማረጋገጫ በመጠበቅ ላይ</h3>
              <p className="text-amber-800 text-sm leading-relaxed max-w-md mx-auto">
                ደረሰኝዎ ደርሶናል። በትምህርት ቤቱ አስተዳደር ታይቶ ማረጋገጫ እስኪሰጥዎ ድረስ እባክዎ በትዕግስት ይጠብቁ።
              </p>
            </div>
          )}

          {/* State: Approved */}
          {registration.status === 'Approved' && (
            <div className="mt-8 bg-emerald-50 rounded-2xl p-6 border border-emerald-100 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-lg font-bold text-emerald-900 mb-2">ምዝገባዎ ጸድቋል!</h3>
              <p className="text-emerald-800 text-sm mb-6">
                ወደ ሲስተሙ በመግባት ትምህርትዎን መጀመር ይችላሉ።
              </p>
              <Link to="/login" className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all">
                ወደ ሲስተሙ ይግቡ
              </Link>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

const ContinueRegistration = () => {
  const inRouterContext = useInRouterContext();
  if (!inRouterContext) {
    return (
      <MemoryRouter>
        <ContinueRegistrationContent />
      </MemoryRouter>
    );
  }
  return <ContinueRegistrationContent />;
};

export default ContinueRegistration;
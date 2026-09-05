import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { API_BASE_URL } from '../api/apiClient';
import { BackButton } from '../components/ui';

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('የፋይል መጠን ከ 5MB መብለጥ የለበትም (File too large)');
      return;
    }

    setReceiptFile(file);
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations/upload-receipt`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setReceiptUrl(data.receiptUrl);
        setMessage('ደረሰኝ በተሳካ ሁኔታ ተጭኗል (Receipt uploaded)');
      } else {
        setError(data.message || 'ደረሰኝ መጫን አልተሳካም');
      }
    } catch (err) {
      setError('የአውታረ መረብ ስህተት በደረሰኝ ጭነት ወቅት');
    } finally {
      setUploading(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e?.preventDefault();
    if (!transactionRef) {
      setError('እባክዎ የክፍያ ማጣቀሻ ቁጥር (Transaction Ref) ያስገቡ');
      return;
    }
    if (!receiptUrl) {
      setError('እባክዎ የደረሰኝ ፎቶ ይጫኑ');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations/submit-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: registration.phone,
          transactionRef,
          receiptUrl,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.message || 'ክፍያ ማረጋገጥ አልተሳካም');
      }
    } catch (err) {
      setError('የአውታረ መረብ ስህተት');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 text-sm placeholder:text-slate-400";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5 ml-1";

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col justify-between items-center p-4 sm:p-6 bg-gradient-to-br from-blue-50/90 via-[#fdfdfc] to-amber-50/70 dark:from-[#050c1a] dark:via-[#09152b] dark:to-[#030710] font-sans">
        <header className="w-full max-w-xl mx-auto flex items-center justify-between py-2">
          <BackButton href="/" label="ወደ ዋናው ገጽ" subLabel="Back to Home" variant="glass" />
        </header>

        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-emerald-100 dark:border-slate-800 text-center animate-in zoom-in-95 duration-500 my-auto">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <svg className="w-10 h-10 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">ምዝገባዎ ተጠናቋል</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed text-sm">
            የክፍያ ማረጋገጫዎ በተሳካ ሁኔታ ተልኳል።
          </p>
          
          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">የምዝገባ ቁጥርዎ</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-widest">{registration.registrationNumber}</p>
          </div>

          <div className="bg-emerald-50/50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 mb-8 text-left">
            <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
              ማረጋገጫው በትምህርት ቤቱ ኃላፊ ሲጸድቅ በስልክዎና በፓስዎርድዎ ገብተው የሲስተሙን ሙሉ አገልግሎት ማግኘት ይችላሉ።
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/login" className="block w-full bg-[#1657b8] hover:bg-[#124796] text-white py-3.5 rounded-2xl font-black shadow-md hover:shadow-lg transition-all text-center text-sm">
              አሁን ይግቡ (Login)
            </Link>
            <Link href="/check-status" className="block w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3.5 rounded-2xl font-bold transition-all text-center text-sm">
              የምዝገባ ሁኔታ አረጋግጥ (Check Status)
            </Link>
          </div>
        </div>

        <footer className="py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት
        </footer>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/90 via-[#fdfdfc] to-amber-50/70 dark:from-[#050c1a] dark:via-[#09152b] dark:to-[#030710] flex flex-col justify-between items-center p-4 sm:p-6 font-sans">
        <header className="w-full max-w-xl mx-auto flex items-center justify-between py-2">
          <BackButton href="/" label="ወደ ዋናው ገጽ" subLabel="Back to Home" variant="glass" />
        </header>

        <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500 my-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-[#1657b8] dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-xs">
              🔄
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              ቀጥል ምዝገባ
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">የርቀት ተማሪዎች ክፍያ ማጠናቀቂያ</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border-l-4 border-rose-500 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-r-xl">
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
                  className="w-full bg-[#1657b8] hover:bg-[#124796] text-white py-3.5 rounded-2xl font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoggingIn ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : 'ግባ (Login)'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <footer className="py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/90 via-[#fdfdfc] to-amber-50/70 dark:from-[#050c1a] dark:via-[#09152b] dark:to-[#030710] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex items-center justify-between pb-2">
          <BackButton href="/" label="ወደ ዋናው ገጽ" subLabel="Back to Home" variant="glass" />
        </header>
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            የምዝገባ ማጠናቀቂያ
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">ክፍያዎን በማረጋገጥ ምዝገባዎን ያጠናቅቁ</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800">
          
          {/* User Detail Banner */}
          <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 mb-8">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">ተማሪ</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{registration.fullName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">የምዝገባ ቁጥር</p>
              <p className="font-mono font-bold text-[#1657b8] dark:text-amber-400">{registration.registrationNumber}</p>
            </div>
            <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-1 sm:hidden"></div>
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
                    className="w-full bg-emerald-600 hover:bg-emerald-500 active:opacity-90 text-white py-4 rounded-xl font-bold text-lg shadow-md shadow-emerald-600/20 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer"
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
              <Link href="/login" className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all">
                ወደ ሲስተሙ ይግቡ
              </Link>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default ContinueRegistrationContent;
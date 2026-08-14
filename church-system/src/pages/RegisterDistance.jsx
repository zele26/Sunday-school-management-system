import React, { useState, useEffect } from 'react';
import { Link, MemoryRouter, useInRouterContext } from 'react-router-dom';

import { API_BASE_URL } from '../api/apiClient';

const RegisterDistanceContent = () => {
  const [step, setStep] = useState('info'); // 'info', 'form', 'success'
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    educationLevel: '',
    profession: '',
    gender: 'Male',
    dateOfBirth: '',
    phone: '',
    grade: 'Batch 1', // set to Batch 1 for distance
    address: '',
    email: '',
    password: '',
    studentType: 'distance',
    // Emergency contact fields
    emergencyFirstName: '',
    emergencyMiddleName: '',
    emergencyLastName: '',
    relationship: 'Father',
    emergencyPhone: '',
    emergencyEmail: '',
    emergencyAddress: '',
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

    const firstName = formData.firstName.trim();
    const middleName = formData.middleName.trim();
    const lastName = formData.lastName.trim();
    const educationLevel = formData.educationLevel.trim();
    const profession = formData.profession.trim();

    // Basic validation
    if (!firstName || !middleName || !lastName || !educationLevel || !profession || !formData.phone || !formData.password) {
      setError('First name, middle name, last name, education level, profession, phone, and password are required.');
      return;
    }

    // Phone validation: exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('ስልክ ቁጥር በትክክል 10 አሃዝ መሆን አለበት (Phone must be exactly 10 digits).');
      return;
    }

    // Emergency contact validation
    if (!formData.emergencyFirstName || !formData.emergencyPhone) {
      setError('የአደጋ ጊዜ ተጠሪ ስም እና ስልክ ግዴታ ነው');
      return;
    }
    if (!phoneRegex.test(formData.emergencyPhone)) {
      setError('የአደጋ ጊዜ ተጠሪ ስልክ በትክክል 10 አሃዝ መሆን አለበት');
      return;
    }

    // Email optional but validated
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('ኢሜይል ትክክል አይደለም');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        firstName,
        middleName,
        lastName,
        educationLevel,
        profession,
        fullName: [firstName, middleName, lastName].filter(Boolean).join(' '),
        grade: 'Batch 1',
      };

      const res = await fetch(`${API_BASE_URL}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
            className="mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
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
            to="/continue-registration"
            className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
          >
            ደረሰኝ ለመላክ ይቀጥሉ (Continue Registration)
          </Link>

          <p className="text-xs text-slate-400 mt-4">
            ቀድሞውኑ ከፍለዋል? <Link to="/check-status" className="text-blue-600 underline">ሁኔታዎን ያረጋግጡ</Link>
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

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl shadow-sm flex items-center gap-3 animate-in slide-in-from-top-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Personal Info */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">👤</div>
              <h2 className="text-lg font-bold text-slate-800">የግል መረጃ (Personal Info)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>የመጀመሪያ ስም (First Name) <span className="text-rose-500">*</span></label>
                <input type="text" name="firstName" placeholder="የመጀመሪያ ስም" required value={formData.firstName} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>የአባት ስም (Middle Name) <span className="text-rose-500">*</span></label>
                <input type="text" name="middleName" placeholder="የመካከለኛ ስም" required value={formData.middleName} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>የአያት ስም (Last Name) <span className="text-rose-500">*</span></label>
                <input type="text" name="lastName" placeholder="የአባት/የእናት ስም" required value={formData.lastName} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>ዓለማዊ የትምህርት ደረጃ <span className="text-rose-500">*</span></label>
                <select name="educationLevel" required value={formData.educationLevel} onChange={handleChange} className={inputClass}>
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
              </div>
              <div>
                <label className={labelClass}>ሙያ <span className="text-rose-500">*</span></label>
                <input type="text" name="profession" placeholder="ሙያ" required value={formData.profession} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>ጾታ <span className="text-rose-500">*</span></label>
                <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                  <option value="Male">ወንድ</option>
                  <option value="Female">ሴት</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>የትውልድ ዘመን</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>ስልክ ቁጥር (10 አሃዝ) <span className="text-rose-500">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="09XXXXXXXX"
                  required
                  pattern="\d{10}"
                  maxLength="10"
                  title="በትክክል 10 አሃዝ ያስገቡ"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>ኢሜይል (Email) <span className="text-slate-400">(optional)</span></label>
                <input
                  type="email"
                  name="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                />
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
                <input type="text" name="address" placeholder="ከተማ፣ ክፍለ ከተማ፣ ወረዳ..." value={formData.address} onChange={handleChange} className={inputClass} />
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
                <input type="text" name="emergencyFirstName" placeholder="ስም" required value={formData.emergencyFirstName} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>የአባት ስም (Father Name)</label>
                <input type="text" name="emergencyMiddleName" placeholder="የአባት ስም" value={formData.emergencyMiddleName} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>የአያት ስም (Grandfather Name)</label>
                <input type="text" name="emergencyLastName" placeholder="የአያት ስም" value={formData.emergencyLastName} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>ዝምድና (Relationship) <span className="text-rose-500">*</span></label>
                <select name="relationship" value={formData.relationship} onChange={handleChange} className={inputClass}>
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
                  name="emergencyPhone"
                  placeholder="09XXXXXXXX"
                  required
                  pattern="\d{10}"
                  maxLength="10"
                  title="በትክክል 10 አሃዝ ያስገቡ"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>ኢሜይል (Email)</label>
                <input type="email" name="emergencyEmail" placeholder="email@example.com" value={formData.emergencyEmail} onChange={handleChange} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>አድራሻ (Address)</label>
                <input type="text" name="emergencyAddress" placeholder="አድራሻ" value={formData.emergencyAddress} onChange={handleChange} className={inputClass} />
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
                <input type="password" name="password" placeholder="ቢያንስ 6 ፊደላት/ቁጥሮች" required minLength={6} onChange={handleChange} className={inputClass} />
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
              disabled={loading}
              className={`w-full text-white py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${loading ? 'bg-blue-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-500 hover:-translate-y-1 hover:shadow-blue-600/30'
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
import React, { useState } from 'react';
import { Link, MemoryRouter, useInRouterContext } from 'react-router-dom';

import { API_BASE_URL } from '../api/apiClient';

const RegisterRegularContent = () => {
  const [step, setStep] = useState('info'); // 'info', 'form'
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    educationLevel: '',
    profession: '',
    gender: 'Male',
    dateOfBirth: '',
    phone: '',
    grade: 'Grade 7',
    address: '',
    email: '',
    password: '',
    studentType: 'regular',
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
  const [success, setSuccess] = useState(null);

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

    if (!firstName || !middleName || !lastName || !educationLevel || !profession || !formData.phone || !formData.password || !formData.grade) {
      setError('First name, middle name, last name, education level, profession, phone, grade, and password are required.');
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('ስልክ ቁጥር በትክክል 10 አሃዝ መሆን አለበት');
      return;
    }

    if (!formData.emergencyFirstName || !formData.emergencyPhone) {
      setError('የአደጋ ጊዜ ተጠሪ ስም እና ስልክ ግዴታ ነው');
      return;
    }
    if (!phoneRegex.test(formData.emergencyPhone)) {
      setError('የአደጋ ጊዜ ተጠሪ ስልክ 10 አሃዝ መሆን አለበት');
      return;
    }

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
      };

      const res = await fetch(`${API_BASE_URL}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  const inputClass = "w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700 text-sm placeholder:text-slate-400";
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
              የመደበኛ ተማሪ ምዝገባ መረጃ
            </h1>
            <p className="text-slate-500">እባክዎ ከመመዝገብዎ በፊት ያንብቡ</p>
          </div>

          <div className="space-y-6 text-left">
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
              <h2 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <span className="text-xl">📘</span> ለምን ይመዘገባሉ?
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                የመደበኛ ትምህርት በክፍል ደረጃ የሚሰጥ ሲሆን ተማሪዎች በአካል ተገኝተው ይማራሉ። ለመግባት መመዝገብ ግዴታ ነው።
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
                <li>ከተመዘገቡ በኋላ ማረጋገጫ ይጠብቁ።</li>
              </ul>
            </div>

            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
              <h2 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
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
            className="mt-8 w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5"
          >
            ወደ ምዝገባ ቀጥል (Proceed to Registration)
          </button>
        </div>
      </div>
    );
  }

  // ---------- SUCCESS STEP ----------
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-lg w-full bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-emerald-100 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2">ምዝገባ ተቀባይነት አግኝቷል</h2>
          <p className="text-slate-500 mb-6">እባክዎ የሚቀጥሉትን ደረጃዎች ይከተሉ</p>

          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 mb-6 text-sm text-slate-600">
            <span className="font-semibold text-emerald-600">የማመልከቻ ቁጥር፡</span>{' '}
            <span className="font-mono font-bold text-emerald-700">{success?.registrationNumber}</span>
            <br />
            <span className="text-xs text-slate-500">📌 ይህን ቁጥር ለክትትል ይጠቀሙ።</span>
          </div>

          <div className="text-left space-y-4 mb-8">
            <div className="flex items-start gap-3 bg-yellow-50/60 p-4 rounded-2xl border border-yellow-100">
              <span className="text-xl mt-0.5">1️⃣</span>
              <div>
                <p className="font-bold text-slate-800">ማረጋገጫ ይጠብቁ</p>
                <p className="text-sm text-slate-600 mt-1">
                  አስተዳደሩ መረጃዎን ከፈተሸ በኋላ ምዝገባዎ ይጸድቃል።
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
              <span className="text-xl mt-0.5">2️⃣</span>
              <div>
                <p className="font-bold text-slate-800">የትምህርት ቤት መለያ ያገኛሉ</p>
                <p className="text-sm text-slate-600 mt-1">
                  ምዝገባዎ ሲጸድቅ ትክክለኛውን የትምህርት ቤት መለያ (School ID) ይሰጥዎታል።
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-yellow-50/60 p-4 rounded-2xl border border-yellow-100">
              <span className="text-xl mt-0.5">3️⃣</span>
              <div>
                <p className="font-bold text-slate-800">ወደ ሲስተሙ ይግቡ</p>
                <p className="text-sm text-slate-600 mt-1">
                  በስልክ ቁጥርዎ እና በፓስዎርድዎ በመጠቀም ወደ ሲስተሙ መግባት ይችላሉ።
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/login"
            className="block w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5"
          >
            ወደ መግቢያ ይሂዱ (Go to Login)
          </Link>

          <p className="text-xs text-slate-400 mt-4">
            ሁኔታዎን ማየት ይፈልጋሉ? <Link to="/check-status" className="text-emerald-600 underline">ሁኔታዎን ያረጋግጡ</Link>
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
            የመደበኛ ተማሪ ምዝገባ
          </h1>
          <p className="text-slate-500">እባክዎ ከታች ያለውን ቅጽ በትክክል ይሙሉ</p>
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
                <label className={labelClass}>የሚገቡበት ክፍል <span className="text-rose-500">*</span></label>
                <select name="grade" value={formData.grade} onChange={handleChange} className={inputClass}>
                  {[
                    { label: '7ኛ ክፍል (Grade 7)', value: 'Grade 7' },
                    { label: '8ኛ ክፍል (Grade 8)', value: 'Grade 8' },
                    { label: '9ኛ ክፍል (Grade 9)', value: 'Grade 9' },
                    { label: '10ኛ ክፍል (Grade 10)', value: 'Grade 10' },
                    { label: '11ኛ ክፍል (Grade 11)', value: 'Grade 11' },
                    { label: '12ኛ ክፍል (Grade 12)', value: 'Grade 12' },
                  ].map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>መኖሪያ አድራሻ</label>
                <input type="text" name="address" placeholder="የክፍለ ከተማ፣ ወረዳ እና የቤት ቁጥር መረጃ" value={formData.address} onChange={handleChange} className={inputClass} />
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
                  በመለያዎ ወደ ሲስተሙ ለመግባት ከላይ ያስገቡትን <span className="text-blue-700 font-bold">ስልክ ቁጥር</span> እና ይህንን <span className="text-blue-700 font-bold">ፓስዎርድ</span> ይጠቀሙ።
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${loading ? 'bg-emerald-400 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-500 hover:-translate-y-1 hover:shadow-emerald-600/30'
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
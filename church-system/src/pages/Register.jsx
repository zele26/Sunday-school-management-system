import React, { useState } from 'react';
import bgImage from '../assets/Lidetachurch.jpg';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    role: 'student',
    fullName: '',
    email: '',
    password: '',
    city: '',
    wereda: '',
    kebele: '',
    phoneNumber: '',
    emergencyPersonName: '',
    emergencyPhone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      ...formData,
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase()
    };

    try {
      const res = await fetch('https://church-api-3l2c.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('ምዝገባ ተሳክቷል! (Registration Successful!)');
        window.location.href = '/login';
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Registration failed. Email might already exist.');
      }
    } catch (err) {
      setError('An unexpected error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center fixed inset-0 font-sans overflow-y-auto" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"></div>

      <div className="max-w-3xl w-full bg-slate-900/85 text-white rounded-3xl shadow-2xl p-6 sm:p-10 relative z-10 border border-slate-700/50 backdrop-blur-md my-auto max-h-[90vh] overflow-y-auto">
        
        <div className="mb-6 border-b border-slate-800 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">አዲስ መመዝገቢያ (Register)</h2>
            <p className="text-xs text-slate-400 mt-1">መረጃዎን በትክክል ይሙሉ</p>
          </div>
          <a href="/login" className="text-xs text-indigo-400 hover:underline">← ወደ መግቢያ ተመለስ</a>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <span>⚠️</span> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1">የተጠቃሚ ሚና (Role)</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-indigo-300 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="student">ተማሪ (Student)</option>
              <option value="teacher">መምህር (Teacher)</option>
            </select>
          </div>

          <input type="text" name="fullName" placeholder="ሙሉ ስም *" onChange={handleChange} required className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="email" name="email" placeholder="ኢሜይል *" onChange={handleChange} required className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="password" name="password" placeholder="ፓስዎርድ *" onChange={handleChange} required className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" name="phoneNumber" placeholder="ስልክ ቁጥር" onChange={handleChange} className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" name="city" placeholder="ከተማ" onChange={handleChange} className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" name="wereda" placeholder="ወረዳ" onChange={handleChange} className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" name="kebele" placeholder="ቀበሌ" onChange={handleChange} className="md:col-span-2 p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500" />

          {/* Emergency Contact */}
          <div className="md:col-span-2 pt-2 border-t border-slate-800 text-xs text-indigo-300 font-bold">
            የአደጋ ጊዜ ተጠሪ (Emergency Contact)
          </div>

          <input type="text" name="emergencyPersonName" placeholder="የተጠሪ ስም" onChange={handleChange} className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" name="emergencyPhone" placeholder="የተጠሪ ስልክ" onChange={handleChange} className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500" />

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'ይመዝገቡ (Submit Registration)'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
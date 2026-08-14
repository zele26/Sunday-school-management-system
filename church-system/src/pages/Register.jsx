// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/Lidetachurch.jpg';
import { API_BASE_URL } from '../api/apiClient';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    role: 'teacher',   // now fixed to teacher
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    wereda: '',
    kebele: '',
    phoneNumber: '',
    emergencyPersonName: '',
    emergencyPhone: '',
    // teacher-specific optional fields
    subject: '',
    experience: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.fullName.trim()) {
      return setError('Full name is required.');
    }
    if (!validateEmail(formData.email.trim())) {
      return setError('Please enter a valid email address.');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role,
      city: formData.city.trim(),
      wereda: formData.wereda.trim(),
      kebele: formData.kebele.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      emergencyPersonName: formData.emergencyPersonName.trim(),
      emergencyPhone: formData.emergencyPhone.trim(),
      // teacher-specific extra fields
      subject: formData.subject.trim(),
      experience: formData.experience.trim(),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess(data.message || 'Registration successful! Your account is pending admin approval.');
        setFormData({
          role: 'teacher',
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
          city: '',
          wereda: '',
          kebele: '',
          phoneNumber: '',
          emergencyPersonName: '',
          emergencyPhone: '',
          subject: '',
          experience: '',
        });
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const teacherSpecificFields = () => {
    return (
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
        <div className="text-xs text-indigo-300 font-bold md:col-span-2">📚 Teacher Info (optional)</div>
        <input
          type="text"
          name="subject"
          placeholder="Subject (e.g., Mathematics)"
          value={formData.subject}
          onChange={handleChange}
          className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          name="experience"
          placeholder="Years of Experience"
          value={formData.experience}
          onChange={handleChange}
          className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    );
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center fixed inset-0 font-sans overflow-y-auto"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"></div>

      <div className="max-w-3xl w-full bg-slate-900/85 text-white rounded-3xl shadow-2xl p-6 sm:p-10 relative z-10 border border-slate-700/50 backdrop-blur-md my-auto max-h-[90vh] overflow-y-auto">
        <div className="mb-6 border-b border-slate-800 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">አዲስ መምህር መመዝገቢያ (Teacher Registration)</h2>
            <p className="text-xs text-slate-400 mt-1">ለመምህራን ብቻ (Teachers only)</p>
          </div>
          <a href="/login" className="text-xs text-indigo-400 hover:underline">
            ← ወደ መግቢያ ተመለስ
          </a>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <span>⚠️</span> <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <span>✅</span> <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Role Selection – fixed to teacher */}
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1">የተጠቃሚ ሚና (Role)</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-indigo-300 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="teacher">መምህር (Teacher)</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              ተማሪዎች በአስተዳዳሪዎ በኩል ይመዘገባሉ። (Students are registered by an admin.)
            </p>
          </div>

          <input type="text" name="fullName" placeholder="ሙሉ ስም *" value={formData.fullName} onChange={handleChange} required className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="email" name="email" placeholder="ኢሜይል *" value={formData.email} onChange={handleChange} required className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="password" name="password" placeholder="ፓስዎርድ * (min. 6 characters)" value={formData.password} onChange={handleChange} required className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="password" name="confirmPassword" placeholder="ፓስዎርድ ያረጋግጡ *" value={formData.confirmPassword} onChange={handleChange} required className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500" />

          <input type="text" name="phoneNumber" placeholder="ስልክ ቁጥር" value={formData.phoneNumber} onChange={handleChange} className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" name="city" placeholder="ከተማ" value={formData.city} onChange={handleChange} className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" name="wereda" placeholder="ወረዳ" value={formData.wereda} onChange={handleChange} className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" name="kebele" placeholder="ቀበሌ" value={formData.kebele} onChange={handleChange} className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500" />

          <div className="md:col-span-2 pt-2 border-t border-slate-800 text-xs text-indigo-300 font-bold">
            የአደጋ ጊዜ ተጠሪ (Emergency Contact)
          </div>
          <input type="text" name="emergencyPersonName" placeholder="የተጠሪ ስም" value={formData.emergencyPersonName} onChange={handleChange} className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" name="emergencyPhone" placeholder="የተጠሪ ስልክ" value={formData.emergencyPhone} onChange={handleChange} className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500" />

          {/* Teacher-specific fields */}
          {teacherSpecificFields()}

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'ይመዝገቡ (Submit Registration)'
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          አካውንት አለዎት? <a href="/login" className="text-indigo-400 hover:underline">ይግቡ</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
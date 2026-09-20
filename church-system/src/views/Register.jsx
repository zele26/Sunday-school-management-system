'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import bgImage from '../assets/Lidetachurch.jpg';
import { API_BASE_URL } from '../api/apiClient';
import { Card, BackButton } from '../components/ui';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { useLanguage } from '../hooks/useLanguage';
import { Eye, EyeOff, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const Register = () => {
  const { t, isAmharic } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      return setError(t('enterFullName', 'እባክዎ ሙሉ ስምዎን ያስገቡ'));
    }
    if (!validateEmail(formData.email.trim())) {
      return setError(t('enterValidEmail', 'እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ'));
    }
    if (formData.password.length < 6) {
      return setError(t('passwordMin6', 'የይለፍ ቃል ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት'));
    }
    if (formData.password !== formData.confirmPassword) {
      return setError(t('passwordsDoNotMatch', 'የይለፍ ቃሎቹ አይመሳሰሉም'));
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
        setSuccess(data.message || t('teacherRegSuccess', 'ምዝገባዎ በተሳካ ሁኔታ ተከናውኗል! በአስተዳዳሪው ሲረጋገጥ ማሳወቂያ ይደርስዎታል።'));
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
        setError(data.message || t('teacherRegFailed', 'ምዝገባው አልተሳካም። እባክዎ እንደገና ይሞክሩ።'));
      }
    } catch (err) {
      setError(t('networkErrorRetry', 'የኔትወርክ ችግር አጋጥሟል። እባክዎ እንደገና ይሞክሩ።'));
    } finally {
      setLoading(false);
    }
  };

  const teacherSpecificFields = () => {
    return (
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
        <div className="text-xs text-indigo-300 font-bold md:col-span-2">
          {t('teacherInfoOptional', '📚 የመምህርነት መረጃ (አማራጭ)')}
        </div>
        <input
          type="text"
          name="subject"
          placeholder={t('subjectTaughtPlaceholder', 'የሚያስተምሩት የትምህርት ዓይነት')}
          value={formData.subject}
          onChange={handleChange}
          className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
        />
        <input
          type="text"
          name="experience"
          placeholder={t('teachingExperiencePlaceholder', 'የማስተማር ልምድ (በዓመታት)')}
          value={formData.experience}
          onChange={handleChange}
          className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 fixed inset-0 font-sans overflow-y-auto">
      {/* Background Image */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <Image
          src={bgImage}
          alt="Lideta Church Backdrop"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center transform scale-105"
        />
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" />
      </div>

      <Card variant="glass" padding="none" className="max-w-3xl w-full bg-slate-900/85 text-white rounded-3xl shadow-2xl p-6 sm:p-10 relative z-10 border border-slate-700/50 backdrop-blur-md my-auto max-h-[90vh] overflow-y-auto">
        <div className="mb-6 border-b border-slate-800 pb-4 flex flex-wrap justify-between items-center gap-2">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {t('teacherRegistrationTitle', 'አዲስ መምህር መመዝገቢያ')}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {t('forTeachersOnly', 'ለመምህራን ብቻ')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle className="bg-slate-800 text-xs text-white border-slate-700" />
            <ThemeToggle className="bg-slate-800 text-xs text-white border-slate-700" />
            <Link href="/login" className="text-xs text-indigo-400 hover:underline font-bold ml-2">
              {t('backToLogin', '← ወደ መግቢያ ተመለስ')}
            </Link>
          </div>
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
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {t('userRole', 'የተጠቃሚ ሚና')}
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-indigo-300 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="teacher">{t('roleTeacher', 'መምህር')}</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              {t('studentRegNoticeTeacher', 'ተማሪዎች በአስተዳዳሪው ወይም በተማሪዎች ምዝገባ ገጽ በኩል ይመዘገባሉ።')}
            </p>
          </div>

          <input
            type="text"
            name="fullName"
            placeholder={t('fullNameRequiredPlaceholder', 'ሙሉ ስም *')}
            value={formData.fullName}
            onChange={handleChange}
            required
            className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
          />
          <input
            type="email"
            name="email"
            placeholder={t('emailRequiredPlaceholder', 'ኢሜይል *')}
            value={formData.email}
            onChange={handleChange}
            required
            className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder={t('passwordMin6Placeholder', 'የይለፍ ቃል * (ቢያንስ 6 ቁምፊዎች)')}
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 pr-10 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder={t('confirmPasswordRequiredPlaceholder', 'የይለፍ ቃል ያረጋግጡ *')}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`w-full p-3 pr-10 bg-slate-800/90 border rounded-xl text-white text-xs outline-none focus:ring-2 placeholder-slate-400 ${
                formData.confirmPassword && formData.password === formData.confirmPassword
                  ? 'border-emerald-500 focus:ring-emerald-500/20'
                  : formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? 'border-rose-400 focus:ring-rose-500/20'
                  : 'border-slate-700 focus:ring-indigo-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {formData.confirmPassword && (
            <div className={`col-span-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold ${
              formData.password === formData.confirmPassword
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950/40 text-rose-300 border border-rose-800'
            }`}>
              {formData.password === formData.confirmPassword ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t('passwordMatchSuccess', 'የይለፍ ቃሉ በትክክል ተዛምዷል ✓')}</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{t('passwordMismatchError', 'የይለፍ ቃሉ አይዛመድም! እባክዎ በትክክል ያረጋግጡ ✕')}</span>
                </>
              )}
            </div>
          )}

          <input
            type="text"
            name="phoneNumber"
            placeholder={t('phonePlaceholder', 'ስልክ ቁጥር')}
            value={formData.phoneNumber}
            onChange={handleChange}
            className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
          />
          <input
            type="text"
            name="city"
            placeholder={t('cityPlaceholder', 'ከተማ')}
            value={formData.city}
            onChange={handleChange}
            className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
          />
          <input
            type="text"
            name="wereda"
            placeholder={t('woredaPlaceholder', 'ወረዳ')}
            value={formData.wereda}
            onChange={handleChange}
            className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
          />
          <input
            type="text"
            name="kebele"
            placeholder={t('kebelePlaceholder', 'ቀበሌ')}
            value={formData.kebele}
            onChange={handleChange}
            className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
          />

          <div className="md:col-span-2 pt-2 border-t border-slate-800 text-xs text-indigo-300 font-bold">
            {t('emergencyContactSection', 'የአደጋ ጊዜ ተጠሪ')}
          </div>
          <input
            type="text"
            name="emergencyPersonName"
            placeholder={t('emergencyPersonNamePlaceholder', 'የተጠሪ ስም')}
            value={formData.emergencyPersonName}
            onChange={handleChange}
            className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
          />
          <input
            type="text"
            name="emergencyPhone"
            placeholder={t('emergencyPhonePlaceholder', 'የተጠሪ ስልክ')}
            value={formData.emergencyPhone}
            onChange={handleChange}
            className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
          />

          {/* Teacher-specific fields */}
          {teacherSpecificFields()}

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              t('registerBtn', 'ይመዝገቡ')
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          {t('haveAccountQuestion', 'አካውንት አለዎት? ')}{' '}
          <Link href="/login" className="text-indigo-400 hover:underline font-bold">
            {t('login', 'ይግቡ')}
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
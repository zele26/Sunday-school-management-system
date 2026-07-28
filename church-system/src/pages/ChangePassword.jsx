// src/pages/ChangePassword.jsx
import React, { useState } from 'react';
import { apiFetch } from '../api/apiClient';
import { Link } from 'react-router-dom';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (newPassword !== confirmPassword) {
      return setMessage({ text: 'አዲሶቹ ፓስዎርዶች አይዛመዱም።', type: 'error' });
    }
    if (newPassword.length < 6) {
      return setMessage({ text: 'አዲሱ ፓስዎርድ ቢያንስ 6 ፊደላት ሊሆን ይገባል።', type: 'error' });
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'ፓስዎርድ በተሳካ ሁኔታ ተቀይሯል!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ text: data.message || 'ለውጡ አልተሳካም', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'የአውታረ መረብ ስህተት', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 transition-all space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </span>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">ፓስዎርድ ቀይር</h2>
        </div>
        <Link
          to="/teacher"
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50 px-3.5 py-2 rounded-xl transition-all border border-slate-200/60 flex items-center gap-1.5"
        >
          <span>←</span> ዳሽቦርድ
        </Link>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium shadow-sm border flex items-center gap-2.5 transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">አሁን ያለው ፓስዎርድ</label>
          <input
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">አዲስ ፓስዎርድ</label>
          <input
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">አዲሱን ያረጋግጡ</label>
          <input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold shadow-md shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none mt-2"
        >
          {loading ? 'በመቀየር ላይ…' : 'ፓስዎርድ ቀይር'}
        </button>
      </form>

      {message.type === 'success' && (
        <div className="pt-2 text-center border-t border-slate-100">
          <Link
            to="/teacher"
            className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            ወደ ዳሽቦርድ ሂድ
          </Link>
        </div>
      )}
    </div>
  );
};

export default ChangePassword;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Password reset link requested for: ${email}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 px-4">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
        <h2 className="text-2xl font-bold mb-2 text-center text-indigo-400">የይለፍ ቃል መልሶ ማግኛ (Forgot Password)</h2>
        <p className="text-slate-400 text-sm mb-6 text-center">
          Enter your email address to receive a password reset link.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-300">ኢሜይል (Email Address)</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="user@example.com"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition"
          >
            ላክ (Send Reset Link)
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/login" className="text-xs text-indigo-400 hover:underline">
            ← ወደ መግቢያ ተመለስ (Back to Login)
          </Link>
        </div>
      </div>
    </div>
  );
}
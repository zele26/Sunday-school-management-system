import React from 'react';
import bgImage from '../assets/Lidetachurch.jpg';

const ForgotPassword = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('ጥያቄው ተልኳል! (Request sent to Admin)');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center fixed inset-0 font-sans" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"></div>

      <div className="max-w-md w-full bg-slate-900/85 text-white rounded-3xl shadow-2xl p-8 relative z-10 border border-slate-700/50 backdrop-blur-md text-center space-y-6">
        <div>
          <h2 className="text-xl font-bold">ፓስዎርድ ለመቀየር</h2>
          <p className="mt-2 text-slate-400 text-xs leading-relaxed">
            እባክዎ ኢሜይልዎን ያስገቡ። የአስተዳዳሪው ክፍል መረጃዎን አረጋግጦ ፓስዎርድዎን ይቀይርልዎታል።
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="ኢሜይል አድራሻ"
            required
            className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-xs shadow-lg"
          >
            ጠይቅ (Send Request)
          </button>
        </form>

        <a href="/login" className="text-slate-400 hover:text-white text-xs block font-medium">
          ← ወደ መግቢያ ተመለስ
        </a>
      </div>
    </div>
  );
};

export default ForgotPassword;
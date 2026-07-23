import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import bgImage from '../assets/Lidetachurch.jpg';

const Login = () => {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    try {
      const response = await fetch('https://church-api-3l2c.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await response.json().catch(() => ({ message: 'Invalid server response.' }));

      if (response.ok) {
        loginStore(data.accessToken, data.user);
        const routes = { student: '/dashboard', admin: '/admin', teacher: '/teacher' };
        navigate(routes[data.user.role] || '/dashboard', { replace: true });
      } else {
        if (response.status === 403) {
          setError(data.message || 'Your account is not yet approved or has been rejected.');
        } else {
          setError(data.message || 'Login failed');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center fixed inset-0 font-sans" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"></div>
      
      <div className="max-w-4xl w-full bg-slate-900/85 text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-slate-700/50 backdrop-blur-md">
        
        {/* Left Branding */}
        <div className="md:w-5/12 bg-gradient-to-br from-indigo-900/90 via-blue-900/80 to-slate-900 p-8 text-white flex flex-col justify-between items-center text-center border-b md:border-b-0 md:border-r border-slate-700/50">
          <div className="space-y-4 my-auto">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/20 text-4xl shadow-inner">
              ⛪
            </div>
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
              ተክለሳዊሮስ ሰንበት ትምህርት ቤት
            </h1>
            <p className="text-xs text-indigo-200/80 font-medium">የተማሪዎች፣ የመምህራን እና የአስተዳደር መድረክ</p>
          </div>
          <div className="hidden md:block text-xs text-indigo-200/60 italic border-t border-white/10 pt-4 w-full">
            "ሕፃኑንም በሚሄድበት መንገድ መዝገበው"
          </div>
        </div>

        {/* Right Form */}
        <div className="md:w-7/12 p-8 bg-slate-900/60 flex flex-col justify-center">
          {error && (
            <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <span>⚠️</span> <span>{error}</span>
            </div>
          )}

          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">የአባል መግቢያ (Sign In)</h2>
              <p className="text-xs text-slate-400 mt-1">እባክዎ ኢሜይልዎን እና ፓስዎርድዎን ያስገቡ</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">ኢሜይል (Email)</label>
                <input
                  type="email"
                  name="email"
                  placeholder="example@gmail.com"
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">ፓስዎርድ (Password)</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'ይግቡ ➔'}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800 flex justify-between text-xs font-semibold text-indigo-400">
              <a href="/forgot-password" className="hover:underline">ፓስዎርድ ረስተዋል?</a>
              <a href="/register" className="hover:underline text-indigo-300">አዲስ አካውንት ይክፈቱ</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
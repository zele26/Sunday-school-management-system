// // src/pages/Login.jsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import useAuthStore from '../store/authStore';
// import bgImage from '../assets/Lidetachurch.jpg';

// const Login = () => {
//   const navigate = useNavigate();
//   const loginStore = useAuthStore((state) => state.login);
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const [error, setError] = useState('');

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     const payload = {
//       email: formData.email.trim().toLowerCase(),
//       password: formData.password,
//     };

//     try {
//       // ✅ Use the full Render API URL – no credentials needed
//       const response = await fetch('https://church-api-3l2c.onrender.com/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json().catch(() => ({ message: 'Invalid server response.' }));

//       if (response.ok) {
//         // Store the access token in Zustand (persisted to localStorage)
//         loginStore(data.accessToken, data.user);

//         const routes = { student: '/dashboard', admin: '/admin', teacher: '/teacher' };
//         navigate(routes[data.user.role] || '/dashboard', { replace: true });
//       } else {
//         if (response.status === 403) {
//           setError(data.message || 'Your account is not yet approved or has been rejected.');
//         } else {
//           setError(data.message || 'Login failed');
//         }
//       }
//     } catch (err) {
//       setError('Network error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center fixed inset-0 font-sans" style={{ backgroundImage: `url(${bgImage})` }}>
//       <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"></div>

//       <div className="max-w-4xl w-full bg-slate-900/85 text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-slate-700/50 backdrop-blur-md">

//         {/* Left Branding */}
//         <div className="md:w-5/12 bg-gradient-to-br from-indigo-900/90 via-blue-900/80 to-slate-900 p-8 text-white flex flex-col justify-between items-center text-center border-b md:border-b-0 md:border-r border-slate-700/50">
//           <div className="space-y-4 my-auto">
//             <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/20 text-4xl shadow-inner">
//               ⛪
//             </div>
//             <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
//               ተክለሳዊሮስ ሰንበት ትምህርት ቤት
//             </h1>
//             <p className="text-xs text-indigo-200/80 font-medium">የተማሪዎች፣ የመምህራን እና የአስተዳደር መድረክ</p>
//           </div>
//           <div className="hidden md:block text-xs text-indigo-200/60 italic border-t border-white/10 pt-4 w-full">
//             "ሕፃኑንም በሚሄድበት መንገድ መዝገበው"
//           </div>
//         </div>

//         {/* Right Form */}
//         <div className="md:w-7/12 p-8 bg-slate-900/60 flex flex-col justify-center">
//           {error && (
//             <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
//               <span>⚠️</span> <span>{error}</span>
//             </div>
//           )}

//           <div className="max-w-md mx-auto w-full space-y-6">
//             <div>
//               <h2 className="text-2xl font-bold text-white">የአባል መግቢያ (Sign In)</h2>
//               <p className="text-xs text-slate-400 mt-1">እባክዎ ኢሜይልዎን እና ፓስዎርድዎን ያስገቡ</p>
//             </div>

//             <form onSubmit={handleLogin} className="space-y-4">
//               <div>
//                 <label className="text-xs font-semibold text-slate-300 block mb-1">ኢሜይል (Email)</label>
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="example@gmail.com"
//                   onChange={handleChange}
//                   className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="text-xs font-semibold text-slate-300 block mb-1">ፓስዎርድ (Password)</label>
//                 <input
//                   type="password"
//                   name="password"
//                   placeholder="••••••••"
//                   onChange={handleChange}
//                   className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//                   required
//                 />
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
//               >
//                 {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'ይግቡ ➔'}
//               </button>
//             </form>

//             <div className="pt-4 border-t border-slate-800 flex justify-between text-xs font-semibold text-indigo-400">
//               <a href="/forgot-password" className="hover:underline">ፓስዎርድ ረስተዋል?</a>
//               <a href="/register" className="hover:underline text-indigo-300">አዲስ አካውንት ይክፈቱ</a>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default Login;



// src/pages/Login.jsx
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
      // ✅ Use the full Render API URL – no credentials needed
      const response = await fetch('https://church-api-3l2c.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({ message: 'Invalid server response.' }));

      if (response.ok) {
        // Store the access token in Zustand (persisted to localStorage)
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
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center fixed inset-0 font-sans selection:bg-indigo-500 selection:text-white"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Light, Soft Frosted Background Overlay */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"></div>

      {/* Clean, Light-Themed Card */}
      <div className="max-w-4xl w-full bg-white/95 text-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/60 backdrop-blur-xl">

        {/* Left Branding - Soft Indigo Theme */}
        <div className="md:w-5/12 bg-gradient-to-b from-indigo-900 to-slate-900 p-8 text-white flex flex-col justify-between items-center text-center">
          <div className="space-y-6 my-auto py-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/20 text-3xl shadow-sm">
              ⛪
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-wide text-white leading-snug">
                ተክለሳዊሮስ ሰንበት ትምህርት ቤት
              </h1>
              <div className="h-0.5 w-10 bg-indigo-400/60 mx-auto"></div>
              <p className="text-xs text-indigo-200 font-medium tracking-wider uppercase pt-1">
                የተማሪዎች፣ የመምህራን እና የአስተዳደር መድረክ
              </p>
            </div>
          </div>

          <div className="hidden md:block text-xs text-indigo-200/70 font-light italic border-t border-white/10 pt-4 w-full">
            "ሕፃኑንም በሚሄድበት መንገድ መዝገበው"
          </div>
        </div>

        {/* Right Form - Crisp, Bright & Minimal */}
        <div className="md:w-7/12 p-8 md:p-10 bg-white flex flex-col justify-center">
          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center gap-2.5 font-medium">
              <span>⚠️</span> 
              <span>{error}</span>
            </div>
          )}

          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                የአባል መግቢያ <span className="text-indigo-600 font-semibold text-base ml-1">(Sign In)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                እባክዎ ኢሜይልዎን እና ፓስዎርድዎን ያስገቡ
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  ኢሜይል (Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="example@gmail.com"
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  ፓስዎርድ (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>ይግቡ</span>
                    <span>➔</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
              <a 
                href="/forgot-password" 
                className="hover:text-indigo-600 transition-colors py-1"
              >
                ፓስዎርድ ረስተዋል?
              </a>
              <a 
                href="/register" 
                className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline underline-offset-4 transition-all py-1"
              >
                አዲስ አካውንት ይክፈቱ
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
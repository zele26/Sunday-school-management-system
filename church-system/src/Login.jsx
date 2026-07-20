// import React, { useState } from 'react';
// import bgImage from './assets/Lidetachurch.jpg';

// const Login = ({ onLogin }) => {
//   const [view, setView] = useState('login'); // 'login', 'signup', 'forgot'
//   const [formData, setFormData] = useState({
//     role: 'student', fullName: '', email: '', password: '',
//     city: '', wereda: '', kebele: '', phoneNumber: '',
//     emergencyPersonName: '', emergencyPhone: '', emergencyAddress: ''
//   });
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     const { email, password } = formData;
//     try {
//       // Fixed: Updated to live backend URL to allow phone & production logins
//       const response = await fetch('https://church-api-3l2c.onrender.com/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password })
//       });

//       let data = null;
//       try {
//         data = await response.json();
//       } catch {
//         data = { message: 'The server returned an invalid response.' };
//       }

//       if (response.ok) {
//         setError("");
//         localStorage.setItem('token', data.token);
//         localStorage.setItem('userRole', data.user.role);
//         localStorage.setItem('userName', data.user.name);

//         if (onLogin) onLogin();
        
//         if (data.user.role === 'student') {
//           window.location.href = '/profile';
//         } else if (data.user.role === 'admin') {
//           window.location.href = '/admin';
//         } else if (data.user.role === 'teacher') {
//           window.location.href = '/teacher';
//         } else {
//           window.location.href = '/dashboard';
//         }
//       } else {
//         setError(data.message || "Login failed");
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       setError("An unexpected error occurred. Please try again.");
//     }
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     try {
//       // Fixed: Updated to live backend URL to allow signups on production
//       const res = await fetch('https://church-api-3l2c.onrender.com/api/auth/signup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });
      
//       if (res.ok) {
//         alert("ምዝገባ ተሳክቷል!");
//         setView('login');
//       } else {
//         setError("Registration failed. Email might already exist.");
//       }
//     } catch (error) {
//       setError("An unexpected error occurred during signup.");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center fixed inset-0" 
//          style={{ backgroundImage: `url(${bgImage})` }}>
//       <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-[2px]"></div>

//       <div className="max-w-5xl w-full bg-white/95 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 backdrop-blur-sm">
        
//         {/* Left Branding */}
//         <div className="md:w-1/3 bg-blue-900/85 p-10 text-white flex flex-col justify-center items-center text-center">
//           <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 border border-white/30 text-3xl">⛪</div>
//           <h1 className="text-2xl font-bold">ተክለሳዊሮስ ሰንበት ትምህርት ቤት</h1>
//         </div>

//         {/* Right Forms */}
//         <div className="md:w-2/3 p-8 bg-white max-h-[90vh] overflow-y-auto rounded-r-3xl">
//           {error && <p className="text-red-500 bg-red-50 p-2 mb-4 rounded text-center">{error}</p>}

//           {view === 'login' ? (
//             <div className="max-w-sm mx-auto">
//               <h2 className="text-2xl font-bold mb-6 text-gray-800">የአባል መግቢያ</h2>
//               <form onSubmit={handleLogin} className="space-y-4">
//                 <input type="email" name="email" placeholder="ኢሜይል" onChange={handleChange} className="w-full p-3 border rounded-xl" required />
//                 <input type="password" name="password" placeholder="ፓስዎርድ" onChange={handleChange} className="w-full p-3 border rounded-xl" required />
//                 <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">ይግቡ</button>
//               </form>
//               <div className="mt-4 flex justify-between text-xs text-blue-600">
//                 <button onClick={() => setView('forgot')}>ፓስዎርድ ረስተዋል?</button>
//                 <button onClick={() => setView('signup')}>አዲስ አካውንት</button>
//               </div>
//             </div>
//           ) : view === 'signup' ? (
//             <div>
//               <h2 className="text-2xl font-bold mb-4">አዲስ መመዝገቢያ</h2>
//               <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <select name="role" onChange={handleChange} className="md:col-span-2 p-3 border rounded-xl bg-blue-50 font-bold">
//                   <option value="student">ተማሪ (Student)</option>
//                   <option value="teacher">መምህር (Teacher)</option>
//                 </select>
//                 <input type="text" name="fullName" placeholder="...</font>" placeholder="Rank/Name" placeholder="Ident" placeholder="ሙሉ ስም" onChange={handleChange} className="p-3 border rounded-xl" required />
//                 <input type="email" name="email" placeholder="ኢሜይል" onChange={handleChange} className="p-3 border rounded-xl" required />
//                 <input type="password" name="password" placeholder="ፓስዎርድ" onChange={handleChange} className="p-3 border rounded-xl" required />
//                 <input type="text" name="phoneNumber" placeholder="ስልክ ቁጥር" onChange={handleChange} className="p-3 border rounded-xl" />
//                 <input type="text" name="city" placeholder="ከተማ" onChange={handleChange} className="p-3 border rounded-xl" />
//                 <input type="text" name="wereda" placeholder="ወረዳ" onChange={handleChange} className="p-3 border rounded-xl" />
//                 <input type="text" name="kebele" placeholder="ቀበሌ" onChange={handleChange} className="p-3 border rounded-xl" />
//                 <div className="md:col-span-2 border-t pt-2 text-gray-500 font-bold">የአደጋ ጊዜ ተጠሪ</div>
//                 <input type="text" name="emergencyPersonName" placeholder="የተጠሪ ስም" onChange={handleChange} className="p-3 border rounded-xl" />
//                 <input type="text" name="emergencyPhone" placeholder="የተጠሪ ስልክ" onChange={handleChange} className="p-3 border rounded-xl" />
//                 <button className="md:col-span-2 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">ይመዝገቡ</button>
//               </form>
//               <button onClick={() => setView('login')} className="mt-4 text-blue-600 text-sm block mx-auto">ተመለስ</button>
//             </div>
//           ) : (
//             <div className="text-center">
//               <h2 className="text-2xl font-bold mb-4">ፓስዎርድ ለመቀየር</h2>
//               <p className="mb-4 text-gray-500 text-sm">እባክዎ ኢሜይልዎን ያስገቡ። የአስተዳዳሪው ክፍል ፓስዎርድዎን ይቀይርልዎታል።</p>
//               <input type="email" placeholder="ኢሜይል" className="w-full p-3 border rounded-xl mb-4" />
//               <button onClick={() => {alert("ጥያቄው ተልኳል!"); setView('login')}} className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold">ጠይቅ</button>
//               <button onClick={() => setView('login')} className="mt-4 text-blue-600">ተመለስ</button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;





import React, { useState } from 'react';
import bgImage from './assets/Lidetachurch.jpg';

const Login = ({ onLogin }) => {
  const [view, setView] = useState('login'); // 'login', 'signup', 'forgot'
  const [loading, setLoading] = useState(false);
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
    emergencyPhone: '',
    emergencyAddress: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { email, password } = formData;
    try {
      const response = await fetch('https://church-api-3l2c.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = { message: 'The server returned an invalid response.' };
      }

      if (response.ok) {
        setError('');
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userName', data.user.name || data.user.fullName);

        if (onLogin) onLogin();

        if (data.user.role === 'student') {
          window.location.href = '/dashboard';
        } else if (data.user.role === 'admin') {
          window.location.href = '/admin';
        } else if (data.user.role === 'teacher') {
          window.location.href = '/teacher';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('https://church-api-3l2c.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert('ምዝገባ ተሳክቷል!');
        setView('login');
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
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-cover bg-center fixed inset-0 font-sans overflow-y-auto"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"></div>

      {/* Main Glassmorphism Card */}
      <div className="max-w-4xl w-full bg-slate-900/85 text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-slate-700/50 backdrop-blur-md my-auto">
        
        {/* Left Branding */}
        <div className="md:w-5/12 bg-gradient-to-br from-indigo-900/90 via-blue-900/80 to-slate-900 p-8 md:p-10 text-white flex flex-col justify-between items-center text-center relative border-b md:border-b-0 md:border-r border-slate-700/50">
          <div className="space-y-4 my-auto">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/20 text-4xl shadow-inner backdrop-blur-md">
              ⛪
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wide leading-snug bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                ተክለሳዊሮስ ሰንበት ትምህርት ቤት
              </h1>
              <p className="text-xs text-indigo-200/80 mt-2 font-medium">
                የተማሪዎች፣ የመምህራን እና የአስተዳደር መድረክ
              </p>
            </div>
          </div>

          <div className="hidden md:block text-xs text-indigo-200/60 italic border-t border-white/10 pt-4 w-full">
            "ሕፃኑንም በሚሄድበት መንገድ መዝገበው"
          </div>
        </div>

        {/* Right Dynamic Forms */}
        <div className="md:w-7/12 p-6 sm:p-10 bg-slate-900/60 flex flex-col justify-center max-h-[85vh] overflow-y-auto custom-scrollbar">
          
          {/* Error Notice Box */}
          {error && (
            <div className="mb-6 p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* VIEW 1: LOGIN */}
          {view === 'login' ? (
            <div className="max-w-md mx-auto w-full space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">የአባል መግቢያ (Sign In)</h2>
                <p className="text-xs text-slate-400 mt-1">እባክዎ ኢሜይልዎን እና ፓስዎርድዎን ያስገቡ</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">ኢሜይል (Email)</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="example@gmail.com"
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">ፓስዎርድ (Password)</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>ይግቡ</span>
                      <span>➔</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-slate-800 flex justify-between text-xs font-semibold text-indigo-400">
                <button onClick={() => { setError(''); setView('forgot'); }} className="hover:underline">
                  ፓስዎርድ ረስተዋል?
                </button>
                <button onClick={() => { setError(''); setView('signup'); }} className="hover:underline text-indigo-300">
                  አዲስ አካውንት ይክፈቱ
                </button>
              </div>
            </div>
          ) : view === 'signup' ? (

            /* VIEW 2: SIGNUP */
            <div className="w-full space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">አዲስ መመዝገቢያ (Register)</h2>
                <p className="text-xs text-slate-400 mt-1">መረጃዎን በትክክል ይሙሉ</p>
              </div>

              <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">የተጠቃሚ ሚና (Role)</label>
                  <select
                    name="role"
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-indigo-300 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="student">ተማሪ (Student)</option>
                    <option value="teacher">መምህር (Teacher)</option>
                  </select>
                </div>

                <div>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="ሙሉ ስም *"
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="ኢሜይል *"
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="ፓስዎርድ *"
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="phoneNumber"
                    placeholder="ስልክ ቁጥር"
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="city"
                    placeholder="ከተማ"
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="wereda"
                    placeholder="ወረዳ"
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <input
                    type="text"
                    name="kebele"
                    placeholder="ቀበሌ"
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Emergency Contact */}
                <div className="md:col-span-2 pt-2 border-t border-slate-800 text-xs text-indigo-300 font-bold">
                  የአደጋ ጊዜ ተጠሪ (Emergency Contact)
                </div>

                <div>
                  <input
                    type="text"
                    name="emergencyPersonName"
                    placeholder="የተጠሪ ስም"
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="emergencyPhone"
                    placeholder="የተጠሪ ስልክ"
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="md:col-span-2 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'ይመዝገቡ (Submit Registration)'
                  )}
                </button>
              </form>

              <button
                onClick={() => { setError(''); setView('login'); }}
                className="mt-2 text-slate-400 hover:text-white text-xs block mx-auto font-medium"
              >
                ← ወደ መግቢያ ተመለስ
              </button>
            </div>
          ) : (

            /* VIEW 3: FORGOT PASSWORD */
            <div className="max-w-md mx-auto w-full text-center space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">ፓስዎርድ ለመቀየር</h2>
                <p className="mt-2 text-slate-400 text-xs leading-relaxed">
                  እባክዎ ኢሜይልዎን ያስገቡ። የአስተዳዳሪው ክፍል መረጃዎን አረጋግጦ ፓስዎርድዎን ይቀይርልዎታል።
                </p>
              </div>

              <input
                type="email"
                placeholder="ኢሜይል አድራሻ"
                className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
              />

              <button
                onClick={() => {
                  alert('ጥያቄው ተልኳል!');
                  setError('');
                  setView('login');
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
              >
                ጠይቅ (Send Request)
              </button>

              <button
                onClick={() => { setError(''); setView('login'); }}
                className="text-slate-400 hover:text-white text-xs block mx-auto"
              >
                ← ተመለስ
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
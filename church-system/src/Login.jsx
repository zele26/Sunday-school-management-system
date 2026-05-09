import React, { useState } from 'react';
import bgImage from './assets/Lidetachurch.jpg';

const Login = ({ onLogin }) => {
  const [view, setView] = useState('login'); // 'login', 'signup', 'forgot'
  const [formData, setFormData] = useState({
    role: 'student', fullName: '', email: '', password: '',
    city: '', wereda: '', kebele: '', phoneNumber: '',
    emergencyPersonName: '', emergencyPhone: '', emergencyAddress: ''
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setError("");
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userName', data.user.name);

        if (onLogin) onLogin();
        // Redirect based on role
        if (data.user.role === 'student') {
          window.location.href = '/profile';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };
  const handleSignup = async (e) => {
    e.preventDefault();
    console.log("DEBUG: Data being sent to server ->", formData); // Check your F12 console for this!
    const res = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      alert("ምዝገባ ተሳክቷል!");
      setView('login');
    } else {
      setError("Registration failed. Email might already exist.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center fixed inset-0" 
         style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-[2px]"></div>

      <div className="max-w-5xl w-full bg-white/95 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 backdrop-blur-sm">
        
        {/* Left Branding */}
        <div className="md:w-1/3 bg-blue-900/85 p-10 text-white flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 border border-white/30 text-3xl">⛪</div>
          <h1 className="text-2xl font-bold">ተክለሳዊሮስ ሰንበት ትምህርት ቤት</h1>
        </div>

        {/* Right Forms */}
        <div className="md:w-2/3 p-8 bg-white max-h-[90vh] overflow-y-auto rounded-r-3xl">
          {error && <p className="text-red-500 bg-red-50 p-2 mb-4 rounded text-center">{error}</p>}

          {view === 'login' ? (
            <div className="max-w-sm mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">የአባል መግቢያ</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" name="email" placeholder="ኢሜይል" onChange={handleChange} className="w-full p-3 border rounded-xl" required />
                <input type="password" name="password" placeholder="ፓስዎርድ" onChange={handleChange} className="w-full p-3 border rounded-xl" required />
                <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">ይግቡ</button>
              </form>
              <div className="mt-4 flex justify-between text-xs text-blue-600">
                <button onClick={() => setView('forgot')}>ፓስዎርድ ረስተዋል?</button>
                <button onClick={() => setView('signup')}>አዲስ አካውንት</button>
              </div>
            </div>
          ) : view === 'signup' ? (
            <div>
              <h2 className="text-2xl font-bold mb-4">አዲስ መመዝገቢያ</h2>
              <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select name="role" onChange={handleChange} className="md:col-span-2 p-3 border rounded-xl bg-blue-50 font-bold">
                  <option value="student">ተማሪ (Student)</option>
                  <option value="teacher">መምህር (Teacher)</option>
                </select>
                <input type="text" name="fullName" placeholder="ሙሉ ስም" onChange={handleChange} className="p-3 border rounded-xl" required />
                <input type="email" name="email" placeholder="ኢሜይል" onChange={handleChange} className="p-3 border rounded-xl" required />
                <input type="password" name="password" placeholder="ፓስዎርድ" onChange={handleChange} className="p-3 border rounded-xl" required />
                <input type="text" name="phoneNumber" placeholder="ስልክ ቁጥር" onChange={handleChange} className="p-3 border rounded-xl" />
                <input type="text" name="city" placeholder="ከተማ" onChange={handleChange} className="p-3 border rounded-xl" />
                <input type="text" name="wereda" placeholder="ወረዳ" onChange={handleChange} className="p-3 border rounded-xl" />
                <input type="text" name="kebele" placeholder="ቀበሌ" onChange={handleChange} className="p-3 border rounded-xl" />
                <div className="md:col-span-2 border-t pt-2 text-gray-500 font-bold">የአደጋ ጊዜ ተጠሪ</div>
                <input type="text" name="emergencyPersonName" placeholder="የተጠሪ ስም" onChange={handleChange} className="p-3 border rounded-xl" />
                <input type="text" name="emergencyPhone" placeholder="የተጠሪ ስልክ" onChange={handleChange} className="p-3 border rounded-xl" />
                <button className="md:col-span-2 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">ይመዝገቡ</button>
              </form>
              <button onClick={() => setView('login')} className="mt-4 text-blue-600 text-sm block mx-auto">ተመለስ</button>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">ፓስዎርድ ለመቀየር</h2>
              <p className="mb-4 text-gray-500 text-sm">እባክዎ ኢሜይልዎን ያስገቡ። የአስተዳዳሪው ክፍል ፓስዎርድዎን ይቀይርልዎታል።</p>
              <input type="email" placeholder="ኢሜይል" className="w-full p-3 border rounded-xl mb-4" />
              <button onClick={() => {alert("ጥያቄው ተልኳል!"); setView('login')}} className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold">ጠይቅ</button>
              <button onClick={() => setView('login')} className="mt-4 text-blue-600">ተመለስ</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
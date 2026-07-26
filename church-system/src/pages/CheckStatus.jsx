import React, { useState } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const CheckStatus = () => {
  const [regNumber, setRegNumber] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');

  const handleCheck = async () => {
    setMessage('');
    const res = await fetch(`${API_BASE_URL}/api/registrations/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationNumber: regNumber, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setResult(data);
    } else {
      setMessage(data.message || 'ስህተት');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">የምዝገባ ሁኔታ ማረጋገጫ</h2>
      {!result ? (
        <div>
          <input type="text" placeholder="የምዝገባ ቁጥር" value={regNumber} onChange={e => setRegNumber(e.target.value)} className="w-full p-2 border rounded-xl mb-2" />
          <input type="password" placeholder="ፓስዎርድ" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded-xl mb-4" />
          <button onClick={handleCheck} className="w-full bg-blue-600 text-white p-2 rounded-xl">አረጋግጥ</button>
        </div>
      ) : (
        <div>
          <p><strong>ስም:</strong> {result.fullName}</p>
          <p><strong>የምዝገባ ሁኔታ:</strong> {result.status}</p>
          {result.status === 'Approved' && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-xl">
              <p className="font-bold">የተማሪ መለያ ቁጥር (Student ID):</p>
              <p className="text-2xl font-mono">{result.studentId}</p>
              <p className="text-sm mt-2">አሁን በዚህ መለያ ቁጥር እና በፓስዎርድዎ ይግቡ።</p>
            </div>
          )}
        </div>
      )}
      {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
    </div>
  );
};

export default CheckStatus;
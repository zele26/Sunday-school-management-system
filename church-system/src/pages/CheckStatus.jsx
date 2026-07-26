// src/pages/CheckStatus.jsx
import React, { useState } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

// Helper: translate raw status + studentType into a clear Amharic message
const getStatusMessage = (status, studentType) => {
  if (studentType === 'regular') {
    switch (status) {
      case 'Pending Payment':
        // Regular students never pay – so this shouldn't happen, but just in case
        return 'ማረጋገጫ በመጠበቅ ላይ ነው። ምዝገባዎ በትምህርት ቤቱ ኃላፊ ሲጸድቅ መግባት ይችላሉ።';
      case 'Pending Verification':
        return 'ማረጋገጫ በመጠበቅ ላይ ነው። ምዝገባዎ በትምህርት ቤቱ ኃላፊ ሲጸድቅ መግባት ይችላሉ።';
      case 'Approved':
        return 'ምዝገባዎ ጸድቋል! አሁን መግባት ይችላሉ።';
      case 'Rejected':
        return 'ምዝገባዎ ውድቅ ተደርጓል። እባክዎ ለበለጠ መረጃ ትምህርት ቤቱን ያግኙ።';
      default:
        return 'ሁኔታዎ እየተዘመነ ነው። እባክዎ ይጠብቁ።';
    }
  } else {
    // distance student
    switch (status) {
      case 'Pending Payment':
        return 'ክፍያ በመጠበቅ ላይ ነው። እባክዎ ክፍያ ከፍለው "ምዝገባዎን ይቀጥሉ" የሚለውን በመጫን ደረሰኝዎን ያስገቡ።';
      case 'Pending Verification':
        return 'ደረሰኝዎ ተቀባይነት አግኝቷል። ማረጋገጫ በመጠበቅ ላይ ነው።';
      case 'Approved':
        return 'ምዝገባዎ ጸድቋል! አሁን መግባት ይችላሉ።';
      case 'Rejected':
        return 'ምዝገባዎ ውድቅ ተደርጓል። እባክዎ ለበለጠ መረጃ ትምህርት ቤቱን ያግኙ።';
      default:
        return 'ሁኔታዎ እየተዘመነ ነው። እባክዎ ይጠብቁ።';
    }
  }
};

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
          <input
            type="text"
            placeholder="የምዝገባ ቁጥር"
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            className="w-full p-2 border rounded-xl mb-2"
          />
          <input
            type="password"
            placeholder="ፓስዎርድ"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded-xl mb-4"
          />
          <button
            onClick={handleCheck}
            className="w-full bg-blue-600 text-white p-2 rounded-xl"
          >
            አረጋግጥ
          </button>
        </div>
      ) : (
        <div>
          <p>
            <strong>ስም:</strong> {result.fullName}
          </p>
          <p>
            <strong>የምዝገባ ቁጥር:</strong> {result.registrationNumber}
          </p>

          {/* Translatable status message */}
          <p className="mt-3 text-sm">
            {getStatusMessage(result.status, result.studentType)}
          </p>

          {/* Show Student ID only if approved */}
          {result.status === 'Approved' && result.studentId && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-xl">
              <p className="font-bold">የተማሪ መለያ ቁጥር (Student ID):</p>
              <p className="text-2xl font-mono">{result.studentId}</p>
              <p className="text-sm mt-2">
                አሁን በዚህ መለያ ቁጥር እና በፓስዎርድዎ ይግቡ።
              </p>
              <a
                href="/login"
                className="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm"
              >
                ይግቡ
              </a>
            </div>
          )}

          {/* Show a link to Continue Registration only for distance students who still need to pay */}
          {result.studentType === 'distance' && result.status === 'Pending Payment' && (
            <div className="mt-4">
              <a href="/continue-registration" className="text-blue-600 underline">
                ምዝገባዎን ይቀጥሉ
              </a>
            </div>
          )}
        </div>
      )}
      {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
    </div>
  );
};

export default CheckStatus;
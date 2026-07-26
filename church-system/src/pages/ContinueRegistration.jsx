// src/pages/ContinueRegistration.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const ContinueRegistration = () => {
  const [regNumber, setRegNumber] = useState('');
  const [password, setPassword] = useState('');
  const [registration, setRegistration] = useState(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [message, setMessage] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);   // NEW – show final confirmation

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/registrations/payment-info`)
      .then(res => res.json())
      .then(data => { if (!data.message) setPaymentInfo(data); })
      .catch(() => {});
  }, []);

  const handleLogin = async () => {
    setMessage('');
    const res = await fetch(`${API_BASE_URL}/api/registrations/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationNumber: regNumber, password }),
    });
    const data = await res.json();
    if (res.ok) {
      if (data.studentType !== 'distance') {
        setMessage('ይህ የመደበኛ ተማሪ ምዝገባ ነው። ክፍያ አያስፈልገውም።');
        return;
      }
      setRegistration(data);
    } else {
      setMessage(data.message || 'የመግቢያ ውድቀት');
    }
  };

  const handleFileUpload = async () => {
    if (!receiptFile) return setMessage('ደረሰኝ ይምረጡ');
    setUploading(true);
    const fd = new FormData(); fd.append('file', receiptFile);
    const res = await fetch(`${API_BASE_URL}/api/upload/receipt`, { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) {
      setReceiptUrl(data.url);
      setMessage('ደረሰኝ ተልኳል');
    } else {
      setMessage('ደረሰኝ መላክ አልተሳካም');
    }
    setUploading(false);
  };

  const handleSubmitReceipt = async () => {
    if (!receiptUrl) return setMessage('ደረሰኝ በመጀመሪያ ይላኩ');
    const res = await fetch(`${API_BASE_URL}/api/registrations/upload-receipt`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationNumber: registration.registrationNumber, transactionRef, receiptUrl }),
    });
    const data = await res.json();
    if (data.success) {
      setSubmitted(true);   // show final confirmation
    } else {
      setMessage(data.message || 'ደረሰኝ ማስገባት አልተሳካም');
    }
  };

  // ----- After successful receipt upload – show final confirmation -----
  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow text-center">
        <h2 className="text-2xl font-bold text-emerald-700 mb-4">✅ ምዝገባዎ ተጠናቋል</h2>
        <p className="text-slate-600">የምዝገባ ቁጥርዎ: <strong>{registration.registrationNumber}</strong></p>
        <p className="mt-4 text-sm text-slate-500">
          ማረጋገጫው በትምህርት ቤቱ ኃላፊ ሲጸድቅ በኢሜይልዎና በፓስዎርድዎ ገብተው ማየት ይችላሉ።
        </p>
        <div className="mt-6 space-y-3">
          <Link to="/login" className="block bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold">
            አሁን ይግቡ
          </Link>
          <Link to="/check-status" className="block text-blue-600 underline text-sm">
            የምዝገባ ሁኔታ አረጋግጥ
          </Link>
        </div>
      </div>
    );
  }

  // ----- Login screen -----
  if (!registration) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">ቀጥል ምዝገባ (ለርቀት ተማሪዎች)</h2>
        <p className="text-sm text-slate-500 mb-4">እባክዎ ሲመዘገቡ የተሰጠዎትን የምዝገባ ቁጥርና ፓስዎርድ ያስገቡ።</p>
        <input type="text" placeholder="የምዝገባ ቁጥር" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} className="w-full p-2 border rounded-xl mb-2" />
        <input type="password" placeholder="ፓስዎርድ" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded-xl mb-4" />
        <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-2 rounded-xl">ግባ</button>
        {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
      </div>
    );
  }

  // ----- Payment screen -----
  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">የምዝገባ ማጠናቀቂያ</h2>
      <p><strong>ስም:</strong> {registration.fullName}</p>
      <p><strong>የምዝገባ ቁጥር:</strong> {registration.registrationNumber}</p>
      <p><strong>ሁኔታ:</strong> {registration.status}</p>

      {registration.status === 'Pending Payment' && (
        <div className="mt-4">
          {paymentInfo && (
            <div className="bg-slate-50 p-3 rounded-xl mb-3">
              <p><strong>የክፍያ መጠን:</strong> {paymentInfo.contributionAmount} ብር</p>
              <p><strong>የትምህርት ቁሳቁስ:</strong> {paymentInfo.resourceFee} ብር</p>
              <p className="font-bold">ጠቅላላ: {paymentInfo.totalAmount} ብር</p>
              <p className="text-sm mt-1">{paymentInfo.instructions}</p>
            </div>
          )}
          <input type="text" placeholder="የክፍያ ማጣቀሻ ቁጥር" value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} className="w-full p-2 border rounded-xl mt-2" />
          <label className="block text-sm font-medium mt-2">የክፍያ ደረሰኝ (ምስል ወይም PDF)</label>
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setReceiptFile(e.target.files[0])} className="w-full p-2 border rounded-xl mt-1" />
          <button onClick={handleFileUpload} disabled={uploading || !receiptFile} className="w-full bg-blue-600 text-white p-2 rounded-xl mt-2 disabled:opacity-50">
            {uploading ? 'በመላክ ላይ…' : 'ደረሰኝ ላክ'}
          </button>
          {receiptUrl && <p className="text-xs text-emerald-600 mt-1">✅ ደረሰኝ ተልኳል</p>}
          <button onClick={handleSubmitReceipt} className="w-full bg-green-600 text-white p-2 rounded-xl mt-3">
            ምዝገባውን አጠናቅቅ (Finalize Registration)
          </button>
        </div>
      )}
      {registration.status === 'Pending Verification' && (
        <p className="text-emerald-600 mt-4">ደረሰኝዎ ተቀባይነት አግኝቷል። እባክዎ ይጠብቁ።</p>
      )}
      {registration.status === 'Approved' && (
        <p className="text-emerald-600 mt-4">ምዝገባዎ ጸድቋል! <a href="/login" className="underline">ይግቡ</a></p>
      )}
      {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
    </div>
  );
};

export default ContinueRegistration;
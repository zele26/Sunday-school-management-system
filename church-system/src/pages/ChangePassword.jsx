// src/pages/ChangePassword.jsx
import React, { useState } from 'react';
import { apiFetch } from '../api/apiClient';

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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">ፓስዎርድ ቀይር</h2>
      {message.text && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="password" placeholder="አሁን ያለው ፓስዎርድ" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full p-2 border rounded-xl" />
        <input type="password" placeholder="አዲስ ፓስዎርድ" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full p-2 border rounded-xl" />
        <input type="password" placeholder="አዲሱን ያረጋግጡ" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full p-2 border rounded-xl" />
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700">
          {loading ? 'በመቀየር ላይ…' : 'ፓስዎርድ ቀይር'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
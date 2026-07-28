// src/components/ChangePasswordModal.jsx
import React, { useState } from 'react';
import { apiFetch } from '../api/apiClient';
import useAuthStore from '../store/authStore';

const ChangePasswordModal = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalClosed, setModalClosed] = useState(false);   // NEW

  const updateUser = useAuthStore((state) => state.updateUser);   // NEW – we'll add this to the store

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      return setError('አዲሶቹ ፓስዎርዶች አይዛመዱም።');
    }
    if (newPassword.length < 6) {
      return setError('አዲሱ ፓስዎርድ ቢያንስ 6 ፊደላት ሊሆን ይገባል።');
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('ፓስዎርድ ተቀይሯል!');

        // Update the user object in Zustand to clear the flag
        updateUser({ mustChangePassword: false });

        // Wait 1 second then close the modal
        setTimeout(() => {
          setModalClosed(true);
        }, 1000);
      } else {
        setError(data.message || 'ለውጡ አልተሳካም');
      }
    } catch (err) {
      setError('የአውታረ መረብ ስህተት');
    } finally {
      setLoading(false);
    }
  };

  // Don't render the modal if it's already closed
  if (modalClosed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold text-slate-800 mb-2">የመጀመሪያ ፓስዎርድ ለውጥ</h2>
        <p className="text-xs text-slate-500 mb-4">
          እባክዎ አሁን ያለውን ፓስዎርድ እና አዲስ ፓስዎርድ ያስገቡ
        </p>

        {error && <div className="mb-3 p-2 bg-rose-50 text-rose-700 rounded-xl text-xs">{error}</div>}
        {success && <div className="mb-3 p-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="password" placeholder="አሁን ያለው ፓስዎርድ" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full p-2 border rounded-xl text-sm" />
          <input type="password" placeholder="አዲስ ፓስዎርድ (ቢያንስ 6)" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full p-2 border rounded-xl text-sm" />
          <input type="password" placeholder="አዲሱን ያረጋግጡ" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full p-2 border rounded-xl text-sm" />
          <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700">
            {loading ? 'በመቀየር ላይ…' : 'ፓስዎርድ ቀይር'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
import React, { useState } from 'react';
import { apiFetch } from '../api/apiClient';
import useAuthStore from '../store/authStore';

const ChangePasswordModal = ({ isOpen = true, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const updateUser = useAuthStore((state) => state.updateUser || state.login);
  const user = useAuthStore((state) => state.user);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (newPassword.length < 6) {
      return setMsg({ type: 'error', text: 'ፓስዎርድ ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት።' });
    }
    if (newPassword !== confirmPassword) {
      return setMsg({ type: 'error', text: 'የገቡት ፓስዎርዶች አይመሳሰሉም!' });
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: 'ፓስዎርድዎ በተሳካ ሁኔታ ተቀይሯል!' });
        // Update user state to clear mustChangePassword flag
        if (user) {
          const updatedUser = { ...user, mustChangePassword: false };
          useAuthStore.setState({ user: updatedUser });
        }
        setTimeout(() => {
          if (onClose) onClose();
        }, 1200);
      } else {
        setMsg({ type: 'error', text: data.message || 'ፓስዎርድ መቀየር አልተቻለም' });
      }
    } catch {
      setMsg({ type: 'error', text: 'የአውታረ መረብ ስህተት ተፈጥሯል' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/60 space-y-6 relative animate-in fade-in zoom-in duration-200">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold border border-indigo-100 shadow-sm">
            🔐
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            አዲስ ፓስዎርድ ያዘጋጁ (Set Your New Password)
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            ለደህንነትዎ ሲባል የተሰጠዎትን ጊዜያዊ ፓስዎርድ ወደ ሚስጥራዊ አዲስ ፓስዎርድዎ ይቀይሩ።
          </p>
        </div>

        {msg.text && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2 ${
              msg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border border-rose-200 text-rose-700'
            }`}
          >
            <span>{msg.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              አዲስ ፓስዎርድ (New Password) *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              አዲስ ፓስዎርድ ያረጋግጡ (Confirm New Password) *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'ፓስዎርዱን ቀይር (Save New Password)'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;

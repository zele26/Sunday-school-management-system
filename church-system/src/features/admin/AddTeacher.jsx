import React, { useState } from 'react';
import { apiFetch } from '../../api/apiClient';

const AddTeacher = () => {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/admin/teachers', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('መምህር በተሳካ ሁኔታ ተፈጥሯል');
        setForm({ fullName: '', email: '', password: '' });
      } else {
        setMsg(data.message || 'ስህተት');
      }
    } catch {
      setMsg('የአውታረ መረብ ስህተት');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">አዲስ መምህር መፍጠሪያ</h2>
      {msg && <div className="mb-4 p-2 bg-slate-100 rounded-xl text-sm">{msg}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" placeholder="ሙሉ ስም *" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} className="w-full p-2 border rounded-xl" required />
        <input type="email" placeholder="ኢሜይል *" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full p-2 border rounded-xl" required />
        <input type="password" placeholder="ፓስዎርድ *" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="w-full p-2 border rounded-xl" required />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-xl">መምህር ፍጠር</button>
      </form>
    </div>
  );
};

export default AddTeacher;
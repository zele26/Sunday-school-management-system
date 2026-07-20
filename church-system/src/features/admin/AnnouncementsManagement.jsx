// src/features/admin/AnnouncementsManagement.jsx
import React, { useState } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const AnnouncementsManagement = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState({ text: '', type: '' });

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, message }),
      });

      if (res.ok) {
        setStatus({ text: 'ማስታወቂያው በስኬት ተልኳል! (Announcement posted!)', type: 'success' });
        setTitle('');
        setMessage('');
      } else {
        setStatus({ text: 'ማስታወቂያውን መላክ አልተቻለም።', type: 'error' });
      }
    } catch (err) {
      setStatus({ text: 'የአውታረ መረብ ስህተት ተከሰቷል።', type: 'error' });
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">ማስታወቂያዎች (Announcements)</h2>
        <p className="text-xs text-slate-500 mt-1">ለተማሪዎች እና መምህራን ማስታወቂያ ያስተላልፉ።</p>
      </div>

      {status.text && (
        <div className={`p-3 rounded-xl text-sm font-medium ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          {status.text}
        </div>
      )}

      <form onSubmit={handlePostAnnouncement} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">ርዕስ (Title)</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            placeholder="የማስታወቂያው ርዕስ..."
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">መልእክት (Message)</label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            placeholder="የማስታወቂያው ዝርዝር..."
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          ማስታወቂያ ላክ (Post Announcement)
        </button>
      </form>
    </div>
  );
};

export default AnnouncementsManagement;
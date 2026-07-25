import React from 'react';

const announcements = [
  { title: 'የ2026/2027 ትምህርት ዓመት መጀመሪያ', date: '2026-09-15' },
  { title: 'የልጆች የጸሎት ቀን', date: '2026-10-02' },
];

const PublicAnnouncements = () => (
  <div className="max-w-4xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold text-slate-800 mb-6">ማስታወቂያዎች</h1>
    {announcements.map(a => (
      <div key={a.title} className="bg-white p-4 rounded-xl shadow mb-3">
        <h3 className="font-semibold text-slate-700">{a.title}</h3>
        <p className="text-xs text-slate-500">{a.date}</p>
      </div>
    ))}
  </div>
);

export default PublicAnnouncements;
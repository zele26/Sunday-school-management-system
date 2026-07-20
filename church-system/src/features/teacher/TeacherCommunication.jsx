// src/features/teacher/TeacherCommunication.jsx
import React from 'react';

const TeacherCommunication = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">የግንኙነት ሰሌዳ (Communication)</h2>
        <p className="text-xs text-slate-500 mt-1">ለተማሪዎች ወይም ለወላጆች መልእክት ይላኩ።</p>
      </div>
      <div className="space-y-4">
        <textarea
          rows={4}
          placeholder="መልእክትዎን እዚህ ይጻፉ..."
          className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
        ></textarea>
        <button className="bg-blue-600 text-white text-xs font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition">
          መልእክት ላክ
        </button>
      </div>
    </div>
  );
};

export default TeacherCommunication;
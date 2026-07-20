// src/features/teacher/TeacherContent.jsx
import React from 'react';

const TeacherContent = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">ይዘት እና ፈተናዎች (Content & Exams)</h2>
          <p className="text-xs text-slate-500 mt-1">የትምህርት ቁሳቁሶችን እና ፈተናዎችን ይስቀሉ ወይም ያዘጋጁ።</p>
        </div>
        <button className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition">
          + አዲስ ይዘት ያክሉ
        </button>
      </div>
      <div className="py-8 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
        እስካሁን ምንም የተጫነ ትምህርት ወይም ፈተና የለም።
      </div>
    </div>
  );
};

export default TeacherContent;
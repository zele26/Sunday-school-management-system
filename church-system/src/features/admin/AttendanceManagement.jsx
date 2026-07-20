import React, { useState } from 'react';

const AttendanceManagement = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">የተማሪዎች ቁጥጥርና አቴንዳንስ (Attendance Tracking)</h2>
        <p className="text-xs text-slate-500 mt-1">የክፍሎችን አቴንዳንስ እና የተማሪዎችን መገኘት ይከታተሉ።</p>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="date"
          className="p-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          አቴንዳንስ ፈልግ (Search)
        </button>
      </div>

      <div className="py-12 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
        ለተመረጠው ቀን ምንም የአቴንዳንስ መረጃ አልተገኘም። (No attendance records for selected date.)
      </div>
    </div>
  );
};

export default AttendanceManagement;
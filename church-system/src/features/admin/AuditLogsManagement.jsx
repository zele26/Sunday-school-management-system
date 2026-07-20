import React from 'react';

const AuditLogsManagement = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">የሲስተም ኦዲት እና እንቅስቃሴዎች (Audit Logs)</h2>
        <p className="text-xs text-slate-500 mt-1">በሲስተሙ ውስጥ የተከናወኑ ሁሉንም አስተዳደራዊ እንቅስቃሴዎች ይመልከቱ።</p>
      </div>

      <div className="divide-y divide-slate-100 text-xs text-slate-600">
        <div className="py-3 flex justify-between">
          <span>አድሚን ሲስተሙ ውስጥ ገብቷል (Admin Logged In)</span>
          <span className="text-slate-400">ዛሬ 09:00</span>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsManagement;
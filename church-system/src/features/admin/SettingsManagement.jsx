import React, { useState } from 'react';

const SettingsManagement = () => {
  const [systemName, setSystemName] = useState('የሰንበት ትምህርት ቤት ሥርዓት');

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">የሲስተም ቅንብሮች (Settings)</h2>
        <p className="text-xs text-slate-500 mt-1">የመተግበሪያውን አጠቃላይ ቅንብሮች ያስተካክሉ።</p>
      </div>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">የመተግበሪያ ስም (System Title)</label>
          <input
            type="text"
            value={systemName}
            onChange={(e) => setSystemName(e.target.value)}
            className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          ቅንብሮችን አስቀምጥ (Save Settings)
        </button>
      </div>
    </div>
  );
};

export default SettingsManagement;
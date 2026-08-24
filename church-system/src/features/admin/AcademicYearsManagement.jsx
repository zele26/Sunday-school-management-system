import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';

const AcademicYearsManagement = () => {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/education/academic-years');
      if (res.ok) {
        const data = await res.json();
        setYears(data.years || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Academic Years</h2>
        <button onClick={fetchYears} className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading academic years...</div>
      ) : years.length === 0 ? (
        <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
          No academic years found.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {years.map(year => (
            <div key={year._id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <h3 className="font-bold text-slate-800">{year.name}</h3>
              <p className="text-xs text-slate-400">Status: {year.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AcademicYearsManagement;
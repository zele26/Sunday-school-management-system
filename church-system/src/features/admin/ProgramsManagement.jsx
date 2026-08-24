import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';

const ProgramsManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/education/programs');
      if (res.ok) {
        const data = await res.json();
        setPrograms(data.programs || []);
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
        <h2 className="text-xl font-bold text-slate-800">Programs</h2>
        <button onClick={fetchPrograms} className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading programs...</div>
      ) : programs.length === 0 ? (
        <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
          No programs found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map(program => (
            <div key={program._id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-800">{program.name}</h3>
              <p className="text-xs text-slate-400 uppercase">{program.code}</p>
              <p className="text-sm text-slate-600 mt-1">Type: {program.type}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgramsManagement;
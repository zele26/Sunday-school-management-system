import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';

const StudentProfilesManagement = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/education/student-profiles');
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles || []);
      } else {
        setError('Failed to load student profiles');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Student Profiles (New)</h2>
        <button onClick={fetchProfiles} className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading student profiles...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">{error}</div>
      ) : profiles.length === 0 ? (
        <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
          No student profiles found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-xs uppercase text-slate-400">
                <th className="py-2 px-2">Student ID</th>
                <th className="py-2 px-2">Person</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Admission Date</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {profiles.map(profile => (
                <tr key={profile._id} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-mono text-xs">{profile.studentNumber}</td>
                  <td className="py-2 px-2 font-medium text-slate-800">
                    {profile.personId ? `${profile.personId.firstName} ${profile.personId.lastName}` : 'Unknown'}
                  </td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      profile.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      profile.status === 'graduated' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {profile.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-xs text-slate-500">
                    {profile.admissionDate ? new Date(profile.admissionDate).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentProfilesManagement;
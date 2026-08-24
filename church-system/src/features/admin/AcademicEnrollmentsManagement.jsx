import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../api/apiClient';

const AcademicEnrollmentsManagement = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/education/academic-enrollments');
      if (res.ok) {
        const data = await res.json();
        setEnrollments(data.enrollments || []);
      } else {
        setError('Failed to load enrollments');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Academic Enrollments</h2>
        <button onClick={fetchEnrollments} className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading enrollments...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">{error}</div>
      ) : enrollments.length === 0 ? (
        <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
          No enrollments found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-xs uppercase text-slate-400">
                <th className="py-2 px-2">Student</th>
                <th className="py-2 px-2">Year</th>
                <th className="py-2 px-2">Program</th>
                <th className="py-2 px-2">Grade/Batch</th>
                <th className="py-2 px-2">Mode</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {enrollments.map(enroll => (
                <tr key={enroll._id} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-medium text-slate-800">
                    {enroll.studentProfileId?.personId ? `${enroll.studentProfileId.personId.firstName} ${enroll.studentProfileId.personId.lastName}` : 'Unknown'}
                  </td>
                  <td className="py-2 px-2">{enroll.academicYearId?.name || '-'}</td>
                  <td className="py-2 px-2">{enroll.programId?.name || '-'}</td>
                  <td className="py-2 px-2">{enroll.gradeId?.name || '-'}</td>
                  <td className="py-2 px-2">{enroll.studyModeId?.name || '-'}</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      enroll.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      enroll.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {enroll.status}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <Link
                      to={`/admin/academic-enrollments/${enroll._id}`}
                      className="text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-100 transition-all"
                    >
                      Details
                    </Link>
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

export default AcademicEnrollmentsManagement;
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';

const StudentProfilesManagement = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Modal state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressTarget, setProgressTarget] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleProgressClick = (profile) => {
    setProgressTarget(profile);
    setShowProgressModal(true);
  };

  const confirmProgress = async () => {
    if (!progressTarget) return;
    setProgressLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await apiFetch(`/api/education/students/${progressTarget._id}/progress`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        setShowProgressModal(false);
        await fetchProfiles();
      } else {
        setError(data.message || 'Failed to progress');
      }
    } catch (err) {
      setError('Network error during progression');
    } finally {
      setProgressLoading(false);
    }
  };

  const handleViewHistory = async (profile) => {
    setHistoryTarget(profile);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const res = await apiFetch(`/api/education/students/${profile._id}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.enrollments || []);
      } else {
        setHistory([]);
      }
    } catch (err) {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const getCurrentGrade = (profile) => {
    const enroll = profile.latestEnrollment;
    if (!enroll) return '—';
    return enroll.gradeId?.name || (enroll.programId?.type === 'distance' ? 'Batch 1' : '—');
  };

  const getAcademicYear = (profile) => {
    return profile.latestEnrollment?.academicYearId?.name || '—';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Student Profiles</h2>
        <button onClick={fetchProfiles} className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl">
          🔄 Refresh
        </button>
      </div>

      {message && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm">{message}</div>}
      {error && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-sm">{error}</div>}

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading student profiles...</div>
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
                <th className="py-2 px-2">Current Grade/Batch</th>
                <th className="py-2 px-2">Year</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2 text-right">Actions</th>
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
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                      {getCurrentGrade(profile)}
                    </span>
                  </td>
                  <td className="py-2 px-2">{getAcademicYear(profile)}</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      profile.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      profile.status === 'graduated' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {profile.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right space-x-2">
                    <button
                      onClick={() => handleViewHistory(profile)}
                      className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-200 transition-all"
                    >
                      History
                    </button>
                    <button
                      onClick={() => handleProgressClick(profile)}
                      className="text-xs bg-blue-600 text-white font-semibold px-3 py-1.5 rounded-xl hover:bg-blue-700 transition-all"
                    >
                      Progress
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Progress Confirmation Modal */}
      {showProgressModal && progressTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-slate-800">Confirm Progression</h3>
            <p className="text-sm text-slate-600">
              You are about to progress <span className="font-semibold">{progressTarget.personId?.firstName} {progressTarget.personId?.lastName}</span> to the next grade/batch. This will mark the current enrollment as completed and create a new enrollment.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowProgressModal(false)}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={confirmProgress}
                disabled={progressLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {progressLoading ? 'Processing…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && historyTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-slate-800">Academic History</h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 font-bold"
              >
                &times;
              </button>
            </div>
            {historyLoading ? (
              <div className="py-10 text-center text-slate-400">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="py-10 text-center text-slate-400">No enrollments found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-slate-400">
                      <th className="py-2 px-2">Year</th>
                      <th className="py-2 px-2">Program</th>
                      <th className="py-2 px-2">Grade/Batch</th>
                      <th className="py-2 px-2">Study Mode</th>
                      <th className="py-2 px-2">Schedule</th>
                      <th className="py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {history.map(enroll => (
                      <tr key={enroll._id} className="hover:bg-slate-50">
                        <td className="py-2 px-2">{enroll.academicYearId?.name || '-'}</td>
                        <td className="py-2 px-2">{enroll.programId?.name || '-'}</td>
                        <td className="py-2 px-2">{enroll.gradeId?.name || '-'}</td>
                        <td className="py-2 px-2">{enroll.studyModeId?.name || '-'}</td>
                        <td className="py-2 px-2">{enroll.scheduleId?.name || '-'}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            enroll.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                            enroll.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {enroll.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfilesManagement;
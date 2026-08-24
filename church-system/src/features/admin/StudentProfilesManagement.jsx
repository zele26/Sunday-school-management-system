import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';

const StudentProfilesManagement = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Detail modal state
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [showProgressConfirm, setShowProgressConfirm] = useState(false);

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

  const openDetails = async (profile) => {
    setSelectedProfile(profile);
    setShowDetailModal(true);
    setHistoryLoading(true);
    setHistory([]);
    try {
      const res = await apiFetch(`/api/education/students/${profile._id}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.enrollments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleProgressClick = () => {
    setShowProgressConfirm(true);
  };

  const confirmProgress = async () => {
    if (!selectedProfile) return;
    setProgressLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await apiFetch(`/api/education/students/${selectedProfile._id}/progress`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        setShowDetailModal(false);
        setShowProgressConfirm(false);
        await fetchProfiles();
      } else {
        setError(data.message || 'Failed to progress');
        setShowProgressConfirm(false);
      }
    } catch (err) {
      setError('Network error during progression');
      setShowProgressConfirm(false);
    } finally {
      setProgressLoading(false);
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
                  <td className="py-2 px-2 text-right">
                    <button
                      onClick={() => openDetails(profile)}
                      className="text-xs bg-blue-600 text-white font-semibold px-3 py-1.5 rounded-xl hover:bg-blue-700 transition-all"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Student Details Modal */}
      {showDetailModal && selectedProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-3xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {selectedProfile.personId?.firstName} {selectedProfile.personId?.lastName}
                </h3>
                <p className="text-sm text-slate-500">
                  Student ID: <span className="font-mono font-bold">{selectedProfile.studentNumber}</span>
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 font-bold"
              >
                &times;
              </button>
            </div>

            {/* Current Enrollment Summary */}
            {selectedProfile.latestEnrollment && (
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <h4 className="font-semibold text-slate-700 mb-2">Current Enrollment</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">Academic Year</span>
                    <span className="font-semibold text-slate-800">{selectedProfile.latestEnrollment.academicYearId?.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Program</span>
                    <span className="font-semibold text-slate-800">{selectedProfile.latestEnrollment.programId?.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Grade/Batch</span>
                    <span className="font-semibold text-slate-800">{getCurrentGrade(selectedProfile)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Study Mode</span>
                    <span className="font-semibold text-slate-800">{selectedProfile.latestEnrollment.studyModeId?.name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Schedule</span>
                    <span className="font-semibold text-slate-800">{selectedProfile.latestEnrollment.scheduleId?.name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      selectedProfile.latestEnrollment.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      selectedProfile.latestEnrollment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {selectedProfile.latestEnrollment.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Academic History */}
            <div>
              <h4 className="font-semibold text-slate-700 mb-3">Academic History</h4>
              {historyLoading ? (
                <div className="py-8 text-center text-slate-400">Loading history...</div>
              ) : history.length === 0 ? (
                <div className="py-8 text-center text-slate-400">No enrollment records found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b text-xs uppercase text-slate-400">
                        <th className="py-2 px-2">Year</th>
                        <th className="py-2 px-2">Program</th>
                        <th className="py-2 px-2">Grade/Batch</th>
                        <th className="py-2 px-2">Mode</th>
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

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              >
                Close
              </button>
              <button
                onClick={handleProgressClick}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
              >
                Progress to Next Grade/Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Confirmation Modal */}
      {showProgressConfirm && selectedProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-slate-800">Confirm Progression</h3>
            <p className="text-sm text-slate-600">
              Progress {selectedProfile.personId?.firstName} {selectedProfile.personId?.lastName} to the next grade/batch?
              This will complete the current enrollment and create a new one.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowProgressConfirm(false)}
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
    </div>
  );
};

export default StudentProfilesManagement;
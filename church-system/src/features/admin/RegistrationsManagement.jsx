// src/features/admin/RegistrationsManagement.jsx
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';

const RegistrationsManagement = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Detail modal state
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/registrations');
      if (res.ok) {
        const data = await res.json();
        setRegistrations(Array.isArray(data) ? data : data.registrations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const res = await apiFetch(`/api/admin/registrations/${id}/approve`, { method: 'PUT' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage({ text: 'Registration approved and student account created.', type: 'success' });
        setRegistrations((prev) => prev.filter((r) => r._id !== id));
        setShowDetailModal(false);
        setSelectedRegistration(null);
      } else {
        setMessage({ text: data.message || 'Failed to approve', type: 'error' });
      }
    } catch (err) {
      if (err.message && err.message.includes('Session expired')) return;
      setMessage({ text: `Error: ${err.message || 'Network error'}`, type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      setMessage({ text: 'Please provide a reason for rejection.', type: 'error' });
      return;
    }
    setActionLoading(id);
    try {
      const res = await apiFetch(`/api/admin/registrations/${id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json().catch(() => ({ message: `Server error (status ${res.status})` }));

      if (res.ok) {
        setMessage({ text: 'Registration rejected.', type: 'success' });
        setRegistrations((prev) => prev.filter((r) => r._id !== id));
        setShowDetailModal(false);
        setSelectedRegistration(null);
        setRejectReason('');
      } else {
        setMessage({ text: data.message || 'Failed to reject', type: 'error' });
      }
    } catch (err) {
      if (err.message && err.message.includes('Session expired')) return;
      setMessage({ text: `Network error: ${err.message || 'Please try again'}`, type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const openDetailModal = (registration) => {
    setSelectedRegistration(registration);
    setRejectReason('');
    setShowDetailModal(true);
  };

  const isImageUrl = (url) => {
    if (!url) return false;
    return /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Pending Registrations</h2>
        <button onClick={fetchRegistrations} className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl">
          🔄 Refresh
        </button>
      </div>

      {message.text && (
        <div className={`p-3 rounded-xl text-sm ${message.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading...</div>
      ) : registrations.length === 0 ? (
        <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
          No pending registrations found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-xs uppercase text-slate-400">
                <th className="py-2 px-2">Reg Number</th>
                <th className="py-2 px-2">Name</th>
                <th className="py-2 px-2">Grade</th>
                <th className="py-2 px-2">Type</th>
                <th className="py-2 px-2">Transaction Ref</th>
                <th className="py-2 px-2">Receipt</th>
                <th className="py-2 px-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {registrations.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-mono text-xs">{r.registrationNumber}</td>
                  <td className="py-2 px-2 font-medium">{r.fullName}</td>
                  <td className="py-2 px-2">{r.grade}</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.studentType === 'distance'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                      }`}>
                      {r.studentType}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-xs text-slate-500">{r.transactionRef || '-'}</td>
                  <td className="py-2 px-2">
                    {r.receiptUrl ? (
                      <a href={r.receiptUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs">
                        View Receipt
                      </a>
                    ) : (
                      <span className="text-slate-400 text-xs">No receipt</span>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    <button
                      onClick={() => openDetailModal(r)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-lg border border-blue-200"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRegistration && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Registration Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 font-bold transition-all"
              >
                &times;
              </button>
            </div>

            {/* Top info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <div>
                <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Full Name</span>
                <span className="text-slate-800 font-semibold text-base">{selectedRegistration.fullName}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Student Type</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${selectedRegistration.studentType === 'distance'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                  }`}>
                  {selectedRegistration.studentType}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Registration Number</span>
                <span className="font-mono font-bold text-slate-800">{selectedRegistration.registrationNumber}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Grade</span>
                <span className="text-slate-800 font-medium">{selectedRegistration.grade}</span>
              </div>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">First Name</span>
                <span className="text-slate-800">{selectedRegistration.firstName || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Middle Name</span>
                <span className="text-slate-800">{selectedRegistration.middleName || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Last Name</span>
                <span className="text-slate-800">{selectedRegistration.lastName || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Education Level</span>
                <span className="text-slate-800">{selectedRegistration.educationLevel || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Profession</span>
                <span className="text-slate-800">{selectedRegistration.profession || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Gender</span>
                <span className="text-slate-800">{selectedRegistration.gender || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Date of Birth</span>
                <span className="text-slate-800">{selectedRegistration.dateOfBirth || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Phone</span>
                <span className="text-slate-800">{selectedRegistration.phone}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Email</span>
                <span className="text-slate-800">{selectedRegistration.email || '-'}</span>
              </div>
              <div className="col-span-2">
                <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Address</span>
                <span className="text-slate-800">{selectedRegistration.address || '-'}</span>
              </div>
            </div>

            {/* Emergency Contact */}
            {/* Emergency Contact */}
            <div>
              <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-3 border-b border-slate-100 pb-2">
                የአደጋ ጊዜ ተጠሪ (Emergency Contact)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Name</span>
                  <span className="text-slate-800">
                    {selectedRegistration.emergencyFirstName || selectedRegistration.parentName || '-'}{' '}
                    {selectedRegistration.emergencyMiddleName || ''}{' '}
                    {selectedRegistration.emergencyLastName || ''}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Relationship</span>
                  <span className="text-slate-800">{selectedRegistration.relationship || 'Father'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Phone</span>
                  <span className="text-slate-800">
                    {selectedRegistration.emergencyPhone || selectedRegistration.parentPhone || '-'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Email</span>
                  <span className="text-slate-800">
                    {selectedRegistration.emergencyEmail || selectedRegistration.parentEmail || '-'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Address</span>
                  <span className="text-slate-800">{selectedRegistration.emergencyAddress || '-'}</span>
                </div>
              </div>
            </div>

            {/* Payment / Receipt */}
            <div>
              <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-3 border-b border-slate-100 pb-2">
                Payment & Receipt
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Transaction Reference</span>
                  <span className="text-slate-800">{selectedRegistration.transactionRef || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Receipt</span>
                  {selectedRegistration.receiptUrl ? (
                    <div>
                      {isImageUrl(selectedRegistration.receiptUrl) ? (
                        <a href={selectedRegistration.receiptUrl} target="_blank" rel="noreferrer">
                          <img
                            src={selectedRegistration.receiptUrl}
                            alt="Receipt"
                            className="w-full max-w-xs rounded-xl border border-slate-200 shadow-sm"
                          />
                        </a>
                      ) : (
                        <a
                          href={selectedRegistration.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline text-xs"
                        >
                          View Receipt File
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">No receipt uploaded</span>
                  )}
                </div>
              </div>
            </div>

            {/* Rejection reason input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                Rejection Reason (if rejecting)
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm text-slate-700 placeholder:text-slate-400"
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading === selectedRegistration._id}
                onClick={() => handleReject(selectedRegistration._id)}
                className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-sm font-semibold border border-rose-200 transition-all disabled:opacity-50"
              >
                {actionLoading === selectedRegistration._id ? '...' : 'Reject'}
              </button>
              <button
                disabled={actionLoading === selectedRegistration._id}
                onClick={() => handleApprove(selectedRegistration._id)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {actionLoading === selectedRegistration._id ? '...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationsManagement;
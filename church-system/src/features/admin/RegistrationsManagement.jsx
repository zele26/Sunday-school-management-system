// src/features/admin/RegistrationsManagement.jsx
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';

const RegistrationsManagement = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/registrations');
      if (res.ok) {
        const data = await res.json();
        setRegistrations(Array.isArray(data) ? data : []);
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
    if (!window.confirm('Approve this registration? A student account will be created.')) return;
    setActionLoading(id);
    try {
      const res = await apiFetch(`/api/admin/registrations/${id}/approve`, { method: 'PUT' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage({ text: 'Registration approved and student account created.', type: 'success' });
        setRegistrations((prev) => prev.filter((r) => r._id !== id));
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
    const reason = window.prompt('Reason for rejection (optional):');
    setActionLoading(id);
    try {
      const res = await apiFetch(`/api/admin/registrations/${id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      });

      const data = await res.json().catch(() => ({ message: `Server error (status ${res.status})` }));

      if (res.ok) {
        setMessage({ text: 'Registration rejected.', type: 'success' });
        setRegistrations((prev) => prev.filter((r) => r._id !== id));
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

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Pending Registrations</h2>
        <button onClick={fetchRegistrations} className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl">
          🔄 Refresh
        </button>
      </div>

      {message.text && (
        <div className={`p-3 rounded-xl text-sm ${
          message.type === 'success'
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
                <th className="py-2 px-2">Transaction Ref</th>
                <th className="py-2 px-2">Receipt</th>
                <th className="py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {registrations.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-mono text-xs">{r.registrationNumber}</td>
                  <td className="py-2 px-2 font-medium">{r.fullName}</td>
                  <td className="py-2 px-2">{r.grade}</td>
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
                  <td className="py-2 px-2 space-x-2">
                    <button
                      disabled={actionLoading === r._id}
                      onClick={() => handleApprove(r._id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1 rounded-lg"
                    >
                      {actionLoading === r._id ? '...' : 'Approve'}
                    </button>
                    <button
                      disabled={actionLoading === r._id}
                      onClick={() => handleReject(r._id)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs px-3 py-1 rounded-lg border border-rose-200"
                    >
                      Reject
                    </button>
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

export default RegistrationsManagement;
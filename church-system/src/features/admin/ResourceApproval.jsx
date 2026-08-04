// src/features/admin/ResourceApproval.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';

const ResourceApproval = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending');
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [actionLoading, setActionLoading] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchResources();
    updateStats();
  }, [filter]);

  const fetchResources = async () => {
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const query = filter === 'All' ? '' : `?status=${filter}`;
      const res = await apiFetch(`/api/resources/admin/all${query}`);
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.message || 'Failed to load resources.' });
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Network error.' });
    } finally {
      setLoading(false);
    }
  };

  const updateStats = async () => {
    try {
      const res = await apiFetch('/api/resources/admin/all');
      if (res.ok) {
        const all = await res.json();
        setStats({
          pending: all.filter(r => r.status === 'Pending').length,
          approved: all.filter(r => r.status === 'Approved').length,
          rejected: all.filter(r => r.status === 'Rejected').length,
        });
      }
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    setMsg({ type: '', text: '' });
    try {
      const res = await apiFetch(`/api/resources/admin/approve/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'approve' }),
      });
      if (res.ok) {
        setMsg({ type: 'success', text: '✅ Resource approved successfully!' });
        fetchResources();
        updateStats();
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.message || 'Approval failed.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Network error.' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    }
  };

  // Open reject modal
  const openRejectModal = (id) => {
    setRejectId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      setMsg({ type: 'error', text: 'Rejection reason is required.' });
      return;
    }
    setShowRejectModal(false);
    setActionLoading(rejectId);
    setMsg({ type: '', text: '' });
    try {
      const res = await apiFetch(`/api/resources/admin/approve/${rejectId}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'reject', rejectionReason: rejectReason.trim() }),
      });
      if (res.ok) {
        setMsg({ type: 'success', text: '❌ Resource rejected.' });
        fetchResources();
        updateStats();
      } else {
        const err = await res.json();
        setMsg({ type: 'error', text: err.message || 'Rejection failed.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Network error.' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Approved': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Rejected': 'bg-rose-100 text-rose-800 border-rose-200',
    };
    const emojis = {
      'Pending': '⏳',
      'Approved': '✅',
      'Rejected': '❌',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[status] || 'bg-gray-100'}`}>
        {emojis[status]} {status}
      </span>
    );
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Resource Approval
          </h2>
          <p className="text-sm text-slate-500">Review and approve/reject teacher-submitted resources.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-2xl border border-yellow-100">
          <p className="text-xs text-yellow-600 font-semibold uppercase">Pending</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-100">
          <p className="text-xs text-emerald-600 font-semibold uppercase">Approved</p>
          <p className="text-2xl font-bold text-emerald-800">{stats.approved}</p>
        </div>
        <div className="bg-gradient-to-r from-rose-50 to-red-50 p-4 rounded-2xl border border-rose-100">
          <p className="text-xs text-rose-600 font-semibold uppercase">Rejected</p>
          <p className="text-2xl font-bold text-rose-800">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter & Messages */}
      <div className="flex flex-col md:flex-row gap-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer min-w-[180px]"
        >
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="All">All</option>
        </select>
        {msg.text && (
          <div className={`flex-1 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}>
            <span className="text-lg">{msg.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{msg.text}</span>
          </div>
        )}
      </div>

      {/* Resource Cards */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Loading resources...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {resources.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm">No resources with status "{filter}".</p>
            </div>
          ) : (
            resources.map((r) => (
              <div key={r._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="font-semibold text-lg text-slate-800">{r.title}</h4>
                      {getStatusBadge(r.status)}
                    </div>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <span className="font-medium">{r.resourceType}</span>
                      <span className="text-slate-300">•</span>
                      <span>{r.course?.name || 'No Course'}</span>
                    </p>
                    <p className="text-sm text-slate-600">{r.description || 'No description provided.'}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {r.fileUrl && (
                        <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                          📎 View File
                        </a>
                      )}
                      {r.externalLink && (
                        <a href={r.externalLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                          🔗 Open Link
                        </a>
                      )}
                      {r.status === 'Rejected' && r.rejectionReason && (
                        <span className="text-rose-600 text-xs bg-rose-50 px-2 py-1 rounded-lg">
                          Reason: {r.rejectionReason}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Uploaded by: {r.uploadedBy?.fullName || 'Unknown'} • {new Date(r.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-auto md:ml-0">
                    {r.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(r._id)}
                          disabled={actionLoading === r._id}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-1 disabled:opacity-50"
                        >
                          {actionLoading === r._id ? '...' : '✅ Approve'}
                        </button>
                        <button
                          onClick={() => openRejectModal(r._id)}
                          disabled={actionLoading === r._id}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-1 disabled:opacity-50"
                        >
                          {actionLoading === r._id ? '...' : '❌ Reject'}
                        </button>
                      </>
                    )}
                    {r.status !== 'Pending' && (
                      <span className="text-sm text-slate-400 italic">Already {r.status}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-xl font-bold text-slate-800">Reject Resource</h3>
            <p className="text-sm text-slate-500">Please provide a reason for rejection:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceApproval;
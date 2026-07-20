// src/features/admin/ApprovalsManagement.jsx
import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const ApprovalsManagement = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch pending registration requests
  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/pending-approvals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading pending approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  // Handle Approve / Reject
  const handleApprovalAction = async (userId, status) => {
    setActionLoading(userId);
    setMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/approve-user/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }), // 'approved' or 'rejected'
      });

      if (res.ok) {
        setMessage({
          text: status === 'approved' ? 'ተጠቃሚው በስኬት ጸድቋል! (User approved successfully!)' : 'ተጠቃሚው ውድቅ ተደርጓል። (User rejected.)',
          type: 'success',
        });
        setPendingUsers((prev) => prev.filter((user) => user._id !== userId));
      } else {
        const errorData = await res.json();
        setMessage({ text: errorData.message || 'ትእዛዙ አልተሳካም። (Action failed.)', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'የአውታረ መረብ ስህተት ተከሰቷል። (Network error occurred.)', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">የማጽደቂያ ጥያቄዎች (Pending Approvals)</h2>
          <p className="text-xs text-slate-500 mt-1">
            አዳዲስ የተመዘገቡ ተጠቃሚዎችን እና መምህራንን ያጽድቁ ወይም ውድቅ ያድርጉ።
          </p>
        </div>
        <button
          onClick={fetchPendingApprovals}
          className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl hover:bg-blue-100 transition"
        >
          🔄 አድስ (Refresh)
        </button>
      </div>

      {/* Notification Toast */}
      {message.text && (
        <div
          className={`p-3 rounded-xl text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Approvals Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">በመጫን ላይ ነው... (Loading requests...)</div>
      ) : pendingUsers.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
          ምንም የሚጠበቅ ማጽደቂያ የለም። (No pending registration requests found.)
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-3">ስም (Name)</th>
                <th className="py-3 px-3">መለያ / ኢሜይል (Username/Email)</th>
                <th className="py-3 px-3">ድርሻ (Role)</th>
                <th className="py-3 px-3">የተመዘገበበት ቀን (Date)</th>
                <th className="py-3 px-3 text-right">ርምጃዎች (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {pendingUsers.map((u) => (
                <tr key={u._id || u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-slate-800">
                    {u.fullName || u.username}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500">{u.email || u.username}</td>
                  <td className="py-3.5 px-3">
                    <span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-lg text-xs uppercase border border-amber-200">
                      {u.role || 'Pending'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-xs text-slate-400">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3.5 px-3 text-right space-x-2">
                    <button
                      disabled={actionLoading === u._id}
                      onClick={() => handleApprovalAction(u._id, 'approved')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                    >
                      {actionLoading === u._id ? '...' : 'አጽድቅ (Approve)'}
                    </button>
                    <button
                      disabled={actionLoading === u._id}
                      onClick={() => handleApprovalAction(u._id, 'rejected')}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs px-3 py-1.5 rounded-lg transition border border-rose-200 disabled:opacity-50"
                    >
                      ውድቅ አድርግ (Reject)
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

export default ApprovalsManagement;
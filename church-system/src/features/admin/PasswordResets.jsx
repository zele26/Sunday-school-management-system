import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';

const PasswordResets = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [selectedReq, setSelectedReq] = useState(null);
  const [tempPassword, setTempPassword] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/password-resets');
      if (res.ok) {
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch password reset requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenApproveModal = (req) => {
    setSelectedReq(req);
    // Auto generate a clean 6-character random temp password e.g. Pass8231
    const randomPass = `Pass${Math.floor(1000 + Math.random() * 9000)}`;
    setTempPassword(randomPass);
    setAdminNote('');
  };

  const handleApprove = async () => {
    if (!selectedReq) return;
    setActionLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await apiFetch(`/api/admin/password-resets/${selectedReq._id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ tempPassword, adminNote }),
      });

      const data = await res.json();
      if (res.ok) {
        setMsg({
          type: 'success',
          text: `የፓስዎርድ ጥያቄው ጸድቋል! የተዘጋጀው ጊዜያዊ ፓስዎርድ፡ ${data.tempPassword}`,
        });
        setSelectedReq(null);
        fetchRequests();
      } else {
        setMsg({ type: 'error', text: data.message || 'ማጽደቅ አልተቻለም' });
      }
    } catch {
      setMsg({ type: 'error', text: 'የአውታረ መረብ ስህተት' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reqId) => {
    if (!window.confirm('ይህን የፓስዎርድ ጥያቄ ውድቅ ማድረግ ይፈልጋሉ?')) return;
    setActionLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await apiFetch(`/api/admin/password-resets/${reqId}/reject`, {
        method: 'PUT',
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: 'ጥያቄው ውድቅ ተደርጓል' });
        fetchRequests();
      } else {
        setMsg({ type: 'error', text: data.message || 'ውድቅ ማድረግ አልተቻለም' });
      }
    } catch {
      setMsg({ type: 'error', text: 'የአውታረ መረብ ስህተት' });
    } finally {
      setActionLoading(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const processedRequests = requests.filter((r) => r.status !== 'pending');

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl border border-white/20 shadow-inner">
            🔑
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">የፓስዎርድ ቅያሬ ጥያቄዎች (Password Resets)</h2>
            <p className="text-xs text-indigo-200 mt-1 font-medium">
              የተጠቃሚዎችን የይለፍ ቃል ቅያሬ ጥያቄ ማረጋገጫ እና ማጽደቂያ መድረክ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md text-xs font-semibold">
          <span>ማረጋገጫ የሚጠብቁ ጥያቄዎች፡</span>
          <span className="bg-amber-500 text-white px-2.5 py-0.5 rounded-full font-bold">
            {pendingRequests.length}
          </span>
        </div>
      </div>

      {msg.text && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium flex items-center justify-between gap-3 ${
            msg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{msg.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{msg.text}</span>
          </div>
          <button onClick={() => setMsg({ type: '', text: '' })} className="text-xs font-bold underline">
            ዝጋ
          </button>
        </div>
      )}

      {/* Pending Requests Table */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
            <span>ማረጋገጫ የሚጠብቁ ጥያቄዎች (Pending Requests)</span>
          </h3>
          <button
            onClick={fetchRequests}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            🔄 አድስ (Refresh)
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">በመጫን ላይ...</div>
        ) : pendingRequests.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm italic">
            ማረጋገጫ የሚጠብቅ የፓስዎርድ ጥያቄ የለም። (No pending password requests)
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-4">ተጠቃሚ (User)</th>
                  <th className="py-3 px-4">ሚና (Role)</th>
                  <th className="py-3 px-4">ያስገቡት መለያ (Identifier)</th>
                  <th className="py-3 px-4">የተጠየቀበት ቀን (Date)</th>
                  <th className="py-3 px-4 text-right">እርምጃ (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {pendingRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{req.fullName || req.user?.fullName || 'N/A'}</div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {req.email || req.phone || ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 uppercase font-bold text-[10px]">
                      <span
                        className={`px-2.5 py-1 rounded-full ${
                          req.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : req.role === 'teacher'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {req.role || 'student'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{req.identifier}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenApproveModal(req)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition-all inline-flex items-center gap-1"
                      >
                        <span>✓</span>
                        <span>አጽድቅ (Approve)</span>
                      </button>
                      <button
                        onClick={() => handleReject(req._id)}
                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-semibold transition-all inline-flex items-center gap-1"
                      >
                        <span>✕</span>
                        <span>ሰርዝ (Reject)</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* History Table */}
      {processedRequests.length > 0 && (
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
            የተከናወኑ ጥያቄዎች ታሪክ (Processed Requests History)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-4">ተጠቃሚ</th>
                  <th className="py-3 px-4">መለያ</th>
                  <th className="py-3 px-4">ሁኔታ (Status)</th>
                  <th className="py-3 px-4">ጊዜያዊ ፓስዎርድ (Temp Pass)</th>
                  <th className="py-3 px-4">ቀን</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {processedRequests.map((req) => (
                  <tr key={req._id}>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {req.fullName || req.user?.fullName}
                    </td>
                    <td className="py-3 px-4 font-mono">{req.identifier}</td>
                    <td className="py-3 px-4 font-semibold">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] uppercase ${
                          req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {req.status === 'approved' ? 'ተፈቅዷል (Approved)' : 'ውድቅ ተደርጓል (Rejected)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-indigo-600 font-bold">
                      {req.tempPasswordIssued || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(req.updatedAt || req.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-6 relative border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                የፓስዎርድ ጥያቄ ማጽደቂያ
              </h3>
              <button
                onClick={() => setSelectedReq(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-1">
              <p><strong>ተጠቃሚ፡</strong> {selectedReq.fullName || selectedReq.user?.fullName}</p>
              <p><strong>ኢሜይል/ስልክ፡</strong> {selectedReq.email || selectedReq.phone || selectedReq.identifier}</p>
              <p><strong>ሚና፡</strong> {selectedReq.role}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ለተጠቃሚው የሚሰጥ ጊዜያዊ ፓስዎርድ (Temporary Password) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-mono font-bold focus:bg-white focus:border-indigo-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setTempPassword(`Pass${Math.floor(1000 + Math.random() * 9000)}`)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold shrink-0"
                  >
                    🎲 አዲስ ሠራ
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  ተጠቃሚው በዚህ ጊዜያዊ ፓስዎርድ ሲገባ አዲስ ሚስጥራዊ ፓስዎርዱን እንዲያስገባ ይገደዳል።
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ማስታወሻ (Admin Note - Optional)
                </label>
                <input
                  type="text"
                  placeholder="ማስታወሻ ያስገቡ..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                ሰርዝ
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleApprove}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-2"
              >
                {actionLoading ? 'በማጽደቅ ላይ...' : 'አጽድቅና ጊዜያዊ ፓስዎርድ ስጥ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordResets;

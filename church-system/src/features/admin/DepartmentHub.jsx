// src/features/admin/DepartmentHub.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/apiClient';

const DepartmentHub = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDepartmentData();
  }, [id]);

  const fetchDepartmentData = async () => {
    setLoading(true);
    try {
      if (id) {
        const res = await apiFetch(`/api/core/departments/${id}`);
        if (res.ok) {
          const data = await res.json();
          setDepartment(data.department || data);
        }
      }
      // Fetch department memberships
      const memRes = await apiFetch(`/api/core/department-memberships?departmentId=${id || ''}`);
      if (memRes.ok) {
        const memData = await memRes.json();
        setMembers(memData.memberships || memData || []);
      }
    } catch (err) {
      console.error('Error fetching department details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 bg-white rounded-3xl shadow-sm border border-slate-100">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p>Loading department hub...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider">
                {department?.code || 'DEPT'}
              </span>
              <span className="text-xs text-blue-200">Department Control Hub</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {department?.name || 'Department Administration'}
            </h1>
            <p className="text-blue-100 text-sm max-w-xl">
              {department?.description || 'Manage departmental activities, member assignments, reports, and coordination.'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/admin/departments')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold backdrop-blur-sm transition-all"
            >
              All Departments
            </button>
            <button
              onClick={() => navigate('/admin/department-memberships')}
              className="px-4 py-2 bg-amber-400 text-slate-950 hover:bg-amber-300 rounded-xl text-sm font-bold shadow-md transition-all"
            >
              + Assign Member
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Members</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{members.length}</p>
          <p className="text-xs text-emerald-600 mt-1 font-medium">Active Servants & Members</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department Status</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">{department?.status || 'Active'}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Operational in Church</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Module Scoping</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-1">Autonomous</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Role-Based Access Guarded</p>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Department Servants & Members</h3>
            <p className="text-xs text-slate-500">Individuals officially assigned to this department.</p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full">
            {members.length} Assigned
          </span>
        </div>

        {members.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p className="text-base font-medium">No assigned members in this department yet.</p>
            <p className="text-xs text-slate-400 mt-1">Use the Memberships manager to assign staff and servants.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-700 uppercase">
                <tr>
                  <th className="p-3">Member</th>
                  <th className="p-3">Member ID</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Start Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800">
                      {m.personId?.firstName ? `${m.personId.firstName} ${m.personId.lastName || ''}` : (m.personId?.fullName || 'Member')}
                    </td>
                    <td className="p-3 font-mono text-xs text-blue-600">
                      {m.departmentMemberId || '—'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {m.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-500">
                      {m.startDate ? new Date(m.startDate).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentHub;

// src/features/admin/UsersManagement.jsx
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    superadmin: 0,
    department_admin: 0,
    admin: 0,
    teacher: 0,
    student: 0,
    member: 0,
    pending: 0,
    approved: 0,
  });

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    departmentId: '',
    status: '',
    gender: '',
    city: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Member Journey & History Modal
  const [showJourneyModal, setShowJourneyModal] = useState(false);
  const [selectedJourneyUser, setSelectedJourneyUser] = useState(null);
  const [journeyData, setJourneyData] = useState(null);
  const [journeyLoading, setJourneyLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, statusFilter, deptFilter]);

  const fetchDepartments = async () => {
    try {
      const res = await apiFetch('/api/core/departments');
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments || data || []);
      }
    } catch (err) {
      console.warn('Failed to load departments:', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (deptFilter) params.append('departmentId', deptFilter);

      const res = await apiFetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      const list = data.users || data || [];
      setUsers(list);
      setTotalPages(data.totalPages || 1);

      if (data.stats) {
        setStats(data.stats);
      } else {
        setStats({
          total: data.total || list.length,
          superadmin: list.filter(u => u.role === 'superadmin').length,
          department_admin: list.filter(u => u.role === 'department_admin').length,
          admin: list.filter(u => u.role === 'admin').length,
          teacher: list.filter(u => u.role === 'teacher').length,
          student: list.filter(u => u.role === 'student').length,
          member: list.filter(u => u.role === 'member').length,
          pending: list.filter(u => u.status === 'pending').length,
          approved: list.filter(u => u.status === 'approved' || u.status === 'active').length,
        });
      }
      setSelectedUsers([]);
      setSelectAll(false);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
    setPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleDeptFilter = (e) => {
    setDeptFilter(e.target.value);
    setPage(1);
  };

  // Selection
  const toggleSelectUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(uId => uId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
      setSelectAll(false);
    } else {
      setSelectedUsers(users.map(u => u._id));
      setSelectAll(true);
    }
  };

  // Bulk Actions
  const approveSelected = async () => {
    if (!confirm(`Approve ${selectedUsers.length} users?`)) return;
    try {
      await apiFetch('/api/admin/users/bulk-approve', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUsers }),
      });
      fetchUsers();
      setSelectedUsers([]);
      setSelectAll(false);
    } catch (err) {
      console.error(err);
    }
  };

  const rejectSelected = async () => {
    if (!confirm(`Reject ${selectedUsers.length} users?`)) return;
    try {
      await apiFetch('/api/admin/users/bulk-reject', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUsers }),
      });
      fetchUsers();
      setSelectedUsers([]);
      setSelectAll(false);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSelected = async () => {
    if (!confirm(`Delete ${selectedUsers.length} users?`)) return;
    try {
      await apiFetch('/api/admin/users/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUsers }),
      });
      fetchUsers();
      setSelectedUsers([]);
      setSelectAll(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Single User Actions
  const handleApprove = async (id) => {
    if (!confirm('Approve this user?')) return;
    try {
      await apiFetch(`/api/admin/users/${id}/approve`, { method: 'PUT' });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Reject this user?')) return;
    try {
      await apiFetch(`/api/admin/users/${id}/reject`, { method: 'PUT' });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Modal
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'student',
      departmentId: user.departmentId?._id || user.departmentId || '',
      status: user.status || 'pending',
      gender: user.gender || '',
      city: user.city || '',
      notes: '',
    });
    setMsg({ type: '', text: '' });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    setSubmitting(true);
    setMsg({ type: '', text: '' });

    try {
      const payload = {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        role: editForm.role,
        departmentId: editForm.departmentId || null,
        status: editForm.status,
        gender: editForm.gender,
        city: editForm.city.trim(),
        notes: editForm.notes.trim(),
      };

      const res = await apiFetch(`/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: '✅ User role & details updated with history preserved!' });
        setTimeout(() => {
          setShowEditModal(false);
          fetchUsers();
        }, 1200);
      } else {
        setMsg({ type: 'error', text: data.message || 'Failed to update user.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Network error.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Member Journey Modal
  const openJourneyModal = async (user) => {
    setSelectedJourneyUser(user);
    setShowJourneyModal(true);
    setJourneyLoading(true);
    setJourneyData(null);

    try {
      const res = await apiFetch(`/api/admin/users/${user._id}/journey`);
      if (res.ok) {
        const data = await res.json();
        setJourneyData(data);
      }
    } catch (err) {
      console.error('Failed to load user journey:', err);
    } finally {
      setJourneyLoading(false);
    }
  };

  const pageButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${
            i === page
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'superadmin':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'department_admin':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200 font-semibold';
      case 'teacher':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'student':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'member':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      rejected: 'bg-rose-50 text-rose-700 border-rose-200',
      created: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return colors[status?.toLowerCase()] || 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User & Role Management (የአባላትና የአስተዳደር አስተዳደር)</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage user accounts, assign Super Admin & Department Admin roles, and preserve lifetime member progression history.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-100 bg-amber-50/20 shadow-sm">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">👑 Super Admins</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.superadmin || stats.admin}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-indigo-100 bg-indigo-50/20 shadow-sm">
          <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">🏛️ Dept Admins</span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{stats.department_admin}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">👨‍🏫 Teachers</span>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{stats.teacher}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">🎓 Students</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{stats.student}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-yellow-100 bg-yellow-50/20 shadow-sm">
          <span className="text-[11px] font-bold text-yellow-700 uppercase tracking-wider">⏳ Pending</span>
          <p className="text-2xl font-extrabold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={handleSearch}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Role</label>
          <select
            value={roleFilter}
            onChange={handleRoleFilter}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="superadmin">👑 Super Admin</option>
            <option value="department_admin">🏛️ Department Admin</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="member">Church Member</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Department</label>
          <select
            value={deptFilter}
            onChange={handleDeptFilter}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={handleStatusFilter}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Controls */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-2xl">
          <span className="text-sm font-semibold text-blue-900">{selectedUsers.length} users selected:</span>
          <button
            onClick={approveSelected}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
          >
            Approve
          </button>
          <button
            onClick={rejectSelected}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
          >
            Reject
          </button>
          <button
            onClick={deleteSelected}
            className="px-3 py-1.5 bg-red-700 text-white rounded-lg text-xs font-semibold hover:bg-red-800"
          >
            Delete
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <tr>
              <th className="p-4">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Department</th>
              <th className="p-4">Status</th>
              <th className="p-4">Contact</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-400">Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-400">No users found matching the criteria.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(u._id)}
                      onChange={() => toggleSelectUser(u._id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{u.fullName}</div>
                    <div className="text-xs text-slate-400">{u.email || 'No email'}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs border ${getRoleBadge(u.role)}`}>
                        {u.role === 'superadmin' && '👑 '}
                        {u.role === 'department_admin' && '🏛️ '}
                        {u.role}
                      </span>
                      {u.roles && u.roles.length > 1 && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold" title="Multi-role member">
                          +{u.roles.length - 1}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {u.departmentId ? (
                      <span className="px-2.5 py-0.5 rounded-lg text-xs bg-slate-100 text-slate-800 font-medium border border-slate-200">
                        {u.departmentId.name || u.departmentId}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Church-wide</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs border font-medium ${getStatusBadge(u.status)}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    <div>{u.phone || '—'}</div>
                    <div>{u.city ? `${u.city}` : ''}</div>
                  </td>
                  <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => openJourneyModal(u)}
                      className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors shadow-xs"
                      title="View full timeline journey & preserved profiles"
                    >
                      📜 Journey
                    </button>

                    {u.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(u._id)}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs hover:bg-emerald-100 font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(u._id)}
                          className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs hover:bg-rose-100 font-medium"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => openEditModal(u)}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="px-2 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
          <div className="flex gap-1.5">{pageButtons()}</div>
        </div>
      )}

      {/* Member Journey & Lifetime Progression Modal */}
      {showJourneyModal && selectedJourneyUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#051533] via-[#08214d] to-[#051533] text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-xl">
                  📜
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {selectedJourneyUser.fullName} — የአባል ጉዞ (Member Journey)
                  </h3>
                  <p className="text-xs text-amber-300 font-medium">
                    የአባሉ ታሪክና የዕድገት ሂደት (Preserved Lifetime Progression)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowJourneyModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {journeyLoading ? (
                <div className="py-16 text-center text-slate-400">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm">የአባሉን ታሪክ በመጫን ላይ...</p>
                </div>
              ) : journeyData ? (
                <div className="space-y-6">
                  {/* Current Active Badges */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">ወቅታዊ ደረጃ (Current Active Role)</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadge(journeyData.user?.role)}`}>
                          {journeyData.user?.role}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(journeyData.user?.status)}`}>
                          {journeyData.user?.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">የተመደበበት ክፍል (Department)</span>
                      <p className="text-xs font-bold text-slate-800 mt-1">
                        {journeyData.user?.departmentId?.name || 'Church-wide / All'}
                      </p>
                    </div>
                  </div>

                  {/* Chronological Role History Timeline */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-2">
                      <span>⏳ የደረጃዎች የጊዜ ሰሌዳ (Role Progression Timeline)</span>
                    </h4>

                    {journeyData.user?.roleHistory && journeyData.user.roleHistory.length > 0 ? (
                      <div className="relative pl-6 border-l-2 border-amber-300 space-y-4 py-1">
                        {journeyData.user.roleHistory.map((item, idx) => (
                          <div key={idx} className="relative group">
                            <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-sm group-hover:scale-125 transition-transform" />
                            <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getRoleBadge(item.role)}`}>
                                  {item.role}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-400">
                                  {new Date(item.startDate).toLocaleDateString()} {item.endDate ? `— ${new Date(item.endDate).toLocaleDateString()}` : '— Present'}
                                </span>
                              </div>
                              {item.notes && (
                                <p className="text-xs text-slate-600 font-medium pt-0.5">{item.notes}</p>
                              )}
                              {item.changedBy && (
                                <p className="text-[10px] text-slate-400">የመዘገበው: {item.changedBy.fullName || item.changedBy.email}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400 border border-dashed border-slate-200">
                        የተመዘገበ የታሪክ ማስታወሻ የለም።
                      </div>
                    )}
                  </div>

                  {/* Sub-Profiles Grid (Preserved Records) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Student Record Card */}
                    <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                          <span>🎓 የተማሪነት መዝገብ</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          journeyData.student ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {journeyData.student ? 'ተገኝቷል (Preserved)' : 'የለም'}
                        </span>
                      </div>
                      {journeyData.student ? (
                        <div className="text-xs text-slate-600 space-y-1 pt-1">
                          <p><span className="font-semibold text-slate-500">የተማሪ መለያ: </span><span className="font-mono font-bold text-blue-700">{journeyData.student.studentId || 'TKD-STU'}</span></p>
                          <p><span className="font-semibold text-slate-500">ዓይነት: </span>{journeyData.student.studentType || 'regular'}</p>
                          <p><span className="font-semibold text-slate-500">ደረጃ/ባች: </span>{journeyData.student.batch || journeyData.student.grade || '—'}</p>
                          {journeyData.student.courses?.length > 0 && (
                            <p><span className="font-semibold text-slate-500">የተመዘገቡ ኮርሶች: </span>{journeyData.student.courses.length} ኮርሶች</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">የተማሪነት መዝገብ አልተገኘም።</p>
                      )}
                    </div>

                    {/* Teacher Record Card */}
                    <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <span>👨‍🏫 የመምህርነት መዝገብ</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          journeyData.teacher ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {journeyData.teacher ? 'ተገኝቷል (Preserved)' : 'የለም'}
                        </span>
                      </div>
                      {journeyData.teacher ? (
                        <div className="text-xs text-slate-600 space-y-1 pt-1">
                          <p><span className="font-semibold text-slate-500">የመምህር መለያ: </span><span className="font-mono font-bold text-amber-800">{journeyData.teacher.teacherId}</span></p>
                          <p><span className="font-semibold text-slate-500">ሁኔታ: </span>{journeyData.teacher.status}</p>
                          <p><span className="font-semibold text-slate-500">ምዝገባ ቀን: </span>{new Date(journeyData.teacher.registrationDate || journeyData.teacher.createdAt).toLocaleDateString()}</p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">የመምህርነት መዝገብ አልተገኘም።</p>
                      )}
                    </div>
                  </div>

                  {/* Department Service History */}
                  {journeyData.memberships && journeyData.memberships.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span>🏛️ የአገልግሎት ክፍሎች (Department Memberships)</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {journeyData.memberships.map((m) => (
                          <div key={m._id} className="p-3 bg-white border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                            <span className="font-bold text-slate-800">{m.departmentId?.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-600">{m.role || 'Member'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowJourneyModal(false)}
                className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
              >
                ዝጋ (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Edit User & Role (አባልና ሚና አሻሽል)</h3>
                <p className="text-xs text-blue-200">የአባሉን ሚና ሲቀይሩ ታሪኩና መረጃው አይጠፋም</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white/70 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {msg.text && (
                <div
                  className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                    msg.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-rose-50 border border-rose-200 text-rose-700'
                  }`}
                >
                  <span>{msg.type === 'success' ? '✅' : '⚠️'}</span>
                  <span>{msg.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={editForm.fullName}
                  onChange={handleEditChange}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role (ሚና)</label>
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleEditChange}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 cursor-pointer font-medium"
                  >
                    <option value="superadmin">👑 Super Admin (Full Access)</option>
                    <option value="department_admin">🏛️ Department Admin</option>
                    <option value="admin">Admin</option>
                    <option value="teacher">👨‍🏫 Teacher</option>
                    <option value="student">🎓 Student</option>
                    <option value="member">Church Member</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Department</label>
                  <select
                    name="departmentId"
                    value={editForm.departmentId}
                    onChange={handleEditChange}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Church-wide / All</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason / Promotion Note (የለውጡ ምክንያት / ማስታወሻ)
                </label>
                <input
                  type="text"
                  name="notes"
                  placeholder="e.g. ተማሪነቱን ጨርሶ ወደ መምህርነት ተዛውሯል (Graduated Batch 4)"
                  value={editForm.notes}
                  onChange={handleEditChange}
                  className="w-full p-2.5 border border-amber-300 bg-amber-50/30 rounded-xl text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 cursor-pointer font-medium"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleEditChange}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={editForm.city}
                    onChange={handleEditChange}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={saveEdit}
                className="px-5 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-xl text-xs font-bold hover:from-blue-800 hover:to-indigo-800 transition-all disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
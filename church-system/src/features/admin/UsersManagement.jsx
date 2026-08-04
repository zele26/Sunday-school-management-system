// src/features/admin/UsersManagement.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/apiClient';

const UsersManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [stats, setStats] = useState({ total: 0, admin: 0, teacher: 0, student: 0, pending: 0, approved: 0 });

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ role: '', status: '' });

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await apiFetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      const list = data.users || data || [];
      setUsers(list);
      setTotalPages(data.totalPages || 1);

      // Calculate stats
      setStats({
        total: data.total || list.length,
        admin: list.filter(u => u.role === 'admin').length,
        teacher: list.filter(u => u.role === 'teacher').length,
        student: list.filter(u => u.role === 'student').length,
        pending: list.filter(u => u.status === 'pending').length,
        approved: list.filter(u => u.status === 'approved' || u.status === 'active').length,
      });
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

  // ---------- Bulk Actions ----------
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u._id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(s => s !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const approveSelected = async () => {
    if (selectedUsers.length === 0) return;
    if (!confirm(`Approve ${selectedUsers.length} user(s)?`)) return;
    try {
      for (const id of selectedUsers) {
        await apiFetch(`/api/admin/users/${id}/approve`, { method: 'PUT' });
      }
      fetchUsers();
      setSelectedUsers([]);
      setSelectAll(false);
    } catch (err) {
      console.error(err);
    }
  };

  const rejectSelected = async () => {
    if (selectedUsers.length === 0) return;
    if (!confirm(`Reject ${selectedUsers.length} user(s)?`)) return;
    try {
      for (const id of selectedUsers) {
        await apiFetch(`/api/admin/users/${id}/reject`, { method: 'PUT' });
      }
      fetchUsers();
      setSelectedUsers([]);
      setSelectAll(false);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSelected = async () => {
    if (selectedUsers.length === 0) return;
    if (!confirm(`Delete ${selectedUsers.length} user(s)?`)) return;
    try {
      for (const id of selectedUsers) {
        await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      }
      fetchUsers();
      setSelectedUsers([]);
      setSelectAll(false);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------- Single User Actions ----------
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

  // ---------- Edit Modal ----------
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({ role: user.role, status: user.status });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    try {
      const res = await apiFetch(`/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ---------- Pagination ----------
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

  // Helper: role badge color
  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-purple-50 text-purple-700 border-purple-200',
      teacher: 'bg-amber-50 text-amber-700 border-amber-200',
      student: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return colors[role] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  // Helper: status badge color
  const getStatusBadge = (status) => {
    const colors = {
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      rejected: 'bg-rose-50 text-rose-700 border-rose-200',
      created: 'bg-slate-50 text-slate-700 border-slate-200',
    };
    return colors[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
            User Management
          </h2>
          <p className="text-sm text-slate-500">Manage all users, approve registrations, assign roles, and monitor activity.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
          <p className="text-xs text-blue-600 font-semibold uppercase">Total Users</p>
          <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100">
          <p className="text-xs text-purple-600 font-semibold uppercase">Admins</p>
          <p className="text-2xl font-bold text-purple-800">{stats.admin}</p>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-100">
          <p className="text-xs text-amber-600 font-semibold uppercase">Teachers</p>
          <p className="text-2xl font-bold text-amber-800">{stats.teacher}</p>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-100">
          <p className="text-xs text-emerald-600 font-semibold uppercase">Students</p>
          <p className="text-2xl font-bold text-emerald-800">{stats.student}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <select
          value={roleFilter}
          onChange={handleRoleFilter}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer min-w-[160px]"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>
        <select
          value={statusFilter}
          onChange={handleStatusFilter}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer min-w-[160px]"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="active">Active</option>
        </select>
        {selectedUsers.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={approveSelected}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              Approve ({selectedUsers.length})
            </button>
            <button
              onClick={rejectSelected}
              className="px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              Reject ({selectedUsers.length})
            </button>
            <button
              onClick={deleteSelected}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              Delete ({selectedUsers.length})
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Loading users...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-sm">
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id || u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(u._id)}
                          onChange={() => toggleSelectUser(u._id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {u.fullName || u.username}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getRoleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getStatusBadge(u.status)}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex gap-1.5 justify-end flex-wrap">
                          {u.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(u._id)}
                                className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all shadow-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(u._id)}
                                className="text-xs bg-yellow-50 text-yellow-700 font-semibold px-3 py-1.5 rounded-xl border border-yellow-200 hover:bg-yellow-100 transition-all shadow-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => openEditModal(u)}
                            className="text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-100 transition-all shadow-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(u._id)}
                            className="text-xs bg-rose-50 text-rose-700 font-semibold px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-100 transition-all shadow-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6 pt-4 border-t border-slate-100">
              {pageButtons()}
            </div>
          )}
        </>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100 space-y-5">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <h3 className="text-xl font-extrabold text-slate-800">Edit User</h3>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 font-bold transition-all"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase mb-1">User</p>
                <p className="font-medium text-slate-800">{editingUser.fullName}</p>
                <p className="text-sm text-slate-500">{editingUser.email}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role</label>
                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setShowEditModal(false)} 
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={saveEdit} 
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
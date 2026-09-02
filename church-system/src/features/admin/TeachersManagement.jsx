// src/features/admin/TeachersManagement.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, API_BASE_URL } from '../../api/apiClient';
import useAuthStore from '../../store/authStore';

const TeachersManagement = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Stats
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  useEffect(() => {
    fetchTeachers();
  }, [page, search, statusFilter]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await apiFetch(`/api/admin/teachers?${params}`);
      if (!res.ok) throw new Error('Failed to fetch teachers');
      const data = await res.json().catch(() => ({}));
      
      const teacherList = Array.isArray(data.teachers)
        ? data.teachers
        : Array.isArray(data)
        ? data
        : Array.isArray(data.users)
        ? data.users
        : [];

      setTeachers(teacherList);
      setTotalPages(data.totalPages || 1);
      
      // Update stats
      setStats({
        total: data.total ?? teacherList.length ?? 0,
        active: teacherList.filter(t => t && t.isActive !== false && t.status !== 'inactive').length,
        inactive: teacherList.filter(t => t && (t.isActive === false || t.status === 'inactive')).length,
      });
      
      setSelectedTeachers([]);
      setSelectAll(false);
    } catch (err) {
      console.error('Fetch teachers error:', err);
      setTeachers([]);
      setStats({ total: 0, active: 0, inactive: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  // ---------- Bulk actions ----------
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers((teachers || []).map(t => t._id).filter(Boolean));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectTeacher = (id) => {
    if (selectedTeachers.includes(id)) {
      setSelectedTeachers(selectedTeachers.filter(s => s !== id));
    } else {
      setSelectedTeachers([...selectedTeachers, id]);
    }
  };

  const deleteSelected = async () => {
    if (selectedTeachers.length === 0) return;
    if (!confirm(`Delete ${selectedTeachers.length} teacher(s)?`)) return;
    try {
      for (const id of selectedTeachers) {
        await apiFetch(`/api/admin/teachers/${id}`, { method: 'DELETE' });
      }
      fetchTeachers();
      setSelectedTeachers([]);
      setSelectAll(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await apiFetch(`/api/admin/teachers/${id}`, { method: 'DELETE' });
      fetchTeachers();
    } catch (err) {
      console.error(err);
    }
  };

  // Download CSV
  const handleDownload = () => {
    const token = useAuthStore.getState().accessToken;
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (statusFilter) params.append('status', statusFilter);
    if (token) params.append('token', token);
    window.open(`${API_BASE_URL}/api/admin/teachers/export?${params.toString()}`, '_blank');
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
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-amber-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            Teacher Management
          </h2>
          <p className="text-sm text-slate-500">Manage teachers, assign courses, track qualifications, and monitor activity.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleDownload}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <Link
            to="/admin/add-teacher"
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Teacher
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
          <p className="text-xs text-blue-600 font-semibold uppercase">Total Teachers</p>
          <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-100">
          <p className="text-xs text-emerald-600 font-semibold uppercase">Active</p>
          <p className="text-2xl font-bold text-emerald-800">{stats.active}</p>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-100">
          <p className="text-xs text-amber-600 font-semibold uppercase">Inactive</p>
          <p className="text-2xl font-bold text-amber-800">{stats.inactive}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100">
          <p className="text-xs text-purple-600 font-semibold uppercase">Subjects</p>
          <p className="text-2xl font-bold text-purple-800">
            {new Set((teachers || []).map(t => t?.subject).filter(Boolean)).size}
          </p>
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
            placeholder="Search by name, email, or subject..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={handleStatusFilter}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer min-w-[160px]"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {selectedTeachers.length > 0 && (
          <button
            onClick={deleteSelected}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            Delete Selected ({selectedTeachers.length})
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Loading teachers...</p>
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
                      className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                  </th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Teacher ID</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Qualification</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400">
                      No teachers found. Click "Add Teacher" to create one.
                    </td>
                  </tr>
                ) : (
                  teachers.map(t => (
                    <tr key={t._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={selectedTeachers.includes(t._id)}
                          onChange={() => toggleSelectTeacher(t._id)}
                          className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {t.fullName || `${t.firstName} ${t.lastName}`}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600 bg-slate-50/50 rounded-lg">
                        {t.teacherId || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{t.email}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-100">
                          {t.subject || '-'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{t.qualification || '-'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                          t.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {t.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex gap-1.5 justify-end flex-wrap">
                          <Link
                            to={`/admin/edit-teacher/${t._id}`}
                            className="text-xs bg-amber-50 text-amber-700 font-semibold px-3 py-1.5 rounded-xl border border-amber-200 hover:bg-amber-100 transition-all shadow-sm"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(t._id)}
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
          <div className="flex justify-center gap-2 mt-6 pt-4 border-t border-slate-100">
            {pageButtons()}
          </div>
        </>
      )}
    </div>
  );
};

export default TeachersManagement;
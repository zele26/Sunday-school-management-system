// src/features/admin/TeachersManagement.jsx
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';
import { Link } from 'react-router-dom';

const TeachersManagement = () => {
  const [teachers, setTeachers] = useState([]); // ✅ Always start as empty array
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, [page, search]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.append('search', search);
      const res = await apiFetch(`/api/admin/teachers?${params}`);
      if (res.ok) {
        const data = await res.json();
        // ✅ Ensure teachers is always an array
        setTeachers(data.teachers || []);
        setTotalPages(data.totalPages || 1);
      } else {
        // On error, set empty array to avoid crash
        setTeachers([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setTeachers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    try {
      const res = await apiFetch(`/api/admin/teachers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTeachers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Safe render – if teachers is empty or still loading, show appropriate UI
  if (loading) {
    return <div className="py-10 text-center">Loading teachers...</div>;
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Teachers Management</h2>
        <Link
          to="/admin/add-teacher"
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold"
        >
          + Add Teacher
        </Link>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 p-2 border rounded-xl"
        />
      </div>

      {/* Table – safe even if teachers is [] */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Qualification</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {teachers.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-slate-400">
                  No teachers found.
                </td>
              </tr>
            ) : (
              teachers.map((t) => (
                <tr key={t._id}>
                  <td className="p-3 font-medium">
                    {t.firstName} {t.lastName}
                  </td>
                  <td className="p-3">{t.email}</td>
                  <td className="p-3">{t.subject || '-'}</td>
                  <td className="p-3">{t.qualification || '-'}</td>
                  <td className="p-3 flex gap-2">
                    <Link to={`/admin/edit-teacher/${t._id}`} className="text-blue-600 text-xs">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(t._id)} className="text-red-600 text-xs">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded-xl text-xs ${p === page ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachersManagement;
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';

const PeopleManagement = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPeople();
  }, [page, search]);

  const fetchPeople = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search.trim()) params.append('search', search.trim());
      const res = await apiFetch(`/api/core/persons?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPeople(data.persons || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">People</h2>
        <button onClick={fetchPeople} className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl">
          🔄 Refresh
        </button>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
        />
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading people...</div>
      ) : people.length === 0 ? (
        <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
          No people found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-xs uppercase text-slate-400">
                <th className="py-2 px-2">Name</th>
                <th className="py-2 px-2">Phone</th>
                <th className="py-2 px-2">Email</th>
                <th className="py-2 px-2">Gender</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {people.map(p => (
                <tr key={p._id} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-medium text-slate-800">
                    {p.firstName} {p.middleName} {p.lastName}
                  </td>
                  <td className="py-2 px-2">{p.phone || '-'}</td>
                  <td className="py-2 px-2">{p.email || '-'}</td>
                  <td className="py-2 px-2">{p.gender || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              p === page ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PeopleManagement;
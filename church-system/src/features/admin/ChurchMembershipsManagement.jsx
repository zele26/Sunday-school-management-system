import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';

const ChurchMembershipsManagement = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Form state
  const [personId, setPersonId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [personSearch, setPersonSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/core/church-memberships');
      if (res.ok) {
        const data = await res.json();
        setMemberships(data.memberships || []);
      } else {
        setError('Failed to load memberships');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonSearch = async (e) => {
    const query = e.target.value;
    setPersonSearch(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await apiFetch(`/api/core/persons?search=${encodeURIComponent(query)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.persons || []);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectPerson = (person) => {
    setPersonId(person._id);
    setPersonSearch(`${person.firstName} ${person.lastName}`);
    setShowDropdown(false);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!personId || !memberId) {
      alert('Please select person and enter member ID');
      return;
    }
    try {
      const res = await apiFetch('/api/core/church-memberships', {
        method: 'POST',
        body: JSON.stringify({ personId, memberId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Church membership assigned successfully!');
        setPersonId('');
        setMemberId('');
        setPersonSearch('');
        fetchMemberships();
      } else {
        setMessage(`❌ ${data.message || 'Failed to assign'}`);
      }
    } catch (err) {
      setMessage('❌ Network error');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Church Memberships</h2>
        <button onClick={fetchMemberships} className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl">
          🔄 Refresh
        </button>
      </div>

      {error && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-sm">{error}</div>}
      {message && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm">{message}</div>}

      {/* Assign Membership Form */}
      <form onSubmit={handleAssign} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
        <div className="relative">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Search Person</label>
          <input
            type="text"
            value={personSearch}
            onChange={handlePersonSearch}
            placeholder="Type name, phone, or email..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm"
          />
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">
              {searchResults.map(person => (
                <button
                  type="button"
                  key={person._id}
                  onClick={() => selectPerson(person)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm"
                >
                  {person.firstName} {person.lastName} — {person.phone || person.email}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Permanent Member ID</label>
          <input
            type="text"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            placeholder="e.g., MEM-000123"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
        >
          Assign Membership
        </button>
      </form>

      {/* Memberships Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading memberships...</div>
      ) : memberships.length === 0 ? (
        <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
          No church memberships found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-xs uppercase text-slate-400">
                <th className="py-2 px-2">Person</th>
                <th className="py-2 px-2">Member ID</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Assigned At</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {memberships.map(m => (
                <tr key={m._id} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-medium text-slate-800">
                    {m.personId ? `${m.personId.firstName} ${m.personId.lastName}` : 'Unknown'}
                  </td>
                  <td className="py-2 px-2 font-mono text-xs">{m.memberId}</td>
                  <td className="py-2 px-2">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                      {m.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-xs text-slate-500">
                    {m.assignedAt ? new Date(m.assignedAt).toLocaleDateString() : '-'}
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

export default ChurchMembershipsManagement;
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';

const DepartmentMembershipsManagement = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state for adding a new membership
  const [form, setForm] = useState({
    personId: '',
    departmentId: '',
    departmentMemberId: '',
    status: 'active',
  });

  const [people, setPeople] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchMemberships();
    fetchPeople();
    fetchDepartments();
  }, []);

  const fetchMemberships = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/core/department-memberships');
      if (res.ok) {
        const data = await res.json();
        setMemberships(data.memberships || []);
      } else {
        setError('Failed to load memberships');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPeople = async () => {
    try {
      const res = await apiFetch('/api/core/persons?limit=100');
      if (res.ok) {
        const data = await res.json();
        setPeople(data.persons || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await apiFetch('/api/core/departments');
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddMembership = async (e) => {
    e.preventDefault();
    if (!form.personId || !form.departmentId) {
      alert('Please select person and department');
      return;
    }
    try {
      const res = await apiFetch('/api/core/department-memberships', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setForm({ personId: '', departmentId: '', departmentMemberId: '', status: 'active' });
        fetchMemberships();
      } else {
        alert(data.message || 'Failed to add membership');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Department Memberships</h2>
        <button onClick={fetchMemberships} className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl">
          🔄 Refresh
        </button>
      </div>

      {/* Add Membership Form */}
      <form onSubmit={handleAddMembership} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-5 gap-3">
        <select
          name="personId"
          value={form.personId}
          onChange={handleChange}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
          required
        >
          <option value="">Select Person</option>
          {people.map(p => (
            <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>
          ))}
        </select>

        <select
          name="departmentId"
          value={form.departmentId}
          onChange={handleChange}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
          required
        >
          <option value="">Select Department</option>
          {departments.map(d => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>

        <input
          type="text"
          name="departmentMemberId"
          placeholder="Dept Member ID (optional)"
          value={form.departmentMemberId}
          onChange={handleChange}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
        >
          Add
        </button>
      </form>

      {/* Memberships Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading memberships...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">{error}</div>
      ) : memberships.length === 0 ? (
        <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
          No memberships found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-xs uppercase text-slate-400">
                <th className="py-2 px-2">Person</th>
                <th className="py-2 px-2">Department</th>
                <th className="py-2 px-2">Dept Member ID</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Start Date</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {memberships.map(m => (
                <tr key={m._id} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-medium text-slate-800">
                    {m.personId ? `${m.personId.firstName} ${m.personId.lastName}` : 'Unknown'}
                  </td>
                  <td className="py-2 px-2">{m.departmentId ? m.departmentId.name : '-'}</td>
                  <td className="py-2 px-2 font-mono text-xs">{m.departmentMemberId || '-'}</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      m.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      m.status === 'inactive' ? 'bg-slate-100 text-slate-600' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-xs text-slate-500">
                    {m.startDate ? new Date(m.startDate).toLocaleDateString() : '-'}
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

export default DepartmentMembershipsManagement;
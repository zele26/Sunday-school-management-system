// src/features/admin/UsersManagement.jsx
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiFetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Users Management</h2>
          <p className="text-xs text-slate-500">Manage students, teachers, and system administrators.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          + Add User
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-400 text-sm">Loading user list...</div>
      ) : users.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm">No users registered yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-2">Name</th>
                <th className="py-3 px-2">Email / Username</th>
                <th className="py-3 px-2">Role</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {users.map((u) => (
                <tr key={u._id || u.id} className="hover:bg-slate-50">
                  <td className="py-3 px-2 font-medium">{u.fullName || u.username}</td>
                  <td className="py-3 px-2 text-slate-500">{u.email || u.username}</td>
                  <td className="py-3 px-2">
                    <span className="bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-lg text-xs">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`font-semibold px-2.5 py-1 rounded-lg text-xs ${
                        u.status === 'approved'
                          ? 'bg-green-50 text-green-600'
                          : u.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <button className="text-xs text-red-500 font-semibold hover:underline">Delete</button>
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

export default UsersManagement;
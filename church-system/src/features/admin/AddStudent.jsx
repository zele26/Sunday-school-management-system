// src/features/admin/AddStudent.jsx
import React, { useState } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const AddStudent = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    grade: '',
    parentName: '',
    parentPhone: '',
    address: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!formData.fullName || !formData.email || !formData.password) {
      return setMessage({
        text: 'Please fill in all required fields (full name, email, password).',
        type: 'error'
      });
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setMessage({
          text: `Student "${data.user?.fullName}" created successfully!`,
          type: 'success',
        });
        setFormData({
          fullName: '',
          email: '',
          password: '',
          grade: '',
          parentName: '',
          parentPhone: '',
          address: ''
        });
      } else {
        setMessage({ text: data.message || 'Failed to create student.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">Add New Student</h2>
        <p className="text-xs text-slate-500 mt-1">
          Create a student account manually. They can log in immediately.
        </p>
      </div>

      {message.text && (
        <div
          className={`p-3 rounded-xl text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name *"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <input
          type="email"
          name="email"
          placeholder="Email *"
          value={formData.email}
          onChange={handleChange}
          required
          className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <input
          type="password"
          name="password"
          placeholder="Temporary Password *"
          value={formData.password}
          onChange={handleChange}
          required
          className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <input
          type="text"
          name="grade"
          placeholder="Grade (e.g., Grade 10)"
          value={formData.grade}
          onChange={handleChange}
          className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <input
          type="text"
          name="parentName"
          placeholder="Parent / Guardian Name"
          value={formData.parentName}
          onChange={handleChange}
          className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <input
          type="text"
          name="parentPhone"
          placeholder="Parent Phone"
          value={formData.parentPhone}
          onChange={handleChange}
          className="p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="md:col-span-2 p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center disabled:opacity-50 transition"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Create Student Account'
          )}
        </button>
      </form>
    </div>
  );
};

export default AddStudent;
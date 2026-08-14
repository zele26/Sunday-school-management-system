// src/features/admin/AddStudent.jsx
import React, { useState } from 'react';
import { apiFetch, API_BASE_URL } from '../../api/apiClient';

const AddStudent = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    // Student fields
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    grade: '',
    address: '',
    contactPhone: '',    // student's phone number
    // Account fields (for User creation)
    email: '',
    password: '',
    // Emergency contact fields
    emergencyFirstName: '',
    emergencyMiddleName: '',
    emergencyLastName: '',
    relationship: '',
    emergencyPhone: '',
    emergencyEmail: '',
    emergencyAddress: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      return setMessage({
        text: 'First name, last name, email, and password are required.',
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
          text: `Student "${data.student?.firstName} ${data.student?.lastName}" created successfully!`,
          type: 'success',
        });
        // Reset form
        setFormData({
          firstName: '',
          middleName: '',
          lastName: '',
          dob: '',
          grade: '',
          address: '',
          contactPhone: '',
          email: '',
          password: '',
          emergencyFirstName: '',
          emergencyMiddleName: '',
          emergencyLastName: '',
          relationship: '',
          emergencyPhone: '',
          emergencyEmail: '',
          emergencyAddress: '',
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
          Fill in the student's details. An account will be created automatically.
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
        {/* Personal Info */}
        <div className="md:col-span-2 text-sm font-semibold text-slate-600 border-b pb-2">
          Personal Information
        </div>
        <input type="text" name="firstName" placeholder="First Name *" value={formData.firstName} onChange={handleChange} required
          className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="text" name="middleName" placeholder="Middle Name" value={formData.middleName} onChange={handleChange}
          className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="text" name="lastName" placeholder="Last Name *" value={formData.lastName} onChange={handleChange} required
          className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="date" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleChange}
          className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="text" name="grade" placeholder="Grade (e.g., Grade 10)" value={formData.grade} onChange={handleChange}
          className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange}
          className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="text" name="contactPhone" placeholder="Student Phone" value={formData.contactPhone} onChange={handleChange}
          className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />

        {/* Account Info */}
        <div className="md:col-span-2 text-sm font-semibold text-slate-600 border-b pb-2 mt-2">
          Account (for login)
        </div>
        <input type="email" name="email" placeholder="Email *" value={formData.email} onChange={handleChange} required
          className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="password" name="password" placeholder="Temporary Password *" value={formData.password} onChange={handleChange} required
          className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />

        {/* Emergency Contact */}
        <div className="md:col-span-2 text-sm font-semibold text-slate-600 border-b pb-2 mt-2">
          Emergency Contact
        </div>
        <input type="text" name="emergencyFirstName" placeholder="First Name" value={formData.emergencyFirstName} onChange={handleChange}
          className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="text" name="emergencyMiddleName" placeholder="Middle Name" value={formData.emergencyMiddleName} onChange={handleChange}
          className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="text" name="emergencyLastName" placeholder="Last Name" value={formData.emergencyLastName} onChange={handleChange}
          className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="text" name="relationship" placeholder="Relationship (e.g., Mother)" value={formData.relationship} onChange={handleChange}
          className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="text" name="emergencyPhone" placeholder="Phone" value={formData.emergencyPhone} onChange={handleChange}
          className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="email" name="emergencyEmail" placeholder="Email" value={formData.emergencyEmail} onChange={handleChange}
          className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="text" name="emergencyAddress" placeholder="Address" value={formData.emergencyAddress} onChange={handleChange}
          className="md:col-span-2 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />

        <button type="submit" disabled={loading}
          className="md:col-span-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center disabled:opacity-50 transition">
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Create Student Account'}
        </button>
      </form>
    </div>
  );
};

export default AddStudent;
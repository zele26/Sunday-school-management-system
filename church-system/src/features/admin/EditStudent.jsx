// src/features/admin/EditStudent.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/apiClient';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    grade: '',
    address: '',
    studentType: 'regular',
    emergencyFirstName: '',
    emergencyMiddleName: '',
    emergencyLastName: '',
    relationship: '',
    contactPhone: '',
    contactEmail: '',
    contactAddress: '',
    dob: '',
  });

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await apiFetch(`/api/admin/students/${id}`);
        if (res.ok) {
          const data = await res.json();
          const s = data.student;
          setForm({
            firstName: s.firstName || '',
            middleName: s.middleName || '',
            lastName: s.lastName || '',
            email: s.userId?.email || '',
            phone: s.studentPhone || '',
            grade: s.grade || '',
            address: s.address || '',
            studentType: s.studentType || 'regular',
            emergencyFirstName: s.emergencyFirstName || s.parentName || '',
            emergencyMiddleName: s.emergencyMiddleName || '',
            emergencyLastName: s.emergencyLastName || '',
            relationship: s.relationship || 'Father',
            contactPhone: s.emergencyPhone || s.contactPhone || s.parentPhone || '',
            contactEmail: s.emergencyEmail || s.contactEmail || s.parentEmail || '',
            contactAddress: s.emergencyAddress || s.contactAddress || '',
            educationLevel: s.educationLevel || '',
            profession: s.profession || '',
            gender: s.gender || 'Male',
            dob: s.dob || '',
          });
        } else {
          setMsg({ type: 'error', text: 'Failed to load student data.' });
        }
      } catch (err) {
        console.error(err);
        setMsg({ type: 'error', text: 'Network error.' });
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ type: '', text: '' });

    const payload = {
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim(),
      lastName: form.lastName.trim(),
      grade: form.grade,
      address: form.address.trim(),
      studentPhone: form.phone.trim(),
      studentType: form.studentType,
      emergencyFirstName: form.emergencyFirstName.trim(),
      emergencyMiddleName: form.emergencyMiddleName.trim(),
      emergencyLastName: form.emergencyLastName.trim(),
      relationship: form.relationship.trim(),
      contactPhone: form.contactPhone.trim(),
      contactEmail: form.contactEmail.trim(),
      contactAddress: form.contactAddress.trim(),
      dob: form.dob,
    };

    try {
      const res = await apiFetch(`/api/admin/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: '✅ Student updated successfully!' });
        setTimeout(() => navigate('/admin/students'), 1500);
      } else {
        setMsg({ type: 'error', text: data.message || 'Failed to update student.' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Network error.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-slate-500">Loading student data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 p-6 sm:p-8 text-white relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl border border-white/20 shadow-inner">
              ✏️
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">አስተካክል ተማሪ (Edit Student)</h2>
              <p className="text-xs text-indigo-200 mt-1 font-medium">
                የተማሪውን መረጃ ያዘምኑ (Update student information)
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {msg.text && (
            <div
              className={`p-4 rounded-2xl text-sm font-medium flex items-center gap-3 ${
                msg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-rose-50 border border-rose-200 text-rose-700'
              }`}
            >
              <span className="text-lg">{msg.type === 'success' ? '✅' : '⚠️'}</span>
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Personal Info */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
                <span className="text-indigo-600 font-bold text-sm">01.</span>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  የግል መረጃ (Personal Info)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ስም * (First Name)</label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">የአባት ስም (Middle Name)</label>
                  <input
                    type="text"
                    name="middleName"
                    value={form.middleName}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">የአያት ስም * (Last Name)</label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ኢሜይል (Email)</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    disabled
                    className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-400 mt-1">ኢሜይል መቀየር አይቻልም (Cannot change email)</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ስልክ (Phone)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ደረጃ (Grade)</label>
                  <select
                    name="grade"
                    value={form.grade}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  >
                    <option value="">ይምረጡ (Select)</option>
                    {[7,8,9,10,11,12].map(g => (
                      <option key={g} value={`Grade ${g}`}>Grade {g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">የተማሪ አይነት (Type)</label>
                  <select
                    name="studentType"
                    value={form.studentType}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  >
                    <option value="regular">Regular</option>
                    <option value="distance">Distance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">የትውልድ ቀን (DOB)</label>
                  <input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">አድራሻ (Address)</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                />
              </div>
            </div>

            {/* Section 2: Emergency Contact */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
                <span className="text-indigo-600 font-bold text-sm">02.</span>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  የአደጋ ጊዜ ተጠሪ (Emergency Contact)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ስም (First Name)</label>
                  <input
                    type="text"
                    name="emergencyFirstName"
                    value={form.emergencyFirstName}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">የአባት ስም</label>
                  <input
                    type="text"
                    name="emergencyMiddleName"
                    value={form.emergencyMiddleName}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">የአያት ስም</label>
                  <input
                    type="text"
                    name="emergencyLastName"
                    value={form.emergencyLastName}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ዝምድና (Relationship)</label>
                  <input
                    type="text"
                    name="relationship"
                    value={form.relationship}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ስልክ (Phone)</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={form.contactPhone}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ኢሜይል (Email)</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={form.contactEmail}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">አድራሻ (Address)</label>
                  <input
                    type="text"
                    name="contactAddress"
                    value={form.contactAddress}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/students')}
                className="px-6 py-3 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                ተመለስ (Cancel)
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>ያዘምኑ (Update Student)</span>
                    <span>➔</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStudent;
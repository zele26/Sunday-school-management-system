// src/features/admin/EditTeacher.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/apiClient';

const EditTeacher = () => {
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
    subject: '',
    qualification: '',
    experience: '',
    bio: '',
    address: '',
    city: '',
    gender: '',
    dateOfBirth: '',
    coursesTaught: [],
  });
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch teacher details
        const teacherRes = await apiFetch(`/api/admin/teachers/${id}`);
        if (teacherRes.ok) {
          const data = await teacherRes.json();
          const teacher = data.teacher || data;
          if (teacher) {
            let fName = teacher.firstName || '';
            let mName = teacher.middleName || '';
            let lName = teacher.lastName || '';

            if (!fName && teacher.fullName) {
              const parts = teacher.fullName.trim().split(/\s+/);
              fName = parts[0] || '';
              if (parts.length === 2) {
                lName = parts[1] || '';
              } else if (parts.length > 2) {
                mName = parts.slice(1, -1).join(' ');
                lName = parts[parts.length - 1] || '';
              }
            }

            let dob = '';
            if (teacher.dateOfBirth) {
              dob = typeof teacher.dateOfBirth === 'string'
                ? teacher.dateOfBirth.split('T')[0]
                : new Date(teacher.dateOfBirth).toISOString().split('T')[0];
            }

            setForm({
              firstName: fName,
              middleName: mName,
              lastName: lName,
              email: teacher.email || teacher.userId?.email || '',
              phone: teacher.phone || teacher.userId?.phone || '',
              subject: teacher.subject || '',
              qualification: teacher.qualification || '',
              experience: teacher.experience || '',
              bio: teacher.bio || '',
              address: teacher.address || '',
              city: teacher.city || '',
              gender: teacher.gender || '',
              dateOfBirth: dob,
              coursesTaught: Array.isArray(teacher.coursesTaught) ? teacher.coursesTaught : [],
            });
            setSelectedCourses(Array.isArray(teacher.coursesTaught) ? teacher.coursesTaught : []);
          }
        } else {
          const errData = await teacherRes.json().catch(() => ({}));
          setMsg({ type: 'error', text: errData.message || 'Failed to load teacher data.' });
        }

        // Fetch courses for selection
        const coursesRes = await apiFetch('/api/admin/courses');
        if (coursesRes.ok) {
          const data = await coursesRes.json().catch(() => []);
          if (Array.isArray(data)) setAvailableCourses(data);
          else if (data.courses && Array.isArray(data.courses)) setAvailableCourses(data.courses);
        }
      } catch (err) {
        console.error('Fetch teacher error:', err);
        setMsg({ type: 'error', text: 'Network error.' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleCourseSelection = (courseName) => {
    let updated;
    if (selectedCourses.includes(courseName)) {
      updated = selectedCourses.filter((c) => c !== courseName);
    } else {
      updated = [...selectedCourses, courseName];
    }
    setSelectedCourses(updated);
    setForm((prev) => ({ ...prev, coursesTaught: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ type: '', text: '' });

    // Build fullName from parts
    const fullName = [form.firstName, form.middleName, form.lastName]
      .filter(Boolean)
      .map(s => s.trim())
      .join(' ');

    const payload = {
      fullName,
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      subject: form.subject.trim(),
      qualification: form.qualification.trim(),
      experience: form.experience,
      bio: form.bio.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      coursesTaught: selectedCourses,
    };

    try {
      const res = await apiFetch(`/api/admin/teachers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: '✅ Teacher updated successfully!' });
        setTimeout(() => navigate('/admin/teachers'), 1500);
      } else {
        setMsg({ type: 'error', text: data.message || 'Failed to update teacher.' });
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
        <span className="ml-3 text-slate-500">Loading teacher data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 p-6 sm:p-8 text-white relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl border border-white/20 shadow-inner">
              ✏️
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">መምህር አስተካክል (Edit Teacher)</h2>
              <p className="text-xs text-amber-200 mt-1 font-medium">
                የመምህሩን መረጃ ያዘምኑ (Update teacher information)
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
            {/* Section 1: Identity */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
                <span className="text-amber-600 font-bold text-sm">01.</span>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  መሠረታዊ መረጃ (Account & Identity)
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
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
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
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">የአያት ስም * (Last Name)</label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ኢሜይል * (Email)</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ስልክ (Phone)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ጾታ (Gender)</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                  >
                    <option value="">ይምረጡ (Select)</option>
                    <option value="Male">ወንድ (Male)</option>
                    <option value="Female">ሴት (Female)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">የትውልድ ቀን (Date of Birth)</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Teaching */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
                <span className="text-amber-600 font-bold text-sm">02.</span>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  የትምህርት ዝግጅትና ልምድ (Qualifications & Teaching)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ዘርፍ / ርዕስ (Subject)</label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ልምድ (Experience)</label>
                  <select
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                  >
                    <option value="">ይምረጡ (Select)</option>
                    <option value="Less than 1 year">ከ 1 ዓመት በታች (&lt; 1 Year)</option>
                    <option value="1 - 3 years">1 - 3 ዓመት</option>
                    <option value="3 - 5 years">3 - 5 ዓመት</option>
                    <option value="5+ years">ከ 5 ዓመት በላይ</option>
                    <option value="10+ years">ከ 10 ዓመት በላይ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">የትምህርት ደረጃ (Qualification)</label>
                  <input
                    type="text"
                    name="qualification"
                    value={form.qualification}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Courses Taught */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  የሚያስተምሯቸው ኮርሶች (Courses Taught)
                </label>
                <input
                  type="text"
                  name="coursesTaught"
                  placeholder="ኮርሶችን በኮማ ይለዩ (e.g. Church History, Bible Study)"
                  value={selectedCourses.join(', ')}
                  onChange={(e) => {
                    const val = e.target.value;
                    const arr = val.split(',').map(s => s.trim()).filter(Boolean);
                    setSelectedCourses(arr);
                    setForm(prev => ({ ...prev, coursesTaught: arr }));
                  }}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none mb-2"
                />

                {availableCourses.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-slate-500 font-medium">
                      ከቀረቡት ኮርሶች ይምረጡ (Quick-select existing courses):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableCourses.map((course) => {
                        const courseName = course.name || course.title || course;
                        const isSelected = selectedCourses.includes(courseName);
                        return (
                          <button
                            type="button"
                            key={course._id || courseName}
                            onClick={() => toggleCourseSelection(courseName)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <span>{courseName}</span>
                            <span>{isSelected ? '✓' : '+'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Address & Emergency */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
                <span className="text-amber-600 font-bold text-sm">03.</span>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  አድራሻ እና የአደጋ ጊዜ ተጠሪ (Address & Emergency Contact)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ከተማ (City)</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ጠቅላይ አድራሻ (Address)</label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">የአደጋ ጊዜ ተጠሪ (Emergency Name)</label>
                  <input
                    type="text"
                    name="emergencyPersonName"
                    value={form.emergencyPersonName || ''}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ስልክ (Emergency Phone)</label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={form.emergencyPhone || ''}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Bio */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
                <span className="text-amber-600 font-bold text-sm">04.</span>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  ተጨማሪ ማስታወሻ (Bio & Notes)
                </h3>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">ስለ መምህሩ አጭር መግለጫ (Short Bio)</label>
                <textarea
                  name="bio"
                  rows="3"
                  value={form.bio}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none resize-none"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/teachers')}
                className="px-6 py-3 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                ተመለስ (Cancel)
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>ያዘምኑ (Update Teacher)</span>
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

export default EditTeacher;
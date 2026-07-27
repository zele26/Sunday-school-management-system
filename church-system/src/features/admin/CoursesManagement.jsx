// src/features/admin/CoursesManagement.jsx
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';

const CoursesManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ageFilter, setAgeFilter] = useState('');
  const [studentTypeFilter, setStudentTypeFilter] = useState('');   // NEW
  const [gradeFilter, setGradeFilter] = useState('');                // NEW

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState(initialFormState());

  // Teacher list for dropdown
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, [search, statusFilter, ageFilter, studentTypeFilter, gradeFilter]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (ageFilter) params.append('ageGroup', ageFilter);
      if (studentTypeFilter) params.append('studentType', studentTypeFilter);   // NEW
      if (gradeFilter) params.append('grade', gradeFilter);                     // NEW

      const res = await apiFetch(`/api/admin/courses?${params}`);
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await apiFetch('/api/admin/teachers');
      if (res.ok) {
        const data = await res.json();
        setTeachers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  function initialFormState() {
    return {
      name: '',
      ageGroup: 'Youth',
      department: '',
      teacher: '',
      bibleTheme: '',
      mainBibleVerse: '',
      bibleBooks: '',
      lessonDuration: 60,
      numberOfLessons: 1,
      startDate: '',
      endDate: '',
      schedule: '',
      language: '',
      learningObjectives: '',
      requiredMaterials: '',
      courseImage: '',
      status: 'Active',
      certificateAvailable: false,
      prerequisiteCourse: '',
      studentType: 'regular',     // NEW
      grade: '',                  // NEW
    };
  }

  const openAddModal = () => {
    setEditingCourse(null);
    setForm(initialFormState());
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setForm({
      name: course.name || '',
      ageGroup: course.ageGroup || 'Youth',
      department: course.department || '',
      teacher: course.teacher?._id || '',
      bibleTheme: course.bibleTheme || '',
      mainBibleVerse: course.mainBibleVerse || '',
      bibleBooks: Array.isArray(course.bibleBooks) ? course.bibleBooks.join(', ') : '',
      lessonDuration: course.lessonDuration || 60,
      numberOfLessons: course.numberOfLessons || 1,
      startDate: course.startDate ? course.startDate.substring(0, 10) : '',
      endDate: course.endDate ? course.endDate.substring(0, 10) : '',
      schedule: course.schedule || '',
      language: course.language || '',
      learningObjectives: course.learningObjectives || '',
      requiredMaterials: Array.isArray(course.requiredMaterials) ? course.requiredMaterials.join(', ') : '',
      courseImage: course.courseImage || '',
      status: course.status || 'Active',
      certificateAvailable: course.certificateAvailable || false,
      prerequisiteCourse: course.prerequisiteCourse?._id || '',
      studentType: course.studentType || 'regular',   // NEW
      grade: course.grade || '',                       // NEW
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedForm = { ...form };
    if (!cleanedForm.teacher) delete cleanedForm.teacher;
    if (!cleanedForm.prerequisiteCourse) delete cleanedForm.prerequisiteCourse;

    // If distance, remove grade so it doesn't send an empty string
    if (cleanedForm.studentType === 'distance') {
      delete cleanedForm.grade;
    }

    const url = editingCourse
      ? `/api/admin/courses/${editingCourse._id}`
      : '/api/admin/courses';
    const method = editingCourse ? 'PUT' : 'POST';

    try {
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(cleanedForm),
      });
      if (res.ok) {
        setShowModal(false);
        fetchCourses();
      } else {
        const data = await res.json();
        alert(data.message || 'Error saving course');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      const res = await apiFetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCourses();
      } else {
        alert('Could not delete course');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  return (
    <div className="bg-slate-50/50 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Card / Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Course Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage, filter, and structure your educational curriculum.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all duration-150 ease-in-out cursor-pointer"
        >
          <svg className="w-4 h-4 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Course
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, theme..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Age Filter */}
          <select
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="">All Ages</option>
            <option value="Children">Children</option>
            <option value="Teens">Teens</option>
            <option value="Youth">Youth</option>
            <option value="Adults">Adults</option>
          </select>

          {/* Student Type Filter */}
          <select
            value={studentTypeFilter}
            onChange={(e) => setStudentTypeFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="regular">Regular</option>
            <option value="distance">Distance</option>
          </select>

          {/* Grade Filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            disabled={studentTypeFilter === 'distance'}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Grades</option>
            {['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <svg className="w-7 h-7 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-medium">Loading courses...</span>
          </div>
        ) : courses.length === 0 ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <svg className="w-10 h-10 text-slate-300 stroke-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-sm font-medium text-slate-500">No courses found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Course Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Grade</th>
                  <th className="py-3.5 px-4">Age Group</th>
                  <th className="py-3.5 px-4">Teacher</th>
                  <th className="py-3.5 px-4">Schedule</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {courses.map(course => (
                  <tr key={course._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{course.name}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        course.studentType === 'distance'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {course.studentType === 'distance' ? 'Distance' : 'Regular'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{course.grade || 'All'}</td>
                    <td className="py-3.5 px-4 text-slate-600">{course.ageGroup}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{course.teacher?.fullName || 'Unassigned'}</td>
                    <td className="py-3.5 px-4 text-slate-600">{course.schedule || '-'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        course.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${course.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {course.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(course)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(course._id)}
                          className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md rounded-t-3xl z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingCourse ? 'Edit Course' : 'Add New Course'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Fill out the information below to configure course parameters.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
              
              {/* Section 1: Classification */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Classification & Basic Info</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Student Type</label>
                    <select
                      name="studentType"
                      value={form.studentType}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="regular">Regular</option>
                      <option value="distance">Distance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Grade</label>
                    <select
                      name="grade"
                      value={form.grade}
                      onChange={handleChange}
                      required={form.studentType === 'regular'}
                      disabled={form.studentType === 'distance'}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Grade</option>
                      {['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Course Name *</label>
                    <input
                      name="name"
                      placeholder="e.g., Intro to Theology"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Age Group</label>
                    <select
                      name="ageGroup"
                      value={form.ageGroup}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="Children">Children</option>
                      <option value="Teens">Teens</option>
                      <option value="Youth">Youth</option>
                      <option value="Adults">Adults</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                    <input
                      name="department"
                      placeholder="e.g., Youth Ministry"
                      value={form.department}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Teacher</label>
                    <select
                      name="teacher"
                      value={form.teacher}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map(t => (
                        <option key={t._id} value={t._id}>{t.fullName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Section 2: Biblical & Curriculum Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Biblical & Curriculum Content</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bible Theme</label>
                    <input
                      name="bibleTheme"
                      placeholder="e.g., Grace & Faith"
                      value={form.bibleTheme}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Main Bible Verse</label>
                    <input
                      name="mainBibleVerse"
                      placeholder="e.g., Ephesians 2:8-9"
                      value={form.mainBibleVerse}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bible Books (comma separated)</label>
                    <input
                      name="bibleBooks"
                      placeholder="e.g., Genesis, Romans, Galatians"
                      value={form.bibleBooks}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Learning Objectives</label>
                    <textarea
                      name="learningObjectives"
                      placeholder="Describe what students will gain..."
                      value={form.learningObjectives}
                      onChange={handleChange}
                      rows="2"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Section 3: Schedule & Logistics */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">3. Logistics & Resources</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Lesson Duration (mins)</label>
                    <input
                      type="number"
                      name="lessonDuration"
                      placeholder="60"
                      value={form.lessonDuration}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Lessons</label>
                    <input
                      type="number"
                      name="numberOfLessons"
                      placeholder="1"
                      value={form.numberOfLessons}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Schedule</label>
                    <input
                      name="schedule"
                      placeholder="e.g., Sunday 10:00 AM"
                      value={form.schedule}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Language</label>
                    <input
                      name="language"
                      placeholder="e.g., English, Amharic"
                      value={form.language}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Required Materials (comma separated)</label>
                    <input
                      name="requiredMaterials"
                      placeholder="e.g., Bible, Notebook, Pen"
                      value={form.requiredMaterials}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Course Image URL</label>
                    <input
                      name="courseImage"
                      placeholder="https://..."
                      value={form.courseImage}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Prerequisite Course ID (optional)</label>
                    <input
                      name="prerequisiteCourse"
                      placeholder="e.g., 60d5ecb8b3f1c20015f8e4b1"
                      value={form.prerequisiteCourse}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <label className="inline-flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl w-full cursor-pointer hover:bg-slate-100/80 transition-colors">
                      <input
                        type="checkbox"
                        name="certificateAvailable"
                        checked={form.certificateAvailable}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700">Certificate Available upon completion</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {editingCourse ? 'Update Course' : 'Save Course'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesManagement;
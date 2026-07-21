// src/features/admin/CoursesManagement.jsx
import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const CoursesManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ageFilter, setAgeFilter] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState(initialFormState());

  // Teacher list for dropdown
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, [search, statusFilter, ageFilter]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (ageFilter) params.append('ageGroup', ageFilter);

      const res = await fetch(`${API_BASE_URL}/api/admin/courses?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/admin/teachers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setTeachers(data);
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
    const token = localStorage.getItem('token');

    const url = editingCourse
      ? `${API_BASE_URL}/api/admin/courses/${editingCourse._id}`
      : `${API_BASE_URL}/api/admin/courses`;
    const method = editingCourse ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
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
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/admin/courses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      fetchCourses();
    } else {
      alert('Could not delete course');
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    // Remove empty string fields that should be null
    const cleanedForm = { ...form };
    if (!cleanedForm.teacher) delete cleanedForm.teacher;
    if (!cleanedForm.prerequisiteCourse) delete cleanedForm.prerequisiteCourse;

    const url = editingCourse
      ? `${API_BASE_URL}/api/admin/courses/${editingCourse._id}`
      : `${API_BASE_URL}/api/admin/courses`;
    const method = editingCourse ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanedForm),
      });
      // ... rest unchanged
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Course Management</h2>
        <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
          + Add Course
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name, theme..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-xl text-sm flex-1 min-w-[200px]"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded-xl text-sm">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)}
          className="p-2 border rounded-xl text-sm">
          <option value="">All Ages</option>
          <option value="Children">Children</option>
          <option value="Teens">Teens</option>
          <option value="Youth">Youth</option>
          <option value="Adults">Adults</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-8 text-center text-slate-400">Loading courses...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-xs uppercase text-slate-400">
                <th className="py-2 px-2">Name</th>
                <th className="py-2 px-2">Age Group</th>
                <th className="py-2 px-2">Teacher</th>
                <th className="py-2 px-2">Schedule</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm text-slate-700">
              {courses.map(course => (
                <tr key={course._id} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-medium">{course.name}</td>
                  <td className="py-2 px-2">{course.ageGroup}</td>
                  <td className="py-2 px-2">{course.teacher?.fullName || 'Unassigned'}</td>
                  <td className="py-2 px-2">{course.schedule || '-'}</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${course.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 space-x-1">
                    <button onClick={() => openEditModal(course)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">Edit</button>
                    <button onClick={() => handleDelete(course._id)}
                      className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-lg">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
            <h3 className="text-lg font-bold mb-4">{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name" placeholder="Course Name *" value={form.name} onChange={handleChange} required
                className="p-2 border rounded-xl text-sm" />
              <select name="ageGroup" value={form.ageGroup} onChange={handleChange}
                className="p-2 border rounded-xl text-sm">
                <option value="Children">Children</option><option value="Teens">Teens</option>
                <option value="Youth">Youth</option><option value="Adults">Adults</option>
              </select>
              <input name="department" placeholder="Department" value={form.department} onChange={handleChange}
                className="p-2 border rounded-xl text-sm" />
              <select name="teacher" value={form.teacher} onChange={handleChange}
                className="p-2 border rounded-xl text-sm">
                <option value="">Select Teacher</option>
                {teachers.map(t => <option key={t._id} value={t._id}>{t.fullName}</option>)}
              </select>
              <input name="bibleTheme" placeholder="Bible Theme" value={form.bibleTheme} onChange={handleChange}
                className="p-2 border rounded-xl text-sm" />
              <input name="mainBibleVerse" placeholder="Main Bible Verse" value={form.mainBibleVerse} onChange={handleChange}
                className="p-2 border rounded-xl text-sm" />
              <input name="bibleBooks" placeholder="Bible Books (comma separated)" value={form.bibleBooks} onChange={handleChange}
                className="p-2 border rounded-xl text-sm md:col-span-2" />
              <input type="number" name="lessonDuration" placeholder="Lesson Duration (min)" value={form.lessonDuration} onChange={handleChange}
                className="p-2 border rounded-xl text-sm" />
              <input type="number" name="numberOfLessons" placeholder="Number of Lessons" value={form.numberOfLessons} onChange={handleChange}
                className="p-2 border rounded-xl text-sm" />
              <input type="date" name="startDate" placeholder="Start Date" value={form.startDate} onChange={handleChange}
                className="p-2 border rounded-xl text-sm" />
              <input type="date" name="endDate" placeholder="End Date" value={form.endDate} onChange={handleChange}
                className="p-2 border rounded-xl text-sm" />
              <input name="schedule" placeholder="Schedule (e.g., Sunday)" value={form.schedule} onChange={handleChange}
                className="p-2 border rounded-xl text-sm" />
              <input name="language" placeholder="Language" value={form.language} onChange={handleChange}
                className="p-2 border rounded-xl text-sm" />
              <textarea name="learningObjectives" placeholder="Learning Objectives" value={form.learningObjectives} onChange={handleChange}
                className="p-2 border rounded-xl text-sm md:col-span-2" rows="2" />
              <input name="requiredMaterials" placeholder="Required Materials (comma separated)" value={form.requiredMaterials} onChange={handleChange}
                className="p-2 border rounded-xl text-sm md:col-span-2" />
              <input name="courseImage" placeholder="Image URL" value={form.courseImage} onChange={handleChange}
                className="p-2 border rounded-xl text-sm md:col-span-2" />
              <select name="status" value={form.status} onChange={handleChange}
                className="p-2 border rounded-xl text-sm">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="certificateAvailable" checked={form.certificateAvailable} onChange={handleChange} />
                Certificate Available
              </label>
              <input name="prerequisiteCourse" placeholder="Prerequisite Course ID (optional)" value={form.prerequisiteCourse} onChange={handleChange}
                className="p-2 border rounded-xl text-sm md:col-span-2" />

              <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">Save Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesManagement;
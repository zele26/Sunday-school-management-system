// src/features/admin/StudentsManagement.jsx
import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);

  // Dropdown data
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignedTeacherId, setAssignedTeacherId] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
    fetchCourses();
  }, [page, search, gradeFilter]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.append('search', search);
      if (gradeFilter) params.append('grade', gradeFilter);

      const res = await fetch(`${API_BASE_URL}/api/admin/students?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setStudents(data.students);
      setTotalPages(data.totalPages);
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

  const fetchCourses = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/admin/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setCourses(data);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleGradeFilter = (e) => {
    setGradeFilter(e.target.value);
    setPage(1);
  };

  // Download CSV
 const handleDownload = async () => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (gradeFilter) params.append('grade', gradeFilter);

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/students/export?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || 'Download failed');
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Download error:', err);
    alert('Network error during download.');
  }
};

  // Assign teacher
  const openTeacherModal = (student) => {
    setSelectedStudent(student);
    setAssignedTeacherId(student.teacher?._id || '');
    setShowTeacherModal(true);
  };

  const assignTeacher = async () => {
    if (!selectedStudent || !assignedTeacherId) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/admin/students/${selectedStudent._id}/assign-teacher`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ teacherId: assignedTeacherId })
    });
    if (res.ok) {
      setShowTeacherModal(false);
      fetchStudents();
    }
  };

  // Assign courses
  const openCourseModal = (student) => {
    setSelectedStudent(student);
    const existingIds = student.courses.map(c => c._id);
    setSelectedCourseIds(existingIds);
    setShowCourseModal(true);
  };

  const toggleCourseSelection = (courseId) => {
    setSelectedCourseIds(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const assignCourses = async () => {
    if (!selectedStudent) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/admin/students/${selectedStudent._id}/assign-courses`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ courseIds: selectedCourseIds })
    });
    if (res.ok) {
      setShowCourseModal(false);
      fetchStudents();
    }
  };

  const pageButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`px-3 py-1 rounded-lg text-sm ${i === page ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Student Management</h2>
        <button
          onClick={handleDownload}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
        >
          ⬇ Download CSV
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={handleSearch}
          className="p-2 border border-slate-200 rounded-xl flex-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={gradeFilter}
          onChange={handleGradeFilter}
          className="p-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Grades</option>
          {[7,8,9,10,11,12].map(g => (
            <option key={g} value={`Grade ${g}`}>Grade {g}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-8 text-center text-slate-400">Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase">
                  <th className="py-2 px-2">Name</th>
                  <th className="py-2 px-2">Email</th>
                  <th className="py-2 px-2">Grade</th>
                  <th className="py-2 px-2">Teacher</th>
                  <th className="py-2 px-2">Courses</th>
                  <th className="py-2 px-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {students.map(s => (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="py-2 px-2 font-medium">
                      {s.firstName} {s.middleName} {s.lastName}
                    </td>
                    <td className="py-2 px-2">{s.userId?.email || '-'}</td>
                    <td className="py-2 px-2">{s.grade}</td>
                    <td className="py-2 px-2">{s.teacher?.fullName || 'Unassigned'}</td>
                    <td className="py-2 px-2">
                      {s.courses?.map(c => c.name).join(', ') || 'None'}
                    </td>
                    <td className="py-2 px-2 flex gap-1 flex-wrap">
                      <button
                        onClick={() => { setSelectedStudent(s); setShowDetailModal(true); }}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-200"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => openTeacherModal(s)}
                        className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-200"
                      >
                        Teacher
                      </button>
                      <button
                        onClick={() => openCourseModal(s)}
                        className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded-lg hover:bg-emerald-200"
                      >
                        Courses
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-4">
            {pageButtons()}
          </div>
        </>
      )}

      {/* Student Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Student Details</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="font-semibold text-slate-500">Full Name:</span> {selectedStudent.firstName} {selectedStudent.middleName} {selectedStudent.lastName}</div>
              <div><span className="font-semibold text-slate-500">Grade:</span> {selectedStudent.grade}</div>
              <div><span className="font-semibold text-slate-500">Date of Birth:</span> {selectedStudent.dob || '-'}</div>
              <div><span className="font-semibold text-slate-500">Address:</span> {selectedStudent.address || '-'}</div>
              <div><span className="font-semibold text-slate-500">Phone:</span> {selectedStudent.studentPhone || selectedStudent.contactPhone || '-'}</div>
              <div><span className="font-semibold text-slate-500">Email (login):</span> {selectedStudent.userId?.email || '-'}</div>
              <div><span className="font-semibold text-slate-500">Assigned Teacher:</span> {selectedStudent.teacher?.fullName || 'Unassigned'}</div>
              <div><span className="font-semibold text-slate-500">Courses:</span> {selectedStudent.courses?.map(c => c.name).join(', ') || 'None'}</div>
              <div className="col-span-2 border-t pt-3 mt-2">
                <h4 className="font-bold text-slate-600 mb-2">Emergency Contact</h4>
              </div>
              <div><span className="font-semibold text-slate-500">Name:</span> {selectedStudent.emergencyFirstName} {selectedStudent.emergencyMiddleName} {selectedStudent.emergencyLastName}</div>
              <div><span className="font-semibold text-slate-500">Relationship:</span> {selectedStudent.relationship || '-'}</div>
              <div><span className="font-semibold text-slate-500">Phone:</span> {selectedStudent.contactPhone || '-'}</div>
              <div><span className="font-semibold text-slate-500">Email:</span> {selectedStudent.contactEmail || '-'}</div>
              <div><span className="font-semibold text-slate-500">Address:</span> {selectedStudent.contactAddress || '-'}</div>
              <div className="col-span-2">
                <span className="font-semibold text-slate-500">Registration Date:</span> {selectedStudent.registrationDate ? new Date(selectedStudent.registrationDate).toLocaleDateString() : '-'}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 bg-slate-200 rounded-xl text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal (unchanged) */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold mb-4">Assign Teacher</h3>
            <select
              value={assignedTeacherId}
              onChange={(e) => setAssignedTeacherId(e.target.value)}
              className="w-full p-2 border rounded-xl mb-4"
            >
              <option value="">Select teacher</option>
              {teachers.map(t => (
                <option key={t._id} value={t._id}>{t.fullName} ({t.email})</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowTeacherModal(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
              <button onClick={assignTeacher} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm">Assign</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Courses Modal (unchanged) */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Assign Courses</h3>
            {courses.map(course => (
              <label key={course._id} className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={selectedCourseIds.includes(course._id)}
                  onChange={() => toggleCourseSelection(course._id)}
                />
                <span className="text-sm">{course.name} ({course.grade})</span>
              </label>
            ))}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowCourseModal(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
              <button onClick={assignCourses} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;
// src/features/admin/StudentsManagement.jsx
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';
import useAuthStore from '../../store/authStore';

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
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.append('search', search);
      if (gradeFilter) params.append('grade', gradeFilter);

      const res = await apiFetch(`/api/admin/students?${params}`);
      if (!res.ok) throw new Error('Failed to fetch students');
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

  const fetchCourses = async () => {
    try {
      const res = await apiFetch('/api/admin/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleGradeFilter = (e) => {
    setGradeFilter(e.target.value);
    setPage(1);
  };

  // ---------- QR Generation functions ----------

  const generateQR = async (studentId) => {
    try {
      const res = await apiFetch('/api/admin/students/generate-qr', {
        method: 'POST',
        body: JSON.stringify({ studentId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('QR code generated!');
        fetchStudents();
      } else {
        alert(data.message || 'Failed to generate QR');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const generateAllQR = async () => {
    try {
      const res = await apiFetch('/api/admin/students/generate-qr', {
        method: 'POST',
        body: JSON.stringify({}),   // no studentId → bulk generate
      });
      const data = await res.json();
      alert(data.message || 'QR codes generated!');
      fetchStudents();
    } catch (err) {
      alert('Network error');
    }
  };

  // Download CSV – token passed via query param (still works with middleware)
  const handleDownload = () => {
    const token = useAuthStore.getState().accessToken;
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (gradeFilter) params.append('grade', gradeFilter);
    if (token) params.append('token', token);
    window.open(`${API_BASE_URL}/api/admin/students/export?${params.toString()}`, '_blank');
  };

  // Assign teacher
  const openTeacherModal = (student) => {
    setSelectedStudent(student);
    setAssignedTeacherId(student.teacher?._id || '');
    setShowTeacherModal(true);
  };

  const assignTeacher = async () => {
    if (!selectedStudent || !assignedTeacherId) return;
    try {
      const res = await apiFetch(`/api/admin/students/${selectedStudent._id}/assign-teacher`, {
        method: 'PUT',
        body: JSON.stringify({ teacherId: assignedTeacherId }),
      });
      if (res.ok) {
        setShowTeacherModal(false);
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
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
    try {
      const res = await apiFetch(`/api/admin/students/${selectedStudent._id}/assign-courses`, {
        method: 'PUT',
        body: JSON.stringify({ courseIds: selectedCourseIds }),
      });
      if (res.ok) {
        setShowCourseModal(false);
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pageButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${i === page ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'}`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6 transition-all">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
            Student Management
          </h2>
          <p className="text-sm text-slate-500">Manage enrolled students, track records, assign teachers, and generate secure QR codes.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleDownload}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download CSV
          </button>
          <button
            onClick={generateAllQR}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Generate All QR
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <select
          value={gradeFilter}
          onChange={handleGradeFilter}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer min-w-[160px]"
        >
          <option value="">All Grades</option>
          {[7,8,9,10,11,12].map(g => (
            <option key={g} value={`Grade ${g}`}>Grade {g}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Loading students...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-sm">
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">School ID</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Grade</th>
                  <th className="py-3.5 px-4">Teacher</th>
                  <th className="py-3.5 px-4">QR</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {students.map(s => (
                  <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {s.firstName} {s.middleName} {s.lastName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 bg-slate-50/50 rounded-lg">{s.studentId || '-'}</td>
                    <td className="py-3.5 px-4 text-slate-600">{s.userId?.email || '-'}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                        {s.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{s.teacher?.fullName || <span className="text-slate-400 italic">Unassigned</span>}</td>
                    <td className="py-3.5 px-4">
                      {s.qrCode ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-emerald-50 text-emerald-600 rounded-full font-bold border border-emerald-200 shadow-sm">✓</span>
                      ) : (
                        <button
                          onClick={() => generateQR(s._id)}
                          className="text-xs bg-purple-50 text-purple-700 font-semibold px-3 py-1.5 rounded-xl border border-purple-200 hover:bg-purple-100 transition-all shadow-sm"
                        >
                          Generate
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex gap-1.5 justify-end flex-wrap">
                        <button
                          onClick={() => { setSelectedStudent(s); setShowDetailModal(true); }}
                          className="text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-100 transition-all shadow-sm"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => openTeacherModal(s)}
                          className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1.5 rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-all shadow-sm"
                        >
                          Teacher
                        </button>
                        <button
                          onClick={() => openCourseModal(s)}
                          className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all shadow-sm"
                        >
                          Courses
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-6 pt-4 border-t border-slate-100">
            {pageButtons()}
          </div>
        </>
      )}

      {/* Student Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Student Details</h3>
              <button 
                onClick={() => setShowDetailModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 font-bold transition-all"
              >
                &times;
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <div><span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Full Name</span> <span className="text-slate-800 font-semibold text-base">{selectedStudent.firstName} {selectedStudent.middleName} {selectedStudent.lastName}</span></div>
              <div><span className="font-semibold text-slate-400 uppercase text-xs block mb-1">School ID</span> <span className="font-mono font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 inline-block">{selectedStudent.studentId || 'N/A'}</span></div>
              <div><span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Grade</span> <span className="text-slate-800 font-medium">{selectedStudent.grade}</span></div>
              <div><span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Date of Birth</span> <span className="text-slate-800 font-medium">{selectedStudent.dob || '-'}</span></div>
              <div><span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Address</span> <span className="text-slate-800 font-medium">{selectedStudent.address || '-'}</span></div>
              <div><span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Phone</span> <span className="text-slate-800 font-medium">{selectedStudent.studentPhone || selectedStudent.contactPhone || '-'}</span></div>
              <div><span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Email (login)</span> <span className="text-slate-800 font-medium">{selectedStudent.userId?.email || '-'}</span></div>
              <div><span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Assigned Teacher</span> <span className="text-slate-800 font-medium">{selectedStudent.teacher?.fullName || 'Unassigned'}</span></div>
              <div className="col-span-2"><span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Courses</span> <span className="text-slate-800 font-medium">{selectedStudent.courses?.map(c => c.name).join(', ') || 'None'}</span></div>
              
              <div className="col-span-2 border-t border-slate-200 pt-4 mt-2">
                <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-3">Emergency Contact</h4>
              </div>
              <div><span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Name</span> <span className="text-slate-800 font-medium">{selectedStudent.emergencyFirstName} {selectedStudent.emergencyMiddleName} {selectedStudent.emergencyLastName}</span></div>
              <div><span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Relationship</span> <span className="text-slate-800 font-medium">{selectedStudent.relationship || '-'}</span></div>
              <div><span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Phone</span> <span className="text-slate-800 font-medium">{selectedStudent.contactPhone || '-'}</span></div>
              <div><span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Email</span> <span className="text-slate-800 font-medium">{selectedStudent.contactEmail || '-'}</span></div>
              <div className="col-span-2"><span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Address</span> <span className="text-slate-800 font-medium">{selectedStudent.contactAddress || '-'}</span></div>
              <div className="col-span-2">
                <span className="font-semibold text-slate-400 uppercase text-xs block mb-1">Registration Date</span> <span className="text-slate-800 font-medium">{selectedStudent.registrationDate ? new Date(selectedStudent.registrationDate).toLocaleDateString() : '-'}</span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setShowDetailModal(false)} 
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100 space-y-5">
            <h3 className="text-xl font-extrabold text-slate-800">Assign Teacher</h3>
            <select
              value={assignedTeacherId}
              onChange={(e) => setAssignedTeacherId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="">Select teacher</option>
              {teachers.map(t => (
                <option key={t._id} value={t._id}>{t.fullName} ({t.email})</option>
              ))}
            </select>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setShowTeacherModal(false)} 
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={assignTeacher} 
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Courses Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100 max-h-[80vh] overflow-y-auto space-y-5">
            <h3 className="text-xl font-extrabold text-slate-800">Assign Courses</h3>
            <div className="space-y-2.5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 max-h-60 overflow-y-auto">
              {courses.map(course => (
                <label key={course._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white transition-all cursor-pointer select-none border border-transparent hover:border-slate-200/60">
                  <input
                    type="checkbox"
                    checked={selectedCourseIds.includes(course._id)}
                    onChange={() => toggleCourseSelection(course._id)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700">{course.name} <span className="text-xs text-slate-400">({course.grade})</span></span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setShowCourseModal(false)} 
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={assignCourses} 
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/20 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;
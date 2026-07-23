// src/features/admin/StudentsManagement.jsx
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';

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
      if (res.ok) setTeachers(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await apiFetch('/api/admin/courses');
      if (res.ok) setCourses(await res.json());
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
        body: JSON.stringify({}),
      });
      const data = await res.json();
      alert(data.message || 'QR codes generated!');
      fetchStudents();
    } catch (err) {
      alert('Network error');
    }
  };

  // Download CSV
  const handleDownload = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (gradeFilter) params.append('grade', gradeFilter);
    // Still need token? We'll use the store token
    const token = useAuthStore.getState().accessToken;
    if (token) params.append('token', token);
    window.open(`${API_BASE_URL}/api/admin/students/export?${params}`, '_blank');
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
          className={`px-3 py-1 rounded-lg text-sm ${i === page ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  // (The JSX remains exactly the same as your previous version – only the API calls changed)
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      {/* ... keep the exact same JSX as before ... */}
    </div>
  );
};

export default StudentsManagement;
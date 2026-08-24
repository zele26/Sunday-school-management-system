import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/apiClient';

const AcademicEnrollmentDetails = () => {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState(null);
  const [courses, setCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Single add states (keep)
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  // Bulk add states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState({});

  const [certificate, setCertificate] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    fetchEnrollmentDetails();
    fetchAvailableCourses();
    fetchTeachers();
  }, [enrollmentId]);

  const fetchEnrollmentDetails = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/education/academic-enrollments/${enrollmentId}`);
      if (res.ok) {
        const data = await res.json();
        setEnrollment(data.enrollment);
      } else {
        setError('Failed to load enrollment');
      }
      const coursesRes = await apiFetch(`/api/education/academic-enrollments/${enrollmentId}/courses`);
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData.courseEnrollments || []);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const res = await apiFetch('/api/admin/courses');
      if (res.ok) {
        const data = await res.json();
        setAvailableCourses(data.courses || []);
      }
    } catch (err) {}
  };

  const fetchTeachers = async () => {
    try {
      const res = await apiFetch('/api/admin/teachers');
      if (res.ok) {
        const data = await res.json();
        setTeachers(data.teachers || []);
      }
    } catch (err) {}
  };

  // ---------- Single Add ----------
  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      const res = await apiFetch(`/api/education/academic-enrollments/${enrollmentId}/courses`, {
        method: 'POST',
        body: JSON.stringify({ courseId: selectedCourse, teacherId: selectedTeacher || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Course added successfully');
        setSelectedCourse('');
        setSelectedTeacher('');
        fetchEnrollmentDetails();
      } else {
        setError(data.message || 'Failed to add course');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  // ---------- Bulk Add ----------
  const openBulkModal = () => {
    setSelectedCourseIds([]);
    setTeacherAssignments({});
    setShowBulkModal(true);
  };

  const toggleCourseSelection = (courseId) => {
    setSelectedCourseIds(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const handleTeacherAssignment = (courseId, teacherId) => {
    setTeacherAssignments(prev => ({ ...prev, [courseId]: teacherId }));
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (selectedCourseIds.length === 0) return;

    const items = selectedCourseIds.map(courseId => ({
      courseId,
      teacherId: teacherAssignments[courseId] || undefined,
    }));

    try {
      const res = await apiFetch(`/api/education/academic-enrollments/${enrollmentId}/bulk-courses`, {
        method: 'POST',
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Courses assigned');
        setShowBulkModal(false);
        fetchEnrollmentDetails();
      } else {
        setError(data.message || 'Failed to assign courses');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  // ---------- Complete Course ----------
  const handleCompleteCourse = async (courseEnrollmentId) => {
    const mark = prompt('Enter final mark/grade (optional):');
    try {
      const res = await apiFetch(`/api/education/course-enrollments/${courseEnrollmentId}/complete`, {
        method: 'PUT',
        body: JSON.stringify({ finalResult: mark || '', mark: mark || null }),
      });
      if (res.ok) {
        setMessage('Course marked completed');
        fetchEnrollmentDetails();
      }
    } catch (err) {}
  };

  const allCoursesCompleted = courses.length > 0 && courses.every(c => c.status === 'completed');

  // ---------- Progression ----------
  const handleProgress = async () => {
    if (!enrollment?.studentProfileId) return;
    try {
      const res = await apiFetch(`/api/education/students/${enrollment.studentProfileId}/progress`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        alert('Progression successful: ' + data.message);
        navigate('/admin/academic-enrollments');
      } else {
        alert(data.message || 'Failed to progress');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  // ---------- Certificate ----------
  const handleGenerateCertificate = async () => {
    try {
      const res = await apiFetch(`/api/education/students/${enrollment.studentProfileId}/certificate`);
      if (res.ok) {
        const data = await res.json();
        setCertificate(data.certificate);
        setShowCertificate(true);
      } else {
        alert('Certificate not available yet');
      }
    } catch (err) {}
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <h2 className="text-xl font-bold text-slate-800">የትምህርት ዝርዝር (Enrollment Details)</h2>
      {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">{error}</div>}
      {message && <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">{message}</div>}

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading...</div>
      ) : enrollment ? (
        <>
          <div className="bg-slate-50 p-4 rounded-2xl grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><span className="font-semibold">ዓመተ ትምህርት:</span> {enrollment.academicYearId?.name}</div>
            <div><span className="font-semibold">ፕሮግራም:</span> {enrollment.programId?.name}</div>
            <div><span className="font-semibold">ደረጃ/ባች:</span> {enrollment.gradeId?.name || '—'}</div>
            <div><span className="font-semibold">የጥናት ሁነታ:</span> {enrollment.studyModeId?.name}</div>
            <div><span className="font-semibold">ሰሌዳ:</span> {enrollment.scheduleId?.name || '—'}</div>
            <div><span className="font-semibold">ሁኔታ:</span> {enrollment.status}</div>
          </div>

          {/* Buttons to open add forms */}
          <div className="flex gap-3">
            <button
              onClick={openBulkModal}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold"
            >
              ➕ ብዙ ኮርሶችን ጨምር (Bulk Add)
            </button>
            {/* Single add can remain but hidden? keep as link */}
            <button
              onClick={() => setSelectedCourse('')}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold"
            >
              አንድ ኮርስ ጨምር
            </button>
          </div>

          {/* Single add form (collapsible via state maybe) */}
          {selectedCourse !== '' && (
            <form onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="border rounded-xl p-2">
                <option value="">— ኮርስ ይምረጡ —</option>
                {availableCourses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)} className="border rounded-xl p-2">
                <option value="">— መምህር ይምረጡ —</option>
                {teachers.map(t => <option key={t._id} value={t._id}>{t.fullName || t.userId?.fullName}</option>)}
              </select>
              <button type="submit" className="bg-blue-600 text-white rounded-xl px-4 py-2">አስገባ</button>
            </form>
          )}

          {/* Courses List */}
          <div>
            <h3 className="font-semibold mb-2">የተመዘገቡ ኮርሶች</h3>
            {courses.length === 0 ? (
              <p className="text-slate-400">ምንም ኮርስ የለም</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-xs uppercase text-slate-400">
                    <th className="py-2">ኮርስ</th>
                    <th className="py-2">መምህር</th>
                    <th className="py-2">ሁኔታ</th>
                    <th className="py-2">እርምጃ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {courses.map(ce => (
                    <tr key={ce._id}>
                      <td className="py-2">{ce.courseId?.name}</td>
                      <td className="py-2">{ce.teacherId?.fullName || '—'}</td>
                      <td className="py-2">{ce.status}</td>
                      <td className="py-2">
                        {ce.status !== 'completed' && (
                          <button onClick={() => handleCompleteCourse(ce._id)} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg">አጠናቅቅ</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleProgress}
              disabled={!allCoursesCompleted}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl disabled:opacity-50"
            >
              ወደ ቀጣይ ክፍል አሳድግ
            </button>
            <button
              onClick={handleGenerateCertificate}
              disabled={!allCoursesCompleted}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl disabled:opacity-50"
            >
              ሰርተፍኬት አውጣ
            </button>
          </div>
        </>
      ) : null}

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-slate-800">ብዙ ኮርሶችን ጨምር</h3>
              <button onClick={() => setShowBulkModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 font-bold">&times;</button>
            </div>
            <p className="text-sm text-slate-500">ኮርሶችን ምረጡ እና ለእያንዳንዱ መምህር ይመድቡ።</p>

            <div className="space-y-2">
              {availableCourses.map(course => (
                <div key={course._id} className={`flex items-center gap-3 p-3 rounded-xl border ${selectedCourseIds.includes(course._id) ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                  <input
                    type="checkbox"
                    checked={selectedCourseIds.includes(course._id)}
                    onChange={() => toggleCourseSelection(course._id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-medium text-slate-800 flex-1">{course.name}</span>
                  {selectedCourseIds.includes(course._id) && (
                    <select
                      value={teacherAssignments[course._id] || ''}
                      onChange={(e) => handleTeacherAssignment(course._id, e.target.value)}
                      className="border rounded-lg p-1.5 text-sm w-40"
                    >
                      <option value="">— መምህር —</option>
                      {teachers.map(t => <option key={t._id} value={t._id}>{t.fullName || t.userId?.fullName}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowBulkModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl">ይቅር</button>
              <button onClick={handleBulkSubmit} disabled={selectedCourseIds.length === 0} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50">አስገባ</button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificate && certificate && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full text-center shadow-2xl">
            <h2 className="text-3xl font-bold text-[var(--brand-blue-dark)] mb-2">ሰርተፍኬት</h2>
            <p className="text-xs text-slate-400 mb-6">ተክለሳዊሮስ ሰንበት ትምህርት ቤት</p>
            <p className="text-lg mb-2">ለ <span className="font-bold">{certificate.studentName}</span></p>
            <p className="mb-1">የተማሪ መለያ: {certificate.studentNumber}</p>
            <p className="mb-1">ፕሮግራም: {certificate.program}</p>
            <p className="mb-1">ደረጃ/ባች: {certificate.grade}</p>
            <p className="mb-1">ዓመተ ትምህርት: {certificate.academicYear}</p>
            <p className="mb-1">የተሰጠበት ቀን: {certificate.issueDateEthiopian}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowCertificate(false)} className="px-4 py-2 bg-slate-100 rounded-xl">ዝጋ</button>
              <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded-xl">አትም</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicEnrollmentDetails;
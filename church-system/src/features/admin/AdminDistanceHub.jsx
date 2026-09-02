import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';
import VerifiableCertificate from '../../components/VerifiableCertificate';
import CurriculumLessonStudio from '../../components/CurriculumLessonStudio';

const AdminDistanceHub = () => {
  const [metrics, setMetrics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'courses' | 'certificates'

  // Curriculum & Lesson Studio Modal State
  const [studioCourse, setStudioCourse] = useState(null);

  // Certificate Issuance
  const [selectedStudentForCert, setSelectedStudentForCert] = useState('');
  const [generatedCert, setGeneratedCert] = useState(null);
  const [certIssuing, setCertIssuing] = useState(false);

  // New Course Modal
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseForm, setNewCourseForm] = useState({
    name: '',
    nameAmharic: '',
    code: '',
    description: '',
    bibleTheme: '',
    grade: 'Batch 1',
    teacher: '',
    studentType: 'distance',
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, coursesRes, studentsRes, teachersRes] = await Promise.all([
        apiFetch('/api/education/distance/admin/analytics'),
        apiFetch('/api/education/courses?studentType=distance'),
        apiFetch('/api/admin/students?studentType=distance&limit=50'),
        apiFetch('/api/admin/users?role=teacher'),
      ]);

      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        setMetrics(aData.metrics);
      }
      if (coursesRes.ok) {
        const cData = await coursesRes.json();
        setCourses(cData.courses || cData || []);
      }
      if (studentsRes.ok) {
        const sData = await studentsRes.json();
        setStudents(sData.students || []);
      }
      if (teachersRes.ok) {
        const tData = await teachersRes.json();
        setTeachers(tData.users || []);
      }
    } catch (err) {
      console.error('Admin distance hub loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourseForm.name.trim()) return;
    try {
      const res = await apiFetch('/api/education/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCourseForm,
          studentType: 'distance',
        }),
      });

      if (res.ok) {
        setShowAddCourseModal(false);
        setNewCourseForm({
          name: '',
          nameAmharic: '',
          code: '',
          description: '',
          bibleTheme: '',
          grade: 'Batch 1',
          teacher: '',
          studentType: 'distance',
        });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    if (!selectedStudentForCert) return;
    setCertIssuing(true);
    try {
      const res = await apiFetch(`/api/education/distance/certificates/generate/${selectedStudentForCert}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedCert(data.certificate);
        fetchAdminData();
      } else {
        alert(data.message || 'Certificate generation error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCertIssuing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">
            የርቀት ትምህርት አስተዳደር ማዕከል (Distance LMS Control Center)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            የትምህርት መርሃ ግብሮችን፣ የሞጁሎች ቅደም ተከተል፣ የመምህራን ምደባና ይፋዊ የምስክር ወረቀቶችን እዚህ ያስተዳድሩ።
          </p>
        </div>

        <button
          onClick={() => setShowAddCourseModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-2xl text-xs font-bold hover:brightness-110 shadow-md transition-all flex items-center gap-2"
        >
          <span>+</span>
          <span>አዲስ የርቀት ኮርስ ፍጠር (Add Distance Course)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'overview', title: '📊 አጠቃላይ እይታ (Analytics)' },
          { id: 'courses', title: '📚 የርቀት ኮርሶች (Courses & Modules)' },
          { id: 'certificates', title: '📜 ይፋዊ የምስክር ወረቀቶች (Certificates)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* TAB 1: High Level LMS Analytics */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase">ጠቅላላ የርቀት ተማሪዎች</span>
              <p className="text-2xl font-black text-slate-800 mt-1">{metrics?.totalDistanceStudents || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase">ንቁ የርቀት ኮርሶች</span>
              <p className="text-2xl font-black text-blue-600 mt-1">{metrics?.activeDistanceCourses || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase">ጠቅላላ ሞጁሎች</span>
              <p className="text-2xl font-black text-amber-600 mt-1">{metrics?.totalModulesCount || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase">የተሰጡ ምስክር ወረቀቶች</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{metrics?.completedCertificatesCount || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase">አማካይ የትምህርት ሂደት</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">{metrics?.avgCompletionRate || 0}%</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase">የተጠናቀቁ ኮርሶች</span>
              <p className="text-2xl font-black text-teal-600 mt-1">{metrics?.completedCoursesCount || 0}</p>
            </div>
          </div>

          {/* Batch Distribution */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">የተማሪዎች ክፍፍል በባች (Batch Distribution)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl">
                <span className="text-xs font-bold text-amber-800">Batch 1 (1ኛ ዓመት)</span>
                <p className="text-xl font-black text-slate-900 mt-1">{metrics?.batchBreakdown?.batch1 || 0} ተማሪዎች</p>
              </div>
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl">
                <span className="text-xs font-bold text-blue-800">Batch 2 (2ኛ ዓመት)</span>
                <p className="text-xl font-black text-slate-900 mt-1">{metrics?.batchBreakdown?.batch2 || 0} ተማሪዎች</p>
              </div>
              <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-2xl">
                <span className="text-xs font-bold text-indigo-800">Batch 3 (3ኛ ዓመት)</span>
                <p className="text-xl font-black text-slate-900 mt-1">{metrics?.batchBreakdown?.batch3 || 0} ተማሪዎች</p>
              </div>
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                <span className="text-xs font-bold text-emerald-800">Batch 4 (ተመራቂዎች)</span>
                <p className="text-xl font-black text-slate-900 mt-1">{metrics?.batchBreakdown?.batch4 || 0} ተማሪዎች</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Courses & Modules Management */}
      {activeTab === 'courses' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">የርቀት ትምህርት ኮርሶች ዝርዝር (Distance Courses)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase">
                <tr>
                  <th className="p-3">ኮርስ</th>
                  <th className="p-3">ኮድ</th>
                  <th className="p-3">ደረጃ (Batch)</th>
                  <th className="p-3">የተመደበ መምህር</th>
                  <th className="p-3">ሁኔታ</th>
                  <th className="p-3 text-right">የትምህርት ማዕከል (Curriculum)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-400">ምንም የርቀት ኮርስ አልተገኘም።</td>
                  </tr>
                ) : (
                  courses.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{c.nameAmharic || c.name}</td>
                      <td className="p-3 font-mono font-bold text-blue-700">{c.code}</td>
                      <td className="p-3 font-semibold text-slate-700">{c.grade || 'Batch 1'}</td>
                      <td className="p-3 text-slate-600">{c.teacher?.fullName || 'ያልተመደበ'}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {c.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setStudioCourse(c)}
                          className="px-3 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <span>🎬</span>
                          <span>ትምህርቶችና ቪዲዮዎች (Manage Lessons)</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Certificate Issuance */}
      {activeTab === 'certificates' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">ይፋዊ የምስክር ወረቀት መስጫ ማዕከል (Certificate Issuance)</h3>
            <p className="text-xs text-slate-400 mt-1">
              ሁሉንም የትምህርት ክፍሎች፣ ቪዲዮዎች፣ ንባቦችና ፈተናዎች ላጠናቀቁ ተማሪዎች ይፋዊና በQR ኮድ የተረጋገጠ ዲፕሎማ ይስጡ።
            </p>
          </div>

          <form onSubmit={handleIssueCertificate} className="max-w-md space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ተማሪ ይምረጡ (Select Student):</label>
              <select
                value={selectedStudentForCert}
                onChange={(e) => setSelectedStudentForCert(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                required
              >
                <option value="">ተማሪ ይምረጡ...</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.firstName} {s.lastName} — {s.studentId || 'TKD-STU'} ({s.batch || s.grade || 'Batch 1'})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={certIssuing || !selectedStudentForCert}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black rounded-xl text-xs hover:brightness-110 shadow-md transition-all disabled:opacity-50"
            >
              {certIssuing ? 'የምስክር ወረቀቱን በማዘጋጀት ላይ...' : '📜 የምስክር ወረቀት አዘጋጅ (Issue Certificate)'}
            </button>
          </form>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">አዲስ የርቀት ኮርስ ፍጠር (Create Distance Course)</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">የኮርሱ ስም በአማርኛ (Course Name in Amharic):</label>
                <input
                  type="text"
                  value={newCourseForm.nameAmharic}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, nameAmharic: e.target.value, name: e.target.value })}
                  placeholder="ለምሳሌ፡ የነገረ መለኮት ጥናት"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">የትምህርት ደረጃ (Batch):</label>
                  <select
                    value={newCourseForm.grade}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, grade: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                  >
                    <option value="Batch 1">Batch 1</option>
                    <option value="Batch 2">Batch 2</option>
                    <option value="Batch 3">Batch 3</option>
                    <option value="Batch 4">Batch 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">የተመደበ መምህር (Assign Teacher):</label>
                  <select
                    value={newCourseForm.teacher}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, teacher: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                  >
                    <option value="">መምህር ይምረጡ...</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>{t.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ዋና የመጽሐፍ ቅዱስ ጥቅስ (Main Bible Verse):</label>
                <input
                  type="text"
                  value={newCourseForm.bibleTheme}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, bibleTheme: e.target.value })}
                  placeholder="ለምሳሌ፡ ዮሐንስ 1:1"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-md"
                >
                  ፍጠር (Create Course)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generated Certificate Modal */}
      {generatedCert && (
        <VerifiableCertificate
          certificate={generatedCert}
          onClose={() => setGeneratedCert(null)}
        />
      )}

      {/* Curriculum & Lesson Studio Modal */}
      {studioCourse && (
        <CurriculumLessonStudio
          courseId={studioCourse._id}
          courseName={studioCourse.nameAmharic || studioCourse.name}
          onClose={() => setStudioCourse(null)}
          onUpdated={fetchAdminData}
        />
      )}
    </div>
  );
};

export default AdminDistanceHub;

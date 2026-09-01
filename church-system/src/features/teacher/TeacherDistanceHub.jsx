// src/features/teacher/TeacherDistanceHub.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';

const TeacherDistanceHub = () => {
  const [courses, setCourses] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState(null);

  // Grading Modal
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [gradingSubmitting, setGradingSubmitting] = useState(false);

  // New Module Modal
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [newModuleForm, setNewModuleForm] = useState({
    title: '',
    titleAmharic: '',
    description: '',
    estimatedHours: 2,
  });

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      const [overviewRes, pendingRes] = await Promise.all([
        apiFetch('/api/education/distance/teacher/overview'),
        apiFetch('/api/education/distance/submissions/pending'),
      ]);

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setCourses(data.courses || []);
        if (data.courses?.length > 0) {
          setActiveCourse(data.courses[0]);
        }
      }

      if (pendingRes.ok) {
        const pData = await pendingRes.json();
        setPendingSubmissions(pData.submissions || []);
      }
    } catch (err) {
      console.error('Teacher hub loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!gradingSubmission) return;
    setGradingSubmitting(true);
    try {
      const res = await apiFetch(`/api/education/distance/submissions/${gradingSubmission._id}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: parseFloat(gradeScore),
          feedback: gradeFeedback.trim(),
          status: 'Graded',
        }),
      });

      if (res.ok) {
        setGradingSubmission(null);
        fetchTeacherData();
      } else {
        alert('ውጤት መመዝገብ አልተሳካም');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGradingSubmitting(false);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!activeCourse || !newModuleForm.title.trim()) return;
    try {
      const res = await apiFetch(`/api/education/distance/courses/${activeCourse._id}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newModuleForm),
      });
      if (res.ok) {
        setShowAddModuleModal(false);
        setNewModuleForm({ title: '', titleAmharic: '', description: '', estimatedHours: 2 });
        fetchTeacherData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">የመምህራን የርቀት ትምህርት ማዕከል (Teacher Distance Hub)</h2>
          <p className="text-xs text-slate-500 mt-1">
            የተመደቡባቸውን የርቀት ትምህርቶች፣ የተማሪዎችን የትምህርት ሂደት እና የቤት ሥራ ምዘናዎችን እዚህ ያስተዳድሩ።
          </p>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">የተመደቡ ኮርሶች</span>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{courses.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">ጠቅላላ ተማሪዎች</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">
            {courses.reduce((acc, c) => acc + (c.totalEnrolled || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">ያጠናቀቁ ተማሪዎች</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {courses.reduce((acc, c) => acc + (c.completedStudents || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-100 bg-amber-50/30 shadow-sm">
          <span className="text-xs font-bold text-amber-700 uppercase">ያልታረሙ የቤት ሥራዎች</span>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{pendingSubmissions.length}</p>
        </div>
      </div>

      {/* Main Grid: Course selector & Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Courses list (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">የትምህርት ክፍሎች (Courses)</h3>
          {courses.map((c) => {
            const isSelected = activeCourse?._id === c._id;
            return (
              <div
                key={c._id}
                onClick={() => setActiveCourse(c)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#051533] to-[#08214d] text-white border-amber-400 shadow-lg'
                    : 'bg-white text-slate-800 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {c.code}
                  </span>
                  <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>
                    {c.totalEnrolled} ተማሪዎች
                  </span>
                </div>

                <h4 className="font-extrabold text-sm mt-2">{c.nameAmharic || c.name}</h4>
                <p className={`text-xs mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  ደረጃ: {c.grade || 'Batch 1'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right: Enrolled Students Roster & Progress (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {activeCourse ? activeCourse.nameAmharic || activeCourse.name : 'ተማሪዎችን ይምረጡ'} — የተማሪዎች ዝርዝር
              </h3>
              <p className="text-xs text-slate-400">የትምህርት ሂደትና የውጤት መከታተያ</p>
            </div>

            <button
              onClick={() => setShowAddModuleModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-md transition-all"
            >
              + አዲስ ሞጁል ጨምር (Add Module)
            </button>
          </div>

          {/* Student Progress Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase">
                <tr>
                  <th className="p-3">ተማሪ</th>
                  <th className="p-3">የተማሪ መለያ</th>
                  <th className="p-3">የትምህርት ሂደት</th>
                  <th className="p-3">ሁኔታ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeCourse?.students?.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-400">በዚህ ኮርስ የተመዘገበ ተማሪ የለም።</td>
                  </tr>
                ) : (
                  activeCourse?.students?.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{s.fullName}</td>
                      <td className="p-3 font-mono font-bold text-blue-700">{s.studentNumber}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                              style={{ width: `${s.progressPct}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold">{s.progressPct}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.progressPct < 25
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {s.isCompleted ? 'ተጠናቋል ✅' : (s.progressPct < 25 ? 'ወደ ኋላ የቀረ ⚠️' : 'በሂደት ላይ ⏳')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pending Assignment Grading Queue */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <span>📝 ያልታረሙ የቤት ሥራዎች (Submissions Queue)</span>
          <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
            {pendingSubmissions.length}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingSubmissions.map((sub) => (
            <div key={sub._id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{sub.student?.firstName} {sub.student?.lastName}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">{sub.assignment?.course?.name}</p>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  Submitted
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 bg-white p-2.5 rounded-xl border border-slate-200">
                {sub.content || 'የተያያዘ ፋይል'}
              </p>

              <button
                onClick={() => {
                  setGradingSubmission(sub);
                  setGradeScore('');
                  setGradeFeedback('');
                }}
                className="w-full py-2 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-sm"
              >
                አርም / ውጤት ስጥ (Grade Submission)
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">የቤት ሥራ ማረሚያ (Grade Assignment)</h3>
            <form onSubmit={handleGradeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ውጤት (Score out of 100):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">አስተያየትና ማበረታቻ (Teacher Comments):</label>
                <textarea
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="የተማሪውን ጥናት የሚያበረታታ አስተያየት ይጻፉ..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  disabled={gradingSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-md"
                >
                  {gradingSubmitting ? 'በመመዝገብ ላይ...' : 'ውጤቱን መዝግብ (Save Grade)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Module Modal */}
      {showAddModuleModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">አዲስ ሞጁል ጨምር (Create Module)</h3>
            <form onSubmit={handleCreateModule} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">የሞጁል ርዕስ በአማርኛ:</label>
                <input
                  type="text"
                  value={newModuleForm.titleAmharic}
                  onChange={(e) => setNewModuleForm({ ...newModuleForm, titleAmharic: e.target.value, title: e.target.value })}
                  placeholder="ለምሳሌ፡ ሞጁል 1 - ነገረ ድኅነት"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">መግለጫ (Description):</label>
                <textarea
                  rows={2}
                  value={newModuleForm.description}
                  onChange={(e) => setNewModuleForm({ ...newModuleForm, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModuleModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-md"
                >
                  ፍጠር (Create Module)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDistanceHub;

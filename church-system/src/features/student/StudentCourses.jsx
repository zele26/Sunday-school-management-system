// src/features/student/StudentCourses.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../api/apiClient';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiFetch('/api/student/my-courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching student courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            የተመዘገቡባቸው ኮርሶች (Enrolled Courses)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            የዚህ መንፈቅ የነገረ መለኮት፣ የመጽሐፍ ቅዱስና የታሪክ ኮርሶች ዝርዝር።
          </p>
        </div>
        <span className="px-3.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">
          {courses.length} የተመዘገቡ ኮርሶች
        </span>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm">ኮርሶች በመጫን ላይ ናቸው...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
          <span className="text-4xl">📚</span>
          <p className="text-base font-bold text-slate-700">ምንም የተመዘገቡ ኮርሶች አልተገኙም</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            በአሁኑ ሰዓት ለዚህ ባች የተመደቡ ኮርሶች የሉም። እባክዎ የአስተዳዳሪ ማረጋገጫን ይጠብቁ።
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((c) => (
            <div
              key={c._id || c.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-11 h-11 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl font-bold shadow-inner">
                      📖
                    </span>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-800 group-hover:text-amber-700 transition-colors">
                        {c.name || c.title}
                      </h3>
                      {c.code && (
                        <span className="text-[11px] font-mono font-bold text-blue-600">
                          {c.code}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>

                {c.bibleTheme && (
                  <div className="p-3 bg-amber-50/60 rounded-xl text-xs text-amber-900 border border-amber-100 flex items-start gap-2">
                    <span>✝️</span>
                    <div>
                      <span className="font-bold">ጭብጥ: </span>
                      <span>{c.bibleTheme}</span>
                    </div>
                  </div>
                )}

                {c.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1 border-t border-slate-50">
                  <div>
                    <span className="font-semibold text-slate-400">መምህር: </span>
                    <span className="font-medium text-slate-700">
                      {c.teacher?.fullName || c.teacherName || 'ሊቀ ማእምራን'}
                    </span>
                  </div>
                  {c.durationWeeks && (
                    <div>
                      <span className="font-semibold text-slate-400">ርዝመት: </span>
                      <span className="font-medium text-slate-700">{c.durationWeeks} ሳምንታት</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <Link
                  to="/dashboard/resources"
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 rounded-xl text-xs font-bold text-center transition-colors border border-slate-200"
                >
                  📄 ማጣቀሻዎች (Resources)
                </Link>
                <Link
                  to="/dashboard/exams"
                  className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold text-center shadow-sm transition-colors"
                >
                  📝 ፈተናዎች (Exams)
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
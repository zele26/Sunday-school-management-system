'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, CheckCircle2 } from 'lucide-react';
import { Badge, Card } from '../../components/ui';
import { useMyEnrolledCourses } from '../../hooks/queries/useStudentPortal';

const StudentCourses = () => {
  const { data: courses = [], isLoading } = useMyEnrolledCourses();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            የተመዘገቡባቸው ኮርሶች (Enrolled Courses)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            የዚህ መንፈቅ የነገረ መለኮት፣ የመጽሐፍ ቅዱስና የታሪክ ኮርሶች ዝርዝር።
          </p>
        </div>
        <Badge variant="gold" size="md">
          {courses.length} የተመዘገቡ ኮርሶች
        </Badge>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm font-medium">ኮርሶች በመጫን ላይ ናቸው...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <BookOpen className="w-12 h-12 mx-auto opacity-40 text-amber-500" />
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">
            ምንም የተመዘገቡ ኮርሶች አልተገኙም
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            በአሁኑ ሰዓት ለዚህ ባች የተመደቡ ኮርሶች የሉም። እባክዎ የአስተዳዳሪ ማረጋገጫን ይጠብቁ።
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((c) => (
            <Card
              key={c._id || c.id}
              variant="default"
              padding="lg"
              className="hover:shadow-md transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-11 h-11 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center text-xl font-bold shadow-inner">
                      📖
                    </span>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-800 dark:text-white group-hover:text-amber-600 transition-colors">
                        {c.name || c.title}
                      </h3>
                      {c.code && (
                        <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                          {c.code}
                        </span>
                      )}
                    </div>
                  </div>

                  <Badge variant="approved" size="xs">
                    Active
                  </Badge>
                </div>

                {c.bibleTheme && (
                  <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl text-xs text-amber-900 dark:text-amber-200 border border-amber-100 dark:border-amber-800/40 flex items-start gap-2">
                    <span>✝️</span>
                    <div>
                      <span className="font-bold">ጭብጥ: </span>
                      <span>{c.bibleTheme}</span>
                    </div>
                  </div>
                )}

                {c.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-semibold text-slate-400">መምህር: </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {c.teacher?.fullName || c.teacherName || 'ሊቀ ማእምራን'}
                    </span>
                  </div>
                  {c.durationWeeks && (
                    <div>
                      <span className="font-semibold text-slate-400">ርዝመት: </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{c.durationWeeks} ሳምንታት</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to="/dashboard/resources"
                  className="flex-1 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-slate-700 dark:text-slate-200 hover:text-amber-800 rounded-xl text-xs font-bold text-center transition-colors border border-slate-200 dark:border-slate-700"
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
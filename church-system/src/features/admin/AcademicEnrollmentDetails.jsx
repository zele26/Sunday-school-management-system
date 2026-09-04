'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipboardList, ArrowLeft, Plus, Check, Award, TrendingUp, BookOpen, Users, X } from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { toast } from '../../utils/toast';

const AcademicEnrollmentDetails = () => {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState(null);
  const [courses, setCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Single add states
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);

  // Bulk add states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [teacherSelections, setTeacherSelections] = useState({});

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
        toast.error('Failed to load enrollment');
      }
      const coursesRes = await apiFetch(`/api/education/academic-enrollments/${enrollmentId}/courses`);
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData.courseEnrollments || []);
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const res = await apiFetch('/api/education/courses');
      if (res.ok) {
        const data = await res.json();
        setAvailableCourses(data.courses || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await apiFetch('/api/education/teacher-profiles');
      if (res.ok) {
        const data = await res.json();
        setTeachers(data.profiles || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      const res = await apiFetch(`/api/education/academic-enrollments/${enrollmentId}/courses`, {
        method: 'POST',
        body: JSON.stringify({ courseId: selectedCourse, teacherIds: selectedTeacherIds }),
      });
      if (res.ok) {
        toast.success('ኮርሱ በተሳካ ሁኔታ ተጨምሯል!');
        setSelectedCourse('');
        setSelectedTeacherIds([]);
        fetchEnrollmentDetails();
      } else {
        toast.error('ኮርስ መጨመር አልተቻለም');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const handleCompleteCourse = async (courseEnrollmentId) => {
    try {
      const res = await apiFetch(`/api/education/academic-enrollments/${enrollmentId}/courses/${courseEnrollmentId}/complete`, {
        method: 'PUT',
      });
      if (res.ok) {
        toast.success('ኮርሱ እንደተጠናቀቀ ተመዝግቧል');
        fetchEnrollmentDetails();
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const allCoursesCompleted = courses.length > 0 && courses.every((c) => c.status === 'completed');

  const getTeacherName = (teacherProfile) => {
    if (!teacherProfile) return '—';
    const person = teacherProfile.personId;
    if (person) return `${person.firstName || ''} ${person.lastName || ''}`.trim();
    return teacherProfile.teacherNumber || '—';
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 dark:text-slate-500">
        <div className="w-8 h-8 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">የምዝገባ ዝርዝር በመጫን ላይ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="የትምህርት ምዝገባ ዝርዝር (Enrollment Details)"
        subtitle="የተማሪውን የዓመቱ ኮርሶች፣ መምህራን እና የማጠናቀቂያ ሁኔታዎች እዚህ ይከታተሉ"
        icon={ClipboardList}
        badge={<Badge variant="gold" size="sm">{enrollment?.status || 'Active'}</Badge>}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/academic-enrollments')} className="gap-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ወደ ምዝገባዎች ተመለስ</span>
          </Button>
        }
      />

      {/* Summary Info */}
      {enrollment && (
        <Card variant="elevated" padding="md">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold uppercase">ዓመተ ትምህርት</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{enrollment.academicYearId?.name || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase">ፕሮግራም</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{enrollment.programId?.name || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase">ደረጃ/ባች</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{enrollment.gradeId?.name || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase">የጥናት ሁነታ</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{enrollment.studyModeId?.name || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase">ሰሌዳ</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{enrollment.scheduleId?.name || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase">ሁኔታ</span>
              <Badge variant={enrollment.status === 'active' ? 'approved' : 'neutral'} size="sm">
                {enrollment.status || 'Active'}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Add Course Form */}
      <Card variant="default" padding="md">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">ኮርስ ጨምር (Add Course)</h3>
        <form onSubmit={handleAddCourse} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
              <option value="">— ኮርስ ይምረጡ —</option>
              {availableCourses.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <Button variant="primary" type="submit" disabled={!selectedCourse} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            <span>ኮርስ ጨምር</span>
          </Button>
        </form>
      </Card>

      {/* Enrolled Courses Table */}
      <Card variant="default" padding="none">
        <div className="p-4 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">የተመዘገቡ ኮርሶች ({courses.length})</h3>
          {allCoursesCompleted && <Badge variant="approved" size="sm">ሁሉም ተጠናቀዋል</Badge>}
        </div>

        {courses.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <BookOpen className="w-10 h-10 mx-auto opacity-40" />
            <p className="text-sm font-semibold">ምንም የተመዘገበ ኮርስ የለም</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="py-3 px-4">ኮርስ</th>
                  <th className="py-3 px-4">መምህር(ዎች)</th>
                  <th className="py-3 px-4">ሁኔታ</th>
                  <th className="py-3 px-4 text-right">እርምጃ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {courses.map((ce) => {
                  const teacherNames = ce.teachers?.length > 0
                    ? ce.teachers.map((t) => getTeacherName(t)).join(', ')
                    : ce.teacherId ? getTeacherName(ce.teacherId) : '—';
                  return (
                    <tr key={ce._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{ce.courseId?.name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{teacherNames}</td>
                      <td className="py-3 px-4">
                        <Badge variant={ce.status === 'completed' ? 'approved' : 'active'} size="sm">
                          {ce.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {ce.status !== 'completed' && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleCompleteCourse(ce._id)}
                            className="gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>አጠናቅቅ</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AcademicEnrollmentDetails;
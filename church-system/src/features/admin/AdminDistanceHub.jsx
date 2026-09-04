'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  BookOpen, 
  Award, 
  GraduationCap, 
  Users, 
  Video, 
  CheckCircle2, 
  TrendingUp, 
  FileText,
  BarChart3,
  Layers,
  Sparkles
} from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { toast } from '../../utils/toast';
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
      toast.error('የርቀት ትምህርት መረጃዎችን ማምጣት አልተቻለም');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourseForm.name.trim()) {
      toast.info('እባክዎ የኮርሱን ስም ያስገቡ');
      return;
    }
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
        toast.success('አዲስ የርቀት ኮርስ በተሳካ ሁኔታ ተፈጥሯል!');
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
      } else {
        toast.error('ኮርስ መፍጠር አልተሳካም');
      }
    } catch (err) {
      toast.error('የኔትወርክ ስህተት');
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
        toast.success('ይፋዊ የምስክር ወረቀት በተሳካ ሁኔታ ተዘጋጅቷል!');
        setGeneratedCert(data.certificate);
        fetchAdminData();
      } else {
        toast.error(data.message || 'የምስክር ወረቀት ማዘጋጀት አልተሳካም');
      }
    } catch (err) {
      toast.error('የኔትወርክ ችግር አጋጥሟል');
    } finally {
      setCertIssuing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="የርቀት ትምህርት አስተዳደር ማዕከል (Distance LMS Control Center)"
        subtitle="Manage distance curriculums, lesson studios, teacher assignments, and verifiable graduation certificates."
        icon={Globe}
        actions={
          <Button variant="primary" onClick={() => setShowAddCourseModal(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> አዲስ የርቀት ኮርስ ፍጠር (Add Distance Course)
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-subtle pb-2">
        {[
          { id: 'overview', title: '📊 አጠቃላይ እይታ (Analytics)' },
          { id: 'courses', title: '📚 የርቀት ኮርሶች (Courses & Modules)' },
          { id: 'certificates', title: '📜 ይፋዊ የምስክር ወረቀቶች (Certificates)' },
        ].map((tab) => (
          <Button
            key={tab.id}
            size="sm"
            variant={activeTab === tab.id ? 'primary' : 'outline'}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.title}
          </Button>
        ))}
      </div>

      {/* TAB 1: High Level LMS Analytics */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card className="p-4 flex flex-col justify-center">
              <span className="text-[11px] font-bold text-muted uppercase">ጠቅላላ የርቀት ተማሪዎች</span>
              <p className="text-2xl font-black text-main mt-1">{metrics?.totalDistanceStudents || 0}</p>
            </Card>
            <Card className="p-4 flex flex-col justify-center border-blue-500/30 bg-blue-500/5">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">ንቁ የርቀት ኮርሶች</span>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{metrics?.activeDistanceCourses || 0}</p>
            </Card>
            <Card className="p-4 flex flex-col justify-center border-amber-500/30 bg-amber-500/5">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase">ጠቅላላ ሞጁሎች</span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{metrics?.totalModulesCount || 0}</p>
            </Card>
            <Card className="p-4 flex flex-col justify-center border-emerald-500/30 bg-emerald-500/5">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">የተሰጡ ምስክር ወረቀቶች</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{metrics?.completedCertificatesCount || 0}</p>
            </Card>
            <Card className="p-4 flex flex-col justify-center border-indigo-500/30 bg-indigo-500/5">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">አማካይ የትምህርት ሂደት</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{metrics?.avgCompletionRate || 0}%</p>
            </Card>
            <Card className="p-4 flex flex-col justify-center border-teal-500/30 bg-teal-500/5">
              <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase">የተጠናቀቁ ኮርሶች</span>
              <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">{metrics?.completedCoursesCount || 0}</p>
            </Card>
          </div>

          {/* Batch Distribution */}
          <Card className="p-6 space-y-4">
            <h3 className="font-extrabold text-base text-main">የተማሪዎች ክፍፍል በባች (Batch Distribution)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Batch 1 (1ኛ ዓመት)</span>
                <p className="text-xl font-black text-main mt-1">{metrics?.batchBreakdown?.batch1 || 0} ተማሪዎች</p>
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Batch 2 (2ኛ ዓመት)</span>
                <p className="text-xl font-black text-main mt-1">{metrics?.batchBreakdown?.batch2 || 0} ተማሪዎች</p>
              </div>
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Batch 3 (3ኛ ዓመት)</span>
                <p className="text-xl font-black text-main mt-1">{metrics?.batchBreakdown?.batch3 || 0} ተማሪዎች</p>
              </div>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Batch 4 (ተመራቂዎች)</span>
                <p className="text-xl font-black text-main mt-1">{metrics?.batchBreakdown?.batch4 || 0} ተማሪዎች</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Courses & Modules Management */}
      {activeTab === 'courses' && (
        <Card className="p-6 space-y-4">
          <h3 className="font-extrabold text-base text-main">የርቀት ትምህርት ኮርሶች ዝርዝር (Distance Courses)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-muted">
              <thead className="bg-surface-page text-[11px] font-bold text-main uppercase border-b border-subtle">
                <tr>
                  <th className="p-3">ኮርስ</th>
                  <th className="p-3">ኮድ</th>
                  <th className="p-3">ደረጃ (Batch)</th>
                  <th className="p-3">የተመደበ መምህር</th>
                  <th className="p-3">ሁኔታ</th>
                  <th className="p-3 text-right">የትምህርት ማዕከል (Curriculum)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle bg-surface-card">
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-muted">ምንም የርቀት ኮርስ አልተገኘም።</td>
                  </tr>
                ) : (
                  courses.map((c) => (
                    <tr key={c._id} className="hover:bg-surface-page/50 transition-colors">
                      <td className="p-3 font-bold text-main">{c.nameAmharic || c.name}</td>
                      <td className="p-3 font-mono font-bold text-brand-primary">{c.code}</td>
                      <td className="p-3 font-semibold text-main">{c.grade || 'Batch 1'}</td>
                      <td className="p-3 text-muted">{c.teacher?.fullName || 'ያልተመደበ'}</td>
                      <td className="p-3">
                        <Badge variant="success">
                          {c.status || 'Active'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="xs"
                          variant="primary"
                          onClick={() => setStudioCourse(c)}
                        >
                          <Video className="w-3.5 h-3.5 mr-1" /> ትምህርቶችና ቪዲዮዎች (Manage Lessons)
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: Certificate Issuance */}
      {activeTab === 'certificates' && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-main">ይፋዊ የምስክር ወረቀት መስጫ ማዕከል (Certificate Issuance)</h3>
            <p className="text-xs text-muted mt-1">
              ሁሉንም የትምህርት ክፍሎች፣ ቪዲዮዎች፣ ንባቦችና ፈተናዎች ላጠናቀቁ ተማሪዎች ይፋዊና በQR ኮድ የተረጋገጠ ዲፕሎማ ይስጡ።
            </p>
          </div>

          <form onSubmit={handleIssueCertificate} className="max-w-md space-y-4 p-5 bg-surface-page rounded-2xl border border-subtle">
            <Select
              label="ተማሪ ይምረጡ (Select Student):"
              value={selectedStudentForCert}
              onChange={(e) => setSelectedStudentForCert(e.target.value)}
              required
            >
              <option value="">ተማሪ ይምረጡ...</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.firstName} {s.lastName} — {s.studentId || 'TKD-STU'} ({s.batch || s.grade || 'Batch 1'})
                </option>
              ))}
            </Select>

            <Button
              type="submit"
              variant="gold"
              className="w-full"
              disabled={certIssuing || !selectedStudentForCert}
            >
              <Award className="w-4 h-4 mr-1.5" />
              {certIssuing ? 'የምስክር ወረቀቱን በማዘጋጀት ላይ...' : '📜 የምስክር ወረቀት አዘጋጅ (Issue Certificate)'}
            </Button>
          </form>
        </Card>
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <Card className="max-w-lg w-full p-6 shadow-2xl space-y-4 border-subtle">
            <h3 className="font-extrabold text-base text-main">አዲስ የርቀት ኮርስ ፍጠር (Create Distance Course)</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3">
              <Input
                label="የኮርሱ ስም በአማርኛ (Course Name in Amharic):"
                value={newCourseForm.nameAmharic}
                onChange={(e) => setNewCourseForm({ ...newCourseForm, nameAmharic: e.target.value, name: e.target.value })}
                placeholder="ለምሳሌ፡ የነገረ መለኮት ጥናት"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="የትምህርት ደረጃ (Batch):"
                  value={newCourseForm.grade}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, grade: e.target.value })}
                >
                  <option value="Batch 1">Batch 1</option>
                  <option value="Batch 2">Batch 2</option>
                  <option value="Batch 3">Batch 3</option>
                  <option value="Batch 4">Batch 4</option>
                </Select>

                <Select
                  label="የተመደበ መምህር (Assign Teacher):"
                  value={newCourseForm.teacher}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, teacher: e.target.value })}
                >
                  <option value="">መምህር ይምረጡ...</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>{t.fullName}</option>
                  ))}
                </Select>
              </div>

              <Input
                label="ዋና የመጽሐፍ ቅዱስ ጥቅስ (Main Bible Verse):"
                value={newCourseForm.bibleTheme}
                onChange={(e) => setNewCourseForm({ ...newCourseForm, bibleTheme: e.target.value })}
                placeholder="ለምሳሌ፡ ዮሐንስ 1:1"
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddCourseModal(false)}
                >
                  ሰርዝ
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  ፍጠር (Create Course)
                </Button>
              </div>
            </form>
          </Card>
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

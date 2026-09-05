'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, ArrowLeft, Save, User, Phone, MapPin, GraduationCap, BookOpen, AlertTriangle, Calendar } from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../utils/toast';

const DAY_MAP = {
  sunday: 'SUNDAY',
  'እሑድ': 'SUNDAY',
  'እሁድ': 'SUNDAY',
  saturday: 'SATURDAY',
  'ቅዳሜ': 'SATURDAY',
  monday: 'MONDAY',
  'ሰኞ': 'MONDAY',
  tuesday: 'TUESDAY',
  'ማክሰኞ': 'TUESDAY',
  wednesday: 'WEDNESDAY',
  'ረቡዕ': 'WEDNESDAY',
  thursday: 'THURSDAY',
  'ሐሙስ': 'THURSDAY',
  friday: 'FRIDAY',
  'ዓርብ': 'FRIDAY',
  weekend: 'WEEKEND',
};

const EditTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    subject: '',
    qualification: '',
    experience: '',
    bio: '',
    address: '',
    city: '',
    gender: 'Male',
    dateOfBirth: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teacherRes, coursesRes] = await Promise.all([
          apiFetch(`/api/admin/teachers/${id}`),
          apiFetch('/api/admin/courses'),
        ]);

        if (teacherRes.ok) {
          const data = await teacherRes.json();
          const t = data.teacher || data;
          setForm({
            fullName: t.fullName || `${t.firstName || ''} ${t.lastName || ''}`.trim(),
            phone: t.phone || t.userId?.phone || '',
            subject: t.subject || '',
            qualification: t.qualification || '',
            experience: t.experience || '',
            bio: t.bio || '',
            address: t.address || '',
            city: t.city || '',
            gender: t.gender || 'Male',
            dateOfBirth: t.dateOfBirth ? new Date(t.dateOfBirth).toISOString().split('T')[0] : '',
          });

          if (Array.isArray(t.coursesTaught)) {
            setSelectedCourses(t.coursesTaught);
          }
        } else {
          toast.error('መምህሩን መጫን አልተቻለም');
        }

        if (coursesRes.ok) {
          const cData = await coursesRes.json();
          if (Array.isArray(cData)) setAvailableCourses(cData);
          else if (cData.courses && Array.isArray(cData.courses)) setAvailableCourses(cData.courses);
        }
      } catch (err) {
        toast.error('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleCourseSelection = (courseName) => {
    if (selectedCourses.includes(courseName)) {
      setSelectedCourses(selectedCourses.filter((c) => c !== courseName));
    } else {
      setSelectedCourses([...selectedCourses, courseName]);
    }
  };

  // Real-time client-side conflict detection
  const scheduleConflicts = useMemo(() => {
    const selected = availableCourses.filter((c) => selectedCourses.includes(c.name));
    const conflicts = [];

    const toMin = (t) => {
      if (!t) return null;
      const [h, m] = t.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const c1 = selected[i];
        const c2 = selected[j];
        const d1 = DAY_MAP[c1.dayOfWeek?.trim().toLowerCase()] || c1.dayOfWeek;
        const d2 = DAY_MAP[c2.dayOfWeek?.trim().toLowerCase()] || c2.dayOfWeek;

        const sameDay = d1 && d2 && (d1 === d2 || (d1 === 'WEEKEND' && (d2 === 'SATURDAY' || d2 === 'SUNDAY')));

        if (sameDay && c1.startTime && c1.endTime && c2.startTime && c2.endTime) {
          const s1 = toMin(c1.startTime);
          const e1 = toMin(c1.endTime);
          const s2 = toMin(c2.startTime);
          const e2 = toMin(c2.endTime);

          if (s1 !== null && e1 !== null && s2 !== null && e2 !== null) {
            if (Math.max(s1, s2) < Math.min(e1, e2)) {
              conflicts.push(
                `"${c1.name}" (${c1.startTime}-${c1.endTime}) እና "${c2.name}" (${c2.startTime}-${c2.endTime}) በዚሁ ቀን (${c1.dayOfWeek || 'Weekend'}) ይደራረባሉ!`
              );
            }
          }
        }
      }
    }
    return conflicts;
  }, [availableCourses, selectedCourses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (scheduleConflicts.length > 0) {
      toast.error('እባክዎ የተደራረቡትን የኮርስ ሰዓቶች ያስተካክሉ (Schedule conflict detected)');
      return;
    }

    setSubmitting(true);

    const payload = {
      ...form,
      coursesTaught: selectedCourses,
    };

    try {
      const res = await apiFetch(`/api/admin/teachers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success('የመምህሩ መረጃ በተሳካ ሁኔታ ተሻሽሏል!');
        navigate('/admin/teachers');
      } else {
        toast.error(data.message || 'ማሻሻል አልተቻለም');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 dark:text-slate-500">
        <div className="w-8 h-8 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">የመምህር መረጃ በመጫን ላይ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`መምህር አሻሽል: ${form.fullName}`}
        subtitle="የመምህሩን የትምህርት ዝግጅት፣ የሚያስተምሯቸውን ኮርሶች እና የግል መረጃዎች ያሻሽሉ"
        icon={Edit}
        badge={<Badge variant="active" size="sm">ማሻሻያ</Badge>}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/teachers')} className="gap-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ተመለስ</span>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">የመምህሩ የግል መረጃ</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ሙሉ ስም *</label>
              <Input name="fullName" required value={form.fullName} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ስልክ ቁጥር</label>
              <Input icon={Phone} name="phone" value={form.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ዋና የትምህርት መስክ (Subject)</label>
              <Input name="subject" value={form.subject} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የትምህርት ደረጃ</label>
              <Input name="qualification" value={form.qualification} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የአገልግሎት ልምድ</label>
              <Input name="experience" value={form.experience} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">አድራሻ</label>
              <Input icon={MapPin} name="address" value={form.address} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ከተማ</label>
              <Input name="city" value={form.city} onChange={handleChange} />
            </div>
          </div>
        </Card>

        {/* Assigned Courses */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <BookOpen className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              የሚያስተምሯቸው ኮርሶች ({selectedCourses.length} ኮርሶች ተመርጠዋል)
            </h3>
          </div>

          {availableCourses.length > 0 ? (
            <div className="space-y-3">
              <span className="text-[11px] text-slate-400">ተመሳሳይ ሰዓት የሌላቸውን መምረጥ ይችላሉ</span>

              {scheduleConflicts.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-bold text-sm">የሰዓት መደራረብ ተገኝቷል (Schedule Conflict)</p>
                    {scheduleConflicts.map((c, idx) => (
                      <p key={idx} className="mt-0.5">• {c}</p>
                    ))}
                    <p className="mt-1 font-semibold text-rose-600 dark:text-rose-400">
                      እባክዎ የተደራረቡትን ኮርሶች ያስተካክሉ ወይም አንዱን ያንሱ።
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {availableCourses.map((c) => {
                  const isSelected = selectedCourses.includes(c.name);
                  const scheduleText = c.schedule || (c.dayOfWeek && c.startTime ? `${c.dayOfWeek} ${c.startTime}-${c.endTime}` : 'ሰዓት አልተወሰነም');
                  return (
                    <label
                      key={c._id}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 shadow-xs font-medium text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCourseSelection(c.name)}
                        className="rounded text-[var(--brand-primary)] mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold truncate">{c.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 font-mono truncate">
                          <Calendar className="w-3 h-3 text-[var(--brand-primary)] shrink-0" />
                          <span>{scheduleText}</span>
                        </p>
                        {c.grade && (
                          <span className="inline-block text-[10px] mt-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {c.grade}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">ምንም ኮርሶች አልተገኙም</p>
          )}
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={() => navigate('/admin/teachers')}>
            ሰርዝ
          </Button>
          <Button variant="primary" type="submit" loading={submitting} disabled={scheduleConflicts.length > 0} className="gap-2">
            <Save className="w-4 h-4" />
            <span>ለውጦችን አስቀምጥ (Save Changes)</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditTeacher;
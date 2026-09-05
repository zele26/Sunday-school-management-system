'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, Save, User, Mail, Lock, Phone, MapPin, BookOpen, GraduationCap, AlertTriangle, Calendar } from 'lucide-react';
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

const AddTeacher = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    experience: '',
    subject: '',
    qualification: '',
    city: '',
    address: '',
    emergencyPersonName: '',
    emergencyPhone: '',
    bio: '',
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiFetch('/api/admin/courses');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setAvailableCourses(data);
          else if (data.courses && Array.isArray(data.courses)) setAvailableCourses(data.courses);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, []);

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
    if (!form.fullName || !form.email || !form.password) {
      toast.error('ሙሉ ስም፣ ኢሜይል እና የይለፍ ቃል አስፈላጊ ናቸው');
      return;
    }

    if (scheduleConflicts.length > 0) {
      toast.error('እባክዎ የተደራረቡትን የኮርስ ሰዓቶች ያስተካክሉ (Schedule conflict detected)');
      return;
    }

    setLoading(true);
    const payload = {
      ...form,
      coursesTaught: selectedCourses,
    };

    try {
      const res = await apiFetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(`መምህር "${form.fullName}" በተሳካ ሁኔታ ተመዝግቧል!`);
        navigate('/admin/teachers');
      } else {
        toast.error(data.message || 'መምህር መመዝገብ አልተቻለም');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="አዲስ መምህር መዝግብ (Add Teacher)"
        subtitle="የመምህሩን የግል መረጃ፣ የትምህርት ዝግጅት፣ እና የሚያስተምሯቸውን ኮርሶች ያስገቡ"
        icon={UserPlus}
        badge={<Badge variant="gold" size="sm">የመምህራን ምዝገባ</Badge>}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/teachers')} className="gap-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ተመለስ</span>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal & Login */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">የግልና የመግቢያ መረጃ (Profile & Login)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ሙሉ ስም (Full Name) *</label>
              <Input name="fullName" required value={form.fullName} onChange={handleChange} placeholder="ዲ/ን ሙሉ ስም..." />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ስልክ ቁጥር (Phone)</label>
              <Input icon={Phone} name="phone" value={form.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ኢሜይል (Email) *</label>
              <Input icon={Mail} type="email" name="email" required value={form.email} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የይለፍ ቃል (Password) *</label>
              <Input icon={Lock} type="password" name="password" required value={form.password} onChange={handleChange} />
            </div>
          </div>
        </Card>

        {/* Academic & Courses */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <GraduationCap className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">የትምህርት ዝግጅትና ኮርሶች</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ዋና የትምህርት መስክ (Subject)</label>
              <Input name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. ነገረ መለኮት, ዜማ..." />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የትምህርት ደረጃ (Qualification)</label>
              <Input name="qualification" value={form.qualification} onChange={handleChange} placeholder="e.g. ዲፕሎማ, ዲግሪ..." />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የአገልግሎት ልምድ (Experience)</label>
              <Input name="experience" value={form.experience} onChange={handleChange} placeholder="e.g. 5 ዓመት" />
            </div>
          </div>

          {availableCourses.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  የሚያስተምሯቸው ኮርሶች ({selectedCourses.length} ተመርጠዋል)
                </label>
                <span className="text-[11px] text-slate-400">ተመሳሳይ ሰዓት የሌላቸውን መምረጥ ይችላሉ</span>
              </div>

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
          )}
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={() => navigate('/admin/teachers')}>
            ሰርዝ
          </Button>
          <Button variant="primary" type="submit" loading={loading} disabled={scheduleConflicts.length > 0} className="gap-2">
            <Save className="w-4 h-4" />
            <span>መምህሩን መዝግብ (Save Teacher)</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddTeacher;
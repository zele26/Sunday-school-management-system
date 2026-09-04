'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, Save, User, Mail, Lock, Phone, MapPin, BookOpen, GraduationCap } from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../utils/toast';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) {
      toast.error('ሙሉ ስም፣ ኢሜይል እና የይለፍ ቃል አስፈላጊ ናቸው');
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
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">የሚያስተምሯቸው ኮርሶች (Courses Taught)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableCourses.map((c) => (
                  <label key={c._id} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(c.name)}
                      onChange={() => toggleCourseSelection(c.name)}
                      className="rounded text-[var(--brand-primary)]"
                    />
                    <span className="truncate">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={() => navigate('/admin/teachers')}>
            ሰርዝ
          </Button>
          <Button variant="primary" type="submit" loading={loading} className="gap-2">
            <Save className="w-4 h-4" />
            <span>መምህሩን መዝግብ (Save Teacher)</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddTeacher;
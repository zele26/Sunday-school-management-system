'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, ArrowLeft, Save, User, Phone, MapPin, GraduationCap } from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../utils/toast';

const EditTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    const fetchTeacher = async () => {
      try {
        const res = await apiFetch(`/api/admin/teachers/${id}`);
        if (res.ok) {
          const data = await res.json();
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
        } else {
          toast.error('መምህሩን መጫን አልተቻለም');
        }
      } catch (err) {
        toast.error('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await apiFetch(`/api/admin/teachers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('የመምህሩ መረጃ በተሳካ ሁኔታ ተሻሽሏል!');
        navigate('/admin/teachers');
      } else {
        toast.error('ማሻሻል አልተቻለም');
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
        subtitle="የመምህሩን የትምህርት ዝግጅት እና የግል መረጃዎች ያሻሽሉ"
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

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={() => navigate('/admin/teachers')}>
            ሰርዝ
          </Button>
          <Button variant="primary" type="submit" loading={submitting} className="gap-2">
            <Save className="w-4 h-4" />
            <span>ለውጦችን አስቀምጥ (Save Changes)</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditTeacher;
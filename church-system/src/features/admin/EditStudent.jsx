'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, ArrowLeft, Save, User, Phone, MapPin, Heart } from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { EthiopianDatePicker } from '../../components/ui/EthiopianDatePicker';
import { toast } from '../../utils/toast';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    grade: '',
    age: '',
    shift: 'weekend',
    subcity: '',
    woreda: '',
    kebele: '',
    address: '',
    studentType: 'regular',
    emergencyFirstName: '',
    emergencyMiddleName: '',
    emergencyLastName: '',
    relationship: 'Father',
    contactPhone: '',
    contactEmail: '',
    contactAddress: '',
    dob: '',
  });

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await apiFetch(`/api/admin/students/${id}`);
        if (res.ok) {
          const data = await res.json();
          const s = data.student;
          setForm({
            firstName: s.firstName || '',
            middleName: s.middleName || '',
            lastName: s.lastName || '',
            phone: s.studentPhone || '',
            grade: s.grade || '',
            age: s.age || '',
            shift: s.shift || 'weekend',
            subcity: s.subcity || '',
            woreda: s.woreda || '',
            kebele: s.kebele || '',
            address: s.address || '',
            studentType: s.studentType || 'regular',
            emergencyFirstName: s.emergencyFirstName || s.parentName || '',
            emergencyMiddleName: s.emergencyMiddleName || '',
            emergencyLastName: s.emergencyLastName || '',
            relationship: s.relationship || 'Father',
            contactPhone: s.emergencyPhone || s.contactPhone || s.parentPhone || '',
            contactEmail: s.emergencyEmail || s.contactEmail || s.parentEmail || '',
            contactAddress: s.emergencyAddress || s.contactAddress || '',
            dob: s.dob ? s.dob.split('T')[0] : '',
          });
        } else {
          toast.error('ተማሪውን መጫን አልተቻለም');
        }
      } catch (err) {
        toast.error('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.age && Number(form.age) <= 14) {
      toast.error('የተማሪ ዕድሜ ከ 14 ዓመት በላይ መሆን አለበት (Age must be greater than 14)');
      return;
    }

    setSubmitting(true);

    const payload = {
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim(),
      lastName: form.lastName.trim(),
      grade: form.grade,
      age: form.age ? Number(form.age) : undefined,
      shift: form.shift,
      subcity: form.subcity.trim(),
      woreda: form.woreda.trim(),
      kebele: form.kebele.trim(),
      address: form.address.trim(),
      studentPhone: form.phone.trim(),
      studentType: form.studentType,
      emergencyFirstName: form.emergencyFirstName.trim(),
      emergencyMiddleName: form.emergencyMiddleName.trim(),
      emergencyLastName: form.emergencyLastName.trim(),
      relationship: form.relationship.trim(),
      contactPhone: form.contactPhone.trim(),
      contactEmail: form.contactEmail.trim(),
      contactAddress: form.contactAddress.trim(),
      dob: form.dob,
    };

    try {
      const res = await apiFetch(`/api/admin/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success('የተማሪው መረጃ በተሳካ ሁኔታ ተሻሽሏል!');
        navigate('/admin/students');
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
        <p className="text-sm font-medium">የተማሪ መረጃ በመጫን ላይ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`ተማሪ አሻሽል: ${form.firstName} ${form.lastName}`}
        subtitle="የተማሪውን የግል እና የአደጋ ጊዜ መረጃዎች ያሻሽሉ"
        icon={Edit}
        badge={<Badge variant="active" size="sm">ማሻሻያ</Badge>}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/students')} className="gap-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ተመለስ</span>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">የተማሪው የግል መረጃ</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ስም *</label>
              <Input name="firstName" required value={form.firstName} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የአባት ስም</label>
              <Input name="middleName" value={form.middleName} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የአያት ስም *</label>
              <Input name="lastName" required value={form.lastName} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ዕድሜ (Age) (&gt; 14)</label>
              <Input type="number" name="age" min="15" max="120" placeholder="ምሳሌ፡ 18" value={form.age} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ክፍል (Grade)</label>
              <Select name="grade" value={form.grade} onChange={handleChange}>
                {[7, 8, 9, 10, 11, 12].map((g) => (
                  <option key={g} value={`Grade ${g}`}>Grade {g}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የምዝገባ ዓይነት</label>
              <Select name="studentType" value={form.studentType} onChange={handleChange}>
                <option value="regular">መደበኛ (Regular)</option>
                <option value="distance">የርቀት (Distance)</option>
              </Select>
            </div>
          </div>

          {/* Ethiopian Calendar Date of Birth */}
          <div className="pt-1">
            <EthiopianDatePicker
              value={form.dob}
              onChange={(iso) => setForm({ ...form, dob: iso })}
              label="የትውልድ ቀን በኢትዮጵያ የቀን አቆጣጠር (Date of Birth - Ethiopian Calendar)"
            />
          </div>

          {form.studentType === 'regular' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የመማሪያ ፈረቃ (Study Shift)</label>
                <Select name="shift" value={form.shift} onChange={handleChange}>
                  <option value="weekend">የቀን (ቅዳሜ እና እሑድ) - Weekend</option>
                  <option value="night">የማታ - Night</option>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ስልክ</label>
                <Input icon={Phone} name="phone" value={form.phone} onChange={handleChange} />
              </div>
            </div>
          )}

          {form.studentType === 'distance' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ስልክ</label>
              <Input icon={Phone} name="phone" value={form.phone} onChange={handleChange} />
            </div>
          )}

          {/* Subcity, Woreda, Kebele & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ክፍለ ከተማ (Subcity)</label>
              <Select name="subcity" value={form.subcity} onChange={handleChange}>
                <option value="">ይምረጡ (Select)</option>
                <option value="ቦሌ (Bole)">ቦሌ (Bole)</option>
                <option value="አራዳ (Arada)">አራዳ (Arada)</option>
                <option value="ቂርቆስ (Kirkos)">ቂርቆስ (Kirkos)</option>
                <option value="ልደታ (Lideta)">ልደታ (Lideta)</option>
                <option value="የካ (Yeka)">የካ (Yeka)</option>
                <option value="ኮልፌ ቀራኒዮ (Kolfe Keranio)">ኮልፌ ቀራኒዮ (Kolfe Keranio)</option>
                <option value="አቃቂ ቃሊቲ (Akaki Kality)">አቃቂ ቃሊቲ (Akaki Kality)</option>
                <option value="ንፋስ ስልክ ላፍቶ (Nifas Silk Lafto)">ንፋስ ስልክ ላፍቶ (Nifas Silk Lafto)</option>
                <option value="ጉለሌ (Gulele)">ጉለሌ (Gulele)</option>
                <option value="አዲስ ከተማ (Addis Ketema)">አዲስ ከተማ (Addis Ketema)</option>
                <option value="ለሚ ኩራ (Lemi Kura)">ለሚ ኩራ (Lemi Kura)</option>
                <option value="ከአዲስ አበባ ውጪ (Outside AA)">ከአዲስ አበባ ውጪ (Outside AA)</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ወረዳ (Woreda)</label>
              <Input name="woreda" placeholder="ምሳሌ፡ 03" value={form.woreda} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ቀበሌ / የቤት ቁጥር (Kebele)</label>
              <Input name="kebele" placeholder="ቀበሌ / የቤት ቁጥር" value={form.kebele} onChange={handleChange} />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ተጨማሪ አድራሻ (Address Details)</label>
              <Input icon={MapPin} name="address" placeholder="የሰፈር ስም ወይም ልዩ ምልክት" value={form.address} onChange={handleChange} />
            </div>
          </div>
        </Card>

        {/* Section 2: Emergency Contact */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Heart className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">የአደጋ ጊዜ ተጠሪ</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የተጠሪ ስም</label>
              <Input name="emergencyFirstName" value={form.emergencyFirstName} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ዝምድና</label>
              <Select name="relationship" value={form.relationship} onChange={handleChange}>
                <option value="Father">አባት (Father)</option>
                <option value="Mother">እናት (Mother)</option>
                <option value="Guardian">አሳዳጊ (Guardian)</option>
                <option value="Other">ሌላ (Other)</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የተጠሪ ስልክ</label>
              <Input icon={Phone} name="contactPhone" value={form.contactPhone} onChange={handleChange} />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={() => navigate('/admin/students')}>
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

export default EditStudent;
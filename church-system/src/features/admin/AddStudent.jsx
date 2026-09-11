'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, Save, User, Mail, Lock, Phone, MapPin, Heart } from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { EthiopianDatePicker } from '../../components/ui/EthiopianDatePicker';
import { toast } from '../../utils/toast';

const AddStudent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    age: '',
    grade: 'Grade 7',
    shift: 'weekend',
    subcity: '',
    woreda: '',
    kebele: '',
    address: '',
    contactPhone: '',
    studentType: 'regular',
    email: '',
    password: '',
    emergencyFirstName: '',
    emergencyMiddleName: '',
    emergencyLastName: '',
    relationship: 'Father',
    emergencyPhone: '',
    emergencyEmail: '',
    emergencyAddress: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error('ስም፣ የአባት ስም፣ ኢሜይል እና የይለፍ ቃል አስፈላጊ ናቸው');
      return;
    }

    if (formData.age && Number(formData.age) <= 14) {
      toast.error('የተማሪ ዕድሜ ከ 14 ዓመት በላይ መሆን አለበት');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/students', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(`ተማሪ "${data.student?.firstName || formData.firstName}" በተሳካ ሁኔታ ተመዝግቧል!`);
        navigate('/admin/students');
      } else {
        toast.error(data.message || 'ተማሪ መመዝገብ አልተቻለም');
      }
    } catch (err) {
      toast.error('የኔትወርክ ግንኙነት ችግር አጋጥሟል');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="አዲስ ተማሪ መዝግብ"
        subtitle="የተማሪውን የግል፣ የአካውንት እና የአደጋ ጊዜ ተጠሪ መረጃዎችን ያስገቡ"
        icon={UserPlus}
        badge={<Badge variant="gold" size="sm">አዲስ ምዝገባ</Badge>}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/students')} className="gap-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ተመለስ</span>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Info */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">የተማሪው የግል መረጃ</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ስም *</label>
              <Input name="firstName" required value={formData.firstName} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የአባት ስም</label>
              <Input name="middleName" value={formData.middleName} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የአያት ስም *</label>
              <Input name="lastName" required value={formData.lastName} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ዕድሜ * (ከ 14 በላይ)</label>
              <Input type="number" name="age" min="15" max="120" placeholder="ምሳሌ፡ 18" value={formData.age} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የትምህርት ክፍል</label>
              <Select name="grade" value={formData.grade} onChange={handleChange}>
                {[7, 8, 9, 10, 11, 12].map((g) => (
                  <option key={g} value={`Grade ${g}`}>{g}ኛ ክፍል</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የምዝገባ ዓይነት</label>
              <Select name="studentType" value={formData.studentType} onChange={handleChange}>
                <option value="regular">መደበኛ</option>
                <option value="distance">የርቀት</option>
              </Select>
            </div>
          </div>

          {/* Ethiopian Calendar Date of Birth */}
          <div className="pt-1">
            <EthiopianDatePicker
              value={formData.dob}
              onChange={(iso) => setFormData({ ...formData, dob: iso })}
              label="የትውልድ ቀን በኢትዮጵያ የቀን አቆጣጠር"
            />
          </div>

          {formData.studentType === 'regular' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የመማሪያ ፈረቃ</label>
                <Select name="shift" value={formData.shift} onChange={handleChange}>
                  <option value="weekend">የቀን (ቅዳሜ እና እሑድ)</option>
                  <option value="night">የማታ</option>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ስልክ ቁጥር</label>
                <Input icon={Phone} name="contactPhone" value={formData.contactPhone} onChange={handleChange} />
              </div>
            </div>
          )}

          {formData.studentType === 'distance' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ስልክ ቁጥር</label>
              <Input icon={Phone} name="contactPhone" value={formData.contactPhone} onChange={handleChange} />
            </div>
          )}

          {/* Subcity, Woreda, Kebele & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ክፍለ ከተማ</label>
              <Select name="subcity" value={formData.subcity} onChange={handleChange}>
                <option value="">ይምረጡ</option>
                <option value="ቦሌ">ቦሌ</option>
                <option value="አራዳ">አራዳ</option>
                <option value="ቂርቆስ">ቂርቆስ</option>
                <option value="ልደታ">ልደታ</option>
                <option value="የካ">የካ</option>
                <option value="ኮልፌ ቀራኒዮ">ኮልፌ ቀራኒዮ</option>
                <option value="አቃቂ ቃሊቲ">አቃቂ ቃሊቲ</option>
                <option value="ንፋስ ስልክ ላፍቶ">ንፋስ ስልክ ላፍቶ</option>
                <option value="ጉለሌ">ጉለሌ</option>
                <option value="አዲስ ከተማ">አዲስ ከተማ</option>
                <option value="ለሚ ኩራ">ለሚ ኩራ</option>
                <option value="ከአዲስ አበባ ውጪ">ከአዲስ አበባ ውጪ</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ወረዳ</label>
              <Input name="woreda" placeholder="ምሳሌ፡ 03" value={formData.woreda} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ቀበሌ / የቤት ቁጥር</label>
              <Input name="kebele" placeholder="ቀበሌ / የቤት ቁጥር" value={formData.kebele} onChange={handleChange} />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ተጨማሪ አድራሻ</label>
              <Input icon={MapPin} name="address" placeholder="የሰፈር ስም ወይም ልዩ ምልክት" value={formData.address} onChange={handleChange} />
            </div>
          </div>
        </Card>

        {/* Section 2: Account Login */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Lock className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">የመግቢያ አካውንት</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ኢሜይል *</label>
              <Input icon={Mail} type="email" name="email" required value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የይለፍ ቃል *</label>
              <Input icon={Lock} type="password" name="password" required value={formData.password} onChange={handleChange} />
            </div>
          </div>
        </Card>

        {/* Section 3: Emergency Contact */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Heart className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">የአደጋ ጊዜ ተጠሪ</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የተጠሪ ስም</label>
              <Input name="emergencyFirstName" value={formData.emergencyFirstName} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ዝምድና</label>
              <Select name="relationship" value={formData.relationship} onChange={handleChange}>
                <option value="Father">አባት</option>
                <option value="Mother">እናት</option>
                <option value="Guardian">አሳዳጊ</option>
                <option value="Other">ሌላ</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የተጠሪ ስልክ</label>
              <Input icon={Phone} name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={() => navigate('/admin/students')}>
            ሰርዝ
          </Button>
          <Button variant="primary" type="submit" loading={loading} className="gap-2">
            <Save className="w-4 h-4" />
            <span>ተማሪውን መዝግብ</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;
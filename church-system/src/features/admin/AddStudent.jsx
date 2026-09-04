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
import { toast } from '../../utils/toast';

const AddStudent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    grade: 'Grade 7',
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
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="አዲስ ተማሪ መዝግብ (Add Student)"
        subtitle="የተማሪውን የግል፣ የአካውንት እና የአደጋ ጊዜ ተጠሪ መረጃዎችን ያስገቡ"
        icon={UserPlus}
        badge={<Badge variant="gold" size="sm">አዲስ ምዝገባ</Badge>}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/students')} className="gap-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ተመለስ (Back)</span>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Info */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">የተማሪው የግል መረጃ (Personal Info)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ስም (First Name) *</label>
              <Input name="firstName" required value={formData.firstName} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የአባት ስም (Middle Name)</label>
              <Input name="middleName" value={formData.middleName} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የአያት ስም (Last Name) *</label>
              <Input name="lastName" required value={formData.lastName} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የትውልድ ቀን (DOB)</label>
              <Input type="date" name="dob" value={formData.dob} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የትምህርት ክፍል (Grade)</label>
              <Select name="grade" value={formData.grade} onChange={handleChange}>
                {[7, 8, 9, 10, 11, 12].map((g) => (
                  <option key={g} value={`Grade ${g}`}>Grade {g}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የምዝገባ ዓይነት (Type)</label>
              <Select name="studentType" value={formData.studentType} onChange={handleChange}>
                <option value="regular">መደበኛ (Regular)</option>
                <option value="distance">የርቀት (Distance)</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ስልክ ቁጥር (Phone)</label>
              <Input icon={Phone} name="contactPhone" value={formData.contactPhone} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">አድራሻ (Address)</label>
              <Input icon={MapPin} name="address" value={formData.address} onChange={handleChange} />
            </div>
          </div>
        </Card>

        {/* Section 2: Account Login */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Lock className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">የመግቢያ አካውንት (Account Login)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ኢሜይል (Email) *</label>
              <Input icon={Mail} type="email" name="email" required value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የይለፍ ቃል (Password) *</label>
              <Input icon={Lock} type="password" name="password" required value={formData.password} onChange={handleChange} />
            </div>
          </div>
        </Card>

        {/* Section 3: Emergency Contact */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Heart className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">የአደጋ ጊዜ ተጠሪ (Emergency Contact)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የተጠሪ ስም</label>
              <Input name="emergencyFirstName" value={formData.emergencyFirstName} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ዝምድና (Relationship)</label>
              <Select name="relationship" value={formData.relationship} onChange={handleChange}>
                <option value="Father">አባት (Father)</option>
                <option value="Mother">እናት (Mother)</option>
                <option value="Guardian">አሳዳጊ (Guardian)</option>
                <option value="Other">ሌላ (Other)</option>
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
            <span>ተማሪውን መዝግብ (Save Student)</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;
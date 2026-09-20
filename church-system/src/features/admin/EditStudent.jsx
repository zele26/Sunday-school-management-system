'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Edit,
  ArrowLeft,
  Save,
  User,
  Phone,
  MapPin,
  Heart,
  GraduationCap,
  CreditCard,
  Hash,
  Sparkles,
} from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { EthiopianDatePicker } from '../../components/ui/EthiopianDatePicker';
import PhotoUploadField from '../../components/ui/PhotoUploadField';
import { toast } from '../../utils/toast';
import {
  EDUCATION_LEVEL_OPTIONS,
  PROFESSION_OPTIONS,
  RELATIONSHIP_OPTIONS,
} from '../../constants/registrationOptions';

const COMMON_GRADES = [
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'መሰረተ ሃይማኖት',
  'ነገረ መለኮት',
  'ስርዓተ ቤተክርስቲያን',
  'ቋንቋ ግእዝ',
  'መዝሙርና ዝማሬ',
  'የቤተክርስቲያን ታሪክ',
];

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customGrade, setCustomGrade] = useState(false);

  const [form, setForm] = useState({
    photoUrl: '',
    studentId: '',
    registrationNumber: '',
    batch: '',
    firstName: '',
    middleName: '',
    lastName: '',
    christianName: '',
    hasConfessionFather: false,
    confessionFatherName: '',
    confessionFatherPhone: '',
    phone: '',
    grade: 'Grade 7',
    age: '',
    shift: 'weekend',
    subcity: '',
    woreda: '',
    kebele: '',
    address: '',
    studentType: 'regular',
    educationLevel: '',
    profession: '',
    gender: 'Male',
    emergencyContactPhoto: '',
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
          const s = data.student || {};
          const currentGrade = s.grade || 'Grade 7';
          if (!COMMON_GRADES.includes(currentGrade) && currentGrade) {
            setCustomGrade(true);
          }

          setForm({
            photoUrl: s.photoUrl || '',
            studentId: s.studentId || '',
            registrationNumber: s.registrationNumber || '',
            batch: s.batch || '',
            firstName: s.firstName || '',
            middleName: s.middleName || '',
            lastName: s.lastName || '',
            christianName: s.christianName || '',
            hasConfessionFather: Boolean(s.hasConfessionFather),
            confessionFatherName: s.confessionFatherName || '',
            confessionFatherPhone: s.confessionFatherPhone || '',
            phone: s.studentPhone || s.contactPhone || '',
            grade: currentGrade,
            age: s.age || '',
            shift: s.shift || 'weekend',
            subcity: s.subcity || '',
            woreda: s.woreda || '',
            kebele: s.kebele || '',
            address: s.address || '',
            studentType: s.studentType || 'regular',
            educationLevel: s.educationLevel || '',
            profession: s.profession || '',
            gender: s.gender || 'Male',
            emergencyContactPhoto: s.emergencyContactPhoto || '',
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
          toast.error('ተማሪውን መጫን አልተቻለም (Failed to load student)');
        }
      } catch (err) {
        toast.error('የግንኙነት ስህተት ተከስቷል (Connection error)');
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
      toast.error('የተማሪ ዕድሜ ከ 14 ዓመት በላይ መሆን አለበት (Age must be > 14)');
      return;
    }

    setSubmitting(true);

    const payload = {
      photoUrl: form.photoUrl,
      studentId: form.studentId ? form.studentId.trim() : undefined,
      registrationNumber: form.registrationNumber ? form.registrationNumber.trim() : '',
      batch: form.batch ? form.batch.trim() : '',
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim(),
      lastName: form.lastName.trim(),
      christianName: form.christianName ? form.christianName.trim() : '',
      hasConfessionFather: form.hasConfessionFather,
      confessionFatherName: form.confessionFatherName ? form.confessionFatherName.trim() : '',
      confessionFatherPhone: form.confessionFatherPhone ? form.confessionFatherPhone.trim() : '',
      grade: form.grade ? form.grade.trim() : 'Grade 7',
      age: form.age ? Number(form.age) : undefined,
      shift: form.shift,
      subcity: form.subcity.trim(),
      woreda: form.woreda.trim(),
      kebele: form.kebele.trim(),
      address: form.address.trim(),
      studentPhone: form.phone.trim(),
      contactPhone: form.phone.trim(),
      studentType: form.studentType,
      educationLevel: form.educationLevel,
      profession: form.profession,
      gender: form.gender,
      emergencyContactPhoto: form.emergencyContactPhoto,
      emergencyFirstName: form.emergencyFirstName.trim(),
      emergencyMiddleName: form.emergencyMiddleName.trim(),
      emergencyLastName: form.emergencyLastName.trim(),
      relationship: form.relationship.trim(),
      emergencyPhone: form.contactPhone.trim(),
      contactEmail: form.contactEmail.trim(),
      emergencyAddress: form.contactAddress.trim(),
      dob: form.dob,
    };

    try {
      const res = await apiFetch(`/api/admin/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('የተማሪው መረጃ በተሳካ ሁኔታ ተሻሽሏል! (Student updated successfully)');
        navigate('/admin/students');
      } else {
        toast.error(resData.message || 'ማሻሻል አልተቻለም (Update failed)');
      }
    } catch (err) {
      toast.error('የኔትወርክ ግንኙነት ችግር አጋጥሟል (Network error)');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 dark:text-slate-500">
        <div className="w-8 h-8 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">የተማሪ መረጃ በመጫን ላይ... (Loading student details...)</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title={`ተማሪ አሻሽል: ${form.firstName} ${form.lastName}`}
        subtitle="የተማሪውን መለያ ቁጥር፣ ክፍል፣ የግል እና የአደጋ ጊዜ መረጃዎች ያሻሽሉ"
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
        {/* Section 1: Academic Identity (ID & Class) */}
        <Card variant="default" padding="lg" className="space-y-4 border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/20 via-white to-blue-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">የተማሪ አካዳሚክ መለያ እና ክፍል (Student ID & Class)</h3>
            </div>
            <Badge variant="gold" size="sm">አካዳሚክ መረጃ</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Student ID */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                <span>የተማሪ መለያ ቁጥር (Student ID)</span>
              </label>
              <Input
                name="studentId"
                placeholder="ምሳሌ፡ TKR-2015-0001 ወይም STU-2026-0001"
                value={form.studentId}
                onChange={handleChange}
                className="font-mono font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">የተማሪው ቋሚ የሰንበት ት/ቤት መታወቂያ ቁጥር</p>
            </div>

            {/* Class / Grade Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                  <span>ክፍል / ደረጃ (Class / Grade) *</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCustomGrade(!customGrade)}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold"
                >
                  {customGrade ? 'ከዝርዝር ምረጥ' : 'ልዩ ክፍል ፃፍ'}
                </button>
              </div>

              {customGrade ? (
                <Input
                  name="grade"
                  required
                  placeholder="ምሳሌ፡ 10ኛ ክፍል ወይም ነገረ መለኮት"
                  value={form.grade}
                  onChange={handleChange}
                />
              ) : (
                <Select name="grade" value={form.grade} onChange={handleChange}>
                  {COMMON_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g.startsWith('Grade') ? `${g.replace('Grade ', '')}ኛ ክፍል (${g})` : g}
                    </option>
                  ))}
                </Select>
              )}
              <p className="text-[11px] text-slate-400 mt-1">የተማሪው የትምህርት ደረጃ ወይም ክፍል</p>
            </div>

            {/* Registration Number or Batch */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>{form.studentType === 'distance' ? 'ዙር / ባች (Batch)' : 'የማመልከቻ ቁጥር (Reg No)'}</span>
              </label>
              {form.studentType === 'distance' ? (
                <Input
                  name="batch"
                  placeholder="ምሳሌ፡ Batch 1 ወይም ዙር 2"
                  value={form.batch}
                  onChange={handleChange}
                />
              ) : (
                <Input
                  name="registrationNumber"
                  placeholder="ምሳሌ፡ REG-2026-0042"
                  value={form.registrationNumber}
                  onChange={handleChange}
                />
              )}
            </div>
          </div>
        </Card>

        {/* Section 2: Personal Information */}
        <Card variant="default" padding="lg" className="space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">የተማሪው የግል መረጃ (Personal Details)</h3>
          </div>

          {/* Student Photo */}
          <div className="pb-2">
            <PhotoUploadField
              label="የተማሪው ፎቶ (የቁም ፎቶ)"
              hint="የተማሪውን ግልጽ የቁም ፎቶ ያስገቡ (JPEG/PNG/WebP እስከ 5MB)"
              value={form.photoUrl}
              onChange={(url) => setForm((prev) => ({ ...prev, photoUrl: url }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ስም (First Name) *</label>
              <Input name="firstName" required value={form.firstName} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የአባት ስም (Middle Name)</label>
              <Input name="middleName" value={form.middleName} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የአያት ስም (Last Name) *</label>
              <Input name="lastName" required value={form.lastName} onChange={handleChange} />
            </div>
          </div>

          {/* Christian / Baptismal Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                <span>✝️ የክርስትና ስም (Baptismal Name)</span>
              </label>
              <Input
                name="christianName"
                placeholder="ምሳሌ፡ ወልደ ሥላሴ / ገብረ ማርያም"
                value={form.christianName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ዕድሜ (Age &gt; 14)</label>
              <Input type="number" name="age" min="15" max="120" placeholder="ምሳሌ፡ 18" value={form.age} onChange={handleChange} />
            </div>
          </div>

          {/* ✝️ Spiritual Father Section */}
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white">
                  የንስሐ አባት አለዎት? (Do you have a confession father?)
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  የንስሐ አባት ካለዎት መረጃቸውን ያስገቡ፤ ከሌለዎትም በኋላ እንዲይዙ ይመቻቻል።
                </p>
              </div>

              {/* Yes / No Pill Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, hasConfessionFather: true }))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    form.hasConfessionFather
                      ? 'bg-[var(--brand-primary)] text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  ✓ አዎ / አለኝ
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      hasConfessionFather: false,
                      confessionFatherName: '',
                      confessionFatherPhone: '',
                    }))
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !form.hasConfessionFather
                      ? 'bg-slate-700 text-white shadow-md dark:bg-slate-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  ✕ የለኝም / አልያዝኩም
                </button>
              </div>
            </div>

            {form.hasConfessionFather ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-blue-200/50 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    የንስሐ አባት ስም
                  </label>
                  <Input
                    name="confessionFatherName"
                    placeholder="ምሳሌ፡ አባ ወልደ ገብርኤል"
                    value={form.confessionFatherName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    የንስሐ አባት ስልክ
                  </label>
                  <Input
                    icon={Phone}
                    name="confessionFatherPhone"
                    placeholder="0911234567"
                    value={form.confessionFatherPhone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800/40">
                ℹ️ የንስሐ አባት ባይኖርዎትም መመዝገብ ይችላሉ፤ ሰንበት ትምህርት ቤቱ የንስሐ አባት እንዲይዙ አስፈላጊውን መንፈሳዊ ድጋፍ ይሰጥዎታል።
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ጾታ (Gender)</label>
              <Select name="gender" value={form.gender} onChange={handleChange}>
                <option value="Male">ወንድ (Male)</option>
                <option value="Female">ሴት (Female)</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የምዝገባ ዓይነት (Student Track)</label>
              <Select name="studentType" value={form.studentType} onChange={handleChange}>
                <option value="regular">መደበኛ (Regular)</option>
                <option value="distance">የርቀት (Distance / Online)</option>
              </Select>
            </div>
          </div>

          {/* Ethiopian Calendar Date of Birth */}
          <div className="pt-1">
            <EthiopianDatePicker
              value={form.dob}
              onChange={(iso) => setForm({ ...form, dob: iso })}
              label="የትውልድ ቀን በኢትዮጵያ የቀን አቆጣጠር (Date of Birth)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ዓለማዊ የትምህርት ደረጃ (Education Level)</label>
              <Select name="educationLevel" value={form.educationLevel} onChange={handleChange}>
                <option value="">ይምረጡ (Select)</option>
                {EDUCATION_LEVEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.labelAm} ({opt.labelEn})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የሥራ ዘርፍ / ሙያ (Profession)</label>
              <Select name="profession" value={form.profession} onChange={handleChange}>
                <option value="">ይምረጡ (Select)</option>
                {PROFESSION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.labelAm} ({opt.labelEn})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {form.studentType === 'regular' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የመማሪያ ፈረቃ (Shift)</label>
                <Select name="shift" value={form.shift} onChange={handleChange}>
                  <option value="weekend">የቀን (ቅዳሜ እና እሑድ)</option>
                  <option value="night">የማታ (Night)</option>
                </Select>
              </div>
            )}
            <div className={form.studentType !== 'regular' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ስልክ ቁጥር (Phone Number)</label>
              <Input icon={Phone} name="phone" value={form.phone} onChange={handleChange} />
            </div>
          </div>

          {/* Subcity, Woreda, Kebele & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ክፍለ ከተማ (Subcity)</label>
              <Select name="subcity" value={form.subcity} onChange={handleChange}>
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ወረዳ (Woreda)</label>
              <Input name="woreda" placeholder="ምሳሌ፡ 03" value={form.woreda} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ቀበሌ / የቤት ቁጥር (Kebele / House No)</label>
              <Input name="kebele" placeholder="ቀበሌ / የቤት ቁጥር" value={form.kebele} onChange={handleChange} />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ተጨማሪ አድራሻ (Address Details)</label>
              <Input icon={MapPin} name="address" placeholder="የሰፈር ስም ወይም ልዩ ምልክት" value={form.address} onChange={handleChange} />
            </div>
          </div>
        </Card>

        {/* Section 3: Emergency Contact */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Heart className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">የአደጋ ጊዜ ተጠሪ (Emergency Contact)</h3>
          </div>

          {/* Emergency Contact Photo */}
          <div className="pb-2">
            <PhotoUploadField
              label="የአደጋ ጊዜ ተጠሪ ፎቶ (Emergency Contact Photo)"
              hint="የአደጋ ጊዜ ተጠሪውን ፎቶ ያስገቡ (አማራጭ)"
              value={form.emergencyContactPhoto}
              onChange={(url) => setForm((prev) => ({ ...prev, emergencyContactPhoto: url }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የተጠሪ ስም (Contact Name)</label>
              <Input name="emergencyFirstName" value={form.emergencyFirstName} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">ዝምድና (Relationship)</label>
              <Select name="relationship" value={form.relationship} onChange={handleChange}>
                {RELATIONSHIP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.labelAm} ({opt.labelEn})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">የተጠሪ ስልክ (Contact Phone)</label>
              <Input icon={Phone} name="contactPhone" value={form.contactPhone} onChange={handleChange} />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={() => navigate('/admin/students')}>
            ሰርዝ (Cancel)
          </Button>
          <Button variant="primary" type="submit" loading={submitting} className="gap-2 shadow-md">
            <Save className="w-4 h-4" />
            <span>ለውጦችን አስቀምጥ (Save Changes)</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditStudent;
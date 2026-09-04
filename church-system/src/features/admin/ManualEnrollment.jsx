'use client';

import React, { useEffect, useState } from 'react';
import { UserPlus, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../utils/toast';

const ManualEnrollment = () => {
  const [programs, setPrograms] = useState([]);
  const [studyModes, setStudyModes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [form, setForm] = useState({
    personId: '',
    programCode: 'REG',
    academicYearName: new Date().getFullYear().toString(),
    gradeName: '',
    studyModeCode: 'REGULAR',
    scheduleCode: 'WEEKEND',
  });

  const [loading, setLoading] = useState(false);

  // Search person
  const [personSearch, setPersonSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [programsRes, studyModesRes, schedulesRes, yearsRes] = await Promise.all([
        apiFetch('/api/education/programs'),
        apiFetch('/api/education/study-modes'),
        apiFetch('/api/education/schedules'),
        apiFetch('/api/education/academic-years'),
      ]);
      if (programsRes.ok) setPrograms((await programsRes.json()).programs || []);
      if (studyModesRes.ok) setStudyModes((await studyModesRes.json()).studyModes || []);
      if (schedulesRes.ok) setSchedules((await schedulesRes.json()).schedules || []);
      if (yearsRes.ok) setAcademicYears((await yearsRes.json()).years || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePersonSearch = async (e) => {
    const query = e.target.value;
    setPersonSearch(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await apiFetch(`/api/core/persons?search=${encodeURIComponent(query)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.persons || []);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectPerson = (person) => {
    setForm({ ...form, personId: person._id });
    setPersonSearch(`${person.firstName} ${person.lastName}`);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.personId) {
      toast.error('እባክዎ መጀመሪያ ተማሪ ይምረጡ');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/api/education/enroll', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('ተማሪው በተሳካ ሁኔታ ተመዝግቧል! (Enrollment created successfully)');
        setForm({
          personId: '',
          programCode: 'REG',
          academicYearName: new Date().getFullYear().toString(),
          gradeName: '',
          studyModeCode: 'REGULAR',
          scheduleCode: 'WEEKEND',
        });
        setPersonSearch('');
      } else {
        toast.error(data.message || 'ምዝገባው አልተሳካም');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ቀጥታ የተማሪ ምዝገባ (Manual Enrollment)"
        subtitle="ነባር ሰዎችን ወደ ትምህርት ፕሮግራም፣ ዘመን እና ክፍል በቀጥታ ያስመዝግቡ"
        icon={UserPlus}
        badge={<Badge variant="gold" size="sm">አስተዳደራዊ ምዝገባ</Badge>}
      />

      <Card variant="default" padding="lg" className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Person Search */}
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              ተማሪ ይፈልጉና ይምረጡ (Select Student) *
            </label>
            <Input
              icon={Search}
              placeholder="በስም ወይም በስልክ ይፈልጉ..."
              value={personSearch}
              onChange={handlePersonSearch}
              required
            />
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                {searchResults.map((p) => (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => selectPerson(p)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 last:border-0"
                  >
                    {p.firstName} {p.middleName} {p.lastName} <span className="text-xs text-slate-400">({p.phone || 'No phone'})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                የትምህርት ፕሮግራም (Program)
              </label>
              <Select
                value={form.programCode}
                onChange={(e) => setForm({ ...form, programCode: e.target.value })}
              >
                {programs.length > 0 ? (
                  programs.map((p) => (
                    <option key={p._id} value={p.code}>
                      {p.name} ({p.code})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="REG">መደበኛ (Regular)</option>
                    <option value="DIST">የርቀት (Distance)</option>
                  </>
                )}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                የትምህርት ዘመን (Academic Year)
              </label>
              <Select
                value={form.academicYearName}
                onChange={(e) => setForm({ ...form, academicYearName: e.target.value })}
              >
                {academicYears.length > 0 ? (
                  academicYears.map((y) => (
                    <option key={y._id} value={y.name}>
                      {y.name}
                    </option>
                  ))
                ) : (
                  <option value="2017">2017 ዓ.ም</option>
                )}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                ክፍል / ባች (Grade/Batch)
              </label>
              <Input
                placeholder="e.g. 1ኛ ዓመት, Batch 1"
                value={form.gradeName}
                onChange={(e) => setForm({ ...form, gradeName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                የመማሪያ ሁነታ (Study Mode)
              </label>
              <Select
                value={form.studyModeCode}
                onChange={(e) => setForm({ ...form, studyModeCode: e.target.value })}
              >
                <option value="REGULAR">መደበኛ (Regular)</option>
                <option value="DISTANCE">የርቀት (Distance)</option>
              </Select>
            </div>
          </div>

          <div className="pt-3">
            <Button variant="primary" type="submit" loading={loading} className="gap-2">
              <UserPlus className="w-4 h-4" />
              <span>ተማሪውን አስመዝግብ (Complete Enrollment)</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ManualEnrollment;
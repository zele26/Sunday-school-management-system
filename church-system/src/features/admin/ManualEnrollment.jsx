import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../api/apiClient';

const ManualEnrollment = () => {
  const [people, setPeople] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [studyModes, setStudyModes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [grades, setGrades] = useState([]);

  const [form, setForm] = useState({
    personId: '',
    programCode: 'REG',
    academicYearName: new Date().getFullYear().toString(),
    gradeName: '',
    studyModeCode: 'REGULAR',
    scheduleCode: 'WEEKEND',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
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
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await apiFetch('/api/education/enroll', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Enrollment created successfully!');
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
        setError(data.message || 'Failed to enroll');
      }
    } catch (err) {
      setError('Network error during enrollment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Manual Enrollment (New)</h2>

      {error && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-sm">{error}</div>}
      {message && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Person Search */}
        <div className="relative">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Search Person</label>
          <input
            type="text"
            value={personSearch}
            onChange={handlePersonSearch}
            placeholder="Type name, phone, or email..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
          />
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">
              {searchResults.map(person => (
                <button
                  type="button"
                  key={person._id}
                  onClick={() => selectPerson(person)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm"
                >
                  {person.firstName} {person.lastName} — {person.phone || person.email}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Program */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Program</label>
          <select
            value={form.programCode}
            onChange={(e) => setForm({ ...form, programCode: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
          >
            {programs.map(program => (
              <option key={program._id} value={program.code}>{program.name}</option>
            ))}
          </select>
        </div>

        {/* Academic Year */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Academic Year</label>
          <select
            value={form.academicYearName}
            onChange={(e) => setForm({ ...form, academicYearName: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
          >
            {academicYears.map(year => (
              <option key={year._id} value={year.name}>{year.name}</option>
            ))}
          </select>
        </div>

        {/* Grade (optional) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Grade (optional)</label>
          <input
            type="text"
            value={form.gradeName}
            onChange={(e) => setForm({ ...form, gradeName: e.target.value })}
            placeholder="e.g., Grade 7"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
          />
        </div>

        {/* Study Mode */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Study Mode</label>
          <select
            value={form.studyModeCode}
            onChange={(e) => setForm({ ...form, studyModeCode: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
          >
            {studyModes.map(mode => (
              <option key={mode._id} value={mode.code}>{mode.name}</option>
            ))}
          </select>
        </div>

        {/* Schedule */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Schedule</label>
          <select
            value={form.scheduleCode}
            onChange={(e) => setForm({ ...form, scheduleCode: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
          >
            {schedules.map(schedule => (
              <option key={schedule._id} value={schedule.code}>{schedule.name}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !form.personId}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm disabled:opacity-50"
        >
          {loading ? 'Enrolling...' : 'Enroll Student'}
        </button>
      </form>
    </div>
  );
};

export default ManualEnrollment;
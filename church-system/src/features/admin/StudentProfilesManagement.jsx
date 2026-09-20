'use client';

import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  RefreshCw, 
  Eye, 
  TrendingUp, 
  X, 
  Search, 
  Filter, 
  Users, 
  BookOpen, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PageHeader,
  Card,
  Button,
  Badge,
} from '../../components/ui';
import {
  useStudentProfiles,
  useProgressStudent,
} from '../../hooks/queries/usePeople';
import { formatGradeAmharic, GRADE_FILTER_OPTIONS } from '../../constants/registrationOptions';

const StudentProfilesManagement = () => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProgressConfirm, setShowProgressConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data: profiles = [], isLoading, isFetching, refetch } = useStudentProfiles();
  const progressMutation = useProgressStudent();

  const getCurrentGrade = (profile) => {
    if (!profile) return '—';
    const enroll = profile.latestEnrollment;
    let raw = profile.grade;
    if (!raw && enroll) {
      raw = enroll.gradeId?.name || (enroll.programId?.type === 'distance' ? (profile.batch ? `Batch ${profile.batch}` : 'Batch 1') : null);
    }
    if (!raw && profile.batch) {
      raw = `Batch ${profile.batch}`;
    }
    return formatGradeAmharic(raw);
  };

  const getAcademicYear = (profile) => {
    return profile.latestEnrollment?.academicYearId?.name || '2017 ዓ.ም';
  };

  const openDetails = (profile) => {
    setSelectedProfile(profile);
    setShowDetailModal(true);
    setShowProgressConfirm(false);
  };

  const handleConfirmProgress = () => {
    if (!selectedProfile) return;
    progressMutation.mutate(selectedProfile._id, {
      onSuccess: () => {
        setShowDetailModal(false);
        setShowProgressConfirm(false);
        refetch();
      },
    });
  };

  // Filter and search
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const pName = p.personId ? `${p.personId.firstName} ${p.personId.middleName || ''} ${p.personId.lastName}`.toLowerCase() : '';
      const pId = String(p.studentNumber || p.studentId || '').toLowerCase();
      const pGrade = String(getCurrentGrade(p)).toLowerCase();
      const rawGrade = String(p.grade || p.latestEnrollment?.gradeId?.name || (p.batch ? `Batch ${p.batch}` : '')).toLowerCase();
      const pType = String(p.studentType || p.latestEnrollment?.programId?.type || '').toLowerCase();

      const matchesSearch = !searchQuery || pName.includes(searchQuery.toLowerCase()) || pId.includes(searchQuery.toLowerCase());
      
      let matchesGrade = true;
      if (gradeFilter) {
        const gf = gradeFilter.toLowerCase();
        const gfNum = gradeFilter.match(/\d+/)?.[0];
        matchesGrade = pGrade.includes(gf) || rawGrade.includes(gf) || (gfNum && (pGrade.includes(gfNum) || rawGrade.includes(gfNum)));
      }

      const matchesType = !typeFilter || pType === typeFilter.toLowerCase();

      return matchesSearch && matchesGrade && matchesType;
    });
  }, [profiles, searchQuery, gradeFilter, typeFilter]);

  // KPI calculations
  const totalProfiles = profiles.length;
  const regularCount = profiles.filter((p) => (p.studentType || p.latestEnrollment?.programId?.type) === 'regular').length;
  const distanceCount = profiles.filter((p) => (p.studentType || p.latestEnrollment?.programId?.type) === 'distance').length;
  const activeCount = profiles.filter((p) => p.status === 'active' || !p.status || p.status === 'approved').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="የተማሪዎች አካዳሚክ ፕሮፋይል (Student Profiles)"
        subtitle="የእያንዳንዱን ተማሪ የትምህርት ደረጃ፣ ምዝገባ ታሪክ፣ ፈረቃ እና የደረጃ ሽግግር (Progression) ያስተዳድሩ።"
        icon={GraduationCap}
        badge={<Badge variant="gold" size="sm">{totalProfiles} ተማሪዎች</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/students">
              <Button variant="outline" size="sm" className="gap-1.5 shadow-sm">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>ዋና የተማሪዎች መዝገብ</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              className="gap-2 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>አድስ</span>
            </Button>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="p-4 bg-surface-card border-subtle flex flex-col justify-between">
          <span className="text-xs text-muted font-medium flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-blue-500" /> አጠቃላይ ማህደራት
          </span>
          <div className="text-2xl font-black text-main mt-2">{totalProfiles}</div>
          <span className="text-[11px] text-muted mt-0.5">የተመዘገቡ ተማሪዎች</span>
        </Card>

        <Card className="p-4 bg-surface-card border-subtle flex flex-col justify-between">
          <span className="text-xs text-muted font-medium flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-500" /> መደበኛ ተማሪዎች
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{regularCount}</div>
          <span className="text-[11px] text-muted mt-0.5">በአካል የሚማሩ</span>
        </Card>

        <Card className="p-4 bg-surface-card border-subtle flex flex-col justify-between">
          <span className="text-xs text-muted font-medium flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-500" /> የርቀት ትምህርት
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{distanceCount}</div>
          <span className="text-[11px] text-muted mt-0.5">ኦንላይን / በባች</span>
        </Card>

        <Card className="p-4 bg-surface-card border-subtle flex flex-col justify-between">
          <span className="text-xs text-muted font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-500" /> ንቁ ተማሪዎች
          </span>
          <div className="text-2xl font-black text-main mt-2">{activeCount}</div>
          <span className="text-[11px] text-muted mt-0.5">ትምህርት ላይ ያሉ</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="በተማሪ ስም ወይም መለያ ቁጥር (ID) ፈልግ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-page rounded-xl border border-subtle text-xs text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="px-3 py-2 bg-surface-page rounded-xl border border-subtle text-xs text-main focus:outline-none"
            >
              {GRADE_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-surface-page rounded-xl border border-subtle text-xs text-main focus:outline-none"
            >
              <option value="">-- ሁሉም ዓይነቶች --</option>
              <option value="regular">መደበኛ (Regular)</option>
              <option value="distance">የርቀት (Distance)</option>
            </select>

            {(searchQuery || gradeFilter || typeFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setGradeFilter('');
                  setTypeFilter('');
                }}
                className="text-xs text-muted hover:text-main"
              >
                አጽዳ
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Profiles Table */}
      <Card className="overflow-hidden border-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted">
            <thead className="bg-surface-page text-xs font-bold text-main uppercase border-b border-subtle">
              <tr>
                <th className="py-3.5 px-4">የተማሪ መለያ (ID)</th>
                <th className="py-3.5 px-4">የተማሪ ሙሉ ስም</th>
                <th className="py-3.5 px-4">ክፍል / ባች</th>
                <th className="py-3.5 px-4">ዓይነትና ፈረቃ</th>
                <th className="py-3.5 px-4">የትምህርት ዘመን</th>
                <th className="py-3.5 px-4 text-center">ሁኔታ</th>
                <th className="py-3.5 px-4 text-right">ተግባር</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-xs text-muted">
                    <div className="w-7 h-7 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    የተማሪዎች ፕሮፋይል በመጫን ላይ ነው...
                  </td>
                </tr>
              ) : filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-xs text-muted space-y-2">
                    <GraduationCap className="w-10 h-10 text-muted/40 mx-auto" />
                    <p className="font-semibold text-main">ምንም የተማሪ ፕሮፋይል አልተገኘም</p>
                    <p className="text-[11px] text-muted">አዲስ ተማሪዎችን በዋና የተማሪዎች መዝገብ ወይም በምዝገባ በኩል ማከል ይችላሉ።</p>
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((p) => {
                  const person = p.personId || {};
                  const fullName = [person.firstName, person.middleName, person.lastName].filter(Boolean).join(' ') || 'ተማሪ';
                  const studentType = p.studentType || p.latestEnrollment?.programId?.type || 'regular';
                  const shift = p.shift === 'night' ? 'የማታ' : 'የቀን / ሳምንት መጨረሻ';
                  const isBlocked = p.status === 'disabled';

                  return (
                    <tr key={p._id} className="hover:bg-surface-page/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-xs text-brand-primary">
                        {p.studentNumber || p.studentId || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {person.photoUrl || p.photoUrl ? (
                            <img
                              src={person.photoUrl || p.photoUrl}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                              {person.firstName ? person.firstName.charAt(0) : 'ተ'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-main">{fullName}</div>
                            {(person.christianName || p.christianName) && (
                              <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                                † {person.christianName || p.christianName}
                              </div>
                            )}
                            <div className="text-[11px] text-muted flex items-center gap-2 mt-0.5">
                              {person.phone && <span>{person.phone}</span>}
                              {person.email && <span>• {person.email}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="primary">{getCurrentGrade(p)}</Badge>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div className="font-medium text-main">
                          {studentType === 'distance' ? 'የርቀት' : 'መደበኛ'}
                        </div>
                        <div className="text-[11px] text-muted">{shift}</div>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-main">
                        {getAcademicYear(p)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={isBlocked ? 'danger' : 'success'}>
                          {isBlocked ? 'የታገደ' : 'ንቁ'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openDetails(p)}
                          className="gap-1.5 font-semibold text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>ዝርዝር</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Student Details & Progression Modal */}
      {showDetailModal && selectedProfile && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card
            className="w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 p-6"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-subtle pb-4">
              <div className="flex items-center gap-3.5">
                {selectedProfile.personId?.photoUrl || selectedProfile.photoUrl ? (
                  <img
                    src={selectedProfile.personId?.photoUrl || selectedProfile.photoUrl}
                    alt=""
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                    {selectedProfile.personId?.firstName ? selectedProfile.personId.firstName.charAt(0) : 'ተ'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[11px] font-bold text-muted uppercase">የተማሪ አካዳሚክ ፕሮፋይል</span>
                  </div>
                  <h3 className="text-xl font-black text-main mt-1">
                    {selectedProfile.personId?.firstName} {selectedProfile.personId?.middleName || ''} {selectedProfile.personId?.lastName}
                  </h3>
                  {(selectedProfile.personId?.christianName || selectedProfile.christianName) && (
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-bold mt-0.5">
                      † የክርስትና ስም: {selectedProfile.personId?.christianName || selectedProfile.christianName}
                    </p>
                  )}
                  <p className="text-xs text-muted mt-0.5 font-mono">
                    የተማሪ መለያ (ID): <span className="font-bold text-brand-primary">{selectedProfile.studentNumber || selectedProfile.studentId || '—'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 rounded-lg text-muted hover:text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Confession Father Card */}
            {(selectedProfile.personId?.hasConfessionFather !== undefined || selectedProfile.hasConfessionFather !== undefined) && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 dark:text-amber-300">† የንስሐ አባት ሁኔታ</span>
                  {(selectedProfile.personId?.hasConfessionFather || selectedProfile.hasConfessionFather) ? (
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                      ✓ አላቸው
                    </span>
                  ) : (
                    <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-700">
                      የላቸውም / አልያዙም
                    </span>
                  )}
                </div>
                {(selectedProfile.personId?.hasConfessionFather || selectedProfile.hasConfessionFather) && (
                  <div className="pt-1 text-slate-700 dark:text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                    {(selectedProfile.personId?.confessionFatherName || selectedProfile.confessionFatherName) && (
                      <span><strong>ስም:</strong> {selectedProfile.personId?.confessionFatherName || selectedProfile.confessionFatherName}</span>
                    )}
                    {(selectedProfile.personId?.confessionFatherPhone || selectedProfile.confessionFatherPhone) && (
                      <span className="font-mono"><strong>ስልክ:</strong> {selectedProfile.personId?.confessionFatherPhone || selectedProfile.confessionFatherPhone}</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Academic Information Block */}
            <div className="bg-surface-page/60 border border-subtle p-4 rounded-2xl space-y-3">
              <h4 className="font-bold text-xs text-main uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand-primary" /> የትምህርትና የምዝገባ ዝርዝር
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <span className="text-muted block text-[11px]">ክፍል / ባች</span>
                  <span className="font-bold text-main text-sm">{getCurrentGrade(selectedProfile)}</span>
                </div>
                <div>
                  <span className="text-muted block text-[11px]">የትምህርት ዓይነት</span>
                  <span className="font-bold text-main text-sm">
                    {selectedProfile.studentType === 'distance' ? 'የርቀት ትምህርት' : 'መደበኛ'}
                  </span>
                </div>
                <div>
                  <span className="text-muted block text-[11px]">ፈረቃ</span>
                  <span className="font-bold text-main text-sm">
                    {selectedProfile.shift === 'night' ? 'የማታ' : 'የቀን / ቅዳሜና እሁድ'}
                  </span>
                </div>
                <div>
                  <span className="text-muted block text-[11px]">የትምህርት ዘመን</span>
                  <span className="font-bold text-main">{getAcademicYear(selectedProfile)}</span>
                </div>
                <div>
                  <span className="text-muted block text-[11px]">ሁኔታ</span>
                  <Badge variant={selectedProfile.status === 'disabled' ? 'danger' : 'success'}>
                    {selectedProfile.status === 'disabled' ? 'የታገደ' : 'ንቁ'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="bg-surface-page/60 border border-subtle p-3.5 rounded-xl space-y-1.5">
                <span className="text-[11px] font-bold text-muted uppercase flex items-center gap-1">
                  <Phone className="w-3 h-3 text-blue-500" /> የተማሪው አድራሻ
                </span>
                <div className="text-main font-medium">{selectedProfile.personId?.phone || selectedProfile.phone || 'ስልክ አልተገለጸም'}</div>
                <div className="text-muted">{selectedProfile.personId?.email || selectedProfile.email || 'ኢሜይል አልተገለጸም'}</div>
              </div>

              <div className="bg-surface-page/60 border border-subtle p-3.5 rounded-xl space-y-1.5 flex items-center gap-3">
                {(selectedProfile.personId?.emergencyContactPhoto || selectedProfile.emergencyContactPhoto) && (
                  <img
                    src={selectedProfile.personId?.emergencyContactPhoto || selectedProfile.emergencyContactPhoto}
                    alt="Emergency Contact"
                    className="w-12 h-12 rounded-xl object-cover border border-amber-300/80 shadow-xs shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-muted uppercase flex items-center gap-1">
                    <Users className="w-3 h-3 text-amber-500" /> የአስቸኳይ ጊዜ ተጠሪ
                  </span>
                  <div className="text-main font-medium truncate">
                    {selectedProfile.emergencyContact?.name || [selectedProfile.personId?.emergencyFirstName, selectedProfile.personId?.emergencyLastName].filter(Boolean).join(' ') || 'አልተጠቀሰም'}
                  </div>
                  <div className="text-muted truncate">
                    {selectedProfile.emergencyContact?.phone || selectedProfile.personId?.emergencyPhone || 'ስልክ የለም'}{' '}
                    {(selectedProfile.emergencyContact?.relationship || selectedProfile.personId?.relationship) && `(${selectedProfile.emergencyContact?.relationship || selectedProfile.personId?.relationship})`}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions: Progress Student or Close */}
            <div className="flex justify-between items-center pt-3 border-t border-subtle">
              <Button
                variant="gold"
                size="sm"
                onClick={() => setShowProgressConfirm(true)}
                className="gap-2 font-bold"
              >
                <TrendingUp className="w-4 h-4" />
                <span>ወደ ቀጣይ ክፍል/ባች አሸጋግር</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDetailModal(false)}>
                ዝጋ
              </Button>
            </div>

            {/* Progress Confirmation Box */}
            {showProgressConfirm && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    ይህንን ተማሪ ወደ ቀጣዩ የትምህርት ደረጃ (Progression) እና ዘመን ማሸጋገር እርግጠኛ ነዎት?
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProgressConfirm(false)}
                  >
                    ሰርዝ
                  </Button>
                  <Button
                    variant="gold"
                    size="sm"
                    loading={progressMutation.isPending}
                    onClick={handleConfirmProgress}
                  >
                    አዎ፣ አሸጋግር
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentProfilesManagement;
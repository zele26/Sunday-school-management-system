'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Printer,
  ExternalLink,
  Search,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  Trash2,
  FileBadge,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import VerifiableCertificate from '../../components/VerifiableCertificate';

const CertificatesManagement = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'valid' | 'all'
  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, valid: 0, revoked: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentTypeFilter, setStudentTypeFilter] = useState('all'); // 'all' | 'regular' | 'distance'
  const [scanning, setScanning] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState(null); // { text, type: 'success' | 'error' }

  // Preview Modal State
  const [previewCert, setPreviewCert] = useState(null);

  // Manual Issue Modal State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [issueStatus, setIssueStatus] = useState('Valid');
  const [customHonors, setCustomHonors] = useState('በከፍተኛ ማዕረግ ተመርቋል (With High Distinction)');
  const [submittingIssue, setSubmittingIssue] = useState(false);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/education/certificates');
      if (res.ok) {
        const data = await res.json();
        setCertificates(data.certificates || []);
        if (data.stats) {
          setStats(data.stats);
          // If no pending items and valid exists, default to valid tab if current tab is empty
          if (data.stats.pending === 0 && data.stats.valid > 0 && activeTab === 'pending') {
            setActiveTab('valid');
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await apiFetch('/api/education/student');
      if (res.ok) {
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : data.students || []);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  useEffect(() => {
    fetchCertificates();
    fetchStudents();
  }, []);

  // Auto-scan eligible graduates
  const handleAutoScan = async () => {
    setScanning(true);
    setMessage(null);
    try {
      const res = await apiFetch('/api/education/certificates/auto-check-eligible', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          text: data.message || `ምርመራው ተጠናቋል፡ ${data.createdCount || 0} ብቁ ተማሪዎች ተገኝተዋል`,
          type: 'success',
        });
        await fetchCertificates();
        setActiveTab('pending');
      } else {
        setMessage({ text: data.message || 'ምርመራውን ማካሄድ አልተቻለም', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'የሰርቨር ግንኙነት ችግር ተፈጥሯል', type: 'error' });
    } finally {
      setScanning(false);
    }
  };

  // Approve Certificate (Admin Review)
  const handleApprove = async (certId) => {
    setActionLoadingId(certId);
    setMessage(null);
    try {
      const res = await apiFetch(`/api/education/certificates/${certId}/approve`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'የምስክር ወረቀቱ ይሁንታ አግኝቶ ይፋዊ ሆኗል! (Approved & Issued)', type: 'success' });
        await fetchCertificates();
      } else {
        setMessage({ text: data.message || 'ይሁንታ መስጠት አልተቻለም', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'የሰርቨር ስህተት', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject Certificate
  const handleReject = async (certId) => {
    const reason = prompt('እባክዎ የምስክር ወረቀቱ ውድቅ የተደረገበትን ምክንያት ያስገቡ (Rejection reason):', 'ተጨማሪ ማሟያ ያስፈልገዋል');
    if (reason === null) return;

    setActionLoadingId(certId);
    setMessage(null);
    try {
      const res = await apiFetch(`/api/education/certificates/${certId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason: reason }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'የምስክር ወረቀቱ ውድቅ ተደርጓል (Certificate Rejected)', type: 'success' });
        await fetchCertificates();
      } else {
        setMessage({ text: data.message || 'ስህተት ተፈጥሯል', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'የሰርቨር ስህተት', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Revoke / Delete
  const handleDelete = async (certId) => {
    if (!confirm('ይህን የምስክር ወረቀት መሰረዝ ይፈልጋሉ?')) return;
    setActionLoadingId(certId);
    try {
      const res = await apiFetch(`/api/education/certificates/${certId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMessage({ text: 'የምስክር ወረቀቱ ተሰርዟል', type: 'success' });
        await fetchCertificates();
      }
    } catch (err) {
      setMessage({ text: 'መሰረዝ አልተቻለም', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Manual Generate Submit
  const handleManualIssueSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert('እባክዎ ተማሪ ይምረጡ');
      return;
    }
    setSubmittingIssue(true);
    try {
      const res = await apiFetch(`/api/education/certificates/generate/${selectedStudentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: issueStatus,
          customHonors,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsIssueModalOpen(false);
        setSelectedStudentId('');
        setMessage({ text: data.message || 'የምስክር ወረቀት በተሳካ ሁኔታ ተዘጋጅቷል', type: 'success' });
        await fetchCertificates();
        setActiveTab(issueStatus === 'Valid' ? 'valid' : 'pending');
      } else {
        alert(data.message || 'ማዘጋጀት አልተቻለም');
      }
    } catch (err) {
      alert('የሰርቨር ስህተት');
    } finally {
      setSubmittingIssue(false);
    }
  };

  // Filter certificates
  const filteredCertificates = useMemo(() => {
    return certificates.filter((c) => {
      // Tab filter
      if (activeTab === 'pending' && c.status !== 'Pending') return false;
      if (activeTab === 'valid' && c.status !== 'Valid') return false;
      if (activeTab === 'revoked' && c.status !== 'Revoked') return false;

      // Type filter
      if (studentTypeFilter !== 'all' && c.studentType !== studentTypeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameAm = (c.studentNameAmharic || '').toLowerCase();
        const nameEn = (c.studentName || '').toLowerCase();
        const num = (c.studentNumber || '').toLowerCase();
        const certNum = (c.certificateNumber || '').toLowerCase();
        return nameAm.includes(q) || nameEn.includes(q) || num.includes(q) || certNum.includes(q);
      }
      return true;
    });
  }, [certificates, activeTab, studentTypeFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <PageHeader
        title="የምስክር ወረቀቶች አስተዳደር"
        subtitle="ትምህርታቸውን ላጠናቀቁ መደበኛና የርቀት ተማሪዎች የምስክር ወረቀት ይገምግሙ፣ ይሁንታ ይስጡ እና ያረጋግጡ"
        icon={Award}
        badge={
          stats.pending > 0 ? (
            <Badge variant="gold" size="sm" className="animate-pulse">
              <Clock className="w-3 h-3" /> {stats.pending} ይሁንታ የሚጠብቁ
            </Badge>
          ) : (
            <Badge variant="success" size="sm">
              <CheckCircle2 className="w-3 h-3" /> {stats.valid} የተሰጡ
            </Badge>
          )
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoScan}
              disabled={scanning}
              className="gap-2 border-amber-400/60 text-amber-900 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'ተማሪዎችን በመመርመር ላይ...' : '⚡ ብቁ ተማሪዎችን በራስ-ሰር ፈልግ'}</span>
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={() => setIsIssueModalOpen(true)}
              className="gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ አዲስ ምስክር ወረቀት አዘጋጅ</span>
            </Button>
          </div>
        }
      />

      {/* Notifications / Feedback */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* Metric Filter Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setActiveTab('pending')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            activeTab === 'pending'
              ? 'bg-amber-500/15 border-amber-500 shadow-md ring-2 ring-amber-400/40'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">ይሁንታ የሚጠብቁ (Pending)</span>
            </div>
            <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{stats.pending}</p>
          </div>
          {stats.pending > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] animate-pulse">
              ግምገማ ያስፈልጋቸዋል
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('valid')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            activeTab === 'valid'
              ? 'bg-blue-500/15 border-[#1657b8] shadow-md ring-2 ring-blue-400/40'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">የተሰጡ ይፋዊ (Valid Issued)</span>
            </div>
            <p className="text-2xl font-black text-[#1657b8] dark:text-blue-400 mt-1">{stats.valid}</p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-[10px]">
            በQR የተረጋገጡ
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            activeTab === 'all'
              ? 'bg-slate-500/15 border-slate-500 shadow-md ring-2 ring-slate-400/40'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <FileBadge className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">ጠቅላላ የምስክር ወረቀቶች</span>
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-200 mt-1">{stats.total}</p>
          </div>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <Card variant="subtle" padding="md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[220px] relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="በተማሪ ስም፣ መለያ ቁጥር ወይም ሰርቲፊኬት ቁጥር ፈልግ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">የትምህርት አይነት:</span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {[
                { key: 'all', label: 'ሁሉም' },
                { key: 'regular', label: 'መደበኛ' },
                { key: 'distance', label: 'ርቀት' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setStudentTypeFilter(opt.key)}
                  className={`px-3 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                    studentTypeFilter === opt.key
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Main List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400">የምስክር ወረቀቶችን በመጫን ላይ...</p>
        </div>
      ) : filteredCertificates.length === 0 ? (
        <Card variant="subtle" padding="lg" className="text-center py-16">
          <Award className="w-12 h-12 mx-auto text-amber-500 opacity-50 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {activeTab === 'pending'
              ? 'ይሁንታ የሚጠብቅ ምንም የምስክር ወረቀት የለም'
              : 'ምንም የተሰጠ የምስክር ወረቀት አልተገኘም'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {activeTab === 'pending'
              ? 'ትምህርታቸውን ያጠናቀቁ ተማሪዎችን በራስ-ሰር ለመፈተሽ "ብቁ ተማሪዎችን በራስ-ሰር ፈልግ" የሚለውን ይጫኑ።'
              : 'አዲስ የምስክር ወረቀት ለመስጠት "+ አዲስ ምስክር ወረቀት አዘጋጅ" የሚለውን ቁልፍ ይጠቀሙ።'}
          </p>
          {activeTab === 'pending' && (
            <Button
              variant="gold"
              size="sm"
              onClick={handleAutoScan}
              disabled={scanning}
              className="mt-4 gap-2 cursor-pointer mx-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
              <span>ብቁ ተማሪዎችን ፈልግ</span>
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCertificates.map((cert) => {
            const isPending = cert.status === 'Pending';
            const isValid = cert.status === 'Valid';
            const isActing = actionLoadingId === cert._id;

            return (
              <Card
                key={cert._id}
                variant="default"
                padding="md"
                className={`relative overflow-hidden transition-all border ${
                  isPending
                    ? 'border-amber-400/80 bg-gradient-to-br from-amber-50/20 via-white to-amber-50/10 dark:from-amber-950/10 dark:to-slate-900'
                    : 'border-slate-200 dark:border-slate-800 hover:border-amber-300'
                }`}
              >
                {/* Status Ribbon Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {cert.studentNameAmharic || cert.studentName}
                      </h4>
                      <Badge variant={cert.studentType === 'distance' ? 'info' : 'primary'} size="xs">
                        {cert.studentType === 'distance' ? 'የርቀት' : 'መደበኛ'}
                      </Badge>
                    </div>
                    <p className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                      መለያ፡ {cert.studentNumber} • {cert.batch || 'ዙር ፩'}
                    </p>
                  </div>

                  <div>
                    {isPending ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 font-black text-[10px] border border-amber-300">
                        <Clock className="w-3 h-3" /> ይሁንታ የሚጠብቅ (Pending)
                      </span>
                    ) : isValid ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 font-black text-[10px] border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3" /> ይፋዊ የተሰጠ ({cert.certificateNumber})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 font-black text-[10px]">
                        <XCircle className="w-3 h-3" /> ውድቅ የተደረገ
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Details: Courses Count, Average Score & Distinction */}
                <div className="py-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="font-medium">የተጠናቀቁ ኮርሶች፡</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {cert.completedCourses?.length || 13} ኮርሶች (100% ተጠናቋል)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="font-medium">አጠቃላይ አማካይ ውጤት፡</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      {cert.averageScore || 95}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="font-medium">የማዕረግ ደረጃ፡</span>
                    <span className="font-serif font-bold text-slate-900 dark:text-white">
                      {cert.honors || 'በማዕረግ ተመርቋል'}
                    </span>
                  </div>

                  {/* Course Grade Chips */}
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-slate-400 mb-1.5">የኮርሶች ውጤት ናሙና፡</p>
                    <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
                      {(cert.completedCourses || []).slice(0, 6).map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                        >
                          {c.courseName}: <strong className="text-amber-700 dark:text-amber-400">{c.grade || 'A'} ({c.mark ?? 95}%)</strong>
                        </span>
                      ))}
                      {(cert.completedCourses?.length || 0) > 6 && (
                        <span className="text-[10px] font-bold text-slate-400 self-center">
                          +{cert.completedCourses.length - 6} ተጨማሪ
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setPreviewCert(cert)}
                    className="gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-600" />
                    <span>ይዘት ተመልከት (Preview)</span>
                  </Button>

                  <div className="flex items-center gap-1.5">
                    {isPending ? (
                      <>
                        <Button
                          variant="danger"
                          size="xs"
                          onClick={() => handleReject(cert._id)}
                          disabled={isActing}
                          className="gap-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          <span>ውድቅ አድርግ</span>
                        </Button>
                        <Button
                          variant="gold"
                          size="xs"
                          onClick={() => handleApprove(cert._id)}
                          disabled={isActing}
                          className="gap-1.5 font-black cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isActing ? 'በማጽደቅ ላይ...' : 'ይሁንታ ስጥ (Approve)'}</span>
                        </Button>
                      </>
                    ) : isValid ? (
                      <>
                        <a
                          href={`/certificates/${cert.certificateNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1657b8] dark:text-blue-300 text-[11px] font-bold hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>ይፋዊ ሊንክ</span>
                        </a>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleDelete(cert._id)}
                          disabled={isActing}
                          className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer p-1"
                          title="ሰርዝ / ሰርቲፊኬት አንሳ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewCert && (
        <VerifiableCertificate certificate={previewCert} onClose={() => setPreviewCert(null)} />
      )}

      {/* Manual Issue Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-600 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  አዲስ የምስክር ወረቀት አዘጋጅ
                </h3>
              </div>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualIssueSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ተማሪ ይምረጡ *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
                  required
                >
                  <option value="">-- ተማሪ ይምረጡ --</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.firstName} {s.lastName} ({s.studentId || 'ID የለውም'}) - {s.registrationType === 'distance' ? 'የርቀት' : 'መደበኛ'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የማዕረግ ደረጃ (Honors)
                </label>
                <select
                  value={customHonors}
                  onChange={(e) => setCustomHonors(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
                >
                  <option value="በከፍተኛ ማዕረግ ተመርቋል (With High Distinction)">በከፍተኛ ማዕረግ ተመርቋል (With High Distinction)</option>
                  <option value="በማዕረግ ተመርቋል (With Distinction)">በማዕረግ ተመርቋል (With Distinction)</option>
                  <option value="ተመርቋል (Graduate)">ተመርቋል (Graduate)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የዝግጅት ሁኔታ (Status)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIssueStatus('Valid')}
                    className={`p-3 rounded-xl border font-bold text-center cursor-pointer transition-all ${
                      issueStatus === 'Valid'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-400/40'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    ✓ ወዲያውኑ ይሁንታ ስጥ (Valid)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIssueStatus('Pending')}
                    className={`p-3 rounded-xl border font-bold text-center cursor-pointer transition-all ${
                      issueStatus === 'Pending'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-300 ring-2 ring-amber-400/40'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    ⏳ እንደ ረቂቅ አስቀምጥ (Pending)
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsIssueModalOpen(false)}
                >
                  ይቅር
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  disabled={submittingIssue}
                  className="gap-1.5 font-bold"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{submittingIssue ? 'በማዘጋጀት ላይ...' : 'ምስክር ወረቀቱን አዘጋጅ'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesManagement;
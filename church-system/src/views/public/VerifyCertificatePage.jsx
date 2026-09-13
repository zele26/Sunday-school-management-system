// src/pages/public/VerifyCertificatePage.jsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../api/apiClient';
import ChurchLogo from '../../assets/ChurchLogo.png';
import { Award, Search, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { BackButton } from '../../components/ui';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { LanguageToggle } from '../../components/ui/LanguageToggle';
import { useLanguage } from '../../hooks/useLanguage';

const VerifyCertificatePage = () => {
  const { t, isAmharic } = useLanguage();
  const { certNumber } = useParams();
  const [inputNumber, setInputNumber] = useState(certNumber || '');
  const [loading, setLoading] = useState(false);
  const [certData, setCertData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (certNumber) {
      verifyCert(certNumber);
    }
  }, [certNumber]);

  const verifyCert = async (num) => {
    if (!num) return;
    setLoading(true);
    setError('');
    setCertData(null);

    try {
      const res = await apiFetch(`/api/public/certificates/verify/${num.trim().toUpperCase()}`);
      const data = await res.json();
      if (res.ok && data.isValid) {
        setCertData(data.certificate);
      } else {
        setError(data.message || t('certNotFound', 'ይህ የምስክር ወረቀት በስርዓቱ ውስጥ አልተገኘም'));
      }
    } catch (err) {
      setError(t('serverErrorUnavailable', 'የማረጋገጫ አገልግሎት አሁን አልተሳካም። እባክዎ ጥቂት ቆይተው እንደገና ይሞክሩ።'));
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (inputNumber.trim()) {
      verifyCert(inputNumber);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Header */}
      <header className="py-4 px-4 sm:px-8 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between max-w-7xl mx-auto w-full">
        <BackButton href="/" label={t('backToHome', 'ወደ ዋናው ገጽ')} variant="glass" />

        <div className="flex items-center gap-3">
          <LanguageToggle className="bg-white/80 dark:bg-slate-800 text-xs shadow-xs" />
          <ThemeToggle className="bg-white/80 dark:bg-slate-800 text-xs shadow-xs" />
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full p-1 border border-amber-400 bg-white shadow-xs overflow-hidden flex items-center justify-center">
              <Image src={ChurchLogo} alt="Logo" width={40} height={40} className="w-full h-full object-contain" style={{ width: 'auto', height: 'auto' }} />
            </div>
            <div className="text-left hidden sm:block">
              <h1 className="text-sm font-black text-[#1657b8] dark:text-amber-400">
                {t('sundaySchoolShortTitle', 'ተክለ ሳዊሮስ')} {t('sundaySchoolLabel', 'ሰንበት ት/ቤት')}
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                {t('certVerificationTitle', 'የምስክር ወረቀት ማረጋገጫ')}
              </p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Verification Card */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/60 text-[#1657b8] dark:text-blue-400 rounded-2xl mx-auto flex items-center justify-center border border-blue-100 dark:border-blue-900 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
              {t('certVerificationTitle', 'የምስክር ወረቀት ትክክለኛነት ማረጋገጫ')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('certVerificationDesc', 'የምስክር ወረቀት መለያ ቁጥሩን በማስገባት ወይም የQR ኮዱን በመቃኘት ትክክለኛነቱን ያረጋግጡ።')}
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleManualSearch} className="flex gap-2">
            <input
              type="text"
              placeholder={t('certNumberPlaceholder', 'ምሳሌ፡ TKD-CERT-2017-B1-4028')}
              value={inputNumber}
              onChange={(e) => setInputNumber(e.target.value)}
              className="flex-1 p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-mono text-slate-900 dark:text-white uppercase outline-none focus:border-[#1657b8] focus:bg-white dark:focus:bg-slate-800 transition-all"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-[#1e3a8a] hover:bg-[#163177] active:opacity-90 text-white rounded-2xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs min-h-[44px]"
            >
              {loading ? (isAmharic ? 'በማረጋገጥ ላይ...' : 'Verifying...') : t('verifyCertBtn', 'ያረጋግጡ')}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-center text-xs text-rose-700 dark:text-rose-300 space-y-1">
              <span className="text-lg">⚠️</span>
              <p className="font-bold">{error}</p>
            </div>
          )}

          {/* Verification Results */}
          {certData && (
            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 border-2 border-emerald-500/40 rounded-3xl space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('certVerifiedBadge', 'ይፋዊና ትክክለኛ የምስክር ወረቀት')}</span>
              </div>

              <div className="space-y-3 pt-2 text-xs divide-y divide-slate-200 dark:divide-slate-700">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 dark:text-slate-400">{isAmharic ? 'የተማሪው ሙሉ ስም:' : 'Student Name:'}</span>
                  <span className="font-black text-slate-900 dark:text-white">{certData.studentNameAmharic || certData.studentName}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 dark:text-slate-400">{isAmharic ? 'የተማሪ መለያ ቁጥር:' : 'Student ID:'}</span>
                  <span className="font-mono font-bold text-[#1657b8] dark:text-blue-400">{certData.studentNumber}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 dark:text-slate-400">{isAmharic ? 'የትምህርት መርሃ ግብር:' : 'Program:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{certData.program}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 dark:text-slate-400">{isAmharic ? 'የትምህርት ደረጃ (ምድብ):' : 'Batch / Level:'}</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">{certData.batch}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 dark:text-slate-400">{isAmharic ? 'የትምህርት ዘመን:' : 'Academic Year:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{certData.academicYear}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 dark:text-slate-400">{isAmharic ? 'የተሰጠበት ቀን:' : 'Date of Issue:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{certData.issueDateEthiopian} (ዓ.ም)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 dark:text-slate-400">{isAmharic ? 'ማዕረግ:' : 'Distinction / Honors:'}</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{certData.honors}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 dark:text-slate-400">{isAmharic ? 'ሰጪው ተቋም:' : 'Issuing Institution:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{certData.institution}</span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  {isAmharic ? 'ማረጋገጫ ቁጥር: ' : 'Certificate Reference: '}{certData.certificateNumber}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        © 2026 {t('sundaySchoolShortTitle', 'ተክለ ሳዊሮስ')} {t('sundaySchoolLabel', 'ሰንበት ትምህርት ቤት')}
      </footer>
    </div>
  );
};

export default VerifyCertificatePage;

// src/pages/public/VerifyCertificatePage.jsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../api/apiClient';
import ChurchLogo from '../../assets/ChurchLogo.png';
import { Award, Search, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { BackButton } from '../../components/ui';

const VerifyCertificatePage = () => {
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
        setError(data.message || 'ይህ የምስክር ወረቀት በስርዓቱ ውስጥ አልተገኘም (Certificate not found)');
      }
    } catch (err) {
      setError('የማረጋገጫ አገልግሎት አሁን አልተሳካም። እባክዎ ጥቂት ቆይተው እንደገና ይሞክሩ።');
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
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Header */}
      <header className="py-4 px-4 sm:px-8 border-b border-slate-200/80 bg-white dark:bg-slate-900 flex items-center justify-between max-w-7xl mx-auto w-full">
        <BackButton href="/" label="ወደ ዋናው ገጽ" subLabel="Back to Home" variant="glass" />

        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 rounded-full p-1 border border-amber-400 bg-white shadow-xs">
            <img src={ChurchLogo?.src || ChurchLogo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="text-left hidden sm:block">
            <h1 className="text-sm font-black text-[#1657b8] dark:text-amber-400">ተክለ ሳዊሮስ ሰንበት ት/ቤት</h1>
            <p className="text-[10px] text-slate-500 font-bold">የምስክር ወረቀት ማረጋገጫ</p>
          </div>
        </Link>
      </header>

      {/* Main Verification Card */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-xl w-full bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-50 text-[#1657b8] rounded-2xl mx-auto flex items-center justify-center border border-blue-100 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg md:text-xl font-black text-slate-900">የምስክር ወረቀት ትክክለኛነት ማረጋገጫ</h2>
            <p className="text-xs text-slate-500">
              የምስክር ወረቀት መለያ ቁጥሩን በማስገባት ወይም የQR ኮዱን በመቃኘት ትክክለኛነቱን ያረጋግጡ።
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleManualSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. TKD-CERT-2017-B1-4028"
              value={inputNumber}
              onChange={(e) => setInputNumber(e.target.value)}
              className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-900 uppercase outline-none focus:border-[#1657b8] focus:bg-white transition-all"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-[#1657b8] hover:bg-[#124796] active:opacity-90 text-white rounded-2xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {loading ? 'በማረጋገጥ ላይ...' : 'አረጋግጥ (Verify)'}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center text-xs text-rose-700 space-y-1">
              <span className="text-lg">⚠️</span>
              <p className="font-bold">{error}</p>
            </div>
          )}

          {/* Verification Results */}
          {certData && (
            <div className="p-6 bg-slate-50 border-2 border-emerald-500/40 rounded-3xl space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>ይፋዊና ትክክለኛ የምስክር ወረቀት (Authentic & Valid Certificate)</span>
              </div>

              <div className="space-y-3 pt-2 text-xs divide-y divide-slate-200">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">የተማሪው ስም (Student Name):</span>
                  <span className="font-black text-slate-900">{certData.studentNameAmharic || certData.studentName}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">የተማሪ መለያ (Student ID):</span>
                  <span className="font-mono font-bold text-[#1657b8]">{certData.studentNumber}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">የትምህርት መርሃ ግብር (Program):</span>
                  <span className="font-bold text-slate-800 text-right">{certData.program}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">ደረጃ (Batch):</span>
                  <span className="font-bold text-amber-700">{certData.batch}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">የትምህርት ዘመን (Academic Year):</span>
                  <span className="font-bold text-slate-800">{certData.academicYear}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">የተሰጠበት ቀን (Issue Date):</span>
                  <span className="font-bold text-slate-800">{certData.issueDateEthiopian} (ዓ.ም)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">ማዕረግ (Honors):</span>
                  <span className="font-bold text-emerald-700">{certData.honors}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">ሰጪው ተቋም (Institution):</span>
                  <span className="font-bold text-slate-800">{certData.institution}</span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <span className="text-[10px] font-mono text-slate-400">
                  ማረጋገጫ ቁጥር: {certData.certificateNumber}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        © {new Date().getFullYear()} ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት • Teklesawiros Distance LMS
      </footer>
    </div>
  );
};

export default VerifyCertificatePage;

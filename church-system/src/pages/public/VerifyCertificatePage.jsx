// src/pages/public/VerifyCertificatePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../../api/apiClient';
import ChurchLogo from '../../assets/ChurchLogo.png';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Header */}
      <header className="py-6 px-4 text-center border-b border-amber-500/20 bg-gradient-to-b from-[#051533] to-slate-950">
        <Link to="/" className="inline-flex items-center gap-3">
          <img src={ChurchLogo} alt="Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(255,204,0,0.5)]" />
          <div className="text-left">
            <h1 className="text-sm md:text-base font-extrabold text-amber-400">ተክለ ሳዊሮስ ሰንበት ት/ቤት</h1>
            <p className="text-[11px] text-slate-300">የምስክር ወረቀት ማረጋገጫ (Certificate Verification Portal)</p>
          </div>
        </Link>
      </header>

      {/* Main Verification Card */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <span className="text-3xl">🔍</span>
            <h2 className="text-lg md:text-xl font-extrabold text-white">የምስክር ወረቀት ትክክለኛነት ማረጋገጫ</h2>
            <p className="text-xs text-slate-400">
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
              className="flex-1 p-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs font-mono text-white uppercase outline-none focus:border-amber-400"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 rounded-2xl text-xs font-extrabold hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? 'በማረጋገጥ ላይ...' : 'አረጋግጥ (Verify)'}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-2xl text-center text-xs text-rose-300 space-y-1">
              <span className="text-lg">⚠️</span>
              <p className="font-bold">{error}</p>
            </div>
          )}

          {/* Verification Results */}
          {certData && (
            <div className="p-6 bg-gradient-to-b from-[#08214d]/60 to-[#051533]/80 border-2 border-emerald-500/50 rounded-3xl space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm">✓</span>
                <span>ይፋዊና ትክክለኛ የምስክር ወረቀት (Authentic & Valid Certificate)</span>
              </div>

              <div className="space-y-3 pt-2 text-xs divide-y divide-slate-800">
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">የተማሪው ስም (Student Name):</span>
                  <span className="font-bold text-white">{certData.studentNameAmharic || certData.studentName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">የተማሪ መለያ (Student ID):</span>
                  <span className="font-mono font-bold text-amber-300">{certData.studentNumber}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">የትምህርት መርሃ ግብር (Program):</span>
                  <span className="font-bold text-slate-200 text-right">{certData.program}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">ደረጃ (Batch):</span>
                  <span className="font-bold text-amber-400">{certData.batch}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">የትምህርት ዘመን (Academic Year):</span>
                  <span className="font-bold text-slate-200">{certData.academicYear}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">የተሰጠበት ቀን (Issue Date):</span>
                  <span className="font-bold text-slate-200">{certData.issueDateEthiopian} (ዓ.ም)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">ማዕረግ (Honors):</span>
                  <span className="font-bold text-emerald-300">{certData.honors}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">ሰጪው ተቋም (Institution):</span>
                  <span className="font-bold text-slate-300">{certData.institution}</span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <span className="text-[10px] font-mono text-slate-500">
                  ማረጋገጫ ቁጥር: {certData.certificateNumber}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-900">
        © {new Date().getFullYear()} ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት • Teklesawiros Distance LMS
      </footer>
    </div>
  );
};

export default VerifyCertificatePage;

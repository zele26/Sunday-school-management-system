// src/pages/public/DirectCertificateView.jsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../api/apiClient';
import VerifiableCertificate from '../../components/VerifiableCertificate';

const DirectCertificateView = () => {
  const { certNumber } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCert = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/education/distance/public/certificate/${certNumber || 'TKD-CERT-2017-B1-0001'}`);
        const data = await res.json();
        if (res.ok && data.certificate) {
          setCert(data.certificate);
        } else {
          setError(data.message || 'Certificate not found');
        }
      } catch (err) {
        setError('Failed to load certificate');
      } finally {
        setLoading(false);
      }
    };

    fetchCert();
  }, [certNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-amber-300 font-bold text-sm">የምስክር ወረቀቱን በመጫን ላይ... (Loading Certificate)</p>
        </div>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white p-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center max-w-md space-y-4 shadow-2xl">
          <span className="text-4xl">⚠️</span>
          <h2 className="text-lg font-bold text-rose-400">የምስክር ወረቀት አልተገኘም</h2>
          <p className="text-xs text-slate-300">የተጠየቀው የምስክር ወረቀት በስርዓቱ ውስጥ አልተገኘም ወይም ተሰርዟል።</p>
          <Link href="/" className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold text-white transition-colors">
            ወደ ዋና ገጽ (Home)
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-4 sm:py-8 px-2 sm:px-4 flex items-center justify-center">
      <VerifiableCertificate certificate={cert} />
    </div>
  );
};

export default DirectCertificateView;

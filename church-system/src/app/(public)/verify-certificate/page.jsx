'use client';

import React, { Suspense } from 'react';
import VerifyCertificatePage from '../../../views/public/VerifyCertificatePage';

export default function CertificateVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyCertificatePage />
    </Suspense>
  );
}

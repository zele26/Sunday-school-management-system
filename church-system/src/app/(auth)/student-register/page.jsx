'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentRegisterRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/register-regular');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#1657b8] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">ወደ ምዝገባ ገጽ በመቀየር ላይ...</p>
      </div>
    </div>
  );
}

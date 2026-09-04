'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../store/authStore';
import StudentLayout from '../../features/student/StudentLayout';

export default function DashboardRootLayout({ children }) {
  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isLoggedIn || !user) {
      router.replace('/login');
      return;
    }

    const role = user?.role?.toLowerCase() || '';
    if (['admin', 'superadmin', 'department_admin'].includes(role)) {
      router.replace('/admin');
      return;
    }
    if (role === 'teacher') {
      router.replace('/teacher');
      return;
    }

    setAuthorized(true);
  }, [hasHydrated, isLoggedIn, user, router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-page)] text-[var(--text-primary)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">ደህንነት እየተረጋገጠ ነው (Verifying access)...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return <StudentLayout onLogout={handleLogout}>{children}</StudentLayout>;
}

'use client';

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export const ProtectedRoute = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-page)] text-[var(--text-primary)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">ደህንነት እየተረጋገጠ ነው (Verifying access)...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export const RoleRoute = ({ allowedRoles }) => {
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-page)] text-[var(--text-primary)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">ደህንነት እየተረጋገጠ ነው (Verifying access)...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user) return <Navigate to="/login" replace />;

  const isSuperAdmin = user.role === 'superadmin';
  const isAdminRole = ['admin', 'superadmin', 'department_admin'].includes(user.role);

  // Super admin can access anything allowed for admins or teachers
  let hasAccess = allowedRoles.includes(user.role) || (isSuperAdmin && (allowedRoles.includes('admin') || allowedRoles.includes('teacher')));

  // If role check includes 'admin', allow any admin type
  if (allowedRoles.includes('admin') && isAdminRole) {
    hasAccess = true;
  }

  if (!hasAccess) {
    if (isAdminRole) return <Navigate to="/admin" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
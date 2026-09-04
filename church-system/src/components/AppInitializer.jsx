'use client';

import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { apiFetch } from '../api/apiClient';

export default function AppInitializer({ children }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = useAuthStore.getState().accessToken;
        if (!token) {
          setInitialized(true);
          return;
        }

        const res = await apiFetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          useAuthStore.getState().updateUser({
            id: data.user.id,
            fullName: data.user.fullName,
            email: data.user.email,
            role: data.user.role,
            departmentId: data.user.departmentId,
            assignedDepartments: data.user.assignedDepartments,
            mustChangePassword: data.user.mustChangePassword,
          });
        } else {
          useAuthStore.getState().logout();
        }
      } catch (err) {
        console.warn('Could not verify session token:', err);
      } finally {
        setInitialized(true);
      }
    };

    verifyUser();
  }, []);

  return <>{children}</>;
}

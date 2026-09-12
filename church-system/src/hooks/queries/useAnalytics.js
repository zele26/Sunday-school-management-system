'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

export const ANALYTICS_QUERY_KEYS = {
  student: ['analytics', 'student'],
  teacher: ['analytics', 'teacher'],
  admin: ['analytics', 'admin'],
};

export function useStudentAnalytics(studentId = null) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEYS.student, studentId],
    queryFn: async () => {
      const url = studentId ? `/api/analytics/student/me?studentId=${studentId}` : '/api/analytics/student/me';
      const res = await apiFetch(url);
      const data = await res.json().catch(() => ({ success: false, message: 'የአገልጋይ (API) መልስ ትክክለኛ የ-JSON መረጃ አይደለም' }));
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'የተማሪ አናሊቲክስ መረጃ ማምጣት አልተቻለም');
      }
      return data;
    },
  });
}

export function useTeacherAnalytics() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.teacher,
    queryFn: async () => {
      const res = await apiFetch('/api/analytics/teacher/courses');
      const data = await res.json().catch(() => ({ success: false, message: 'የአገልጋይ (API) መልስ ትክክለኛ የ-JSON መረጃ አይደለም' }));
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'የመምህር አናሊቲክስ መረጃ ማምጣት አልተቻለም');
      }
      return data;
    },
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.admin,
    queryFn: async () => {
      const res = await apiFetch('/api/analytics/admin/overview');
      const data = await res.json().catch(() => ({ success: false, message: 'የአገልጋይ (API) መልስ ትክክለኛ የ-JSON መረጃ አይደለም' }));
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'የአስተዳደር አናሊቲክስ መረጃ ማምጣት አልተቻለም');
      }
      return data;
    },
  });
}

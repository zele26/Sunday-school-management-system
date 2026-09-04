'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

export const ATTENDANCE_REPORT_QUERY_KEY = ['attendance-report'];

export function useAttendanceReport(filters = {}, enabled = true) {
  return useQuery({
    queryKey: [...ATTENDANCE_REPORT_QUERY_KEY, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val && String(val).trim() !== '') {
          params.append(key, String(val).trim());
        }
      });

      const res = await apiFetch(`/api/admin/attendance/report?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'የመገኘት መረጃን ማምጣት አልተቻለም');
      }
      const data = await res.json().catch(() => []);
      return Array.isArray(data) ? data : data.records || data.attendance || data.data || [];
    },
    enabled,
  });
}

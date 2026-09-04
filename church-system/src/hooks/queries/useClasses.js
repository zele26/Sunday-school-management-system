'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

export const CLASSES_QUERY_KEY = ['classes'];

export function useClasses() {
  return useQuery({
    queryKey: CLASSES_QUERY_KEY,
    queryFn: async () => {
      const res = await apiFetch('/api/admin/classes');
      if (!res.ok) throw new Error('Failed to fetch classes');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

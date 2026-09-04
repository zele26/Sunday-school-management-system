'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

export function useMyStudents() {
  return useQuery({
    queryKey: ['teacher', 'my-students'],
    queryFn: async () => {
      const res = await apiFetch('/api/teacher/my-students');
      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useMyCourses() {
  return useQuery({
    queryKey: ['teacher', 'my-courses'],
    queryFn: async () => {
      const res = await apiFetch('/api/teacher/my-courses');
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

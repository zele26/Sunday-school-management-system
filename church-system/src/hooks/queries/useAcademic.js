'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

export const ACADEMIC_YEARS_QUERY_KEY = ['academic-years'];
export const PROGRAMS_QUERY_KEY = ['programs'];
export const ENROLLMENTS_QUERY_KEY = ['academic-enrollments'];

export function useAcademicYears() {
  return useQuery({
    queryKey: ACADEMIC_YEARS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiFetch('/api/education/academic-years');
      if (!res.ok) throw new Error('Failed to fetch academic years');
      const data = await res.json();
      return data.years || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function usePrograms() {
  return useQuery({
    queryKey: PROGRAMS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiFetch('/api/education/programs');
      if (!res.ok) throw new Error('Failed to fetch programs');
      const data = await res.json();
      return data.programs || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useAcademicEnrollments() {
  return useQuery({
    queryKey: ENROLLMENTS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiFetch('/api/education/academic-enrollments');
      if (!res.ok) throw new Error('Failed to fetch enrollments');
      const data = await res.json();
      return data.enrollments || [];
    },
  });
}

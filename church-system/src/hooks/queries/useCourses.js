'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { toast } from '../../utils/toast';

export const COURSES_QUERY_KEY = ['courses'];

/**
 * Fetch lookup list of courses (dropdowns/assignments)
 */
export function useCourses() {
  return useQuery({
    queryKey: COURSES_QUERY_KEY,
    queryFn: async () => {
      const res = await apiFetch('/api/admin/courses');
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      return Array.isArray(data) ? data : data.courses || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch filtered courses for management
 */
export function useCoursesAdmin(params = {}) {
  return useQuery({
    queryKey: [...COURSES_QUERY_KEY, 'admin', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.status) searchParams.append('status', params.status);
      if (params.studentType) searchParams.append('studentType', params.studentType);

      const res = await apiFetch(`/api/admin/courses?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      return Array.isArray(data) ? data : data.courses || [];
    },
  });
}

/**
 * Create course
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await apiFetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to create course');
      return data;
    },
    onSuccess: () => {
      toast.success('አዲስ ኮርስ ተፈጥሯል!');
      queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err.message || 'ስህተት ተከስቷል');
    },
  });
}

/**
 * Update course
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await apiFetch(`/api/admin/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to update course');
      return data;
    },
    onSuccess: () => {
      toast.success('ኮርሱ ተሻሽሏል!');
      queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err.message || 'ስህተት ተከስቷል');
    },
  });
}

/**
 * Delete course
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await apiFetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete course');
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      toast.info('ኮርሱ ተሰርዟል');
      queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
    },
    onError: () => {
      toast.error('መሰረዝ አልተቻለም');
    },
  });
}

'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { toast } from '../../utils/toast';

export const TEACHERS_QUERY_KEY = ['teachers'];

/**
 * Fetch lookup list of all teachers (for dropdowns/modals)
 */
export function useTeachers() {
  return useQuery({
    queryKey: TEACHERS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiFetch('/api/admin/teachers');
      if (!res.ok) throw new Error('Failed to fetch teachers');
      const data = await res.json();
      return data.teachers || data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch paginated, filtered teachers list for admin management
 */
export function useTeachersAdmin(params = {}) {
  return useQuery({
    queryKey: [...TEACHERS_QUERY_KEY, 'admin', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append('page', params.page);
      if (params.limit) searchParams.append('limit', params.limit);
      if (params.search) searchParams.append('search', params.search);
      if (params.status) searchParams.append('status', params.status);

      const res = await apiFetch(`/api/admin/teachers?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch teachers');
      return res.json();
    },
    placeholderData: keepPreviousData,
  });
}

/**
 * Delete a single teacher
 */
export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teacherId) => {
      const res = await apiFetch(`/api/admin/teachers/${teacherId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete teacher');
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      toast.success('መምህሩ በተሳካ ሁኔታ ተሰርዟል');
      queryClient.invalidateQueries({ queryKey: TEACHERS_QUERY_KEY });
    },
    onError: () => {
      toast.error('መምህሩን መሰረዝ አልተቻለም');
    },
  });
}

/**
 * Bulk delete teachers
 */
export function useBulkDeleteTeachers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teacherIds) => {
      for (const id of teacherIds) {
        const res = await apiFetch(`/api/admin/teachers/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`Failed to delete teacher ${id}`);
      }
      return { success: true };
    },
    onSuccess: () => {
      toast.success('የተመረጡት መምህራን ተሰርዘዋል');
      queryClient.invalidateQueries({ queryKey: TEACHERS_QUERY_KEY });
    },
    onError: () => {
      toast.error('ስህተት ተከስቷል');
    },
  });
}

/**
 * Toggle teacher status (active/inactive)
 */
export function useToggleTeacherStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ teacherId, isActive }) => {
      const res = await apiFetch(`/api/admin/teachers/${teacherId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      toast.success('የመምህሩ ሁኔታ ተቀይሯል');
      queryClient.invalidateQueries({ queryKey: TEACHERS_QUERY_KEY });
    },
    onError: () => {
      toast.error('ሁኔታውን መቀየር አልተቻለም');
    },
  });
}

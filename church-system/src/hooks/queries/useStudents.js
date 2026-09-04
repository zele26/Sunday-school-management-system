'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { toast } from '../../utils/toast';

export const STUDENTS_QUERY_KEY = ['students'];

/**
 * Fetch paginated, filtered list of students
 */
export function useStudents(params = {}) {
  return useQuery({
    queryKey: [...STUDENTS_QUERY_KEY, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append('page', params.page);
      if (params.limit) searchParams.append('limit', params.limit);
      if (params.search) searchParams.append('search', params.search);
      if (params.grade) searchParams.append('grade', params.grade);
      if (params.studentType) searchParams.append('studentType', params.studentType);

      const res = await apiFetch(`/api/admin/students?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch students');
      return res.json();
    },
    placeholderData: keepPreviousData,
  });
}

/**
 * Delete a student
 */
export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studentId) => {
      const res = await apiFetch(`/api/admin/students/${studentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete student');
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      toast.success('ተማሪው በተሳካ ሁኔታ ተሰርዟል');
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
    onError: () => {
      toast.error('ተማሪውን መሰረዝ አልተቻለም');
    },
  });
}

/**
 * Bulk delete students
 */
export function useBulkDeleteStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studentIds) => {
      for (const id of studentIds) {
        const res = await apiFetch(`/api/admin/students/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`Failed to delete student with ID ${id}`);
      }
      return { success: true };
    },
    onSuccess: () => {
      toast.success('የተመረጡት ተማሪዎች ተሰርዘዋል');
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
    onError: () => {
      toast.error('ስህተት ተከስቷል');
    },
  });
}

/**
 * Generate QR code for a single student
 */
export function useGenerateStudentQR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studentId) => {
      const res = await apiFetch('/api/admin/students/generate-qr', {
        method: 'POST',
        body: JSON.stringify({ studentId }),
      });
      if (!res.ok) throw new Error('Failed to generate QR');
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      toast.success('QR ኮድ ተዘጋጅቷል!');
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
    onError: () => {
      toast.error('QR ማመንጨት አልተቻለም');
    },
  });
}

/**
 * Generate QR codes for all students
 */
export function useGenerateAllQR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiFetch('/api/admin/students/generate-qr', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Failed to generate all QR codes');
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      toast.success('ለሁሉም ተማሪዎች QR ኮድ ተዘጋጅቷል!');
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
    onError: () => {
      toast.error('Network error');
    },
  });
}

/**
 * Assign teacher to student
 */
export function useAssignTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, teacherId }) => {
      const res = await apiFetch(`/api/admin/students/${studentId}/assign-teacher`, {
        method: 'PUT',
        body: JSON.stringify({ teacherId }),
      });
      if (!res.ok) throw new Error('Failed to assign teacher');
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      toast.success('መምህር በተሳካ ሁኔታ ተመድቧል!');
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
    onError: () => {
      toast.error('መምህር መመደብ አልተቻለም');
    },
  });
}

/**
 * Assign courses to student
 */
export function useAssignCourses() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, courseIds }) => {
      const res = await apiFetch(`/api/admin/students/${studentId}/assign-courses`, {
        method: 'PUT',
        body: JSON.stringify({ courseIds }),
      });
      if (!res.ok) throw new Error('Failed to assign courses');
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      toast.success('ኮርሶች በተሳካ ሁኔታ ተመድበዋል!');
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
    onError: () => {
      toast.error('Network error');
    },
  });
}

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { toast } from '../../utils/toast';
import { REGISTRATION_STATUS_KEY, ADMIN_REG_SETTINGS_KEY } from './useRegistrationStatus';

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
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await apiFetch('/api/education/academic-years', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'የትምህርት ዘመን መፍጠር አልተሳካም');
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'አዲስ የትምህርት ዘመን በተሳካ ሁኔታ ተፈጥሯል!');
      queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: REGISTRATION_STATUS_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REG_SETTINGS_KEY });
    },
    onError: (err) => {
      toast.error(err.message || 'የትምህርት ዘመን መፍጠር አልተሳካም');
    },
  });
}

export function useUpdateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const res = await apiFetch(`/api/education/academic-years/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'የትምህርት ዘመን ማሻሻል አልተሳካም');
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'የትምህርት ዘመን በተሳካ ሁኔታ ተሻሽሏል!');
      queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: REGISTRATION_STATUS_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REG_SETTINGS_KEY });
    },
    onError: (err) => {
      toast.error(err.message || 'የትምህርት ዘመን ማሻሻል አልተሳካም');
    },
  });
}

export function useSetActiveAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await apiFetch(`/api/education/academic-years/${id}/set-active`, {
        method: 'PATCH',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'የትምህርት ዘመን ንቁ ማድረግ አልተሳካም');
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'የትምህርት ዘመን ንቁ ሆኗል!');
      queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: REGISTRATION_STATUS_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REG_SETTINGS_KEY });
    },
    onError: (err) => {
      toast.error(err.message || 'የትምህርት ዘመን ንቁ ማድረግ አልተሳካም');
    },
  });
}

export function useDeleteAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await apiFetch(`/api/education/academic-years/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'የትምህርት ዘመን መሰረዝ አልተሳካም');
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'የትምህርት ዘመን ተሰርዟል');
      queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err.message || 'የትምህርት ዘመን መሰረዝ አልተሳካም');
    },
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

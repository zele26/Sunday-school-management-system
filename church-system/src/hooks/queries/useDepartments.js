'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { toast } from '../../utils/toast';

export const DEPARTMENTS_QUERY_KEY = ['departments'];
export const DEPARTMENT_MEMBERSHIPS_QUERY_KEY = ['department-memberships'];
export const PERSONS_QUERY_KEY = ['persons'];

export function useDepartments() {
  return useQuery({
    queryKey: DEPARTMENTS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiFetch('/api/core/departments');
      if (!res.ok) throw new Error('Failed to load departments');
      const data = await res.json();
      return data.departments || data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useDepartmentMemberships() {
  return useQuery({
    queryKey: DEPARTMENT_MEMBERSHIPS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiFetch('/api/core/department-memberships');
      if (!res.ok) throw new Error('Failed to load department memberships');
      const data = await res.json();
      return data.memberships || [];
    },
  });
}

export function usePersons(limit = 100) {
  return useQuery({
    queryKey: [...PERSONS_QUERY_KEY, limit],
    queryFn: async () => {
      const res = await apiFetch(`/api/core/persons?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to load persons');
      const data = await res.json();
      return data.persons || [];
    },
    staleTime: 1000 * 60 * 3,
  });
}

export function useAddDepartmentMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await apiFetch('/api/core/department-memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to add membership');
      return data;
    },
    onSuccess: () => {
      toast.success('የክፍል አባልነት በተሳካ ሁኔታ ተመዝግቧል!');
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_MEMBERSHIPS_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err.message || 'ስህተት ተከስቷል');
    },
  });
}

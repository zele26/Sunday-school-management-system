'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { toast } from '../../utils/toast';

export const REGISTRATIONS_QUERY_KEY = ['registrations'];

/**
 * Fetch pending registrations
 */
export function useRegistrations() {
  return useQuery({
    queryKey: REGISTRATIONS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiFetch('/api/admin/registrations');
      if (!res.ok) throw new Error('Failed to fetch registrations');
      const data = await res.json();
      return Array.isArray(data) ? data : data.registrations || [];
    },
  });
}

/**
 * Approve a registration
 */
export function useApproveRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await apiFetch(`/api/admin/registrations/${id}/approve`, { method: 'PUT' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'ማጽደቅ አልተሳካም');
      return data;
    },
    onSuccess: () => {
      toast.success('ምዝገባው ጸድቋል! የተማሪ አካውንት ተፈጥሯል።');
      queryClient.invalidateQueries({ queryKey: REGISTRATIONS_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err.message || 'ማጽደቅ አልተሳካም');
    },
  });
}

/**
 * Reject a registration
 */
export function useRejectRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }) => {
      const res = await apiFetch(`/api/admin/registrations/${id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'ውድቅ ማድረግ አልተሳካም');
      return data;
    },
    onSuccess: () => {
      toast.success('ምዝገባው ውድቅ ተደርጓል (Registration rejected)');
      queryClient.invalidateQueries({ queryKey: REGISTRATIONS_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err.message || 'ውድቅ ማድረግ አልተሳካም');
    },
  });
}

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { toast } from '../../utils/toast';

export const APPROVALS_QUERY_KEY = ['pending-approvals'];

export function useApprovals() {
  return useQuery({
    queryKey: APPROVALS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiFetch('/api/admin/pending-approvals');
      if (!res.ok) throw new Error('Failed to load pending approvals');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useApprovePendingUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      const res = await apiFetch(`/api/admin/users/${userId}/approve`, { method: 'PUT' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Action failed');
      return data;
    },
    onSuccess: () => {
      toast.success('ተጠቃሚው በስኬት ጸድቋል! (User approved successfully)');
      queryClient.invalidateQueries({ queryKey: APPROVALS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => {
      toast.error(err.message || 'ትእዛዙ አልተሳካም።');
    },
  });
}

export function useRejectPendingUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      const res = await apiFetch(`/api/admin/users/${userId}/reject`, { method: 'PUT' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Action failed');
      return data;
    },
    onSuccess: () => {
      toast.info('ተጠቃሚው ውድቅ ተደርጓል። (User rejected)');
      queryClient.invalidateQueries({ queryKey: APPROVALS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => {
      toast.error(err.message || 'ትእዛዙ አልተሳካም።');
    },
  });
}

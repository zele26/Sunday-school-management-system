'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { toast } from '../../utils/toast';

export const PASSWORD_RESETS_QUERY_KEY = ['password-resets'];

export function usePasswordResets() {
  return useQuery({
    queryKey: PASSWORD_RESETS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiFetch('/api/admin/password-resets');
      if (!res.ok) throw new Error('Failed to fetch password reset requests');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useApprovePasswordReset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reqId, tempPassword, adminNote }) => {
      const res = await apiFetch(`/api/admin/password-resets/${reqId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempPassword, adminNote }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'ማጽደቅ አልተቻለም');
      return data;
    },
    onSuccess: (data) => {
      toast.success(`የፓስዎርድ ጥያቄው ጸድቋል! የተዘጋጀው ጊዜያዊ ፓስዎርድ፡ ${data.tempPassword}`);
      queryClient.invalidateQueries({ queryKey: PASSWORD_RESETS_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err.message || 'የአውታረ መረብ ስህተት');
    },
  });
}

export function useRejectPasswordReset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reqId) => {
      const res = await apiFetch(`/api/admin/password-resets/${reqId}/reject`, {
        method: 'PUT',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'ውድቅ ማድረግ አልተቻለም');
      return data;
    },
    onSuccess: () => {
      toast.info('ጥያቄው ውድቅ ተደርጓል');
      queryClient.invalidateQueries({ queryKey: PASSWORD_RESETS_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err.message || 'የአውታረ መረብ ስህተት');
    },
  });
}

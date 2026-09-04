'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { toast } from '../../utils/toast';

export const RESOURCES_QUERY_KEY = ['resources'];

export function useAdminResources(filter = 'Pending') {
  return useQuery({
    queryKey: [...RESOURCES_QUERY_KEY, 'admin', filter],
    queryFn: async () => {
      const query = filter === 'All' ? '' : `?status=${filter}`;
      const res = await apiFetch(`/api/resources/admin/all${query}`);
      if (!res.ok) throw new Error('Failed to load resources');
      return res.json();
    },
  });
}

export function useApproveResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, rejectionReason }) => {
      const res = await apiFetch(`/api/resources/admin/approve/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejectionReason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Action failed');
      return data;
    },
    onSuccess: (_, variables) => {
      if (variables.action === 'approve') {
        toast.success('የመርጃ ሰነዱ ጸድቋል! (Resource approved)');
      } else {
        toast.info('የመርጃ ሰነዱ ውድቅ ተደርጓል');
      }
      queryClient.invalidateQueries({ queryKey: RESOURCES_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err.message || 'ስህተት ተከስቷል');
    },
  });
}

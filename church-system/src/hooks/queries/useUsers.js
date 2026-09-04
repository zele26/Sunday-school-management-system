'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { toast } from '../../utils/toast';

export const USERS_QUERY_KEY = ['users'];

/**
 * Fetch paginated, filtered list of users
 */
export function useUsers(params = {}) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append('page', params.page);
      if (params.limit) searchParams.append('limit', params.limit);
      if (params.search) searchParams.append('search', params.search);
      if (params.role) searchParams.append('role', params.role);
      if (params.status) searchParams.append('status', params.status);
      if (params.departmentId) searchParams.append('departmentId', params.departmentId);

      const res = await apiFetch(`/api/admin/users?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch member journey & lifetime progression
 */
export function useUserJourney(userId, enabled = true) {
  return useQuery({
    queryKey: ['user-journey', userId],
    queryFn: async () => {
      const res = await apiFetch(`/api/admin/users/${userId}/journey`);
      if (!res.ok) throw new Error('Failed to fetch user journey');
      return res.json();
    },
    enabled: !!userId && enabled,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Update user details/role
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, id, payload }) => {
      const targetId = userId || id;
      const res = await apiFetch(`/api/admin/users/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'ማደስ አልተሳካም');
      return data;
    },
    onSuccess: () => {
      toast.success('የአባሉ ሚና እና ዝርዝር መረጃ በተሳካ ሁኔታ ታድሷል!');
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err.message || 'የኔትወርክ ችግር አጋጥሟል');
    },
  });
}

/**
 * Approve single user
 */
export function useApproveUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      const res = await apiFetch(`/api/admin/users/${userId}/approve`, { method: 'PUT' });
      if (!res.ok) throw new Error('Failed to approve user');
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      toast.success('ተጠቃሚው ጸድቋል (User approved)');
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
    onError: () => {
      toast.error('ማጽደቅ አልተሳካም');
    },
  });
}

/**
 * Reject single user
 */
export function useRejectUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      const res = await apiFetch(`/api/admin/users/${userId}/reject`, { method: 'PUT' });
      if (!res.ok) throw new Error('Failed to reject user');
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      toast.success('ተጠቃሚው ውድቅ ተደርጓል (User rejected)');
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
    onError: () => {
      toast.error('ውድቅ ማድረግ አልተሳካም');
    },
  });
}

/**
 * Delete single user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      const res = await apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      toast.success('ተጠቃሚው ተሰርዟል (User deleted)');
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
    onError: () => {
      toast.error('መሰረዝ አልተሳካም');
    },
  });
}

/**
 * Bulk approve users
 */
export function useBulkApproveUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userIds) => {
      const res = await apiFetch('/api/admin/users/bulk-approve', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds }),
      });
      if (!res.ok) throw new Error('Failed to approve users');
      return res.json().catch(() => ({}));
    },
    onSuccess: (_, userIds) => {
      toast.success(`${userIds.length} ተጠቃሚዎች ጸድቀዋል (Approved)`);
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
    onError: () => {
      toast.error('ማጽደቅ አልተሳካም');
    },
  });
}

/**
 * Bulk reject users
 */
export function useBulkRejectUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userIds) => {
      const res = await apiFetch('/api/admin/users/bulk-reject', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds }),
      });
      if (!res.ok) throw new Error('Failed to reject users');
      return res.json().catch(() => ({}));
    },
    onSuccess: (_, userIds) => {
      toast.success(`${userIds.length} ተጠቃሚዎች ውድቅ ተደርገዋል (Rejected)`);
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
    onError: () => {
      toast.error('ውድቅ ማድረግ አልተሳካም');
    },
  });
}

/**
 * Bulk delete users
 */
export function useBulkDeleteUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userIds) => {
      const res = await apiFetch('/api/admin/users/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds }),
      });
      if (!res.ok) throw new Error('Failed to delete users');
      return res.json().catch(() => ({}));
    },
    onSuccess: (_, userIds) => {
      toast.success(`${userIds.length} ተጠቃሚዎች ተሰርዘዋል (Deleted)`);
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
    onError: () => {
      toast.error('መሰረዝ አልተሳካም');
    },
  });
}

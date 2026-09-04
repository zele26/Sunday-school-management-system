'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { toast } from '../../utils/toast';

export const PEOPLE_QUERY_KEY = ['people'];
export const STUDENT_PROFILES_QUERY_KEY = ['student-profiles'];
export const CHURCH_MEMBERSHIPS_QUERY_KEY = ['church-memberships'];

export function usePeople(params = {}) {
  return useQuery({
    queryKey: [...PEOPLE_QUERY_KEY, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append('page', params.page);
      if (params.limit) searchParams.append('limit', params.limit);
      if (params.search) searchParams.append('search', params.search);

      const res = await apiFetch(`/api/core/persons?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Failed to load persons');
      return res.json();
    },
    placeholderData: keepPreviousData,
  });
}

export function useStudentProfiles() {
  return useQuery({
    queryKey: STUDENT_PROFILES_QUERY_KEY,
    queryFn: async () => {
      const res = await apiFetch('/api/education/student-profiles');
      if (!res.ok) throw new Error('Failed to load student profiles');
      const data = await res.json();
      return data.profiles || [];
    },
  });
}

export function useStudentHistory(profileId, enabled = true) {
  return useQuery({
    queryKey: ['student-history', profileId],
    queryFn: async () => {
      const res = await apiFetch(`/api/education/students/${profileId}/history`);
      if (!res.ok) throw new Error('Failed to load history');
      const data = await res.json();
      return data.enrollments || [];
    },
    enabled: !!profileId && enabled,
  });
}

export function useProgressStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileId) => {
      const res = await apiFetch(`/api/education/students/${profileId}/progress`, {
        method: 'POST',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'ማሸጋገር አልተቻለም');
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'ተማሪው ወደ ቀጣዩ ደረጃ ተሸጋግሯል!');
      queryClient.invalidateQueries({ queryKey: STUDENT_PROFILES_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err.message || 'ስህተት ተከስቷል');
    },
  });
}

export function useChurchMemberships() {
  return useQuery({
    queryKey: CHURCH_MEMBERSHIPS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiFetch('/api/core/church-memberships');
      if (!res.ok) throw new Error('Failed to load church memberships');
      const data = await res.json();
      return data.memberships || [];
    },
  });
}

export function useAssignChurchMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ personId, memberId }) => {
      const res = await apiFetch('/api/core/church-memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId, memberId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'መመደብ አልተቻለም');
      return data;
    },
    onSuccess: () => {
      toast.success('የቤተክርስቲያን አባልነት መታወቂያ በተሳካ ሁኔታ ተመድቧል!');
      queryClient.invalidateQueries({ queryKey: CHURCH_MEMBERSHIPS_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err.message || 'ስህተት ተከስቷል');
    },
  });
}

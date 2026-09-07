'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { toast } from '../../utils/toast';

export const REGISTRATION_STATUS_KEY = ['registration-status'];
export const ADMIN_REG_SETTINGS_KEY = ['admin-registration-settings'];

/**
 * Public Hook: Fetch live registration open/closed status
 */
export function useRegistrationStatus() {
  return useQuery({
    queryKey: REGISTRATION_STATUS_KEY,
    queryFn: async () => {
      try {
        const res = await apiFetch('/api/registrations/status');
        if (!res.ok) {
          // Graceful fallback to default open state if offline or network issue
          return {
            isRegistrationOpen: true,
            isRegularOpen: true,
            isDistanceOpen: true,
            academicYear: '2017 ዓ.ም',
            regularClosedMessage: 'የመደበኛ ተማሪዎች ምዝገባ ለጊዜው ተዘግቷል።',
            distanceClosedMessage: 'የርቀት ተማሪዎች ምዝገባ ለጊዜው ተዘግቷል።',
            generalClosedMessage: 'የተማሪዎች ምዝገባ ለጊዜው ተዘግቷል።',
          };
        }
        const json = await res.json();
        return json.data || {
          isRegistrationOpen: true,
          isRegularOpen: true,
          isDistanceOpen: true,
          academicYear: '2017 ዓ.ም',
          regularClosedMessage: 'የመደበኛ ተማሪዎች ምዝገባ ለጊዜው ተዘግቷል።',
          distanceClosedMessage: 'የርቀት ተማሪዎች ምዝገባ ለጊዜው ተዘግቷል።',
          generalClosedMessage: 'የተማሪዎች ምዝገባ ለጊዜው ተዘግቷል።',
        };
      } catch (e) {
        return {
          isRegistrationOpen: true,
          isRegularOpen: true,
          isDistanceOpen: true,
          academicYear: '2017 ዓ.ም',
          regularClosedMessage: 'የመደበኛ ተማሪዎች ምዝገባ ለጊዜው ተዘግቷል።',
          distanceClosedMessage: 'የርቀት ተማሪዎች ምዝገባ ለጊዜው ተዘግቷል።',
          generalClosedMessage: 'የተማሪዎች ምዝገባ ለጊዜው ተዘግቷል።',
        };
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Admin Hook: Fetch complete registration intake configuration
 */
export function useAdminRegistrationSettings() {
  return useQuery({
    queryKey: ADMIN_REG_SETTINGS_KEY,
    queryFn: async () => {
      const res = await apiFetch('/api/admin/registrations/settings');
      if (!res.ok) throw new Error('Failed to fetch registration settings');
      const data = await res.json();
      return data.settings || {};
    },
  });
}

/**
 * Admin Hook: Update registration intake status & custom messages
 */
export function useUpdateRegistrationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await apiFetch('/api/admin/registrations/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'ቅንብሮችን ማስተካከል አልተሳካም');
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'የምዝገባ ቅንብሮች በተሳካ ሁኔታ ተስተካክለዋል!');
      queryClient.invalidateQueries({ queryKey: ADMIN_REG_SETTINGS_KEY });
      queryClient.invalidateQueries({ queryKey: REGISTRATION_STATUS_KEY });
    },
    onError: (err) => {
      toast.error(err.message || 'ቅንብሮችን ማስተካከል አልተሳካም');
    },
  });
}

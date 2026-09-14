'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { toast } from '../../utils/toast';

export const REGISTRATION_STATUS_KEY = ['registration-status'];
export const ADMIN_REG_SETTINGS_KEY = ['admin-registration-settings'];

const LOCAL_STORAGE_KEY = 'app_reg_status';

/**
 * Helper to synchronously read cached status from localStorage for 0ms initial render
 */
const getCachedStatus = () => {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (err) {
    // ignore parsing errors
  }
  return undefined;
};

/**
 * Public Hook: Fetch live registration open/closed status with 0ms instant initial rendering
 */
export function useRegistrationStatus() {
  return useQuery({
    queryKey: REGISTRATION_STATUS_KEY,
    queryFn: async () => {
      try {
        const res = await apiFetch('/api/registrations/status');
        if (!res.ok) {
          const cached = getCachedStatus();
          if (cached) return cached;
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
        const data = json.data;
        if (data && typeof window !== 'undefined') {
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
          } catch (e) {
            // ignore localStorage quota errors
          }
        }
        return data;
      } catch (e) {
        const cached = getCachedStatus();
        if (cached) return cached;
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
    staleTime: 1000 * 30, // 30 seconds
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

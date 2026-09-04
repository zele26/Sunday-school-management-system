'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

export function useMyEnrolledCourses() {
  return useQuery({
    queryKey: ['student', 'my-courses'],
    queryFn: async () => {
      const res = await apiFetch('/api/student/my-courses');
      if (!res.ok) throw new Error('Failed to fetch enrolled courses');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useMyStudentAttendance() {
  return useQuery({
    queryKey: ['student', 'my-attendance'],
    queryFn: async () => {
      const res = await apiFetch('/api/student/my-attendance');
      if (!res.ok) throw new Error('Failed to fetch attendance');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useMyStudentExams() {
  return useQuery({
    queryKey: ['student', 'my-exams'],
    queryFn: async () => {
      const res = await apiFetch('/api/student/my-exams');
      if (!res.ok) throw new Error('Failed to fetch exams');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useMyStudentResults() {
  return useQuery({
    queryKey: ['student', 'my-results'],
    queryFn: async () => {
      const res = await apiFetch('/api/student/my-results');
      if (!res.ok) throw new Error('Failed to fetch results');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

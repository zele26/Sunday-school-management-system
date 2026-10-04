// src/api/apiClient.jsx
'use client';

import useAuthStore from '../store/authStore';

// ------------------------------------------------------------------
// 1) Determine the base URL for API calls
//    - In Next.js with rewrites configured in next.config.mjs, an empty string
//      routes directly to the same origin and proxies seamlessly to the backend.
// ------------------------------------------------------------------
export function getApiBaseUrl() {
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

  // 1. If explicit valid remote URL is provided in env, use it directly
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;

    // 2. If running on Vercel or any cloud hosting (*.vercel.app or custom cloud domain)
    if (
      hostname.endsWith('.vercel.app') ||
      hostname.includes('onrender.com') ||
      (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.') && !hostname.startsWith('10.'))
    ) {
      if (envUrl && !envUrl.includes('localhost')) {
        return envUrl;
      }
      return 'https://church-api-3l2c.onrender.com';
    }

    // 3. If running on local Wi-Fi / LAN IP (e.g. 192.168.x.x or 10.x.x.x)
    if (hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.endsWith('.local')) {
      return `http://${hostname}:5000`;
    }

    // 4. Default localhost in browser
    return 'http://localhost:5000';
  }

  return envUrl || 'http://localhost:5000';
}

export const API_BASE_URL = (() => {
  return getApiBaseUrl();
})();

// In-memory cache for ultra-fast GET responses with TTL
const responseCache = new Map();
const CACHE_TTL_MS = 20000; // 20 seconds cache TTL for instant tab switching

export function clearApiCache(pattern = null) {
  if (!pattern) {
    responseCache.clear();
    return;
  }
  for (const key of responseCache.keys()) {
    if (key.includes(pattern)) {
      responseCache.delete(key);
    }
  }
}

// ------------------------------------------------------------------
// 2) Main fetch wrapper
//    - Automatically adds Authorization header with stored token
//    - High-speed in-memory caching for GET requests
//    - Handles token expiration (401) by attempting refresh
//    - Supports both JSON and FormData (file uploads)
// ------------------------------------------------------------------
export async function apiFetch(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const token = useAuthStore.getState().accessToken || (typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null);

  // If this is a mutation (POST, PUT, DELETE, PATCH), invalidate related cache
  if (method !== 'GET') {
    clearApiCache();
  }

  // Check cache for GET requests
  const cacheKey = `${url}:${token || 'anon'}`;
  const now = Date.now();
  if (method === 'GET' && !options.skipCache) {
    const cached = responseCache.get(cacheKey);
    if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
      return cached.response.clone();
    }
  }

  // Start with headers from the caller (if any)
  const headers = { ...options.headers };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type to application/json if body is NOT FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const baseUrl = getApiBaseUrl();
  const endpoint = url.startsWith('http') ? url : `${baseUrl}${url}`;

  // Make the actual fetch request
  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  // If response is successful GET, cache a clone of it
  if (res.ok && method === 'GET' && !options.skipCache) {
    responseCache.set(cacheKey, {
      timestamp: Date.now(),
      response: res.clone(),
    });
  }

  // If the response is 401 Unauthorized and we had a token, try refresh
  if (res.status === 401 && token) {
    try {
      const refreshEndpoint = `${baseUrl}/api/auth/refresh`;
      const refreshRes = await fetch(refreshEndpoint, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json().catch(() => ({}));
        const newToken = refreshData.accessToken;
        if (newToken) {
          const { setAccessToken } = useAuthStore.getState();
          if (typeof setAccessToken === 'function') setAccessToken(newToken);

          const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
          const retryRes = await fetch(endpoint, {
            ...options,
            headers: retryHeaders,
          });
          return retryRes;
        }
      }
    } catch (err) {
      console.error('Refresh token request failed', err);
    }

    // If refresh failed, clear auth and redirect
    useAuthStore.getState().logout();
    clearApiCache();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Session expired – please log in again');
  }

  return res;
}
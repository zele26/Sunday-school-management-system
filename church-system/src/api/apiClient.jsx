// src/api/apiClient.jsx
import useAuthStore from '../store/authStore';

// ------------------------------------------------------------------
// 1) Determine the base URL for API calls
//    - In Docker (nginx proxy): use an empty string → requests go to the same origin.
//    - In Vercel / local dev: you can set VITE_API_URL to your Render backend.
//    - Fallback: if running on localhost, use localhost:5000, else use Render.
// ------------------------------------------------------------------
export const API_BASE_URL = (() => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Otherwise, detect environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }

  // Default for production (Render)
  return 'https://church-api-3l2c.onrender.com';
})();

// ------------------------------------------------------------------
// 2) Main fetch wrapper
//    - Automatically adds Authorization header with the stored token
//    - Handles token expiration (401) by logging out
//    - Supports both JSON and FormData (file uploads)
// ------------------------------------------------------------------
export async function apiFetch(url, options = {}) {
  // Get the current access token from the auth store
  const token = useAuthStore.getState().accessToken;

  // Start with headers from the caller (if any)
  const headers = { ...options.headers };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // ✅ IMPORTANT: Only set Content-Type to application/json if the body is NOT FormData
  // FormData requires a multipart/form-data header with a boundary,
  // which the browser sets automatically when we omit Content-Type.
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Make the actual fetch request
  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // If the response is 401 Unauthorized and we had a token, it's expired
  if (res.status === 401) {
    // If we had a token, try a refresh flow before forcing logout
    if (token) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json().catch(() => ({}));
          const newToken = refreshData.accessToken;
          if (newToken) {
            // Update the in-memory store and retry the original request
            const { setAccessToken } = useAuthStore.getState();
            if (typeof setAccessToken === 'function') setAccessToken(newToken);

            // Rebuild headers with the new token
            const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
            const retryRes = await fetch(`${API_BASE_URL}${url}`, {
              ...options,
              headers: retryHeaders,
            });
            return retryRes;
          }
        }
      } catch (err) {
        console.error('Refresh token request failed', err);
      }

      // If refresh did not succeed, clear auth and redirect
      useAuthStore.getState().logout();
      window.location.href = '/login';
      throw new Error('Session expired – please log in again');
    }

    return res;
  }

  return res;
}
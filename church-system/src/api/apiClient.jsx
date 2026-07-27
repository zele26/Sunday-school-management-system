import useAuthStore from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : 'https://church-api-3l2c.onrender.com');

export async function apiFetch(url, options = {}) {
  const token = useAuthStore.getState().accessToken;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // If the token is expired, force logout
  if (res.status === 401 && token) {
    useAuthStore.getState().logout();
    window.location.href = '/login';
    throw new Error('Session expired – please log in again');
  }

  return res;
}

export { API_BASE_URL };
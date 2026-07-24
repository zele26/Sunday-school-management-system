import useAuthStore from '../store/authStore';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';   // back to full URL

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
  if (res.status === 401) {
    useAuthStore.getState().logout();
    window.location.href = '/login';
    throw new Error('Session expired – please log in again');
  }

  return res;
}
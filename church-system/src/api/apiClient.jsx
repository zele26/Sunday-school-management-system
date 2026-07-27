import useAuthStore from '../store/authStore';

const PRIMARY_API_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : 'https://church-api-3l2c.onrender.com');

const FALLBACK_API_URL = 'https://church-api-3l2c.onrender.com';

export async function apiFetch(url, options = {}) {
  const token = useAuthStore.getState().accessToken;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${PRIMARY_API_URL}${url}`, {
      ...options,
      headers,
    });

    if (res.status === 401 && token) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      throw new Error('Session expired – please log in again');
    }

    return res;
  } catch (err) {
    // If primary URL is localhost and failed (e.g. local backend server not running), fallback to remote production URL
    if (PRIMARY_API_URL.includes('localhost') || PRIMARY_API_URL.includes('127.0.0.1')) {
      console.warn('Local API server unreachable, falling back to remote server:', FALLBACK_API_URL);
      try {
        const fallbackRes = await fetch(`${FALLBACK_API_URL}${url}`, {
          ...options,
          headers,
        });

        if (fallbackRes.status === 401 && token) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
          throw new Error('Session expired – please log in again');
        }

        return fallbackRes;
      } catch (fallbackErr) {
        throw err;
      }
    }
    throw err;
  }
}

export { PRIMARY_API_URL as API_BASE_URL };
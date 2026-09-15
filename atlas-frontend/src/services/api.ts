import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      alert('Koneksi ke server terputus. Pastikan server backend sedang berjalan.');
    } else if (error.response && error.response.status >= 500) {
      alert('Terjadi kesalahan internal pada server (500). Silakan coba beberapa saat lagi.');
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

// Instance axios untuk API publik (submit form)
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'x-mock-match-request-body': 'false' // Untuk postman [Hapus kalau API udah ada]
  }
});

// Instance axios untuk API Admin (dashboard & CRM)
export const adminApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Interceptor  Token JWT di endpoint Admin
adminApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token'); // Ambil token dari localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

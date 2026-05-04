import axios from 'axios';
import { getAccessToken } from './tokenManager';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// TODO: add a request interceptor that reads the access token from tokenManager
// and attaches it as an Authorization: Bearer <token> header

api.interceptors.request.use(async (config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// TODO: add a response interceptor that catches 401 responses,
// calls the token refresh endpoint, then retries the original request

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error('401 response from API, attempting token refresh...');

      const { refresh } = await import('./authService');
      await refresh();
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);

export default api;

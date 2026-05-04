import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// TODO: add a request interceptor that reads the access token from tokenManager
// and attaches it as an Authorization: Bearer <token> header

// TODO: add a response interceptor that catches 401 responses,
// calls the token refresh endpoint, then retries the original request

export default api;

import axios from 'axios';

export const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

http.interceptors.response.use(
  response => response,
  error => {
    console.error('[API Error]', error.response?.status || error.message);
    return Promise.reject(error);
  }
);

export default http;

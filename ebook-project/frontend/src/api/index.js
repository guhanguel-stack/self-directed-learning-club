import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, removeTokens } from '../utils/token';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
});

// 요청 인터셉터 — 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 — 토큰 만료 시 자동 재발급
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        const response = await axios.post('http://localhost:8080/api/auth/reissue', null, {
          headers: { 'Refresh-Token': refreshToken },
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        setTokens(accessToken, newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        removeTokens();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

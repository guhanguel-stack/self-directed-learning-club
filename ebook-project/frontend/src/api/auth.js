import api from './index';

export const register = (data) => api.post('/api/auth/register', data);
export const login = (data) => api.post('/api/auth/login', data);
export const logout = () => api.post('/api/auth/logout');
export const getMyInfo = () => api.get('/api/users/me');
export const chargePoint = (amount) => api.post('/api/users/me/points/charge', { amount });
export const checkNickname = (nickname) => api.get('/api/users/check-nickname', { params: { nickname } });

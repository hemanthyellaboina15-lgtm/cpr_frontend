import api from './axios';

export const authApi = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (studentData) => api.post('/api/auth/register', studentData),
  getCurrentUser: () => api.get('/api/auth/me'),
};

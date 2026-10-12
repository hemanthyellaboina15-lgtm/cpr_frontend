import api from './axios';

export const dashboardApi = {
  getAdminStats: () => api.get('/api/dashboard/admin'),
  getStudentStats: () => api.get('/api/dashboard/student'),
  getStaffStats: () => api.get('/api/dashboard/staff'),
};

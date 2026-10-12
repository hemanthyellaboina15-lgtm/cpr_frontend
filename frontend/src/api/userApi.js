import api from './axios';

export const userApi = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
  getAllUsers: () => api.get('/api/admin/users'),
  getUsersByRole: (role) => api.get(`/api/admin/users/role/${role}`),
  createStaff: (staffData) => api.post('/api/admin/staff', staffData),
  toggleUserStatus: (id, active) => api.patch(`/api/admin/users/${id}/status?active=${active}`),
  getStaffByDepartment: (departmentId) => api.get(`/api/users/staff/department/${departmentId}`),
};

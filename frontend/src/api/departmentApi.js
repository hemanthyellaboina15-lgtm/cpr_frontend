import api from './axios';

export const departmentApi = {
  getActiveDepartments: () => api.get('/api/departments'),
  getAllDepartments: () => api.get('/api/departments/all'),
  getDepartmentById: (id) => api.get(`/api/departments/${id}`),
  createDepartment: (dept) => api.post('/api/departments', dept),
  updateDepartment: (id, dept) => api.put(`/api/departments/${id}`, dept),
  deleteDepartment: (id) => api.delete(`/api/departments/${id}`),
};

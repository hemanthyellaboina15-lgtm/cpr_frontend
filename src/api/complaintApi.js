import api from './axios';

export const complaintApi = {
  getComplaints: (params = {}) => api.get('/api/complaints', { params }),
  getComplaintById: (id) => api.get(`/api/complaints/${id}`),
  getComplaintByRef: (referenceNo) => api.get(`/api/complaints/ref/${referenceNo}`),
  
  createComplaint: (formData) =>
    api.post('/api/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  createComplaintJson: (data) => api.post('/api/complaints', data),

  assignComplaint: (id, assignData) => api.put(`/api/complaints/${id}/assign`, assignData),

  updateStatus: (id, statusData) => api.put(`/api/complaints/${id}/status`, statusData),

  cancelComplaint: (id) => api.put(`/api/complaints/${id}/cancel`),

  addAttachment: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/complaints/${id}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

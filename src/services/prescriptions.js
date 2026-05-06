import api from './api';

export const prescriptionService = {
  getAll: () => api.get('/prescriptions/'),
  getById: (id) => api.get(`/prescriptions/${id}/`),
  upload: (formData) => api.post('/prescriptions/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  approve: (id) => api.post(`/prescriptions/${id}/approve/`),
  reject: (id, notes) => api.post(`/prescriptions/${id}/reject/`, { notes }),
};

export default prescriptionService;

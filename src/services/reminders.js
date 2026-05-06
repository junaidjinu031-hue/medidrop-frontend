import api from './api';

export const reminderService = {
  getAll: () => api.get('/reminders/'),
  getById: (id) => api.get(`/reminders/${id}/`),
  create: (data) => api.post('/reminders/', data),
  update: (id, data) => api.patch(`/reminders/${id}/`, data),
  delete: (id) => api.delete(`/reminders/${id}/`),
};

export default reminderService;

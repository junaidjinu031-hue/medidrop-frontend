import api from './api';

export const reportsService = {
  getReports: () => api.get('/reports/'),
};

export default reportsService;

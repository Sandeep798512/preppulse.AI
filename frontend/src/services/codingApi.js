import API from './api';

export const getCodingProblems = async (params = {}) => {
  const response = await API.get('/coding/problems', { params });
  return response.data;
};

export const getCodingProblemBySlug = async (slug) => {
  const response = await API.get(`/coding/problems/${slug}`);
  return response.data;
};

export const runCodingCode = async (problemId, data) => {
  const response = await API.post(`/coding/problems/${problemId}/run`, data);
  return response.data;
};

export const submitCodingSolution = async (problemId, data) => {
  const response = await API.post(`/coding/problems/${problemId}/submit`, data);
  return response.data;
};

export const getCodingSubmissions = async (params = {}) => {
  const response = await API.get('/coding/submissions', { params });
  return response.data;
};

export const getCodingSubmissionById = async (id) => {
  const response = await API.get(`/coding/submissions/${id}`);
  return response.data;
};

export const getCodingAnalytics = async () => {
  const response = await API.get('/coding/analytics');
  return response.data;
};

export const getCodingReadiness = async () => {
  const response = await API.get('/coding/readiness');
  return response.data;
};

// Admin API
export const createCodingProblem = async (data) => {
  const response = await API.post('/coding/admin/problems', data);
  return response.data;
};

export const updateCodingProblem = async (id, data) => {
  const response = await API.put(`/coding/admin/problems/${id}`, data);
  return response.data;
};

export const deleteCodingProblem = async (id) => {
  const response = await API.delete(`/coding/admin/problems/${id}`);
  return response.data;
};

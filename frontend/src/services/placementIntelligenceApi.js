import api from './api';

export const getJobOpenings = async (params = {}) => {
  const response = await api.get('/jobs', { params });
  return response.data;
};

export const getJobOpeningById = async (id) => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

export const createJobOpening = async (data) => {
  const response = await api.post('/jobs', data);
  return response.data;
};

export const compareJobs = async (jobIds) => {
  const response = await api.post('/jobs/compare', { jobIds });
  return response.data;
};

export const getJobEligibility = async (id) => {
  const response = await api.get(`/jobs/${id}/eligibility`);
  return response.data;
};

export const getJobReadiness = async (id) => {
  const response = await api.get(`/jobs/${id}/readiness`);
  return response.data;
};

export const generateJobPreparationPlan = async (id) => {
  const response = await api.post(`/jobs/${id}/preparation/generate`);
  return response.data;
};

export const getJobPreparationPlan = async (id) => {
  const response = await api.get(`/jobs/${id}/preparation`);
  return response.data;
};

export const getCompanies = async (params = {}) => {
  const response = await api.get('/companies', { params });
  return response.data;
};

export const getCompanyById = async (id) => {
  const response = await api.get(`/companies/${id}`);
  return response.data;
};

export const createCompany = async (data) => {
  const response = await api.post('/companies', data);
  return response.data;
};

export const getApplications = async (status = '') => {
  const response = await api.get(`/applications${status ? `?status=${encodeURIComponent(status)}` : ''}`);
  return response.data;
};

export const trackApplication = async (data) => {
  const response = await api.post('/applications', data);
  return response.data;
};

export const getApplicationById = async (id) => {
  const response = await api.get(`/applications/${id}`);
  return response.data;
};

export const updateApplication = async (id, data) => {
  const response = await api.put(`/applications/${id}`, data);
  return response.data;
};

export const deleteApplication = async (id) => {
  const response = await api.delete(`/applications/${id}`);
  return response.data;
};

export const getUpcomingActions = async () => {
  const response = await api.get('/applications/upcoming');
  return response.data;
};

export const getPlacementIntelligenceOverview = async () => {
  const response = await api.get('/placement-intelligence/overview');
  return response.data;
};

export const getApplicationAnalytics = async () => {
  const response = await api.get('/application-analytics');
  return response.data;
};

export const getSkillDemandVsReadiness = async () => {
  const response = await api.get('/placement-intelligence/skills');
  return response.data;
};

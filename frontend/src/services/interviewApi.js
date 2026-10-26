import API from './api';

export const startInterviewSession = async (data) => {
  const response = await API.post('/interviews/start', data);
  return response.data;
};

export const getInterviewSession = async (id) => {
  const response = await API.get(`/interviews/${id}`);
  return response.data;
};

export const submitInterviewAnswer = async (id, data) => {
  const response = await API.post(`/interviews/${id}/answer`, data);
  return response.data;
};

export const skipInterviewQuestion = async (id) => {
  const response = await API.post(`/interviews/${id}/skip`);
  return response.data;
};

export const endInterviewSession = async (id) => {
  const response = await API.post(`/interviews/${id}/end`);
  return response.data;
};

export const getInterviewResult = async (id) => {
  const response = await API.get(`/interviews/${id}/result`);
  return response.data;
};

export const getInterviewHistory = async (params = {}) => {
  const response = await API.get('/interviews/history', { params });
  return response.data;
};

export const getInterviewAnalytics = async () => {
  const response = await API.get('/interviews/analytics');
  return response.data;
};

export const getInterviewCoach = async () => {
  const response = await API.get('/interviews/coach');
  return response.data;
};

// Phase 7 Deep Analysis Endpoints
export const getSessionAnalysis = async (id) => {
  const response = await API.get(`/interviews/${id}/analysis`);
  return response.data;
};

export const reanalyzeSession = async (id) => {
  const response = await API.post(`/interviews/${id}/reanalyze`);
  return response.data;
};

export const getInterviewTrends = async () => {
  const response = await API.get('/interviews/trends');
  return response.data;
};

export const getWeakTopics = async () => {
  const response = await API.get('/interviews/weak-topics');
  return response.data;
};

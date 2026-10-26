import api from './api';

export const getCareerCoachOverview = async () => {
  const response = await api.get('/career-coach/overview');
  return response.data;
};

export const getSkillHeatmap = async (role = '') => {
  const response = await api.get(`/career-coach/skills?role=${encodeURIComponent(role)}`);
  return response.data;
};

export const getNextBestAction = async () => {
  const response = await api.get('/career-coach/next-best-action');
  return response.data;
};

export const getWeeklyReview = async () => {
  const response = await api.get('/career-coach/weekly-review');
  return response.data;
};

export const sendCareerCoachChat = async (prompt) => {
  const response = await api.post('/career-coach/chat', { prompt });
  return response.data;
};

export const getCareerGoals = async () => {
  const response = await api.get('/career-goals');
  return response.data;
};

export const saveCareerGoal = async (goalData) => {
  const response = await api.post('/career-goals', goalData);
  return response.data;
};

export const getActiveRoadmap = async () => {
  const response = await api.get('/roadmap');
  return response.data;
};

export const generateRoadmap = async (data = {}) => {
  const response = await api.post('/roadmap/generate', data);
  return response.data;
};

export const regenerateRoadmap = async (data = {}) => {
  const response = await api.post('/roadmap/regenerate', data);
  return response.data;
};

export const getTodayTasks = async () => {
  const response = await api.get('/roadmap/tasks/today');
  return response.data;
};

export const startRoadmapTask = async (taskId) => {
  const response = await api.put(`/roadmap/tasks/${taskId}/start`);
  return response.data;
};

export const completeRoadmapTask = async (taskId, payload = {}) => {
  const response = await api.put(`/roadmap/tasks/${taskId}/complete`, payload);
  return response.data;
};

export const skipRoadmapTask = async (taskId) => {
  const response = await api.put(`/roadmap/tasks/${taskId}/skip`);
  return response.data;
};

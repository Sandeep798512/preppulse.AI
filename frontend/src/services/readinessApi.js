import API from './api';

export const getPlacementReadiness = async () => {
  const response = await API.get('/placement-readiness');
  return response.data;
};

export const recalculatePlacementReadiness = async () => {
  const response = await API.post('/placement-readiness/recalculate');
  return response.data;
};

export const getScoreBreakdown = async () => {
  const response = await API.get('/placement-readiness/breakdown');
  return response.data;
};

export const getReadinessTrend = async () => {
  const response = await API.get('/placement-readiness/trend');
  return response.data;
};

export const getSkillsMatrix = async () => {
  const response = await API.get('/placement-readiness/skills');
  return response.data;
};

export const getRoleReadiness = async () => {
  const response = await API.get('/placement-readiness/roles');
  return response.data;
};

export const getRecommendations = async () => {
  const response = await API.get('/placement-readiness/recommendations');
  return response.data;
};

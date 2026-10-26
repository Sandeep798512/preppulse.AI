const express = require('express');
const router = express.Router();
const {
  getProblems,
  getProblemBySlug,
  runCode,
  submitCode,
  getSubmissions,
  getSubmissionById,
  getCodingAnalytics,
  getCodingReadiness,
  createProblem,
  updateProblem,
  deleteProblem,
} = require('../controllers/codingController');
const { protect, adminOnly, optionalAuth } = require('../middleware/authMiddleware');

// Student / Public Endpoints
router.get('/problems', optionalAuth, getProblems);
router.get('/problems/:slug', optionalAuth, getProblemBySlug);
router.post('/problems/:id/run', protect, runCode);
router.post('/problems/:id/submit', protect, submitCode);

router.get('/submissions', protect, getSubmissions);
router.get('/submissions/:id', protect, getSubmissionById);
router.get('/analytics', protect, getCodingAnalytics);
router.get('/readiness', protect, getCodingReadiness);

// Admin Management Endpoints
router.post('/admin/problems', protect, adminOnly, createProblem);
router.put('/admin/problems/:id', protect, adminOnly, updateProblem);
router.delete('/admin/problems/:id', protect, adminOnly, deleteProblem);

module.exports = router;

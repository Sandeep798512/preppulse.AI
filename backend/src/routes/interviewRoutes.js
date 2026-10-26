const express = require('express');
const router = express.Router();
const {
  startSession,
  getCurrentSession,
  submitAnswer,
  skipQuestion,
  endSession,
  getSessionResult,
  getInterviewHistory,
  getInterviewAnalytics,
  getInterviewCoach,
  analyzeSession,
  getSessionAnalysis,
  reanalyzeSession,
  getInterviewTrends,
  getWeakTopics,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/start', protect, startSession);
router.get('/history', protect, getInterviewHistory);
router.get('/analytics', protect, getInterviewAnalytics);
router.get('/coach', protect, getInterviewCoach);
router.get('/trends', protect, getInterviewTrends);
router.get('/weak-topics', protect, getWeakTopics);

router.get('/:id', protect, getCurrentSession);
router.post('/:id/answer', protect, submitAnswer);
router.post('/:id/skip', protect, skipQuestion);
router.post('/:id/end', protect, endSession);
router.get('/:id/result', protect, getSessionResult);

// Phase 7 Deep Analysis Endpoints
router.post('/:id/analyze', protect, analyzeSession);
router.get('/:id/analysis', protect, getSessionAnalysis);
router.post('/:id/reanalyze', protect, reanalyzeSession);

module.exports = router;

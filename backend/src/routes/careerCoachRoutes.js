const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getOverview,
  getSkillHeatmap,
  getNextAction,
  getWeeklyReview,
  handleCareerCoachChat,
} = require('../controllers/careerCoachController');

router.use(protect);

router.get('/overview', getOverview);
router.get('/skills', getSkillHeatmap);
router.get('/gaps', getSkillHeatmap);
router.get('/recommendations', getOverview);
router.get('/next-best-action', getNextAction);
router.get('/weekly-review', getWeeklyReview);

router.post('/chat', handleCareerCoachChat);

module.exports = router;

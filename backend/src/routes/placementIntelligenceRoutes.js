const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getPlacementIntelligenceOverview,
  getAnalytics,
  getSkillDemandVsReadiness,
} = require('../controllers/placementIntelligenceController');

router.use(protect);

router.get('/overview', getPlacementIntelligenceOverview);
router.get('/analytics', getAnalytics);
router.get('/skills', getSkillDemandVsReadiness);

module.exports = router;

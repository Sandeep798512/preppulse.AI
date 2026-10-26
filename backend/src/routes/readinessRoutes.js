const express = require('express');
const router = express.Router();
const {
  getPlacementReadiness,
  recalculatePlacementReadiness,
  getScoreBreakdown,
  getReadinessTrend,
  getSkillsMatrix,
  getRoleReadiness,
  getRecommendations,
  getAdminReadinessAggregate,
} = require('../controllers/readinessController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getPlacementReadiness);
router.post('/recalculate', protect, recalculatePlacementReadiness);
router.get('/breakdown', protect, getScoreBreakdown);
router.get('/trend', protect, getReadinessTrend);
router.get('/skills', protect, getSkillsMatrix);
router.get('/roles', protect, getRoleReadiness);
router.get('/recommendations', protect, getRecommendations);

// Admin route
router.get('/admin/aggregate', protect, adminOnly, getAdminReadinessAggregate);

module.exports = router;

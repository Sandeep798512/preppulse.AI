const express = require('express');
const router = express.Router();
const {
  analyzeMatch,
  getUserMatches,
  getMatchById,
  deleteMatch,
} = require('../controllers/matchingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', protect, analyzeMatch);
router.get('/', protect, getUserMatches);
router.get('/:id', protect, getMatchById);
router.delete('/:id', protect, deleteMatch);

module.exports = router;

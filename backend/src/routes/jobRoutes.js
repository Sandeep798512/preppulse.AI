const express = require('express');
const router = express.Router();
const {
  analyzeJobDescription,
  getUserJobDescriptions,
  getJobDescriptionById,
  deleteJobDescription,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', protect, analyzeJobDescription);
router.get('/', protect, getUserJobDescriptions);
router.get('/:id', protect, getJobDescriptionById);
router.delete('/:id', protect, deleteJobDescription);

module.exports = router;

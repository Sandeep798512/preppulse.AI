const express = require('express');
const router = express.Router();
const {
  uploadResume,
  analyzeResume,
  getUserResumes,
  getResumeById,
  deleteResume,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUpload');

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.post('/:id/analyze', protect, analyzeResume);
router.get('/', protect, getUserResumes);
router.get('/:id', protect, getResumeById);
router.delete('/:id', protect, deleteResume);

module.exports = router;

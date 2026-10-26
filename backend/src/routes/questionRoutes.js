const express = require('express');
const router = express.Router();
const {
  getQuestions,
  createQuestion,
  updateQuestion,
  toggleQuestionStatus,
  deleteQuestion,
  bulkImportQuestions,
} = require('../controllers/questionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getQuestions);
router.post('/', protect, adminOnly, createQuestion);
router.put('/:id', protect, adminOnly, updateQuestion);
router.patch('/:id/status', protect, adminOnly, toggleQuestionStatus);
router.delete('/:id', protect, adminOnly, deleteQuestion);
router.post('/admin/import', protect, adminOnly, bulkImportQuestions);

module.exports = router;

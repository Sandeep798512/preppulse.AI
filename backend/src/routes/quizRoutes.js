const express = require('express');
const router = express.Router();
const {
  startQuiz,
  saveAnswer,
  submitQuiz,
  getQuizAttempt,
  getQuizHistory,
  getQuizResult,
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.post('/start', protect, startQuiz);
router.get('/history', protect, getQuizHistory);
router.post('/:id/answer', protect, saveAnswer);
router.post('/:id/submit', protect, submitQuiz);
router.get('/:id', protect, getQuizAttempt);
router.get('/:id/result', protect, getQuizResult);

module.exports = router;

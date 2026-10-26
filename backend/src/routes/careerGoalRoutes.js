const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getCareerGoals,
  createOrUpdateCareerGoal,
  updateCareerGoal,
  deleteCareerGoal,
} = require('../controllers/careerGoalController');

router.use(protect);

router.route('/')
  .get(getCareerGoals)
  .post(createOrUpdateCareerGoal);

router.route('/:id')
  .put(updateCareerGoal)
  .delete(deleteCareerGoal);

module.exports = router;

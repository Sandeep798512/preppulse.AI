const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getApplications,
  createApplication,
  getApplicationById,
  updateApplication,
  deleteApplication,
  getUpcomingActions,
} = require('../controllers/jobApplicationController');

router.use(protect);

router.route('/')
  .get(getApplications)
  .post(createApplication);

router.get('/upcoming', getUpcomingActions);

router.route('/:id')
  .get(getApplicationById)
  .put(updateApplication)
  .delete(deleteApplication);

module.exports = router;

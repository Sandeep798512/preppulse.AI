const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getActiveRoadmap,
  triggerRoadmapGeneration,
  getTodayTaskAllocations,
  startTask,
  completeTask,
  skipTask,
  pauseRoadmap,
  resumeRoadmap,
} = require('../controllers/roadmapController');

router.use(protect);

router.get('/', getActiveRoadmap);
router.post('/generate', triggerRoadmapGeneration);
router.post('/regenerate', triggerRoadmapGeneration);
router.get('/tasks/today', getTodayTaskAllocations);

router.put('/tasks/:id/start', startTask);
router.put('/tasks/:id/complete', completeTask);
router.put('/tasks/:id/skip', skipTask);

router.put('/:id/pause', pauseRoadmap);
router.put('/:id/resume', resumeRoadmap);

module.exports = router;

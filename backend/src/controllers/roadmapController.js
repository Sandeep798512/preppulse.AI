const LearningRoadmap = require('../models/LearningRoadmap');
const RoadmapTask = require('../models/RoadmapTask');
const CareerGoal = require('../models/CareerGoal');
const { generateRoadmap, getTodayTasks, updateTaskStatus } = require('../services/roadmapService');

/**
 * GET /api/roadmap
 * Fetch active roadmap for logged-in user
 */
const getActiveRoadmap = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let roadmap = await LearningRoadmap.findOne({ userId, status: 'active' });

    if (!roadmap) {
      // If no active roadmap, generate one using active goal or default goal
      let goal = await CareerGoal.findOne({ userId, goalStatus: 'active' });
      if (!goal) {
        goal = await CareerGoal.create({ userId, primaryRole: 'Software Developer' });
      }
      roadmap = await generateRoadmap(req.user, goal, 'Auto generation on fetch');
    }

    const tasks = await RoadmapTask.find({ roadmapId: roadmap._id }).sort({ weekNumber: 1, dayNumber: 1, priority: 1 });

    res.json({
      success: true,
      data: {
        roadmap,
        tasks,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/roadmap/generate or POST /api/roadmap/regenerate
 * Trigger adaptive roadmap generation / versioning
 */
const triggerRoadmapGeneration = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let goal = await CareerGoal.findOne({ userId, goalStatus: 'active' });
    if (!goal) {
      goal = await CareerGoal.create({ userId, primaryRole: req.body.targetRole || 'Software Developer' });
    }

    const reason = req.body.reason || 'Manual regeneration trigger';
    const roadmap = await generateRoadmap(req.user, goal, reason);
    const tasks = await RoadmapTask.find({ roadmapId: roadmap._id }).sort({ weekNumber: 1, dayNumber: 1 });

    res.json({
      success: true,
      message: `Personalized Learning Roadmap Version ${roadmap.roadmapVersion} generated successfully!`,
      data: {
        roadmap,
        tasks,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/roadmap/tasks/today
 * Fetch tasks allocated for today
 */
const getTodayTaskAllocations = async (req, res, next) => {
  try {
    const result = await getTodayTasks(req.user._id);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/roadmap/tasks/:id/start
 */
const startTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await updateTaskStatus(req.user._id, id, 'in_progress');
    res.json({
      success: true,
      message: 'Task marked as in progress',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/roadmap/tasks/:id/complete
 */
const completeTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { timeSpent, score } = req.body;
    const result = await updateTaskStatus(req.user._id, id, 'completed', timeSpent, score);
    res.json({
      success: true,
      message: 'Task marked as completed! Preparation points and streak updated.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/roadmap/tasks/:id/skip
 */
const skipTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await updateTaskStatus(req.user._id, id, 'skipped');
    res.json({
      success: true,
      message: 'Task skipped',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/roadmap/:id/pause
 */
const pauseRoadmap = async (req, res, next) => {
  try {
    const { id } = req.params;
    const roadmap = await LearningRoadmap.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { status: 'paused' },
      { new: true }
    );
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });
    res.json({ success: true, message: 'Roadmap paused', data: roadmap });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/roadmap/:id/resume
 */
const resumeRoadmap = async (req, res, next) => {
  try {
    const { id } = req.params;
    const roadmap = await LearningRoadmap.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { status: 'active' },
      { new: true }
    );
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });
    res.json({ success: true, message: 'Roadmap resumed', data: roadmap });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getActiveRoadmap,
  triggerRoadmapGeneration,
  getTodayTaskAllocations,
  startTask,
  completeTask,
  skipTask,
  pauseRoadmap,
  resumeRoadmap,
};

const CareerGoal = require('../models/CareerGoal');
const { generateRoadmap } = require('../services/roadmapService');

/**
 * GET /api/career-goals
 * Fetch user's career goals
 */
const getCareerGoals = async (req, res, next) => {
  try {
    const goals = await CareerGoal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const activeGoal = goals.find((g) => g.goalStatus === 'active') || goals[0] || null;

    res.json({
      success: true,
      data: {
        activeGoal,
        allGoals: goals,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/career-goals
 * Create or update active career goal and trigger roadmap generation
 */
const createOrUpdateCareerGoal = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      primaryRole,
      secondaryRoles,
      targetCompanyType,
      targetExperienceLevel,
      targetTimeline,
      dailyStudyHours,
      availableDays,
      preferredLearningStyle,
      currentLevel,
    } = req.body;

    // Archive previous active goals
    await CareerGoal.updateMany({ userId, goalStatus: 'active' }, { goalStatus: 'archived' });

    const goal = await CareerGoal.create({
      userId,
      primaryRole: primaryRole || 'Software Developer',
      secondaryRoles: secondaryRoles || ['Full Stack Developer'],
      targetCompanyType: targetCompanyType || 'Product-Based',
      targetExperienceLevel: targetExperienceLevel || 'Entry Level / Fresher (0-1 yr)',
      targetTimeline: targetTimeline || '3 Months',
      dailyStudyHours: Number(dailyStudyHours) || 2,
      availableDays: availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      preferredLearningStyle: preferredLearningStyle || 'Balanced Mix',
      currentLevel: currentLevel || 'Intermediate',
      goalStatus: 'active',
    });

    // Generate new roadmap automatically on goal creation
    const roadmap = await generateRoadmap(req.user, goal, 'Goal creation trigger');

    res.status(201).json({
      success: true,
      message: 'Career goal created & personalized learning roadmap generated successfully.',
      data: {
        goal,
        roadmap,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/career-goals/:id
 * Update an existing goal by ID
 */
const updateCareerGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const goal = await CareerGoal.findOne({ _id: id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Career goal not found' });
    }

    Object.assign(goal, req.body);
    await goal.save();

    // Regenerate roadmap if goal was updated
    let roadmap = null;
    if (goal.goalStatus === 'active') {
      roadmap = await generateRoadmap(req.user, goal, 'Goal updated trigger');
    }

    res.json({
      success: true,
      message: 'Career goal updated successfully.',
      data: { goal, roadmap },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/career-goals/:id
 * Delete a goal (ownership check enforced)
 */
const deleteCareerGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const goal = await CareerGoal.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Career goal not found' });
    }

    res.json({
      success: true,
      message: 'Career goal deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCareerGoals,
  createOrUpdateCareerGoal,
  updateCareerGoal,
  deleteCareerGoal,
};

const { getCareerCoachOverview, generateCareerCoachChatResponse } = require('../services/careerCoachService');
const { calculateSkillGaps } = require('../services/skillGapService');
const { getNextBestAction } = require('../services/recommendationService');
const WeeklyReview = require('../models/WeeklyReview');
const LearningRoadmap = require('../models/LearningRoadmap');
const RoadmapTask = require('../models/RoadmapTask');

/**
 * GET /api/career-coach/overview
 */
const getOverview = async (req, res, next) => {
  try {
    const overview = await getCareerCoachOverview(req.user);
    res.json({
      success: true,
      data: overview,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/career-coach/skills
 */
const getSkillHeatmap = async (req, res, next) => {
  try {
    const targetRole = req.query.role || 'Software Developer';
    const skillData = await calculateSkillGaps(req.user, targetRole);
    res.json({
      success: true,
      data: skillData,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/career-coach/next-best-action
 */
const getNextAction = async (req, res, next) => {
  try {
    const overview = await getCareerCoachOverview(req.user);
    res.json({
      success: true,
      data: overview.nextBestAction,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/weekly-review
 */
const getWeeklyReview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const roadmap = await LearningRoadmap.findOne({ userId, status: 'active' });
    if (!roadmap) {
      return res.json({ success: true, data: null });
    }

    let review = await WeeklyReview.findOne({ userId, roadmapId: roadmap._id }).sort({ weekNumber: -1 });
    if (!review) {
      // Auto generate week 1 review
      const tasks = await RoadmapTask.find({ userId, roadmapId: roadmap._id, weekNumber: 1 });
      const completed = tasks.filter((t) => t.status === 'completed').length;
      const total = tasks.length || 1;

      review = await WeeklyReview.create({
        userId,
        roadmapId: roadmap._id,
        weekNumber: 1,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 86400000),
        tasksPlanned: total,
        tasksCompleted: completed,
        completionRate: Math.round((completed / total) * 100),
        whatWentWell: ['Started placement preparation roadmap', 'Targeted key core CS & DSA gaps'],
        topGapsRemaining: ['Data Structures & Algorithms', 'AI Mock Interview'],
        nextWeekPriority: 'Solve 15 Array/String Coding Challenges',
        summaryText: 'Solid start to Week 1 preparation. Focus on completing daily tasks consistently.',
      });
    }

    res.json({
      success: true,
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/career-coach/chat
 */
const handleCareerCoachChat = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ success: false, message: 'Question prompt is required.' });
    }

    const response = await generateCareerCoachChatResponse(req.user, prompt.trim());
    res.json(response);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOverview,
  getSkillHeatmap,
  getNextAction,
  getWeeklyReview,
  handleCareerCoachChat,
};

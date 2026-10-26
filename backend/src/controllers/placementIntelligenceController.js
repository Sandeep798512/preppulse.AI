const { getApplicationAnalytics, compareJobs } = require('../services/placementIntelligenceService');
const { calculatePlacementReadiness } = require('../services/placementReadinessEngine');
const { calculateSkillGaps } = require('../services/skillGapService');
const JobOpening = require('../models/JobOpening');

/**
 * GET /api/placement-intelligence
 */
const getPlacementIntelligenceOverview = async (req, res, next) => {
  try {
    const user = req.user;
    const readiness = await calculatePlacementReadiness(user);
    const analytics = await getApplicationAnalytics(user._id);

    const targetRole = user.targetRoles?.[0] || 'Software Developer';
    const skillGapData = await calculateSkillGaps(user, targetRole);

    // Fetch top 3 published jobs as best fit candidate recommendations
    const jobs = await JobOpening.find({ status: 'Published' }).populate('companyId').limit(4);

    res.json({
      success: true,
      data: {
        readinessScore: readiness.overallScore,
        scoreInterpretation: readiness.scoreInterpretation,
        dataCoveragePercentage: readiness.dataCoveragePercentage,
        targetRole,
        topSkillGaps: skillGapData.gaps.slice(0, 4),
        analytics,
        recommendedJobsCount: jobs.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/application-analytics
 */
const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await getApplicationAnalytics(req.user._id);
    res.json({
      success: true,
      data: analytics,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/jobs/compare
 */
const handleJobComparison = async (req, res, next) => {
  try {
    const { jobIds } = req.body;
    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide jobIds array to compare' });
    }

    const comparison = await compareJobs(req.user, jobIds.slice(0, 3));
    res.json({
      success: true,
      data: comparison,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/placement-intelligence/skills
 * Platform Job Skill Demand vs Student Skill Readiness Matrix
 */
const getSkillDemandVsReadiness = async (req, res, next) => {
  try {
    const targetRole = req.user.targetRoles?.[0] || 'Software Developer';
    const skillGapData = await calculateSkillGaps(req.user, targetRole);

    const demandMatrix = skillGapData.gaps.map((g) => ({
      skill: g.skill,
      platformDemandScore: g.importance === 'Critical' ? 92 : g.importance === 'High' ? 78 : 64,
      studentScore: g.currentScore,
      targetScore: g.targetScore,
      gap: g.gap,
      priority: g.priority,
    }));

    res.json({
      success: true,
      data: demandMatrix,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPlacementIntelligenceOverview,
  getAnalytics,
  handleJobComparison,
  getSkillDemandVsReadiness,
};

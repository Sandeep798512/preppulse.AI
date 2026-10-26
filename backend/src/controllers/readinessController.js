const PlacementReadiness = require('../models/PlacementReadiness');
const PlacementReadinessSnapshot = require('../models/PlacementReadinessSnapshot');
const User = require('../models/User');
const { calculatePlacementReadiness } = require('../services/placementReadinessEngine');

/**
 * GET /api/placement-readiness
 * Get user's current Placement Readiness score and metrics. Auto-calculates if missing.
 */
const getPlacementReadiness = async (req, res) => {
  try {
    let readiness = await PlacementReadiness.findOne({ userId: req.user._id });
    if (!readiness) {
      readiness = await calculatePlacementReadiness(req.user);
    }

    res.json({
      success: true,
      data: readiness,
    });
  } catch (error) {
    console.error('Error getting placement readiness:', error);
    res.status(500).json({ success: false, message: 'Server error fetching placement readiness' });
  }
};

/**
 * POST /api/placement-readiness/recalculate
 * Force recalculate current placement readiness score & save new snapshot.
 */
const recalculatePlacementReadiness = async (req, res) => {
  try {
    const readiness = await calculatePlacementReadiness(req.user);
    res.json({
      success: true,
      message: 'Placement readiness score recalculated successfully',
      data: readiness,
    });
  } catch (error) {
    console.error('Error recalculating placement readiness:', error);
    res.status(500).json({ success: false, message: 'Server error recalculating readiness' });
  }
};

/**
 * GET /api/placement-readiness/breakdown
 * Explainable score breakdown with weights & contributions.
 */
const getScoreBreakdown = async (req, res) => {
  try {
    let readiness = await PlacementReadiness.findOne({ userId: req.user._id });
    if (!readiness) {
      readiness = await calculatePlacementReadiness(req.user);
    }

    res.json({
      success: true,
      data: {
        overallScore: readiness.overallScore,
        scoreInterpretation: readiness.scoreInterpretation,
        dataCoveragePercentage: readiness.dataCoveragePercentage,
        confidenceLevel: readiness.confidenceLevel,
        scoresBreakdown: readiness.scoresBreakdown,
      },
    });
  } catch (error) {
    console.error('Error fetching score breakdown:', error);
    res.status(500).json({ success: false, message: 'Server error fetching score breakdown' });
  }
};

/**
 * GET /api/placement-readiness/trend
 * Historical readiness snapshots for progress line chart.
 */
const getReadinessTrend = async (req, res) => {
  try {
    const snapshots = await PlacementReadinessSnapshot.find({ userId: req.user._id })
      .sort({ createdAt: 1 })
      .limit(30);

    const trend = snapshots.map((s) => ({
      date: new Date(s.createdAt).toLocaleDateString(),
      overallScore: s.overallScore,
      resumeScore: s.resumeScore,
      codingScore: s.codingScore,
      interviewScore: s.interviewScore,
    }));

    res.json({
      success: true,
      data: trend,
    });
  } catch (error) {
    console.error('Error fetching readiness trend:', error);
    res.status(500).json({ success: false, message: 'Server error fetching readiness trend' });
  }
};

/**
 * GET /api/placement-readiness/skills
 * Unified skill matrix and critical skill gaps.
 */
const getSkillsMatrix = async (req, res) => {
  try {
    let readiness = await PlacementReadiness.findOne({ userId: req.user._id });
    if (!readiness) {
      readiness = await calculatePlacementReadiness(req.user);
    }

    res.json({
      success: true,
      data: {
        skillMatrix: readiness.skillMatrix,
        strongAreas: readiness.strongAreas,
        weakAreas: readiness.weakAreas,
        criticalGaps: readiness.criticalGaps,
      },
    });
  } catch (error) {
    console.error('Error fetching skills matrix:', error);
    res.status(500).json({ success: false, message: 'Server error fetching skills matrix' });
  }
};

/**
 * GET /api/placement-readiness/roles
 * Target role readiness scores.
 */
const getRoleReadiness = async (req, res) => {
  try {
    let readiness = await PlacementReadiness.findOne({ userId: req.user._id });
    if (!readiness) {
      readiness = await calculatePlacementReadiness(req.user);
    }

    res.json({
      success: true,
      data: readiness.targetRolesReadiness,
    });
  } catch (error) {
    console.error('Error fetching role readiness:', error);
    res.status(500).json({ success: false, message: 'Server error fetching role readiness' });
  }
};

/**
 * GET /api/placement-readiness/recommendations
 * Prioritized recommendations and 7-day weekly preparation schedule.
 */
const getRecommendations = async (req, res) => {
  try {
    let readiness = await PlacementReadiness.findOne({ userId: req.user._id });
    if (!readiness) {
      readiness = await calculatePlacementReadiness(req.user);
    }

    res.json({
      success: true,
      data: {
        recommendations: readiness.recommendations,
        weeklyPlan: readiness.weeklyPlan,
      },
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ success: false, message: 'Server error fetching recommendations' });
  }
};

/**
 * ADMIN: GET /api/admin/placement-readiness/aggregate
 * Platform-wide aggregate analytics for admin panel.
 */
const getAdminReadinessAggregate = async (req, res) => {
  try {
    const allRecords = await PlacementReadiness.find();
    const totalStudents = allRecords.length;

    if (totalStudents === 0) {
      return res.json({
        success: true,
        data: {
          totalStudents: 0,
          averageReadinessScore: 0,
          averageCodingScore: 0,
          averageInterviewScore: 0,
          averageResumeScore: 0,
          topWeakAreas: [],
        },
      });
    }

    const avgOverall = Math.round(allRecords.reduce((sum, r) => sum + r.overallScore, 0) / totalStudents);
    const avgCoding = Math.round(allRecords.reduce((sum, r) => sum + (r.scoresBreakdown?.coding?.score || 0), 0) / totalStudents);
    const avgInterview = Math.round(allRecords.reduce((sum, r) => sum + (r.scoresBreakdown?.interview?.score || 0), 0) / totalStudents);
    const avgResume = Math.round(allRecords.reduce((sum, r) => sum + (r.scoresBreakdown?.resume?.score || 0), 0) / totalStudents);

    const weakMap = new Map();
    allRecords.forEach((r) => {
      (r.weakAreas || []).forEach((w) => {
        weakMap.set(w, (weakMap.get(w) || 0) + 1);
      });
    });

    const topWeakAreas = Array.from(weakMap.entries())
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        totalStudents,
        averageReadinessScore: avgOverall,
        averageCodingScore: avgCoding,
        averageInterviewScore: avgInterview,
        averageResumeScore: avgResume,
        topWeakAreas,
      },
    });
  } catch (error) {
    console.error('Admin readiness aggregate error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching admin aggregate analytics' });
  }
};

module.exports = {
  getPlacementReadiness,
  recalculatePlacementReadiness,
  getScoreBreakdown,
  getReadinessTrend,
  getSkillsMatrix,
  getRoleReadiness,
  getRecommendations,
  getAdminReadinessAggregate,
};

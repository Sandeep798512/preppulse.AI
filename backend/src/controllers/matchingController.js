const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const ResumeJobMatch = require('../models/ResumeJobMatch');
const { calculateResumeJobMatch } = require('../services/matchingEngine');

// @desc    Compare Resume vs Job Description using 5-Factor Engine
// @route   POST /api/matching/analyze
// @access  Private
const analyzeMatch = async (req, res) => {
  try {
    const { resumeId, jobDescriptionId } = req.body;

    if (!resumeId || !jobDescriptionId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both resumeId and jobDescriptionId for comparison.',
        code: 'MISSING_PARAMETERS',
      });
    }

    // 1. Verify Resume ownership
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume document not found or access denied.',
        code: 'RESUME_NOT_FOUND',
      });
    }

    // 2. Verify JobDescription ownership
    const job = await JobDescription.findOne({ _id: jobDescriptionId, userId: req.user._id });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job Description document not found or access denied.',
        code: 'JD_NOT_FOUND',
      });
    }

    // 3. Calculate 5-Factor Match
    const matchFindings = calculateResumeJobMatch(resume, job);

    // 4. Save to MongoDB
    const matchDoc = await ResumeJobMatch.create({
      userId: req.user._id,
      resumeId: resume._id,
      jobDescriptionId: job._id,
      factorScores: matchFindings.factorScores,
      overallScore: matchFindings.overallScore,
      matchLevel: matchFindings.matchLevel,
      applicationDecision: matchFindings.applicationDecision,
      matchedSkills: matchFindings.matchedSkills,
      partialSkills: matchFindings.partialSkills,
      missingRequiredSkills: matchFindings.missingRequiredSkills,
      missingPreferredSkills: matchFindings.missingPreferredSkills,
      qualificationMatches: matchFindings.qualificationMatches,
      qualificationGaps: matchFindings.qualificationGaps,
      matchedProjects: matchFindings.matchedProjects,
      matchedExperience: matchFindings.matchedExperience,
      relevantResumeSections: matchFindings.relevantResumeSections,
      criticalActions: matchFindings.criticalActions,
      recommendedSkills: matchFindings.recommendedSkills,
      preparationSuggestions: matchFindings.preparationSuggestions,
    });

    res.status(201).json({
      success: true,
      message: 'Resume vs JD Compatibility Analysis completed.',
      match: matchDoc,
    });
  } catch (error) {
    console.error('Matching Engine Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Unable to calculate Resume vs JD compatibility score',
      code: 'MATCHING_FAILED',
    });
  }
};

// @desc    Get user's saved match reports
// @route   GET /api/matching
// @access  Private
const getUserMatches = async (req, res) => {
  try {
    const matches = await ResumeJobMatch.find({ userId: req.user._id })
      .populate('resumeId', 'originalFileName resumeScore')
      .populate('jobDescriptionId', 'title company')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve match reports' });
  }
};

// @desc    Get single match report by ID
// @route   GET /api/matching/:id
// @access  Private
const getMatchById = async (req, res) => {
  try {
    const match = await ResumeJobMatch.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('resumeId')
      .populate('jobDescriptionId');

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match report not found' });
    }

    res.json({ success: true, match });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch match report' });
  }
};

// @desc    Delete single match report
// @route   DELETE /api/matching/:id
// @access  Private
const deleteMatch = async (req, res) => {
  try {
    const match = await ResumeJobMatch.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match report not found or access denied' });
    }

    res.json({ success: true, message: 'Match report deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete match report' });
  }
};

module.exports = {
  analyzeMatch,
  getUserMatches,
  getMatchById,
  deleteMatch,
};

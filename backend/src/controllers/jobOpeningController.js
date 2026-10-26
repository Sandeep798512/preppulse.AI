const JobOpening = require('../models/JobOpening');
const Company = require('../models/Company');
const JobPreparationPlan = require('../models/JobPreparationPlan');
const { evaluateEligibility } = require('../services/eligibilityEngine');
const { calculateCompanyReadiness } = require('../services/companyReadinessEngine');
const { generateJobPreparationPlan } = require('../services/placementIntelligenceService');
const { calculateSkillGaps } = require('../services/skillGapService');

/**
 * GET /api/jobs
 * Search, filter, & list jobs with eligibility & preparation readiness evaluation
 */
const getJobOpenings = async (req, res, next) => {
  try {
    const { role, location, workMode, source, difficulty, sortBy, search } = req.query;

    const filter = { status: 'Published' };

    // Automatically check for expired jobs
    const now = new Date();
    await JobOpening.updateMany({ deadline: { $lt: now }, status: 'Published' }, { status: 'Expired' });

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) filter.role = { $regex: role, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (workMode) filter.workMode = workMode;
    if (source) filter.source = source;

    let sort = { createdAt: -1 };
    if (sortBy === 'Deadline') sort = { deadline: 1 };
    if (sortBy === 'Salary') sort = { salaryMax: -1 };

    const jobs = await JobOpening.find(filter).populate('companyId').sort(sort);

    // Evaluate student's eligibility & preparation score for each job
    const user = req.user;
    const enrichedJobs = [];

    for (const job of jobs) {
      const eligibility = evaluateEligibility(user, job);
      const readiness = await calculateCompanyReadiness(user, job);

      enrichedJobs.push({
        ...job.toObject(),
        eligibilityStatus: eligibility.status,
        eligibilityExplanations: eligibility.explanations,
        preparationReadinessScore: readiness.companyReadinessScore,
        readinessStatus: readiness.status,
        topGaps: readiness.topGaps,
      });
    }

    if (sortBy === 'Readiness') {
      enrichedJobs.sort((a, b) => b.preparationReadinessScore - a.preparationReadinessScore);
    } else if (sortBy === 'Best Match') {
      enrichedJobs.sort((a, b) => (b.preparationReadinessScore + (b.eligibilityStatus === 'Eligible' ? 20 : 0)) - (a.preparationReadinessScore + (a.eligibilityStatus === 'Eligible' ? 20 : 0)));
    }

    res.json({
      success: true,
      count: enrichedJobs.length,
      data: enrichedJobs,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/jobs/:id
 */
const getJobOpeningById = async (req, res, next) => {
  try {
    const job = await JobOpening.findById(req.params.id).populate('companyId');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job opening not found' });
    }

    const eligibility = evaluateEligibility(req.user, job);
    const readiness = await calculateCompanyReadiness(req.user, job);
    const skillGapData = await calculateSkillGaps(req.user, job.role);

    res.json({
      success: true,
      data: {
        job,
        eligibility,
        readiness,
        skillGaps: skillGapData.gaps,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/jobs
 * Create a new job opening (Admin or User added)
 */
const createJobOpening = async (req, res, next) => {
  try {
    const {
      companyId,
      companyName,
      title,
      role,
      description,
      location,
      workMode,
      employmentType,
      salaryMin,
      salaryMax,
      requiredSkills,
      preferredSkills,
      eligibilityCriteria,
      applicationUrl,
      deadline,
      source,
    } = req.body;

    let targetCompanyId = companyId;
    if (!targetCompanyId && companyName) {
      const normalizedName = companyName.toLowerCase().trim();
      let company = await Company.findOne({ normalizedName });
      if (!company) {
        company = await Company.create({
          name: companyName.trim(),
          normalizedName,
          createdBy: req.user._id,
        });
      }
      targetCompanyId = company._id;
    }

    if (!targetCompanyId) {
      return res.status(400).json({ success: false, message: 'Company ID or Company Name is required' });
    }

    const job = await JobOpening.create({
      companyId: targetCompanyId,
      title: title || `${role} Opening`,
      role: role || 'Software Developer',
      description: description || 'Software Developer placement opportunity.',
      location: location || 'Pan India / Remote',
      workMode: workMode || 'Hybrid',
      employmentType: employmentType || 'Full-time',
      salaryMin: Number(salaryMin) || 0,
      salaryMax: Number(salaryMax) || 0,
      requiredSkills: requiredSkills || ['JavaScript', 'DSA', 'SQL'],
      preferredSkills: preferredSkills || ['React', 'Node.js'],
      eligibilityCriteria: eligibilityCriteria || {},
      applicationUrl: applicationUrl || '',
      deadline: deadline ? new Date(deadline) : new Date(Date.now() + 30 * 86400000),
      source: source || 'Campus Placement',
      status: 'Published',
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Job opening published successfully',
      data: job,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/jobs/:id/eligibility
 */
const getJobEligibility = async (req, res, next) => {
  try {
    const job = await JobOpening.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job opening not found' });
    const eligibility = evaluateEligibility(req.user, job);
    res.json({ success: true, data: eligibility });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/jobs/:id/readiness
 */
const getJobReadiness = async (req, res, next) => {
  try {
    const job = await JobOpening.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job opening not found' });
    const readiness = await calculateCompanyReadiness(req.user, job);
    res.json({ success: true, data: readiness });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/jobs/:id/preparation/generate
 */
const triggerJobPreparationPlan = async (req, res, next) => {
  try {
    const job = await JobOpening.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job opening not found' });
    const plan = await generateJobPreparationPlan(req.user, job);
    res.json({
      success: true,
      message: 'Company-specific 14-day preparation plan generated successfully!',
      data: plan,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/jobs/:id/preparation
 */
const getJobPreparationPlan = async (req, res, next) => {
  try {
    let plan = await JobPreparationPlan.findOne({ userId: req.user._id, jobId: req.params.id, status: 'active' });
    if (!plan) {
      const job = await JobOpening.findById(req.params.id);
      if (!job) return res.status(404).json({ success: false, message: 'Job opening not found' });
      plan = await generateJobPreparationPlan(req.user, job);
    }
    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getJobOpenings,
  getJobOpeningById,
  createJobOpening,
  getJobEligibility,
  getJobReadiness,
  triggerJobPreparationPlan,
  getJobPreparationPlan,
};

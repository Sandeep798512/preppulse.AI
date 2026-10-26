const JobApplication = require('../models/JobApplication');
const ApplicationEvent = require('../models/ApplicationEvent');
const JobOpening = require('../models/JobOpening');

/**
 * GET /api/applications
 * Fetch all tracked applications for logged-in user
 */
const getApplications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const applications = await JobApplication.find(filter)
      .populate('jobId companyId resumeVersionId')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/applications
 * Track new application (Checks for duplicates!)
 */
const createApplication = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { jobId, companyId, status, resumeVersionId, coverLetter, notes, nextAction, nextActionDate, source } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job Opening ID is required' });
    }

    // Duplicate Application Protection Check
    const existing = await JobApplication.findOne({ userId, jobId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You are already tracking an application for this job opening.',
        data: existing,
      });
    }

    const job = await JobOpening.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job opening not found' });
    }

    const applicationStatus = status || 'Saved';

    const application = await JobApplication.create({
      userId,
      jobId,
      companyId: companyId || job.companyId,
      status: applicationStatus,
      appliedAt: applicationStatus === 'Applied' ? new Date() : null,
      source: source || job.source || 'Campus Placement',
      resumeVersionId: resumeVersionId || null,
      coverLetter: coverLetter || '',
      notes: notes || '',
      nextAction: nextAction || '',
      nextActionDate: nextActionDate ? new Date(nextActionDate) : null,
    });

    // Create initial timeline audit event
    await ApplicationEvent.create({
      applicationId: application._id,
      userId,
      previousStatus: '',
      newStatus: applicationStatus,
      notes: `Application record created with status: ${applicationStatus}`,
    });

    res.status(201).json({
      success: true,
      message: 'Application tracked successfully!',
      data: application,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/applications/:id
 */
const getApplicationById = async (req, res, next) => {
  try {
    const application = await JobApplication.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('jobId companyId resumeVersionId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const timeline = await ApplicationEvent.find({ applicationId: application._id }).sort({ timestamp: -1 });

    res.json({
      success: true,
      data: {
        application,
        timeline,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/applications/:id
 * Update status/notes/offer details (Logs ApplicationEvent on status change)
 */
const updateApplication = async (req, res, next) => {
  try {
    const application = await JobApplication.findOne({ _id: req.params.id, userId: req.user._id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const previousStatus = application.status;
    const { status, notes, rejectionReason, offerStatus, salaryOffered, joiningDate, nextAction, nextActionDate } = req.body;

    if (status) application.status = status;
    if (notes !== undefined) application.notes = notes;
    if (rejectionReason) application.rejectionReason = rejectionReason;
    if (offerStatus) application.offerStatus = offerStatus;
    if (salaryOffered) application.salaryOffered = Number(salaryOffered);
    if (joiningDate) application.joiningDate = new Date(joiningDate);
    if (nextAction !== undefined) application.nextAction = nextAction;
    if (nextActionDate) application.nextActionDate = new Date(nextActionDate);

    if (status === 'Applied' && !application.appliedAt) {
      application.appliedAt = new Date();
    }

    await application.save();

    // Log status change timeline event if status changed
    if (status && status !== previousStatus) {
      await ApplicationEvent.create({
        applicationId: application._id,
        userId: req.user._id,
        previousStatus,
        newStatus: status,
        notes: req.body.eventNotes || `Status updated from ${previousStatus} to ${status}`,
      });
    }

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: application,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/applications/:id
 */
const deleteApplication = async (req, res, next) => {
  try {
    const application = await JobApplication.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    await ApplicationEvent.deleteMany({ applicationId: req.params.id });

    res.json({
      success: true,
      message: 'Application untracked successfully',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/applications/upcoming
 * Fetch upcoming deadlines and follow-up actions
 */
const getUpcomingActions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const upcomingFollowUps = await JobApplication.find({
      userId,
      nextActionDate: { $gte: now },
    }).populate('jobId companyId').sort({ nextActionDate: 1 }).limit(5);

    res.json({
      success: true,
      data: {
        upcomingFollowUps,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getApplications,
  createApplication,
  getApplicationById,
  updateApplication,
  deleteApplication,
  getUpcomingActions,
};

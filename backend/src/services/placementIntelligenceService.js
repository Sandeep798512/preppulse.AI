const JobOpening = require('../models/JobOpening');
const Company = require('../models/Company');
const JobApplication = require('../models/JobApplication');
const ApplicationEvent = require('../models/ApplicationEvent');
const JobPreparationPlan = require('../models/JobPreparationPlan');
const { evaluateEligibility } = require('./eligibilityEngine');
const { calculateCompanyReadiness } = require('./companyReadinessEngine');
const { mapSkillToPlatformRoute } = require('./recommendationService');
const { calculateSkillGaps } = require('./skillGapService');

/**
 * Fetch Application Funnel & Analytics
 */
const getApplicationAnalytics = async (userId) => {
  const applications = await JobApplication.find({ userId }).populate('jobId companyId');

  const total = applications.length;

  const countByStatus = {
    Saved: 0,
    'Planning to Apply': 0,
    Applied: 0,
    Assessment: 0,
    'Technical Interview': 0,
    'HR Interview': 0,
    'Final Round': 0,
    Selected: 0,
    Rejected: 0,
    Withdrawn: 0,
    'On Hold': 0,
    'Offer Received': 0,
    Joined: 0,
  };

  const rejectionsByReason = {
    Eligibility: 0,
    Resume: 0,
    Aptitude: 0,
    Coding: 0,
    'Technical Interview': 0,
    Communication: 0,
    HR: 0,
    Other: 0,
    Unknown: 0,
  };

  applications.forEach((app) => {
    if (countByStatus[app.status] !== undefined) {
      countByStatus[app.status]++;
    }
    if (app.status === 'Rejected') {
      const reason = app.rejectionReason || 'Unknown';
      rejectionsByReason[reason] = (rejectionsByReason[reason] || 0) + 1;
    }
  });

  const appliedCount = total - countByStatus.Saved - countByStatus['Planning to Apply'];
  const assessmentCount = countByStatus.Assessment + countByStatus['Technical Interview'] + countByStatus['HR Interview'] + countByStatus['Final Round'] + countByStatus.Selected + countByStatus['Offer Received'] + countByStatus.Joined;
  const interviewCount = countByStatus['Technical Interview'] + countByStatus['HR Interview'] + countByStatus['Final Round'] + countByStatus.Selected + countByStatus['Offer Received'] + countByStatus.Joined;
  const offerCount = countByStatus.Selected + countByStatus['Offer Received'] + countByStatus.Joined;

  const appliedToAssessmentRate = appliedCount > 0 ? Math.round((assessmentCount / appliedCount) * 100) : 0;
  const assessmentToInterviewRate = assessmentCount > 0 ? Math.round((interviewCount / assessmentCount) * 100) : 0;
  const interviewToOfferRate = interviewCount > 0 ? Math.round((offerCount / interviewCount) * 100) : 0;

  let mostCommonRejectionReason = 'None';
  let maxRejections = 0;
  Object.entries(rejectionsByReason).forEach(([reason, cnt]) => {
    if (cnt > maxRejections && reason !== 'None') {
      maxRejections = cnt;
      mostCommonRejectionReason = reason;
    }
  });

  return {
    totalApplications: total,
    activeApplicationsCount: appliedCount - countByStatus.Rejected - countByStatus.Withdrawn,
    countByStatus,
    funnel: [
      { stage: 'Saved', count: countByStatus.Saved },
      { stage: 'Applied', count: appliedCount },
      { stage: 'Assessment', count: assessmentCount },
      { stage: 'Interview', count: interviewCount },
      { stage: 'Offers / Selected', count: offerCount },
    ],
    conversionRates: {
      appliedToAssessmentRate,
      assessmentToInterviewRate,
      interviewToOfferRate,
    },
    rejectionAnalysis: {
      totalRejections: countByStatus.Rejected,
      mostCommonRejectionReason,
      rejectionsByReason,
      hasSufficientData: total >= 3,
    },
  };
};

/**
 * Compare up to 3 Jobs Side-by-Side
 */
const compareJobs = async (user, jobIds) => {
  const jobs = await JobOpening.find({ _id: { $in: jobIds } }).populate('companyId');
  const userApps = await JobApplication.find({ userId: user._id, jobId: { $in: jobIds } });

  const appMap = new Map();
  userApps.forEach((a) => appMap.set(a.jobId.toString(), a));

  const comparison = [];

  for (const job of jobs) {
    const eligibility = evaluateEligibility(user, job);
    const readiness = await calculateCompanyReadiness(user, job);
    const existingApp = appMap.get(job._id.toString());

    comparison.push({
      jobId: job._id,
      title: job.title,
      companyName: job.companyId?.name || 'Company',
      location: job.location,
      workMode: job.workMode,
      salaryRange: job.salaryMax > 0 ? `₹${job.salaryMin / 100000}L - ₹${job.salaryMax / 100000}L PA` : 'Not specified',
      eligibilityStatus: eligibility.status,
      preparationReadinessScore: readiness.companyReadinessScore,
      topGap: readiness.topGaps[0]?.skill || 'DSA',
      deadline: job.deadline,
      applicationStatus: existingApp ? existingApp.status : 'Not Applied',
    });
  }

  return comparison;
};

/**
 * Generate 14-Day Company-Specific Preparation Plan
 */
const generateJobPreparationPlan = async (user, job) => {
  const userId = user._id;

  // Archive previous active plan for this job
  await JobPreparationPlan.updateMany({ userId, jobId: job._id, status: 'active' }, { status: 'archived' });

  const readiness = await calculateCompanyReadiness(user, job);
  const reqSkills = job.requiredSkills?.length ? job.requiredSkills : ['DSA', 'Java', 'SQL', 'OOP'];

  const tasks = [];
  const totalDays = 14;

  for (let day = 1; day <= totalDays; day++) {
    const skillName = reqSkills[(day - 1) % reqSkills.length];
    let taskType = day % 3 === 1 ? 'QUIZ' : day % 3 === 2 ? 'CODE' : 'INTERVIEW';
    const routeInfo = mapSkillToPlatformRoute(skillName, taskType);

    tasks.push({
      dayNumber: day,
      title: `Day ${day}: ${taskType === 'CODE' ? 'Solve' : taskType === 'QUIZ' ? 'Practice' : 'Prepare'} ${skillName} for ${job.companyId?.name || 'Company'}`,
      description: `Targeted ${job.role} preparation task for ${skillName}.`,
      type: taskType,
      skill: skillName,
      relatedModule: routeInfo.module,
      relatedRoute: routeInfo.route,
      estimatedMinutes: 45,
      completed: false,
    });
  }

  const startDate = new Date();
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 14);

  const plan = await JobPreparationPlan.create({
    userId,
    jobId: job._id,
    companyId: job.companyId._id || job.companyId,
    version: 1,
    startDate,
    targetDate,
    preparationReadinessScore: readiness.companyReadinessScore,
    skillPriorities: readiness.topGaps,
    tasks,
    overallProgress: 0,
    status: 'active',
  });

  return plan;
};

module.exports = {
  getApplicationAnalytics,
  compareJobs,
  generateJobPreparationPlan,
};

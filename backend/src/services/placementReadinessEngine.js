const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const ResumeJobMatch = require('../models/ResumeJobMatch');
const QuizAttempt = require('../models/QuizAttempt');
const CodingSubmission = require('../models/CodingSubmission');
const CodingProblem = require('../models/CodingProblem');
const InterviewSession = require('../models/InterviewSession');
const InterviewAnalysis = require('../models/InterviewAnalysis');
const PlacementReadiness = require('../models/PlacementReadiness');
const PlacementReadinessSnapshot = require('../models/PlacementReadinessSnapshot');
const { calculateInterviewPerformance } = require('./ai/aiInterviewAnalysisEngine');

const {
  SCORING_VERSION,
  WEIGHTS,
  MINIMUM_REQUIREMENTS,
  ROLE_SKILL_REQUIREMENTS,
} = require('../config/readinessConfig');

/**
 * Calculate complete Placement Readiness profile for a user
 */
const calculatePlacementReadiness = async (user) => {
  const userId = user._id;

  // 1. Fetch module readiness scores (0-100)
  const resumeData = await fetchResumeScore(userId);
  const jobMatchData = await fetchJobMatchScore(userId);
  const aptitudeData = await fetchAptitudeScore(userId);
  const technicalData = await fetchTechnicalScore(userId);
  const codingData = await fetchCodingScore(userId);
  const interviewData = await fetchInterviewScore(userId);
  const commData = await fetchCommunicationScore(userId);

  // 2. Compute Data Coverage & Confidence Level
  const evidenceModules = [
    resumeData.hasEvidence,
    jobMatchData.hasEvidence,
    aptitudeData.hasEvidence,
    technicalData.hasEvidence,
    codingData.hasEvidence,
    interviewData.hasEvidence,
    commData.hasEvidence,
  ];

  const evidenceCount = evidenceModules.filter(Boolean).length;
  const dataCoveragePercentage = Math.round((evidenceCount / 7) * 100);

  let confidenceLevel = 'Medium Confidence';
  if (dataCoveragePercentage >= 80) confidenceLevel = 'High Confidence';
  else if (dataCoveragePercentage < 50) confidenceLevel = 'Low Confidence';

  // 3. Explainable Scores Breakdown Calculation
  const resumeScore = resumeData.score;
  const jobMatchScore = jobMatchData.score;
  const aptitudeScore = aptitudeData.score;
  const technicalScore = technicalData.score;
  const codingScore = codingData.score;
  const interviewScore = interviewData.score;
  const communicationScore = commData.score;

  const resumeContrib = Number((resumeScore * WEIGHTS.resumeScore).toFixed(2));
  const jobMatchContrib = Number((jobMatchScore * WEIGHTS.jobMatchScore).toFixed(2));
  const aptitudeContrib = Number((aptitudeScore * WEIGHTS.aptitudeScore).toFixed(2));
  const technicalContrib = Number((technicalScore * WEIGHTS.technicalScore).toFixed(2));
  const codingContrib = Number((codingScore * WEIGHTS.codingScore).toFixed(2));
  const interviewContrib = Number((interviewScore * WEIGHTS.interviewScore).toFixed(2));
  const commContrib = Number((communicationScore * WEIGHTS.communicationScore).toFixed(2));

  // Deterministic Overall Score
  const rawOverall = Math.round(
    resumeContrib +
      jobMatchContrib +
      aptitudeContrib +
      technicalContrib +
      codingContrib +
      interviewContrib +
      commContrib
  );

  const overallScore = Math.min(100, Math.max(0, rawOverall));

  // Score Interpretation
  let scoreInterpretation = 'Good Preparation';
  if (overallScore >= 90) scoreInterpretation = 'Placement Ready';
  else if (overallScore >= 80) scoreInterpretation = 'Highly Prepared';
  else if (overallScore >= 70) scoreInterpretation = 'Good Preparation';
  else if (overallScore >= 60) scoreInterpretation = 'Needs Improvement';
  else if (overallScore >= 40) scoreInterpretation = 'Underprepared';
  else scoreInterpretation = 'Significant Preparation Required';

  const scoresBreakdown = {
    resume: { score: resumeScore, weight: WEIGHTS.resumeScore, contribution: resumeContrib, status: resumeData.hasEvidence ? 'Sufficient Data' : 'Limited Data' },
    jobMatch: { score: jobMatchScore, weight: WEIGHTS.jobMatchScore, contribution: jobMatchContrib, status: jobMatchData.hasEvidence ? 'Sufficient Data' : 'No Target JD' },
    aptitude: { score: aptitudeScore, weight: WEIGHTS.aptitudeScore, contribution: aptitudeContrib, status: aptitudeData.hasEvidence ? 'Sufficient Data' : 'Limited Attempts' },
    technical: { score: technicalScore, weight: WEIGHTS.technicalScore, contribution: technicalContrib, status: technicalData.hasEvidence ? 'Sufficient Data' : 'Limited Quizzes' },
    coding: { score: codingScore, weight: WEIGHTS.codingScore, contribution: codingContrib, status: codingData.hasEvidence ? 'Sufficient Data' : 'Limited Solved' },
    interview: { score: interviewScore, weight: WEIGHTS.interviewScore, contribution: interviewContrib, status: interviewData.hasEvidence ? 'Sufficient Data' : 'Limited Interviews' },
    communication: { score: communicationScore, weight: WEIGHTS.communicationScore, contribution: commContrib, status: commData.hasEvidence ? 'Sufficient Data' : 'Limited Evidence' },
  };

  // 4. Unified Skill Matrix & Skill Gaps
  const studentSkills = new Set([...(user.skills || []), ...(resumeData.skills || [])]);
  const skillMatrix = [];
  const strongAreas = [];
  const weakAreas = [];

  studentSkills.forEach((sk) => {
    let level = 'Moderate';
    if (codingData.topicsCovered?.has(sk) || technicalScore >= 75) {
      level = 'Strong';
      strongAreas.push(sk);
    } else if (aptitudeScore < 60 || technicalScore < 60) {
      level = 'Weak';
      weakAreas.push(sk);
    }
    skillMatrix.push({ skill: sk, level });
  });

  if (weakAreas.length === 0) {
    if (aptitudeScore < 65) weakAreas.push('Quantitative Aptitude');
    if (codingScore < 65) weakAreas.push('Data Structures & Algorithms');
    if (interviewScore < 65) weakAreas.push('STAR Method Project Explanation');
  }

  // 5. Target Role Readiness & Skill Gap Engine
  const userTargetRoles = user.targetRoles?.length ? user.targetRoles : ['Software Developer', 'Full Stack Developer'];
  const targetRolesReadiness = [];
  const criticalGaps = [];

  userTargetRoles.forEach((role) => {
    const required = ROLE_SKILL_REQUIREMENTS[role] || ROLE_SKILL_REQUIREMENTS['Software Developer'];
    const missing = [];
    let matchCount = 0;

    required.forEach((reqSkill) => {
      const match = Array.from(studentSkills).some(
        (sk) => sk.toLowerCase().trim() === reqSkill.toLowerCase().trim()
      );
      if (match) matchCount++;
      else missing.push(reqSkill);
    });

    const roleSkillScore = Math.round((matchCount / required.length) * 100);
    const roleOverallScore = Math.round(overallScore * 0.6 + roleSkillScore * 0.4);

    targetRolesReadiness.push({
      role,
      score: roleOverallScore,
      requiredSkills: required,
      missingSkills: missing,
    });

    if (missing.length > 0) {
      criticalGaps.push({
        gap: `Missing key skills for ${role}: ${missing.slice(0, 3).join(', ')}`,
        role,
        severity: missing.length >= 3 ? 'Critical' : 'High',
      });
    }
  });

  // 6. Actionable Recommendations & Priority System
  const recommendations = [];
  if (codingScore < 65) {
    recommendations.push({
      priority: 'Critical',
      action: 'Solve 5 Medium DSA coding problems (Arrays & Two Pointers)',
      module: 'coding',
      estimatedMinutes: 60,
    });
  }
  if (aptitudeScore < 65) {
    recommendations.push({
      priority: 'High',
      action: 'Complete 2 Quantitative Aptitude timed quizzes',
      module: 'aptitude',
      estimatedMinutes: 30,
    });
  }
  if (interviewScore < 65) {
    recommendations.push({
      priority: 'High',
      action: 'Take a 15-minute Technical Mock Interview session',
      module: 'interview',
      estimatedMinutes: 20,
    });
  }
  if (resumeScore < 70) {
    recommendations.push({
      priority: 'Medium',
      action: 'Update Resume skills & project bullet points with measurable impact',
      module: 'resume',
      estimatedMinutes: 30,
    });
  }
  if (jobMatchScore < 60) {
    recommendations.push({
      priority: 'Medium',
      action: 'Analyze a target Job Description to generate skill gap compatibility scorecard',
      module: 'matching',
      estimatedMinutes: 15,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'Low',
      action: 'Maintain peak placement readiness with a mixed mock interview drive',
      module: 'interview',
      estimatedMinutes: 30,
    });
  }

  // 7. 7-Day Weekly Preparation Schedule
  const weeklyPlan = [
    { day: 'Monday', task: 'Solve 3 Arrays & HashMap coding problems', module: 'coding', completed: false },
    { day: 'Tuesday', task: 'Take 1 Technical MCQ Quiz on DBMS & SQL', module: 'technical', completed: false },
    { day: 'Wednesday', task: 'Review & optimize Resume ATS compatibility score', module: 'resume', completed: false },
    { day: 'Thursday', task: 'Attempt 1 HR & Behavioral Mock Interview', module: 'interview', completed: false },
    { day: 'Friday', task: 'Take 1 Quantitative Aptitude practice quiz', module: 'aptitude', completed: false },
    { day: 'Saturday', task: 'Conduct 1 Full-length Mixed Mock Placement Drive', module: 'interview', completed: false },
    { day: 'Sunday', task: 'Review weak topic reports and re-test weak areas', module: 'analytics', completed: false },
  ];

  // 8. Save or Update materialized PlacementReadiness document
  let readinessDoc = await PlacementReadiness.findOne({ userId });
  const payload = {
    userId,
    scoringVersion: SCORING_VERSION,
    overallScore,
    scoreInterpretation,
    dataCoveragePercentage,
    confidenceLevel,
    scoresBreakdown,
    skillMatrix,
    criticalGaps,
    targetRolesReadiness,
    recommendations,
    weeklyPlan,
    strongAreas,
    weakAreas,
    lastCalculatedAt: new Date(),
  };

  if (readinessDoc) {
    Object.assign(readinessDoc, payload);
    await readinessDoc.save();
  } else {
    readinessDoc = await PlacementReadiness.create(payload);
  }

  // 9. Save snapshot for historical trend tracking
  await PlacementReadinessSnapshot.create({
    userId,
    scoringVersion: SCORING_VERSION,
    overallScore,
    resumeScore,
    jobMatchScore,
    aptitudeScore,
    technicalScore,
    codingScore,
    interviewScore,
    communicationScore,
    dataCoveragePercentage,
  });

  return readinessDoc;
};

// ============================================================================
// MODULE EVIDENCE & SCORE FETCHERS
// ============================================================================

async function fetchResumeScore(userId) {
  const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
  if (!resume) {
    return { score: 60, hasEvidence: false, skills: [] };
  }
  const score = resume.resumeScore || resume.atsCompatibilityScore || 75;
  return { score, hasEvidence: true, skills: resume.skills || [] };
}

async function fetchJobMatchScore(userId) {
  const match = await ResumeJobMatch.findOne({ userId }).sort({ createdAt: -1 });
  if (!match) {
    return { score: 50, hasEvidence: false };
  }
  return { score: match.overallMatchScore || 65, hasEvidence: true };
}

async function fetchAptitudeScore(userId) {
  const attempts = await QuizAttempt.find({ userId, category: 'aptitude' });
  if (attempts.length === 0) {
    return { score: 50, hasEvidence: false };
  }
  const avgPct = Math.round(
    attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length
  );
  return { score: avgPct, hasEvidence: attempts.length >= MINIMUM_REQUIREMENTS.minQuizzes };
}

async function fetchTechnicalScore(userId) {
  const attempts = await QuizAttempt.find({ userId, category: 'technical' });
  if (attempts.length === 0) {
    return { score: 50, hasEvidence: false };
  }
  const avgPct = Math.round(
    attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length
  );
  return { score: avgPct, hasEvidence: attempts.length >= MINIMUM_REQUIREMENTS.minQuizzes };
}

async function fetchCodingScore(userId) {
  const subs = await CodingSubmission.find({ userId }).populate('problem', 'difficulty topics');
  if (subs.length === 0) {
    return { score: 50, hasEvidence: false, topicsCovered: new Set() };
  }

  const solvedIds = new Set();
  const topicsCovered = new Set();
  let easy = 0, medium = 0, hard = 0;

  subs.forEach((s) => {
    if (s.status === 'Accepted' && s.problem) {
      solvedIds.add(s.problem._id.toString());
      if (s.problem.difficulty === 'Easy') easy++;
      else if (s.problem.difficulty === 'Medium') medium++;
      else if (s.problem.difficulty === 'Hard') hard++;
      if (s.problem.topics) s.problem.topics.forEach((t) => topicsCovered.add(t));
    }
  });

  const easyScore = Math.min(25, (easy / 5) * 25);
  const mediumScore = Math.min(45, (medium / 5) * 45);
  const hardScore = Math.min(15, (hard / 2) * 15);
  const topicScore = Math.min(15, (topicsCovered.size / 5) * 15);

  const rawScore = Math.round(easyScore + mediumScore + hardScore + topicScore);
  const score = Math.min(100, Math.max(0, rawScore));

  return {
    score: score || 50,
    hasEvidence: subs.length >= MINIMUM_REQUIREMENTS.minCodingProblems,
    topicsCovered,
  };
}

async function fetchInterviewScore(userId) {
  const perf = await calculateInterviewPerformance(userId);
  if (perf.totalInterviews === 0) {
    return { score: 50, hasEvidence: false };
  }
  return {
    score: perf.averageScore || 50,
    hasEvidence: perf.totalInterviews >= MINIMUM_REQUIREMENTS.minInterviews,
  };
}

async function fetchCommunicationScore(userId) {
  const analysis = await InterviewAnalysis.findOne({ userId, analysisStatus: 'completed' }).sort({ createdAt: -1 });
  if (!analysis) {
    return { score: 60, hasEvidence: false };
  }
  const commScore = analysis.metricsBreakdown?.communicationScore || analysis.communicationAnalysis?.clarityScore * 10 || 70;
  return { score: commScore, hasEvidence: true };
}

module.exports = {
  calculatePlacementReadiness,
};

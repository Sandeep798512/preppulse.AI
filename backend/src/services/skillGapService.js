const { ROLE_SKILL_BENCHMARKS } = require('../config/roleSkillMapping');
const { calculatePlacementReadiness } = require('./placementReadinessEngine');
const QuizAttempt = require('../models/QuizAttempt');
const CodingSubmission = require('../models/CodingSubmission');
const InterviewSession = require('../models/InterviewSession');
const Resume = require('../models/Resume');
const ResumeJobMatch = require('../models/ResumeJobMatch');

/**
 * Calculate detailed skill gaps and evidence for a target role
 * Formula: gap = Math.max(0, targetScore - currentScore)
 * Priority:
 *   Critical: score < 40 AND High/Critical importance
 *   High: 40-59 OR High importance
 *   Medium: 60-74
 *   Low: 75+
 */
const calculateSkillGaps = async (user, targetRole = 'Software Developer') => {
  const userId = user._id;

  // 1. Fetch placement readiness module metrics
  const readiness = await calculatePlacementReadiness(user);
  const scoresBreakdown = readiness.scoresBreakdown || {};

  // 2. Fetch raw evidence counts from collections
  const quizAttempts = await QuizAttempt.find({ userId }).select('topic percentageScore createdAt');
  const codingSubmissions = await CodingSubmission.find({ userId, status: 'Accepted' }).populate('problemId', 'category tags difficulty');
  const interviewSessions = await InterviewSession.find({ userId, status: 'completed' }).select('averageScore role createdAt');
  const latestResume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
  const latestJobMatch = await ResumeJobMatch.findOne({ userId }).sort({ createdAt: -1 });

  // 3. Get target role benchmark definition
  const roleBenchmark = ROLE_SKILL_BENCHMARKS[targetRole] || ROLE_SKILL_BENCHMARKS['Software Developer'];
  const requiredSkills = roleBenchmark.requiredSkills;

  const gaps = [];

  for (const reqSkill of requiredSkills) {
    const skillName = reqSkill.name;
    const targetScore = reqSkill.targetScore;
    const importance = reqSkill.importance;
    const category = reqSkill.category;

    // Collect Evidence & calculate skill score
    let quizScore = 0;
    let quizCount = 0;
    quizAttempts.forEach((q) => {
      if (q.topic && q.topic.toLowerCase().includes(skillName.toLowerCase())) {
        quizScore += q.percentageScore || 0;
        quizCount++;
      }
    });
    const avgQuizScore = quizCount > 0 ? Math.round(quizScore / quizCount) : (scoresBreakdown.technical?.score || 50);

    let codingSolvedCount = 0;
    codingSubmissions.forEach((c) => {
      if (c.problemId && (c.problemId.category?.toLowerCase().includes(skillName.toLowerCase()) || c.problemId.tags?.some((t) => t.toLowerCase().includes(skillName.toLowerCase())))) {
        codingSolvedCount++;
      }
    });
    const avgCodingScore = codingSolvedCount > 0 ? Math.min(100, codingSolvedCount * 25 + 40) : (scoresBreakdown.coding?.score || 40);

    const isResumePresent = latestResume?.skills?.some((s) => s.toLowerCase().trim() === skillName.toLowerCase().trim()) || false;
    const resumeSkillScore = isResumePresent ? (latestResume.resumeScore || 70) : 40;

    const interviewSkillScore = scoresBreakdown.interview?.score || 50;

    // Weighted Skill Score Calculation
    let currentScore = Math.round(
      avgQuizScore * 0.3 + avgCodingScore * 0.3 + resumeSkillScore * 0.2 + interviewSkillScore * 0.2
    );
    currentScore = Math.min(100, Math.max(0, currentScore));

    // Calculate Gap (no negative gaps)
    const gap = Math.max(0, targetScore - currentScore);

    // Calculate Priority Engine Rule
    let priority = 'Low';
    if (currentScore < 40 && (importance === 'Critical' || importance === 'High')) {
      priority = 'Critical';
    } else if (currentScore < 60 || importance === 'High') {
      priority = 'High';
    } else if (currentScore < 75) {
      priority = 'Medium';
    } else {
      priority = 'Low';
    }

    gaps.push({
      skill: skillName,
      category,
      currentScore,
      targetScore,
      gap,
      priority,
      importance,
      evidence: {
        resumePresent: isResumePresent,
        resumeScore: resumeSkillScore,
        quizScore: avgQuizScore,
        codingSolved: codingSolvedCount,
        codingScore: avgCodingScore,
        interviewScore: interviewSkillScore,
        overallReadiness: readiness.overallScore,
      },
    });
  }

  // Sort gaps by priority & gap size
  const priorityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  gaps.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority] || b.gap - a.gap);

  return {
    targetRole,
    overallReadiness: readiness.overallScore,
    gaps,
    recommendedProjects: roleBenchmark.recommendedProjects || [],
  };
};

module.exports = {
  calculateSkillGaps,
};

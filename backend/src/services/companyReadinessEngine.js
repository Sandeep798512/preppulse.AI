const { calculatePlacementReadiness } = require('./placementReadinessEngine');
const { calculateSkillGaps } = require('./skillGapService');

const WEIGHTS = {
  resumeFit: 0.15,
  technicalSkills: 0.15,
  codingReadiness: 0.20,
  aptitudeReadiness: 0.10,
  interviewReadiness: 0.15,
  communication: 0.10,
  jdRoleMatch: 0.15,
};

/**
 * Calculate deterministic Company / Job Readiness score
 */
const calculateCompanyReadiness = async (user, jobOrCompany) => {
  const readiness = await calculatePlacementReadiness(user);
  const scores = readiness.scoresBreakdown || {};

  const targetRole = jobOrCompany?.role || 'Software Developer';
  const skillGapData = await calculateSkillGaps(user, targetRole);

  const resumeFit = scores.resume?.score || 50;
  const technicalSkills = scores.technical?.score || 50;
  const codingReadiness = scores.coding?.score || 40;
  const aptitudeReadiness = scores.aptitude?.score || 50;
  const interviewReadiness = scores.interview?.score || 50;
  const communication = scores.communication?.score || 50;
  const jdRoleMatch = scores.jobMatch?.score || 60;

  const rawScore = Math.round(
    resumeFit * WEIGHTS.resumeFit +
      technicalSkills * WEIGHTS.technicalSkills +
      codingReadiness * WEIGHTS.codingReadiness +
      aptitudeReadiness * WEIGHTS.aptitudeReadiness +
      interviewReadiness * WEIGHTS.interviewReadiness +
      communication * WEIGHTS.communication +
      jdRoleMatch * WEIGHTS.jdRoleMatch
  );

  const companyReadinessScore = Math.min(100, Math.max(0, rawScore));

  let status = 'Sufficient Data';
  if (readiness.dataCoveragePercentage < 50) {
    status = 'Limited Data';
  }

  return {
    companyReadinessScore,
    status,
    dataCoveragePercentage: readiness.dataCoveragePercentage,
    breakdown: {
      resumeFit: { score: resumeFit, weight: WEIGHTS.resumeFit },
      technicalSkills: { score: technicalSkills, weight: WEIGHTS.technicalSkills },
      codingReadiness: { score: codingReadiness, weight: WEIGHTS.codingReadiness },
      aptitudeReadiness: { score: aptitudeReadiness, weight: WEIGHTS.aptitudeReadiness },
      interviewReadiness: { score: interviewReadiness, weight: WEIGHTS.interviewReadiness },
      communication: { score: communication, weight: WEIGHTS.communication },
      jdRoleMatch: { score: jdRoleMatch, weight: WEIGHTS.jdRoleMatch },
    },
    topGaps: skillGapData.gaps.slice(0, 4),
  };
};

module.exports = {
  WEIGHTS,
  calculateCompanyReadiness,
};

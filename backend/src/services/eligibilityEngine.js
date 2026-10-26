/**
 * Deterministic Eligibility Engine for Phase 10
 * Evaluates student profile vs Job/Company eligibility requirements.
 * Returns: Eligible, Potentially Eligible, Not Eligible, Insufficient Information
 */
const evaluateEligibility = (user, jobOrCompany) => {
  const criteria = jobOrCompany?.eligibilityCriteria || {};
  const education = user?.education || {};
  const profile = user?.profile || {};

  const explanations = [];
  let isEligible = true;
  let hasWarning = false;
  let missingInfo = false;

  // 1. Degree & Branch Check
  const allowedBranches = criteria.allowedBranches || ['Computer Science & Engineering', 'Information Technology'];
  const userBranch = education.branch || '';

  if (!userBranch) {
    explanations.push({ criterion: 'Branch / Specialization', status: 'unknown', detail: 'Branch not specified in user profile' });
    missingInfo = true;
  } else {
    const branchMatch = allowedBranches.some((b) => b.toLowerCase().includes(userBranch.toLowerCase()) || userBranch.toLowerCase().includes(b.toLowerCase()));
    if (branchMatch) {
      explanations.push({ criterion: 'Branch Match', status: 'pass', detail: `Branch (${userBranch}) meets target criteria` });
    } else {
      explanations.push({ criterion: 'Branch Match', status: 'fail', detail: `Branch (${userBranch}) does not match allowed branches: ${allowedBranches.join(', ')}` });
      isEligible = false;
    }
  }

  // 2. Graduation Year Check
  const targetYear = criteria.graduationYear || 2026;
  const userGradYear = education.graduationYear;

  if (!userGradYear) {
    explanations.push({ criterion: 'Graduation Year', status: 'unknown', detail: 'Graduation year not set in profile' });
    missingInfo = true;
  } else if (userGradYear === targetYear) {
    explanations.push({ criterion: 'Graduation Year', status: 'pass', detail: `Batch ${userGradYear} matches target ${targetYear}` });
  } else {
    explanations.push({ criterion: 'Graduation Year', status: 'warn', detail: `Batch ${userGradYear} differs from target ${targetYear}` });
    hasWarning = true;
  }

  // 3. Minimum CGPA Check
  const minCGPA = criteria.minimumCGPA || criteria.minCGPA || 6.0;
  const userCGPA = education.cgpa || 0;

  if (userCGPA === 0) {
    explanations.push({ criterion: 'Minimum CGPA', status: 'unknown', detail: `Min ${minCGPA} CGPA required. Profile CGPA not updated.` });
    missingInfo = true;
  } else if (userCGPA >= minCGPA) {
    explanations.push({ criterion: 'Minimum CGPA', status: 'pass', detail: `CGPA ${userCGPA} meets minimum cutoff of ${minCGPA}` });
  } else {
    explanations.push({ criterion: 'Minimum CGPA', status: 'fail', detail: `CGPA ${userCGPA} is below required cutoff of ${minCGPA}` });
    isEligible = false;
  }

  // 4. Backlog Policy Check
  const backlogPolicy = criteria.backlogPolicy || 'No active backlog';
  const userBacklogs = education.backlogs ?? 0;

  if (backlogPolicy === 'Not specified') {
    explanations.push({ criterion: 'Backlog Policy', status: 'unknown', detail: 'Company backlog policy not specified' });
  } else if (backlogPolicy === 'No active backlog') {
    if (userBacklogs === 0) {
      explanations.push({ criterion: 'Backlog Policy', status: 'pass', detail: 'No active backlogs (0 Backlogs)' });
    } else {
      explanations.push({ criterion: 'Backlog Policy', status: 'fail', detail: `Active backlogs (${userBacklogs}) violate "No active backlog" policy` });
      isEligible = false;
    }
  } else if (backlogPolicy === 'Maximum 1 backlog') {
    if (userBacklogs <= 1) {
      explanations.push({ criterion: 'Backlog Policy', status: 'pass', detail: `Backlogs (${userBacklogs}) within max 1 limit` });
    } else {
      explanations.push({ criterion: 'Backlog Policy', status: 'fail', detail: `Backlogs (${userBacklogs}) exceed max 1 backlog policy` });
      isEligible = false;
    }
  } else {
    explanations.push({ criterion: 'Backlog Policy', status: 'pass', detail: `Backlogs allowed policy (${userBacklogs} backlogs)` });
  }

  // Final Overall Status Result
  let status = 'Eligible';
  if (!isEligible) {
    status = 'Not Eligible';
  } else if (missingInfo) {
    status = 'Insufficient Information';
  } else if (hasWarning) {
    status = 'Potentially Eligible';
  }

  return {
    status,
    isEligible,
    explanations,
  };
};

module.exports = {
  evaluateEligibility,
};

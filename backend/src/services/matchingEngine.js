const { evaluateSkillMatch, normalizeSkill } = require('../utils/skillDictionary');

/**
 * Deterministic 5-Factor Resume vs Job Description Matching Engine
 */
const calculateResumeJobMatch = (resume, jobDescription) => {
  const resumeSkills = (resume.skills || []).map(normalizeSkill);
  const resumeText = (resume.extractedText || '').toLowerCase();
  const resumeProjects = resume.projects || resume.parsedData?.projects || [];
  const resumeExp = resume.experience || resume.parsedData?.experience || [];

  const requiredSkills = (jobDescription.requiredSkills || []).map(normalizeSkill);
  const preferredSkills = (jobDescription.preferredSkills || []).map(normalizeSkill);
  const jdKeywords = (jobDescription.keywords || []).map(k => k.toLowerCase());
  const jdSoftSkills = (jobDescription.softSkills || []).map(s => s.toLowerCase());

  // FACTOR 1: Technical Skill Match (30% Weight)
  const matchedSkills = [];
  const partialSkills = [];
  const missingRequiredSkills = [];
  const missingPreferredSkills = [];

  let requiredScoreSum = 0;
  if (requiredSkills.length > 0) {
    requiredSkills.forEach((reqSkill) => {
      const evalRes = evaluateSkillMatch(reqSkill, resumeSkills);
      if (evalRes.matchType === 'EXACT') {
        matchedSkills.push(reqSkill);
        requiredScoreSum += 1.0;
      } else if (evalRes.matchType === 'RELATED') {
        partialSkills.push(`${reqSkill} (via ${evalRes.matchedWith})`);
        requiredScoreSum += evalRes.weight;
      } else {
        missingRequiredSkills.push(reqSkill);
      }
    });
  }

  let preferredScoreSum = 0;
  if (preferredSkills.length > 0) {
    preferredSkills.forEach((prefSkill) => {
      const evalRes = evaluateSkillMatch(prefSkill, resumeSkills);
      if (evalRes.matchType === 'EXACT') {
        if (!matchedSkills.includes(prefSkill)) matchedSkills.push(prefSkill);
        preferredScoreSum += 1.0;
      } else if (evalRes.matchType === 'RELATED') {
        if (!partialSkills.includes(prefSkill)) partialSkills.push(`${prefSkill} (via ${evalRes.matchedWith})`);
        preferredScoreSum += evalRes.weight;
      } else {
        missingPreferredSkills.push(prefSkill);
      }
    });
  }

  // Weight required skills 80% and preferred skills 20% within Factor 1
  const reqPct = requiredSkills.length > 0 ? (requiredScoreSum / requiredSkills.length) * 100 : 85;
  const prefPct = preferredSkills.length > 0 ? (preferredScoreSum / preferredSkills.length) * 100 : 75;
  const technicalSkillScore = Math.min(100, Math.round(reqPct * 0.80 + prefPct * 0.20));

  // FACTOR 2: Experience / Project Relevance (20% Weight)
  const matchedProjects = [];
  let projectScoreSum = 0;

  if (resumeProjects.length > 0) {
    resumeProjects.forEach((proj) => {
      const projText = `${proj.title || ''} ${proj.description || ''} ${(proj.technologies || []).join(' ')}`.toLowerCase();
      let overlapCount = 0;

      [...requiredSkills, ...preferredSkills].forEach((tech) => {
        if (projText.includes(tech.toLowerCase())) {
          overlapCount++;
        }
      });

      if (overlapCount > 0) {
        matchedProjects.push({
          projectTitle: proj.title || 'Technical Project',
          relevanceReason: `Utilizes target technologies (${overlapCount} overlapping skills).`,
          score: Math.min(100, overlapCount * 30),
        });
        projectScoreSum += 30;
      }
    });
  }

  const experienceProjectScore = Math.min(100, Math.max(50, projectScoreSum + (resumeExp.length > 0 ? 20 : 10)));

  // FACTOR 3: Qualification Match (15% Weight)
  const qualificationMatches = [];
  const qualificationGaps = [];
  let qualificationScore = 90; // Default candidate fit for CSE freshers

  if (resumeText.includes('b.tech') || resumeText.includes('computer science')) {
    qualificationMatches.push('B.Tech in Computer Science & Engineering degree satisfies academic requirements.');
  } else {
    qualificationGaps.push('Specific engineering degree not explicitly highlighted.');
    qualificationScore -= 15;
  }

  // FACTOR 4: Keyword & Semantic Relevance (20% Weight)
  let keywordMatches = 0;
  if (jdKeywords.length > 0) {
    jdKeywords.forEach((kw) => {
      if (resumeText.includes(kw)) {
        keywordMatches++;
      }
    });
  }
  const semanticKeywordScore = jdKeywords.length > 0 ? Math.min(100, Math.round((keywordMatches / jdKeywords.length) * 100)) : 75;

  // FACTOR 5: Soft Skills & Role Alignment (15% Weight)
  let softSkillMatches = 0;
  if (jdSoftSkills.length > 0) {
    jdSoftSkills.forEach((ss) => {
      if (resumeText.includes(ss)) {
        softSkillMatches++;
      }
    });
  }
  const softSkillRoleScore = jdSoftSkills.length > 0 ? Math.min(100, Math.round((softSkillMatches / jdSoftSkills.length) * 100 + 40)) : 70;

  // OVERALL WEIGHTED CALCULATIONS
  // Technical: 30%, Experience: 20%, Qualification: 15%, Semantic Keywords: 20%, Soft Skills: 15%
  const overallScore = Math.round(
    technicalSkillScore * 0.30 +
    experienceProjectScore * 0.20 +
    qualificationScore * 0.15 +
    semanticKeywordScore * 0.20 +
    softSkillRoleScore * 0.15
  );

  // Match Level Thresholds
  let matchLevel = 'Good Match';
  if (overallScore >= 90) matchLevel = 'Excellent Match';
  else if (overallScore >= 80) matchLevel = 'Strong Match';
  else if (overallScore >= 70) matchLevel = 'Good Match';
  else if (overallScore >= 60) matchLevel = 'Moderate Match';
  else if (overallScore >= 40) matchLevel = 'Low Match';
  else matchLevel = 'Weak Match';

  // Application Decision Support
  let applicationDecision = 'Possible Fit';
  if (overallScore >= 80 && qualificationGaps.length === 0) applicationDecision = 'Strong Fit';
  else if (overallScore < 60 || missingRequiredSkills.length > 2) applicationDecision = 'Skill Gap Heavy';
  else if (qualificationScore < 50) applicationDecision = 'Qualification Mismatch';

  // Actionable Non-Fabricating Recommendations
  const criticalActions = [];
  const recommendedSkills = [];
  const preparationSuggestions = [];

  if (missingRequiredSkills.length > 0) {
    missingRequiredSkills.forEach((skill) => {
      criticalActions.push(`Required skill missing: Learn ${skill} fundamentals and build a mini-project.`);
      recommendedSkills.push(skill);
    });
  }

  if (missingPreferredSkills.length > 0) {
    missingPreferredSkills.forEach((skill) => {
      preparationSuggestions.push(`Preferred skill bonus: Familiarize yourself with ${skill}.`);
      if (!recommendedSkills.includes(skill)) recommendedSkills.push(skill);
    });
  }

  if (criticalActions.length === 0) {
    criticalActions.push('Your profile strongly aligns with core job requirements. Prepare for technical interviews!');
  }

  return {
    factorScores: {
      technicalSkillScore,
      experienceProjectScore,
      qualificationScore,
      semanticKeywordScore,
      softSkillRoleScore,
    },
    overallScore,
    matchLevel,
    applicationDecision,
    matchedSkills,
    partialSkills,
    missingRequiredSkills,
    missingPreferredSkills,
    qualificationMatches,
    qualificationGaps,
    matchedProjects,
    matchedExperience: resumeExp.map(e => `${e.role || 'Role'} at ${e.company || 'Company'}`),
    relevantResumeSections: ['Technical Skills', 'Projects', 'Education'],
    criticalActions,
    recommendedSkills,
    preparationSuggestions,
  };
};

module.exports = {
  calculateResumeJobMatch,
};

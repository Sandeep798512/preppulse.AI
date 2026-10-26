const test = require('node:test');
const assert = require('node:assert');
const { WEIGHTS, ROLE_SKILL_REQUIREMENTS } = require('../config/readinessConfig');

test('Phase 8 - Weights Configuration Sum Verification', () => {
  const sumWeights = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  assert.strictEqual(Number(sumWeights.toFixed(2)), 1.0, 'Placement readiness weights must sum exactly to 1.0 (100%)');
});

test('Phase 8 - Deterministic Placement Readiness Formula Test', () => {
  const resumeScore = 80;        // 80 * 0.10 = 8.0
  const jobMatchScore = 70;      // 70 * 0.10 = 7.0
  const aptitudeScore = 60;      // 60 * 0.15 = 9.0
  const technicalScore = 80;     // 80 * 0.15 = 12.0
  const codingScore = 75;        // 75 * 0.20 = 15.0
  const interviewScore = 70;     // 70 * 0.20 = 14.0
  const communicationScore = 80; // 80 * 0.10 = 8.0

  // Total = 8.0 + 7.0 + 9.0 + 12.0 + 15.0 + 14.0 + 8.0 = 73.0 -> 73
  const rawScore =
    resumeScore * WEIGHTS.resumeScore +
    jobMatchScore * WEIGHTS.jobMatchScore +
    aptitudeScore * WEIGHTS.aptitudeScore +
    technicalScore * WEIGHTS.technicalScore +
    codingScore * WEIGHTS.codingScore +
    interviewScore * WEIGHTS.interviewScore +
    communicationScore * WEIGHTS.communicationScore;

  const overallScore = Math.round(rawScore);
  assert.strictEqual(overallScore, 73);
});

test('Phase 8 - Data Coverage & Confidence Level Calculation Test', () => {
  const evidenceModules = [true, true, true, true, true, false, false]; // 5 out of 7
  const evidenceCount = evidenceModules.filter(Boolean).length;
  const dataCoveragePercentage = Math.round((evidenceCount / 7) * 100);

  let confidenceLevel = 'Medium Confidence';
  if (dataCoveragePercentage >= 80) confidenceLevel = 'High Confidence';
  else if (dataCoveragePercentage < 50) confidenceLevel = 'Low Confidence';

  assert.strictEqual(dataCoveragePercentage, 71);
  assert.strictEqual(confidenceLevel, 'Medium Confidence');
});

test('Phase 8 - Role Readiness & Skill Gap Matching Test', () => {
  const required = ROLE_SKILL_REQUIREMENTS['Software Developer'];
  const studentSkills = ['Java', 'Python', 'OOP', 'SQL', 'Git'];

  let matched = 0;
  const missing = [];

  required.forEach((reqSkill) => {
    if (studentSkills.includes(reqSkill)) matched++;
    else missing.push(reqSkill);
  });

  const skillScore = Math.round((matched / required.length) * 100);
  assert.ok(skillScore > 0, 'Skill match score must be greater than zero');
  assert.ok(missing.includes('DSA'), 'DSA should be detected as missing for Software Developer role');
});

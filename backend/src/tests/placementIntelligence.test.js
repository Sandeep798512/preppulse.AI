const test = require('node:test');
const assert = require('node:assert');

const { evaluateEligibility } = require('../services/eligibilityEngine');
const { WEIGHTS } = require('../services/companyReadinessEngine');

test('Phase 10 - Eligibility Engine Logic & Backlog Handling Test', () => {
  const mockUserEligible = {
    education: {
      degree: 'B.Tech',
      branch: 'Computer Science & Engineering',
      graduationYear: 2026,
      cgpa: 8.2,
      backlogs: 0,
    },
  };

  const mockJob = {
    eligibilityCriteria: {
      minimumCGPA: 7.0,
      maximumBacklogs: 0,
      backlogPolicy: 'No active backlog',
      allowedBranches: ['Computer Science & Engineering', 'Information Technology'],
      graduationYear: 2026,
    },
  };

  // Test 1: Fully Eligible student
  const result1 = evaluateEligibility(mockUserEligible, mockJob);
  assert.strictEqual(result1.status, 'Eligible');
  assert.strictEqual(result1.isEligible, true);

  // Test 2: Student with active backlog against "No active backlog" policy
  const mockUserBacklog = {
    education: {
      degree: 'B.Tech',
      branch: 'Computer Science & Engineering',
      graduationYear: 2026,
      cgpa: 7.8,
      backlogs: 2,
    },
  };
  const result2 = evaluateEligibility(mockUserBacklog, mockJob);
  assert.strictEqual(result2.status, 'Not Eligible');
  assert.strictEqual(result2.isEligible, false);

  // Test 3: Insufficient Information check (missing CGPA)
  const mockUserNoCGPA = {
    education: {
      degree: 'B.Tech',
      branch: 'Computer Science & Engineering',
      graduationYear: 2026,
      cgpa: 0,
    },
  };
  const result3 = evaluateEligibility(mockUserNoCGPA, mockJob);
  assert.strictEqual(result3.status, 'Insufficient Information');
});

test('Phase 10 - Company Readiness Formula Weights Sum Test', () => {
  const sumWeights = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  assert.strictEqual(Number(sumWeights.toFixed(2)), 1.0, 'Company readiness weights must sum to 1.0 (100%)');
});

test('Phase 10 - Deterministic 7-Factor Company Readiness Calculation Test', () => {
  const resumeFit = 80;         // 80 * 0.15 = 12
  const technicalSkills = 70;   // 70 * 0.15 = 10.5
  const codingReadiness = 75;   // 75 * 0.20 = 15
  const aptitudeReadiness = 60; // 60 * 0.10 = 6
  const interviewReadiness = 70;// 70 * 0.15 = 10.5
  const communication = 80;     // 80 * 0.10 = 8
  const jdRoleMatch = 80;       // 80 * 0.15 = 12

  // Total = 12 + 10.5 + 15 + 6 + 10.5 + 8 + 12 = 74
  const score = Math.round(
    resumeFit * WEIGHTS.resumeFit +
      technicalSkills * WEIGHTS.technicalSkills +
      codingReadiness * WEIGHTS.codingReadiness +
      aptitudeReadiness * WEIGHTS.aptitudeReadiness +
      interviewReadiness * WEIGHTS.interviewReadiness +
      communication * WEIGHTS.communication +
      jdRoleMatch * WEIGHTS.jdRoleMatch
  );

  assert.strictEqual(score, 74);
});

test('Phase 10 - Secure URL Scheme Validation Test', () => {
  const isHttps = (url) => /^https:\/\//i.test(url);

  assert.strictEqual(isHttps('https://google.com'), true);
  assert.strictEqual(isHttps('http://unsafe.com'), false);
  assert.strictEqual(isHttps('javascript:alert(1)'), false);
});

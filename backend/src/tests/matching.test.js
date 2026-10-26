const test = require('node:test');
const assert = require('node:assert');
const { normalizeSkill, evaluateSkillMatch } = require('../utils/skillDictionary');
const { calculateResumeJobMatch } = require('../services/matchingEngine');

test('Phase 3 - Skill Normalization Test', () => {
  assert.strictEqual(normalizeSkill('js'), 'JavaScript');
  assert.strictEqual(normalizeSkill('react js'), 'React');
  assert.strictEqual(normalizeSkill('node'), 'Node.js');
  assert.strictEqual(normalizeSkill('my sql'), 'MySQL');
  assert.strictEqual(normalizeSkill('c++'), 'C++');
});

test('Phase 3 - Skill Relationship & Partial Match Test', () => {
  const candidateSkills = ['Java', 'SQL', 'Git'];

  const javaMatch = evaluateSkillMatch('Java', candidateSkills);
  assert.strictEqual(javaMatch.matchType, 'EXACT');
  assert.strictEqual(javaMatch.weight, 1.0);

  const springMatch = evaluateSkillMatch('Spring Boot', candidateSkills);
  assert.strictEqual(springMatch.matchType, 'RELATED');
  assert.strictEqual(springMatch.weight, 0.6);

  const jsMatch = evaluateSkillMatch('JavaScript', candidateSkills);
  assert.strictEqual(jsMatch.matchType, 'NONE');
  assert.strictEqual(jsMatch.weight, 0.0);
});

test('Phase 3 - 5-Factor Matching Engine Formula Test', () => {
  const mockResume = {
    skills: ['Java', 'SQL', 'Git', 'React', 'Node.js', 'DSA'],
    extractedText: 'B.Tech in Computer Science & Engineering. Developed REST APIs and full-stack web applications.',
    projects: [
      {
        title: 'E-Commerce Portal',
        description: 'Built REST APIs using Node.js and SQL database',
        technologies: ['Node.js', 'SQL', 'React'],
      },
    ],
  };

  const mockJD = {
    requiredSkills: ['Java', 'SQL', 'Node.js', 'Git'],
    preferredSkills: ['AWS', 'Docker'],
    keywords: ['java', 'sql', 'node.js', 'rest api'],
    softSkills: ['problem solving', 'teamwork'],
  };

  const match = calculateResumeJobMatch(mockResume, mockJD);

  assert.ok(match.overallScore >= 0 && match.overallScore <= 100, 'Overall score must be 0-100');
  assert.strictEqual(match.matchedSkills.includes('Java'), true);
  assert.strictEqual(match.matchedSkills.includes('SQL'), true);
  assert.strictEqual(match.missingPreferredSkills.includes('AWS'), true);
  assert.ok(['Excellent Match', 'Strong Match', 'Good Match', 'Moderate Match', 'Low Match', 'Weak Match'].includes(match.matchLevel));
});

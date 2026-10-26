const test = require('node:test');
const assert = require('node:assert');
const { parseResumeBasic } = require('../utils/resumeParser');
const { analyzeResumeText } = require('../services/ai/resumeAnalyzer');
const Resume = require('../models/Resume');

test('Phase 2 - Basic Resume Text Parser Test', () => {
  const sampleResumeText = `
    RAHUL SHARMA
    Email: rahul.sharma@gmail.com | Phone: +91 9876543210
    LinkedIn: linkedin.com/in/rahul-sharma | GitHub: github.com/rahulsharma

    SUMMARY
    Enthusiastic Computer Science undergraduate with hands-on experience in full-stack web development and algorithm optimization.

    TECHNICAL SKILLS
    Languages: Java, Python, JavaScript, SQL
    Frameworks & Tools: React, Node.js, Express, MongoDB, Git, Docker, REST API

    PROJECTS
    Placement Preparation Platform:
    Developed a responsive React web app with Node.js backend. Integrated JWT auth and MongoDB storage.

    EDUCATION
    B.Tech in Computer Science & Engineering - NIT (CGPA: 8.7/10)
  `;

  const parsed = parseResumeBasic(sampleResumeText);

  assert.strictEqual(parsed.contactInfo.email, 'rahul.sharma@gmail.com');
  assert.strictEqual(parsed.contactInfo.linkedin, 'linkedin.com/in/rahul-sharma');
  assert.strictEqual(parsed.sectionChecklist.education, true);
  assert.strictEqual(parsed.sectionChecklist.skills, true);
  assert.strictEqual(parsed.sectionChecklist.projects, true);
  assert.ok(parsed.extractedSkills.includes('Java'), 'Should extract Java skill');
  assert.ok(parsed.extractedSkills.includes('React'), 'Should extract React skill');
});

test('Phase 2 - Weighted Score Calculation Engine Test', async () => {
  const sampleResumeText = `
    RAHUL SHARMA
    Email: rahul@gmail.com | Phone: +91 9876543210
    SUMMARY: CS Student looking for Software Engineer role.
    SKILLS: Java, Python, React, Node.js, SQL, Git, DSA
    PROJECTS: Built an e-commerce platform using MERN stack. Improved query speed by 40%.
    EDUCATION: B.Tech CSE (2026) - CGPA 8.5
  `;

  const analysis = await analyzeResumeText(sampleResumeText, 'Software Developer');

  assert.ok(analysis.scores.resumeScore >= 0 && analysis.scores.resumeScore <= 100, 'Resume Score must be between 0 and 100');
  assert.ok(analysis.scores.atsCompatibilityScore >= 0 && analysis.scores.atsCompatibilityScore <= 100, 'ATS Score must be between 0 and 100');
  assert.ok(Array.isArray(analysis.strengths), 'Strengths should be an array');
  assert.ok(Array.isArray(analysis.recommendations), 'Recommendations should be an array');
});

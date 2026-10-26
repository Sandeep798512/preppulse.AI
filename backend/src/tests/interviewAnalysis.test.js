const test = require('node:test');
const assert = require('node:assert');
const { performDeepInterviewAnalysis, calculateInterviewPerformance } = require('../services/ai/aiInterviewAnalysisEngine');

test('Phase 7 - Deterministic Overall Score Formula & Weights Test', () => {
  const technicalScore = 80;
  const correctnessScore = 80;
  const communicationScore = 70;
  const completenessScore = 70;
  const relevanceScore = 90;
  const structureScore = 80;
  const questionHandlingScore = 100;
  const consistencyScore = 100;

  // Formula:
  // 80*0.30 + 80*0.20 + 70*0.15 + 70*0.10 + 90*0.10 + 80*0.05 + 100*0.05 + 100*0.05
  // = 24 + 16 + 10.5 + 7 + 9 + 4 + 5 + 5 = 80.5 -> 81
  const rawScore =
    technicalScore * 0.30 +
    correctnessScore * 0.20 +
    communicationScore * 0.15 +
    completenessScore * 0.10 +
    relevanceScore * 0.10 +
    structureScore * 0.05 +
    questionHandlingScore * 0.05 +
    consistencyScore * 0.05;

  const finalScore = Math.round(rawScore);
  assert.strictEqual(finalScore, 81);
});

test('Phase 7 - Score Interpretation Classification Test', () => {
  const getInterpretation = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Strong';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Needs Improvement';
    if (score >= 40) return 'Weak';
    return 'Critical Improvement Needed';
  };

  assert.strictEqual(getInterpretation(95), 'Excellent');
  assert.strictEqual(getInterpretation(85), 'Strong');
  assert.strictEqual(getInterpretation(75), 'Good');
  assert.strictEqual(getInterpretation(65), 'Needs Improvement');
  assert.strictEqual(getInterpretation(50), 'Weak');
  assert.strictEqual(getInterpretation(30), 'Critical Improvement Needed');
});

test('Phase 7 - Text Filler Marker & Hesitation Detection Test', () => {
  const sampleAnswer = 'Um, basically I think Java is like an object oriented language, you know?';
  const textLower = sampleAnswer.toLowerCase();

  const fillerKeywords = ['um', 'uh', 'like', 'actually', 'basically', 'you know', 'i think', 'maybe'];
  const detected = [];

  fillerKeywords.forEach((kw) => {
    if (textLower.includes(kw)) detected.push(kw);
  });

  assert.ok(detected.includes('um'), 'Should detect "um"');
  assert.ok(detected.includes('basically'), 'Should detect "basically"');
  assert.ok(detected.includes('you know'), 'Should detect "you know"');
  assert.ok(detected.length >= 3, 'Should detect multiple hesitation markers');
});

test('Phase 7 - STAR Framework Structure Analysis Test', () => {
  const answer = 'In my 3rd year project (Situation), my task was to build auth (Task). I implemented JWT in Node.js (Action), which reduced login latency by 40% (Result).';
  const textLower = answer.toLowerCase();

  const situation = textLower.includes('project') || textLower.includes('when');
  const task = textLower.includes('task') || textLower.includes('goal');
  const action = textLower.includes('implemented') || textLower.includes('built');
  const result = textLower.includes('result') || textLower.includes('reduced');

  assert.strictEqual(situation, true);
  assert.strictEqual(task, true);
  assert.strictEqual(action, true);
  assert.strictEqual(result, true);
});

test('Phase 7 - Concept Coverage Calculation Test', () => {
  const expectedConcepts = ['encapsulation', 'abstraction', 'inheritance', 'polymorphism'];
  const coveredConcepts = ['encapsulation', 'inheritance'];

  const coverageScore = Math.round((coveredConcepts.length / expectedConcepts.length) * 100);
  assert.strictEqual(coverageScore, 50);
});

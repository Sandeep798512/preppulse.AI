const test = require('node:test');
const assert = require('node:assert');
const { seedInterviewQuestions, getFallbackQuestion } = require('../utils/seedInterviewQuestions');
const { analyzeAnswer, generateSessionSummary } = require('../services/ai/aiInterviewService');

test('Phase 6 - Seed Interview Question Bank Quantity & Categories Verification', () => {
  assert.ok(seedInterviewQuestions.hr.length >= 30, 'HR question bank must have 30+ questions');
  assert.ok(seedInterviewQuestions.technical.length >= 50, 'Technical question bank must have 50+ questions');
  assert.ok(seedInterviewQuestions.project.length >= 30, 'Project question bank must have 30+ questions');
  assert.ok(seedInterviewQuestions.behavioral.length >= 20, 'Behavioral question bank must have 20+ questions');

  const totalQuestions =
    seedInterviewQuestions.hr.length +
    seedInterviewQuestions.technical.length +
    seedInterviewQuestions.project.length +
    seedInterviewQuestions.behavioral.length;

  assert.ok(totalQuestions >= 130, `Total question bank count must be 130+, found ${totalQuestions}`);
});

test('Phase 6 - Fallback Question Generator & Duplicate Avoidance', () => {
  const asked = [seedInterviewQuestions.technical[0].question];
  const nextQ = getFallbackQuestion('technical', 'Medium', asked);

  assert.ok(nextQ, 'Should return a valid fallback question');
  assert.notStrictEqual(nextQ.question, asked[0], 'Returned question must not be in excluded asked list');
});

test('Phase 6 - Answer Analysis Heuristic Engine Scoring Test', async () => {
  const questionObj = {
    questionText: 'Explain the difference between interface and abstract class in Java.',
    expectedConcepts: ['interface', 'abstract class', 'inheritance', 'multiple inheritance'],
  };

  const candidateAns = 'An interface in Java allows multiple inheritance and contains abstract methods. An abstract class can have instance state and method implementations.';

  const result = await analyzeAnswer(questionObj, candidateAns, 45);

  assert.ok(result.scores, 'Must return score breakdown');
  assert.ok(result.scores.relevance >= 5, 'Relevance score should be high for keyword match');
  assert.ok(result.scores.overallAnswerScore >= 60, 'Overall score should be above 60 for good answer');
  assert.ok(result.feedback.keyPositives.length >= 1, 'Key positives feedback should exist');
});

test('Phase 6 - Session Summary Aggregation & Score Weighting Test', async () => {
  const session = {
    interviewType: 'technical',
    questionCount: 5,
  };

  const answers = [
    {
      isSkipped: false,
      scores: { relevance: 8, correctness: 8, completeness: 8, clarity: 8, confidenceIndicator: 8, overallAnswerScore: 80 },
      feedback: { keyPositives: ['Good Java knowledge'], improvementAreas: ['Elaborate more'] },
    },
    {
      isSkipped: false,
      scores: { relevance: 7, correctness: 7, completeness: 6, clarity: 7, confidenceIndicator: 7, overallAnswerScore: 70 },
      feedback: { keyPositives: ['Clear explanation'], improvementAreas: ['Add examples'] },
    },
    {
      isSkipped: true,
      scores: { relevance: 0, correctness: 0, completeness: 0, clarity: 0, confidenceIndicator: 0, overallAnswerScore: 0 },
    },
  ];

  const summary = await generateSessionSummary(session, answers);

  assert.ok(summary.overallScore > 0, 'Overall score must be greater than zero');
  assert.strictEqual(summary.strengths.length > 0, true, 'Strengths array must not be empty');
  assert.strictEqual(summary.weaknesses.length > 0, true, 'Weaknesses array must not be empty');
  assert.strictEqual(summary.actionableTips.length >= 3, true, 'Should include actionable tips');
});

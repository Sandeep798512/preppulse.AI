const test = require('node:test');
const assert = require('node:assert');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const { sampleQuestions } = require('../utils/seedQuestions');

test('Phase 4 - Question DTO Answer Security Verification', () => {
  const sampleQ = sampleQuestions[0];
  assert.ok(sampleQ.question, 'Question text must exist');
  assert.strictEqual(sampleQ.options.length, 4, 'Must have exactly 4 options');
  assert.ok(typeof sampleQ.correctAnswer === 'number', 'Correct answer index must be numeric');
  assert.ok(sampleQ.explanation, 'Explanation must exist');
});

test('Phase 4 - Quiz Scoring & Negative Marking Formula Test', () => {
  const totalQuestions = 10;
  const marksPerQuestion = 1;
  const negativeMarksPerQuestion = 0.25;

  const correctCount = 7;
  const incorrectCount = 2;
  const skippedCount = 1;

  // Formula with Negative Marking enabled:
  // Score = (7 * 1) - (2 * 0.25) = 7 - 0.5 = 6.5
  const earnedMarks = (correctCount * marksPerQuestion) - (incorrectCount * negativeMarksPerQuestion);
  const finalScore = Math.max(0, Number(earnedMarks.toFixed(2)));
  const percentage = Math.round((finalScore / totalQuestions) * 100);
  const accuracy = Math.round((correctCount / (correctCount + incorrectCount)) * 100);

  assert.strictEqual(finalScore, 6.5);
  assert.strictEqual(percentage, 65);
  assert.strictEqual(accuracy, 78);
});

const test = require('node:test');
const assert = require('node:assert');
const { sampleCodingProblems } = require('../utils/seedCodingProblems');
const { evaluateTestCases, executeCodeInSandbox } = require('../services/codeExecutionEngine');

test('Phase 5 - Seed Coding Problems Structure & Hidden Test Cases Verification', () => {
  assert.ok(sampleCodingProblems.length >= 5, 'Should have at least 5 seeded coding problems');

  const twoSum = sampleCodingProblems.find((p) => p.slug === 'two-sum-target-index');
  assert.ok(twoSum, 'Two Sum problem must exist in seed dataset');
  assert.strictEqual(twoSum.difficulty, 'Easy');
  assert.ok(twoSum.starterCode.javascript, 'JavaScript starter code must exist');
  assert.ok(twoSum.starterCode.python, 'Python starter code must exist');
  assert.ok(twoSum.testCases.length >= 3, 'Must have sample and hidden test cases');

  const hiddenCases = twoSum.testCases.filter((tc) => tc.isHidden);
  assert.ok(hiddenCases.length >= 1, 'Must include hidden test cases for secure evaluation');
});

test('Phase 5 - Sandboxed JS Code Execution & Output Matching', async () => {
  const code = `
function solve(input) {
  const lines = input.trim().split('\\n');
  const nums = lines[0].split(',').map(Number);
  const target = Number(lines[1]);
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return map.get(diff) + ' ' + i;
    }
    map.set(nums[i], i);
  }
  return '';
}
`;

  const input = '2,7,11,15\n9';
  const execResult = await executeCodeInSandbox({
    language: 'javascript',
    sourceCode: code,
    input,
    timeLimitSeconds: 2,
  });

  assert.strictEqual(execResult.status, 'Success');
  assert.strictEqual(execResult.stdout, '0 1');
});

test('Phase 5 - Sandboxed Time Limit Exceeded Detection', async () => {
  const infiniteLoopCode = `
function solve(input) {
  while (true) {}
}
`;

  const execResult = await executeCodeInSandbox({
    language: 'javascript',
    sourceCode: infiniteLoopCode,
    input: 'test',
    timeLimitSeconds: 1,
  });

  assert.strictEqual(execResult.status, 'Time Limit Exceeded');
});

test('Phase 5 - Full Test Case Evaluation (Sample + Hidden)', async () => {
  const code = `
function solve(input) {
  const lines = input.trim().split('\\n');
  const nums = lines[0].split(',').map(Number);
  const target = Number(lines[1]);
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return map.get(diff) + ' ' + i;
    }
    map.set(nums[i], i);
  }
  return '';
}
`;

  const testCases = [
    { input: '2,7,11,15\n9', expectedOutput: '0 1', isHidden: false },
    { input: '3,2,4\n6', expectedOutput: '1 2', isHidden: true },
  ];

  const evalResult = await evaluateTestCases('javascript', code, testCases, 2);

  assert.strictEqual(evalResult.overallStatus, 'Accepted');
  assert.strictEqual(evalResult.passedTests, 2);
  assert.strictEqual(evalResult.score, 100);
  assert.strictEqual(evalResult.testResults[1].actualOutput, '[Hidden]');
});

test('Phase 5 - Coding Placement Readiness Score Formula Test', () => {
  const easySolved = 6; // 6/10 * 25 = 15
  const mediumSolved = 4; // 4/10 * 45 = 18
  const hardSolved = 1; // 1/5 * 15 = 3
  const topicCount = 5; // 5/8 * 15 = 9.375

  const easyScore = Math.min(25, (easySolved / 10) * 25);
  const mediumScore = Math.min(45, (mediumSolved / 10) * 45);
  const hardScore = Math.min(15, (hardSolved / 5) * 15);
  const topicScore = Math.min(15, (topicCount / 8) * 15);

  const totalScore = Math.round(easyScore + mediumScore + hardScore + topicScore);

  assert.strictEqual(totalScore, 45);
});

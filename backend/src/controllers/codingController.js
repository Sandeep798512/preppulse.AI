const CodingProblem = require('../models/CodingProblem');
const CodingSubmission = require('../models/CodingSubmission');
const { executeCodeInSandbox, evaluateTestCases } = require('../services/codeExecutionEngine');
const { supportedLanguages } = require('../utils/languageRegistry');

/**
 * GET /api/coding/problems
 * Public/Student endpoint to fetch paginated & filtered coding problems.
 * Strips hidden test cases from response.
 */
const getProblems = async (req, res) => {
  try {
    const { category, difficulty, topic, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (topic) query.topics = { $in: [topic] };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await CodingProblem.countDocuments(query);

    // Exclude hidden test cases and testCases array from public list view
    const problems = await CodingProblem.find(query)
      .select('-testCases')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // If user is authenticated, attach user's completion status
    let userSubmissions = [];
    if (req.user) {
      userSubmissions = await CodingSubmission.find({ user: req.user._id, status: 'Accepted' })
        .distinct('problem');
    }

    const solvedProblemIds = new Set(userSubmissions.map((id) => id.toString()));

    const formattedProblems = problems.map((prob) => {
      const pObj = prob.toObject();
      return {
        ...pObj,
        isSolved: req.user ? solvedProblemIds.has(prob._id.toString()) : false,
      };
    });

    res.json({
      success: true,
      data: formattedProblems,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
      supportedLanguages,
    });
  } catch (error) {
    console.error('Error fetching coding problems:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching problems' });
  }
};

/**
 * GET /api/coding/problems/:slug
 * Public/Student endpoint to get problem details by slug.
 * Hides hidden test cases unless requester is admin.
 */
const getProblemBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const problem = await CodingProblem.findOne({ slug });

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Coding problem not found' });
    }

    const probObj = problem.toObject();

    // Hide hidden test cases if not admin
    if (!req.user || req.user.role !== 'admin') {
      probObj.testCases = probObj.testCases
        .filter((tc) => !tc.isHidden)
        .map((tc) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          explanation: tc.explanation || '',
          isHidden: false,
        }));
    }

    // Check user solve status
    let isSolved = false;
    let userSubmission = null;

    if (req.user) {
      const sub = await CodingSubmission.findOne({
        user: req.user._id,
        problem: problem._id,
        status: 'Accepted',
      }).sort({ createdAt: -1 });

      if (sub) {
        isSolved = true;
        userSubmission = sub;
      }
    }

    res.json({
      success: true,
      data: {
        ...probObj,
        isSolved,
        lastAcceptedSubmission: userSubmission,
      },
    });
  } catch (error) {
    console.error('Error fetching coding problem detail:', error);
    res.status(500).json({ success: false, message: 'Server error fetching problem details' });
  }
};

/**
 * POST /api/coding/problems/:id/run
 * Run code against sample test cases or custom input in isolated sandbox without saving to database.
 */
const runCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, language = 'javascript', customInput } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Source code is required' });
    }

    const problem = await CodingProblem.findById(id);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    if (customInput !== undefined && customInput !== null) {
      // Run custom input
      const execResult = await executeCodeInSandbox({
        language,
        sourceCode: code,
        input: customInput,
        timeLimitSeconds: problem.timeLimitSeconds || 2,
      });

      return res.json({
        success: true,
        type: 'custom',
        data: {
          status: execResult.status,
          stdout: execResult.stdout,
          stderr: execResult.stderr,
          executionTimeMs: execResult.executionTimeMs,
        },
      });
    }

    // Run against visible sample test cases only
    const sampleCases = problem.testCases.filter((tc) => !tc.isHidden);
    const evalResult = await evaluateTestCases(
      language,
      code,
      sampleCases.length > 0 ? sampleCases : problem.testCases.slice(0, 2),
      problem.timeLimitSeconds || 2
    );

    res.json({
      success: true,
      type: 'sample',
      data: evalResult,
    });
  } catch (error) {
    console.error('Error running code:', error);
    res.status(500).json({ success: false, message: 'Server error while executing code' });
  }
};

/**
 * POST /api/coding/problems/:id/submit
 * Submit code for full evaluation against ALL test cases (sample + hidden) & record submission.
 */
const submitCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, language = 'javascript' } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Source code is required' });
    }

    const problem = await CodingProblem.findById(id);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Evaluate against ALL test cases (sample & hidden)
    const evalResult = await evaluateTestCases(
      language,
      code,
      problem.testCases,
      problem.timeLimitSeconds || 2
    );

    // Format test case results for DB storage (sanitizing hidden outputs)
    const formattedResults = evalResult.testResults.map((tr) => ({
      testCaseIndex: tr.testCaseIndex,
      passed: tr.passed,
      status: tr.status,
      actualOutput: tr.isHidden ? '[Hidden Test Case]' : tr.actualOutput,
      expectedOutput: tr.isHidden ? '[Hidden Test Case]' : tr.expectedOutput,
      stderr: tr.stderr,
      isHidden: tr.isHidden,
    }));

    const firstErrorMsg = evalResult.testResults.find((t) => t.stderr)?.stderr || '';

    // Create submission document
    const submission = await CodingSubmission.create({
      user: req.user._id,
      problem: problem._id,
      code,
      language,
      status: evalResult.overallStatus,
      passCount: evalResult.passedTests,
      totalTestCases: evalResult.totalTests,
      score: evalResult.score,
      executionTimeMs: evalResult.executionTimeMs,
      errorMessage: firstErrorMsg,
      testCaseResults: formattedResults,
    });

    // Update problem submission count stats
    problem.submissionCount = (problem.submissionCount || 0) + 1;
    if (evalResult.overallStatus === 'Accepted') {
      problem.acceptedCount = (problem.acceptedCount || 0) + 1;
    }
    await problem.save();

    res.status(201).json({
      success: true,
      message: evalResult.overallStatus === 'Accepted' ? 'Solution Accepted!' : `Submission Status: ${evalResult.overallStatus}`,
      data: {
        submissionId: submission._id,
        status: submission.status,
        score: submission.score,
        passCount: submission.passCount,
        totalTestCases: submission.totalTestCases,
        executionTimeMs: submission.executionTimeMs,
        testResults: formattedResults,
      },
    });
  } catch (error) {
    console.error('Error submitting code:', error);
    res.status(500).json({ success: false, message: 'Server error while submitting solution' });
  }
};

/**
 * GET /api/coding/submissions
 * Get user's submission history.
 */
const getSubmissions = async (req, res) => {
  try {
    const { problemId, page = 1, limit = 15 } = req.query;
    const query = { user: req.user._id };

    if (problemId) query.problem = problemId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await CodingSubmission.countDocuments(query);

    const submissions = await CodingSubmission.find(query)
      .populate('problem', 'title slug difficulty category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: submissions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ success: false, message: 'Server error fetching submissions' });
  }
};

/**
 * GET /api/coding/submissions/:id
 * Get single submission details.
 */
const getSubmissionById = async (req, res) => {
  try {
    const submission = await CodingSubmission.findById(req.params.id).populate(
      'problem',
      'title slug difficulty category topics'
    );

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Ensure user owns submission or is admin
    if (submission.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Error fetching submission detail:', error);
    res.status(500).json({ success: false, message: 'Server error fetching submission detail' });
  }
};

/**
 * GET /api/coding/analytics
 * Performance analytics for authenticated student.
 */
const getCodingAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all submissions by user
    const submissions = await CodingSubmission.find({ user: userId }).populate('problem', 'difficulty category topics');

    const totalSubmissions = submissions.length;
    const statusCounts = {
      Accepted: 0,
      'Wrong Answer': 0,
      'Time Limit Exceeded': 0,
      'Compilation Error': 0,
      'Runtime Error': 0,
    };

    const solvedProblemIds = new Set();
    const solvedDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
    const topicStats = {};

    submissions.forEach((sub) => {
      statusCounts[sub.status] = (statusCounts[sub.status] || 0) + 1;

      if (sub.status === 'Accepted' && sub.problem) {
        const probId = sub.problem._id.toString();
        if (!solvedProblemIds.has(probId)) {
          solvedProblemIds.add(probId);
          if (sub.problem.difficulty) {
            solvedDifficulty[sub.problem.difficulty] = (solvedDifficulty[sub.problem.difficulty] || 0) + 1;
          }
          if (sub.problem.topics) {
            sub.problem.topics.forEach((top) => {
              topicStats[top] = (topicStats[top] || 0) + 1;
            });
          }
        }
      }
    });

    const totalSolved = solvedProblemIds.size;
    const totalProblemsInBank = await CodingProblem.countDocuments();
    const acceptanceRate = totalSubmissions > 0 ? Math.round((statusCounts.Accepted / totalSubmissions) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalSolved,
        totalProblemsInBank,
        solveRate: totalProblemsInBank > 0 ? Math.round((totalSolved / totalProblemsInBank) * 100) : 0,
        totalSubmissions,
        acceptanceRate,
        solvedDifficulty,
        statusCounts,
        topicStats,
      },
    });
  } catch (error) {
    console.error('Error computing coding analytics:', error);
    res.status(500).json({ success: false, message: 'Server error generating coding analytics' });
  }
};

/**
 * GET /api/coding/readiness
 * Returns Coding Placement Readiness Score & Recommendations.
 */
const getCodingReadiness = async (req, res) => {
  try {
    const userId = req.user._id;
    const submissions = await CodingSubmission.find({ user: userId }).populate('problem', 'difficulty topics category');

    const solvedProblems = new Map();
    let totalSubmissions = submissions.length;
    let acceptedSubmissions = 0;

    submissions.forEach((sub) => {
      if (sub.status === 'Accepted') acceptedSubmissions++;
      if (sub.status === 'Accepted' && sub.problem) {
        solvedProblems.set(sub.problem._id.toString(), sub.problem);
      }
    });

    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;
    const coveredTopics = new Set();

    solvedProblems.forEach((prob) => {
      if (prob.difficulty === 'Easy') easySolved++;
      else if (prob.difficulty === 'Medium') mediumSolved++;
      else if (prob.difficulty === 'Hard') hardSolved++;

      if (prob.topics) prob.topics.forEach((t) => coveredTopics.add(t));
    });

    // Score components
    // Easy target: 10 problems (max 25 pts)
    const easyScore = Math.min(25, (easySolved / 10) * 25);
    // Medium target: 10 problems (max 45 pts)
    const mediumScore = Math.min(45, (mediumSolved / 10) * 45);
    // Hard target: 5 problems (max 15 pts)
    const hardScore = Math.min(15, (hardSolved / 5) * 15);

    // Topic breadth target: 8 topics (max 15 pts)
    const topicScore = Math.min(15, (coveredTopics.size / 8) * 15);

    const rawScore = Math.round(easyScore + mediumScore + hardScore + topicScore);
    const overallScore = Math.min(100, Math.max(0, rawScore));

    let readinessLevel = 'Beginner';
    if (overallScore >= 80) readinessLevel = 'Placement Ready (Advanced)';
    else if (overallScore >= 60) readinessLevel = 'Intermediate (Job Ready)';
    else if (overallScore >= 35) readinessLevel = 'Developing';

    const recommendations = [];
    if (easySolved < 5) recommendations.push('Solve at least 5 Easy problems to build fundamental logic.');
    if (mediumSolved < 5) recommendations.push('Focus on Medium difficulty problems (Arrays, HashMaps, Two Pointers).');
    if (coveredTopics.size < 5) recommendations.push('Expand DSA topic coverage across Dynamic Programming, Graphs, and Trees.');
    if (totalSubmissions > 0 && acceptedSubmissions / totalSubmissions < 0.5) {
      recommendations.push('Work on debugging edge cases before submitting to improve acceptance rate.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Great job! Keep practicing Medium & Hard problems to maintain top placement readiness.');
    }

    res.json({
      success: true,
      data: {
        overallScore,
        readinessLevel,
        solvedBreakdown: {
          easy: easySolved,
          medium: mediumSolved,
          hard: hardSolved,
          total: solvedProblems.size,
        },
        topicCoverageCount: coveredTopics.size,
        acceptanceRate: totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0,
        recommendations,
      },
    });
  } catch (error) {
    console.error('Error fetching coding readiness:', error);
    res.status(500).json({ success: false, message: 'Server error computing coding readiness' });
  }
};

/**
 * ADMIN: POST /api/coding/admin/problems
 * Create new coding problem.
 */
const createProblem = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      category,
      topics,
      tags,
      constraints,
      inputFormat,
      outputFormat,
      examples,
      starterCode,
      testCases,
      timeLimitSeconds,
      memoryLimitMB,
      hints,
    } = req.body;

    if (!title || !description || !difficulty || !category) {
      return res.status(400).json({ success: false, message: 'Title, description, difficulty, and category are required' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await CodingProblem.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A problem with similar title already exists' });
    }

    const problem = await CodingProblem.create({
      title,
      slug,
      description,
      difficulty,
      category,
      topics: topics || [],
      tags: tags || [],
      constraints: constraints || [],
      inputFormat,
      outputFormat,
      examples: examples || [],
      starterCode: starterCode || {},
      testCases: testCases || [],
      timeLimitSeconds: timeLimitSeconds || 2,
      memoryLimitMB: memoryLimitMB || 256,
      hints: hints || [],
    });

    res.status(201).json({ success: true, message: 'Coding problem created successfully', data: problem });
  } catch (error) {
    console.error('Admin create problem error:', error);
    res.status(500).json({ success: false, message: 'Failed to create coding problem' });
  }
};

/**
 * ADMIN: PUT /api/coding/admin/problems/:id
 * Update existing coding problem.
 */
const updateProblem = async (req, res) => {
  try {
    const problem = await CodingProblem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Coding problem not found' });
    }

    res.json({ success: true, message: 'Coding problem updated successfully', data: problem });
  } catch (error) {
    console.error('Admin update problem error:', error);
    res.status(500).json({ success: false, message: 'Failed to update coding problem' });
  }
};

/**
 * ADMIN: DELETE /api/coding/admin/problems/:id
 * Delete coding problem.
 */
const deleteProblem = async (req, res) => {
  try {
    const problem = await CodingProblem.findByIdAndDelete(req.params.id);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Coding problem not found' });
    }

    // Delete associated submissions
    await CodingSubmission.deleteMany({ problem: problem._id });

    res.json({ success: true, message: 'Coding problem and related submissions deleted' });
  } catch (error) {
    console.error('Admin delete problem error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete coding problem' });
  }
};

module.exports = {
  getProblems,
  getProblemBySlug,
  runCode,
  submitCode,
  getSubmissions,
  getSubmissionById,
  getCodingAnalytics,
  getCodingReadiness,
  createProblem,
  updateProblem,
  deleteProblem,
};

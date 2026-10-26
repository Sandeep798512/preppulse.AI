const InterviewSession = require('../models/InterviewSession');
const InterviewAnswer = require('../models/InterviewAnswer');
const InterviewAnalysis = require('../models/InterviewAnalysis');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const ResumeJobMatch = require('../models/ResumeJobMatch');
const CodingSubmission = require('../models/CodingSubmission');
const QuizAttempt = require('../models/QuizAttempt');
const {
  generateNextQuestion,
  analyzeAnswer,
  generateSessionSummary,
} = require('../services/ai/aiInterviewService');
const { performDeepInterviewAnalysis } = require('../services/ai/aiInterviewAnalysisEngine');

/**
 * POST /api/interviews/start
 * Create a new mock interview session and generate the first question.
 */
const startSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      targetRole = 'Software Developer',
      interviewType = 'technical',
      difficulty = 'Medium',
      questionCount = 10,
      durationMinutes = 15,
      resumeId,
      jobDescriptionId,
    } = req.body;

    // Load Resume & JD if specified or pick latest for user
    let userResume = null;
    if (resumeId) {
      userResume = await Resume.findOne({ _id: resumeId, userId });
    } else {
      userResume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    }

    let userJD = null;
    if (jobDescriptionId) {
      userJD = await JobDescription.findOne({ _id: jobDescriptionId, userId });
    } else {
      userJD = await JobDescription.findOne({ userId }).sort({ createdAt: -1 });
    }

    // Build context
    const resumeSummary = userResume
      ? {
          skills: userResume.skills || [],
          projects: userResume.projects || [],
          experience: userResume.experience || [],
        }
      : null;

    const jdSummary = userJD
      ? {
          requiredSkills: userJD.requiredSkills || [],
          technologies: userJD.technologies || [],
          responsibilities: userJD.responsibilities || [],
        }
      : null;

    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    const firstQuestion = await generateNextQuestion({
      interviewType,
      targetRole,
      difficulty,
      resumeSummary,
      jdSummary,
      askedQuestions: [],
    });

    const session = await InterviewSession.create({
      userId,
      targetRole,
      interviewType,
      difficulty,
      questionCount: parseInt(questionCount),
      durationMinutes: parseInt(durationMinutes),
      resumeId: userResume ? userResume._id : null,
      jobDescriptionId: userJD ? userJD._id : null,
      status: 'in_progress',
      currentQuestionIndex: 0,
      startedAt: new Date(),
      expiresAt,
      questions: [firstQuestion],
    });

    res.status(201).json({
      success: true,
      message: 'Interview session initialized successfully',
      data: {
        sessionId: session._id,
        targetRole: session.targetRole,
        interviewType: session.interviewType,
        difficulty: session.difficulty,
        questionCount: session.questionCount,
        durationMinutes: session.durationMinutes,
        status: session.status,
        expiresAt: session.expiresAt,
        remainingSeconds: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
        currentQuestionIndex: 0,
        currentQuestion: firstQuestion,
      },
    });
  } catch (error) {
    console.error('Error starting interview session:', error);
    res.status(500).json({ success: false, message: 'Server error while starting interview' });
  }
};

/**
 * GET /api/interviews/:id
 * Fetch current state of an interview session, checking server-side expiration.
 */
const getCurrentSession = async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (session.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const now = Date.now();
    const remainingSeconds = Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - now) / 1000));

    // Check timer expiration
    if (remainingSeconds <= 0 && session.status === 'in_progress') {
      session.status = 'expired';
      session.endedAt = new Date();
      await session.save();
    }

    const answers = await InterviewAnswer.find({ sessionId: session._id }).sort({ createdAt: 1 });
    const currentQuestion = session.questions[session.currentQuestionIndex] || null;

    res.json({
      success: true,
      data: {
        sessionId: session._id,
        targetRole: session.targetRole,
        interviewType: session.interviewType,
        difficulty: session.difficulty,
        questionCount: session.questionCount,
        durationMinutes: session.durationMinutes,
        status: session.status,
        remainingSeconds,
        currentQuestionIndex: session.currentQuestionIndex,
        currentQuestion,
        totalQuestionsAsked: session.questions.length,
        answersCount: answers.length,
      },
    });
  } catch (error) {
    console.error('Error getting interview session:', error);
    res.status(500).json({ success: false, message: 'Server error fetching interview details' });
  }
};

/**
 * POST /api/interviews/:id/answer
 * Submit an answer to the current question, analyze it, and generate the next adaptive question.
 */
const submitAnswer = async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (session.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: `Interview session is already ${session.status}` });
    }

    // Check timer expiration
    const remainingSeconds = Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000));
    if (remainingSeconds <= 0) {
      session.status = 'expired';
      session.endedAt = new Date();
      await session.save();
      return res.status(400).json({ success: false, message: 'Interview session has expired' });
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    if (!currentQuestion) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }

    const { answerText, answerType = 'TEXT', timeTaken = 30 } = req.body;

    if (!answerText || !answerText.trim()) {
      return res.status(400).json({ success: false, message: 'Answer text is required' });
    }

    // Check duplicate submission for same question
    const existingAns = await InterviewAnswer.findOne({
      sessionId: session._id,
      questionId: currentQuestion.questionId,
    });

    if (existingAns) {
      return res.status(400).json({ success: false, message: 'Answer for this question has already been submitted' });
    }

    // Analyze answer
    const evalResult = await analyzeAnswer(currentQuestion, answerText, timeTaken);

    // Create InterviewAnswer
    const answerDoc = await InterviewAnswer.create({
      sessionId: session._id,
      userId: req.user._id,
      questionId: currentQuestion.questionId,
      questionText: currentQuestion.questionText,
      answerText,
      answerType,
      timeTaken: parseInt(timeTaken),
      isSkipped: false,
      scores: evalResult.scores,
      starMethodAnalysis: evalResult.starMethodAnalysis,
      feedback: evalResult.feedback,
      nextAdaptiveQuestion: {
        questionText: evalResult.suggestedFollowUp || '',
      },
    });

    // Advance question index
    session.currentQuestionIndex += 1;

    let nextQuestion = null;
    let isCompleted = false;

    if (session.currentQuestionIndex >= session.questionCount) {
      // Completed all questions
      session.status = 'completed';
      session.endedAt = new Date();

      const allAnswers = await InterviewAnswer.find({ sessionId: session._id });
      const summary = await generateSessionSummary(session, allAnswers);
      session.overallScore = summary.overallScore;
      session.overallMetrics = {
        technicalScore: summary.technicalScore,
        communicationScore: summary.communicationScore,
        relevanceScore: summary.relevanceScore,
        completenessScore: summary.completenessScore,
        clarityScore: summary.clarityScore,
        answeredCount: allAnswers.filter((a) => !a.isSkipped).length,
        skippedCount: allAnswers.filter((a) => a.isSkipped).length,
        unansweredCount: session.questionCount - allAnswers.length,
      };
      session.summaryFeedback = {
        strengths: summary.strengths,
        weaknesses: summary.weaknesses,
        actionableTips: summary.actionableTips,
      };

      await session.save();
      isCompleted = true;
    } else {
      // Generate next question
      const askedTexts = session.questions.map((q) => q.questionText);
      nextQuestion = await generateNextQuestion({
        interviewType: session.interviewType,
        targetRole: session.targetRole,
        difficulty: session.difficulty,
        askedQuestions: askedTexts,
        lastAnswer: {
          questionText: currentQuestion.questionText,
          answerText,
          score: evalResult.scores.overallAnswerScore,
        },
      });

      session.questions.push(nextQuestion);
      await session.save();
    }

    res.json({
      success: true,
      message: isCompleted ? 'Interview completed successfully!' : 'Answer submitted',
      data: {
        answerId: answerDoc._id,
        evaluation: evalResult,
        isCompleted,
        currentQuestionIndex: session.currentQuestionIndex,
        nextQuestion,
      },
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ success: false, message: 'Server error while submitting answer' });
  }
};

/**
 * POST /api/interviews/:id/skip
 * Skip the current question and advance to the next question.
 */
const skipQuestion = async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (session.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: `Session is ${session.status}` });
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    if (!currentQuestion) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }

    // Save skipped answer document
    await InterviewAnswer.create({
      sessionId: session._id,
      userId: req.user._id,
      questionId: currentQuestion.questionId,
      questionText: currentQuestion.questionText,
      answerText: '[Question Skipped]',
      isSkipped: true,
    });

    session.currentQuestionIndex += 1;
    let nextQuestion = null;
    let isCompleted = false;

    if (session.currentQuestionIndex >= session.questionCount) {
      session.status = 'completed';
      session.endedAt = new Date();
      const allAnswers = await InterviewAnswer.find({ sessionId: session._id });
      const summary = await generateSessionSummary(session, allAnswers);
      session.overallScore = summary.overallScore;
      session.summaryFeedback = summary;
      await session.save();
      isCompleted = true;
    } else {
      const askedTexts = session.questions.map((q) => q.questionText);
      nextQuestion = await generateNextQuestion({
        interviewType: session.interviewType,
        targetRole: session.targetRole,
        difficulty: session.difficulty,
        askedQuestions: askedTexts,
      });

      session.questions.push(nextQuestion);
      await session.save();
    }

    res.json({
      success: true,
      message: 'Question skipped',
      data: {
        isCompleted,
        currentQuestionIndex: session.currentQuestionIndex,
        nextQuestion,
      },
    });
  } catch (error) {
    console.error('Error skipping question:', error);
    res.status(500).json({ success: false, message: 'Server error skipping question' });
  }
};

/**
 * POST /api/interviews/:id/end
 * Manually end the interview session.
 */
const endSession = async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    session.status = 'completed';
    session.endedAt = new Date();

    const allAnswers = await InterviewAnswer.find({ sessionId: session._id });
    const summary = await generateSessionSummary(session, allAnswers);

    session.overallScore = summary.overallScore;
    session.overallMetrics = {
      technicalScore: summary.technicalScore,
      communicationScore: summary.communicationScore,
      relevanceScore: summary.relevanceScore,
      completenessScore: summary.completenessScore,
      clarityScore: summary.clarityScore,
      answeredCount: allAnswers.filter((a) => !a.isSkipped).length,
      skippedCount: allAnswers.filter((a) => a.isSkipped).length,
      unansweredCount: session.questionCount - allAnswers.length,
    };
    session.summaryFeedback = {
      strengths: summary.strengths,
      weaknesses: summary.weaknesses,
      actionableTips: summary.actionableTips,
    };

    await session.save();

    res.json({
      success: true,
      message: 'Interview session ended manually',
      data: {
        sessionId: session._id,
        overallScore: session.overallScore,
      },
    });
  } catch (error) {
    console.error('Error ending interview session:', error);
    res.status(500).json({ success: false, message: 'Server error ending session' });
  }
};

/**
 * GET /api/interviews/:id/result
 * Detailed session scorecard & question-by-question review.
 */
const getSessionResult = async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const answers = await InterviewAnswer.find({ sessionId: session._id }).sort({ createdAt: 1 });

    const reviewList = session.questions.map((q, idx) => {
      const ans = answers.find((a) => a.questionId === q.questionId);
      return {
        order: idx + 1,
        questionText: q.questionText,
        category: q.category,
        difficulty: q.difficulty,
        expectedConcepts: q.expectedConcepts,
        studentAnswer: ans ? ans.answerText : '[Not Answered]',
        isSkipped: ans ? ans.isSkipped : true,
        scores: ans ? ans.scores : null,
        feedback: ans ? ans.feedback : null,
        starMethod: ans ? ans.starMethodAnalysis : null,
      };
    });

    res.json({
      success: true,
      data: {
        sessionId: session._id,
        targetRole: session.targetRole,
        interviewType: session.interviewType,
        difficulty: session.difficulty,
        questionCount: session.questionCount,
        status: session.status,
        overallScore: session.overallScore,
        overallMetrics: session.overallMetrics,
        summaryFeedback: session.summaryFeedback,
        createdAt: session.createdAt,
        endedAt: session.endedAt,
        questionsReview: reviewList,
      },
    });
  } catch (error) {
    console.error('Error getting interview result:', error);
    res.status(500).json({ success: false, message: 'Server error fetching interview result' });
  }
};

/**
 * GET /api/interviews/history
 * Fetch student's interview attempt history.
 */
const getInterviewHistory = async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const query = { userId: req.user._id };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await InterviewSession.countDocuments(query);

    const sessions = await InterviewSession.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: sessions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching interview history:', error);
    res.status(500).json({ success: false, message: 'Server error fetching interview history' });
  }
};

/**
 * GET /api/interviews/analytics
 * Aggregated interview performance metrics.
 */
const getInterviewAnalytics = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({
      userId: req.user._id,
      status: 'completed',
    }).sort({ createdAt: 1 });

    const totalInterviews = sessions.length;
    let totalScoreSum = 0;
    let highestScore = 0;

    const typeBreakdown = { hr: [], technical: [], project: [], mixed: [] };
    const scoreTrend = [];

    sessions.forEach((s) => {
      const score = s.overallScore || 0;
      totalScoreSum += score;
      if (score > highestScore) highestScore = score;

      if (typeBreakdown[s.interviewType]) {
        typeBreakdown[s.interviewType].push(score);
      }

      scoreTrend.push({
        date: new Date(s.createdAt).toLocaleDateString(),
        score,
        type: s.interviewType,
      });
    });

    const averageScore = totalInterviews > 0 ? Math.round(totalScoreSum / totalInterviews) : 0;

    const calcAvg = (arr) => (arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);

    res.json({
      success: true,
      data: {
        totalInterviews,
        averageScore,
        highestScore,
        recentScore: totalInterviews > 0 ? sessions[sessions.length - 1].overallScore : 0,
        typeAverages: {
          hr: calcAvg(typeBreakdown.hr),
          technical: calcAvg(typeBreakdown.technical),
          project: calcAvg(typeBreakdown.project),
          mixed: calcAvg(typeBreakdown.mixed),
        },
        scoreTrend,
      },
    });
  } catch (error) {
    console.error('Error fetching interview analytics:', error);
    res.status(500).json({ success: false, message: 'Server error computing interview analytics' });
  }
};

/**
 * GET /api/interviews/coach
 * AI Interview Coach insights based on real DB metrics.
 */
const getInterviewCoach = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({
      userId: req.user._id,
      status: 'completed',
    }).sort({ createdAt: -1 });

    if (sessions.length === 0) {
      return res.json({
        success: true,
        data: {
          insight: 'Welcome to AI Mock Interview Coach! Start your first mock interview to receive personalized feedback.',
          strongestArea: 'Not enough data',
          weakestArea: 'Not enough data',
          recommendedAction: 'Take a 10-minute HR or Technical mock interview challenge.',
        },
      });
    }

    const latest = sessions[0];
    const strengths = latest.summaryFeedback?.strengths || [];
    const weaknesses = latest.summaryFeedback?.weaknesses || [];

    res.json({
      success: true,
      data: {
        insight: `Your latest ${latest.interviewType.toUpperCase()} interview score was ${latest.overallScore}/100.`,
        strongestArea: strengths[0] || 'Technical understanding',
        weakestArea: weaknesses[0] || 'Answering completeness',
        recommendedAction: 'Focus on practicing structured STAR method responses for project challenges.',
      },
    });
  } catch (error) {
    console.error('Error fetching interview coach:', error);
    res.status(500).json({ success: false, message: 'Server error fetching interview coach' });
  }
};

/**
 * POST /api/interviews/:id/analyze
 * Run or trigger deep Phase 7 interview analysis and cache result.
 */
const analyzeSession = async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (session.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (session.status !== 'completed' && session.status !== 'expired') {
      return res.status(400).json({ success: false, message: 'Interview session must be completed before running analysis' });
    }

    // Check if analysis already cached
    let existingAnalysis = await InterviewAnalysis.findOne({ sessionId: session._id });
    if (existingAnalysis && existingAnalysis.analysisStatus === 'completed' && !req.query.force) {
      return res.json({
        success: true,
        message: 'Loaded cached interview analysis',
        data: existingAnalysis,
      });
    }

    // Load Resume & JD for consistency checking
    const userResume = session.resumeId ? await Resume.findById(session.resumeId) : await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    const userJD = session.jobDescriptionId ? await JobDescription.findById(session.jobDescriptionId) : await JobDescription.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

    const analysisPayload = await performDeepInterviewAnalysis(session, req.user, userResume, userJD);

    let savedAnalysis = null;
    if (existingAnalysis) {
      Object.assign(existingAnalysis, analysisPayload);
      savedAnalysis = await existingAnalysis.save();
    } else {
      savedAnalysis = await InterviewAnalysis.create(analysisPayload);
    }

    res.json({
      success: true,
      message: 'Deep interview analysis generated successfully',
      data: savedAnalysis,
    });
  } catch (error) {
    console.error('Error analyzing session:', error);
    res.status(500).json({ success: false, message: 'Server error generating interview analysis' });
  }
};

/**
 * GET /api/interviews/:id/analysis
 * Retrieve cached deep interview analysis report. Triggers analysis if not cached yet.
 */
const getSessionAnalysis = async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let analysis = await InterviewAnalysis.findOne({ sessionId: session._id });
    if (!analysis) {
      // Auto-trigger analysis if session is completed
      if (session.status === 'completed' || session.status === 'expired') {
        const userResume = session.resumeId ? await Resume.findById(session.resumeId) : await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
        const userJD = session.jobDescriptionId ? await JobDescription.findById(session.jobDescriptionId) : await JobDescription.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
        const analysisPayload = await performDeepInterviewAnalysis(session, req.user, userResume, userJD);
        analysis = await InterviewAnalysis.create(analysisPayload);
      } else {
        return res.status(400).json({ success: false, message: 'Interview session is still in progress' });
      }
    }

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Error fetching session analysis:', error);
    res.status(500).json({ success: false, message: 'Server error fetching interview analysis' });
  }
};

/**
 * POST /api/interviews/:id/reanalyze
 * Force re-generation of deep analysis.
 */
const reanalyzeSession = async (req, res) => {
  req.query.force = 'true';
  return analyzeSession(req, res);
};

/**
 * GET /api/interviews/trends
 * Returns score progression trend across completed sessions.
 */
const getInterviewTrends = async (req, res) => {
  try {
    const analyses = await InterviewAnalysis.find({
      userId: req.user._id,
      analysisStatus: 'completed',
    })
      .sort({ createdAt: 1 })
      .select('overallScore metricsBreakdown analyzedAt createdAt');

    res.json({
      success: true,
      data: analyses.map((a) => ({
        id: a.sessionId,
        score: a.overallScore,
        technicalScore: a.metricsBreakdown?.technicalScore || 0,
        communicationScore: a.metricsBreakdown?.communicationScore || 0,
        date: new Date(a.createdAt).toLocaleDateString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching interview trends:', error);
    res.status(500).json({ success: false, message: 'Server error fetching interview trends' });
  }
};

/**
 * GET /api/interviews/weak-topics
 * Aggregates weak topics across all user interview sessions.
 */
const getWeakTopics = async (req, res) => {
  try {
    const analyses = await InterviewAnalysis.find({
      userId: req.user._id,
      analysisStatus: 'completed',
    });

    const weakMap = new Map();
    analyses.forEach((a) => {
      (a.weakTopics || []).forEach((wt) => {
        weakMap.set(wt, (weakMap.get(wt) || 0) + 1);
      });
    });

    const weakList = Array.from(weakMap.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: weakList,
    });
  } catch (error) {
    console.error('Error fetching weak topics:', error);
    res.status(500).json({ success: false, message: 'Server error fetching weak topics' });
  }
};

module.exports = {
  startSession,
  getCurrentSession,
  submitAnswer,
  skipQuestion,
  endSession,
  getSessionResult,
  getInterviewHistory,
  getInterviewAnalytics,
  getInterviewCoach,
  analyzeSession,
  getSessionAnalysis,
  reanalyzeSession,
  getInterviewTrends,
  getWeakTopics,
};

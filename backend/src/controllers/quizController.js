const QuizAttempt = require('../models/QuizAttempt');
const Question = require('../models/Question');
const User = require('../models/User');

// @desc    Start Custom Timed Quiz / Practice Attempt
// @route   POST /api/quizzes/start
// @access  Private
const startQuiz = async (req, res) => {
  try {
    const {
      category = 'technical',
      topic,
      difficulty = 'Mixed',
      questionCount = 10,
      timeLimit = 15,
      negativeMarking = false,
      mode = 'exam',
    } = req.body;

    const count = parseInt(questionCount, 10) || 10;
    const timeMins = parseInt(timeLimit, 10) || 15;

    // Filter eligible active questions
    const filter = { isActive: true, category: category.toLowerCase() };

    if (topic && topic !== 'All Topics') {
      filter.topic = new RegExp(topic, 'i');
    }
    if (difficulty && difficulty !== 'Mixed') {
      filter.difficulty = difficulty;
    }

    const availableQuestions = await Question.find(filter);

    if (availableQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No questions currently available matching your selected filters.',
        code: 'NO_QUESTIONS_FOUND',
      });
    }

    if (availableQuestions.length < count) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableQuestions.length} matching active questions are currently available for these filters. Please select a smaller question count.`,
        code: 'INSUFFICIENT_QUESTIONS',
      });
    }

    // Random shuffle without replacement
    const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, count);

    // Create Question Snapshots protecting historical attempts
    const questionSnapshots = selectedQuestions.map((q) => ({
      questionId: q._id.toString(),
      question: q.question,
      options: q.options,
      marks: q.marks || 1,
      negativeMarks: negativeMarking ? (q.negativeMarks || 0.25) : 0,
      topic: q.topic,
    }));

    const now = new Date();
    const expiresAt = new Date(now.getTime() + timeMins * 60 * 1000);

    const attempt = await QuizAttempt.create({
      userId: req.user._id,
      category: category.toLowerCase(),
      topics: topic ? [topic] : ['Mixed Topics'],
      difficulty,
      mode,
      totalQuestions: count,
      timeLimitMinutes: timeMins,
      negativeMarking,
      marksPerQuestion: 1,
      negativeMarksPerQuestion: negativeMarking ? 0.25 : 0,
      startedAt: now,
      expiresAt,
      status: 'in_progress',
      questions: questionSnapshots,
      answers: questionSnapshots.map((q) => ({
        questionId: q.questionId,
        selectedOptionIndex: null,
        isAnswered: false,
      })),
    });

    // SECURITY: Return questions WITHOUT correct answers or explanations
    const sanitizedQuestions = questionSnapshots.map((q) => ({
      questionId: q.questionId,
      question: q.question,
      options: q.options,
      topic: q.topic,
    }));

    res.status(201).json({
      success: true,
      quizId: attempt._id,
      attempt: {
        id: attempt._id,
        category: attempt.category,
        difficulty: attempt.difficulty,
        mode: attempt.mode,
        totalQuestions: attempt.totalQuestions,
        timeLimitMinutes: attempt.timeLimitMinutes,
        expiresAt: attempt.expiresAt,
        questions: sanitizedQuestions,
      },
    });
  } catch (error) {
    console.error('Start Quiz Error:', error);
    res.status(500).json({ success: false, message: 'Failed to start quiz attempt' });
  }
};

// @desc    Auto-save answer during attempt
// @route   POST /api/quizzes/:id/answer
// @access  Private
const saveAnswer = async (req, res) => {
  try {
    const { questionId, selectedOptionIndex } = req.body;
    const attempt = await QuizAttempt.findOne({ _id: req.params.id, userId: req.user._id });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Quiz attempt not found' });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Quiz attempt has already been finalized', code: 'QUIZ_FINALIZED' });
    }

    // Check timer expiration
    if (new Date() > new Date(attempt.expiresAt)) {
      attempt.status = 'expired';
      await attempt.save();
      return res.status(400).json({ success: false, message: 'Quiz time limit expired. Auto-submitting.', code: 'QUIZ_EXPIRED' });
    }

    // Find & update answer record
    const ansIndex = attempt.answers.findIndex((a) => a.questionId === questionId);
    if (ansIndex !== -1) {
      attempt.answers[ansIndex].selectedOptionIndex = selectedOptionIndex !== null ? Number(selectedOptionIndex) : null;
      attempt.answers[ansIndex].isAnswered = selectedOptionIndex !== null && selectedOptionIndex !== undefined;
    }

    await attempt.save();

    res.json({
      success: true,
      message: 'Answer saved successfully',
    });
  } catch (error) {
    console.error('Save Answer Error:', error);
    res.status(500).json({ success: false, message: 'Failed to save answer' });
  }
};

// @desc    Finalize Quiz Attempt & Compute Authoritative Score
// @route   POST /api/quizzes/:id/submit
// @access  Private
const submitQuiz = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({ _id: req.params.id, userId: req.user._id });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Quiz attempt not found' });
    }

    if (attempt.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Quiz attempt already submitted.' });
    }

    const submittedAt = new Date();
    const timeTakenSeconds = Math.round((submittedAt.getTime() - new Date(attempt.startedAt).getTime()) / 1000);

    // Fetch actual Question documents for authoritative grading
    const questionIds = attempt.questions.map((q) => q.questionId);
    const actualQuestions = await Question.find({ _id: { $in: questionIds } });
    const questionMap = new Map(actualQuestions.map((q) => [q._id.toString(), q]));

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    let earnedMarks = 0;

    const topicStats = {};

    attempt.answers.forEach((ans) => {
      const actualQ = questionMap.get(ans.questionId);
      const snapQ = attempt.questions.find((q) => q.questionId === ans.questionId);
      const topicName = snapQ ? snapQ.topic : 'General';

      if (!topicStats[topicName]) {
        topicStats[topicName] = { total: 0, correct: 0 };
      }
      topicStats[topicName].total += 1;

      if (ans.selectedOptionIndex === null || ans.selectedOptionIndex === undefined) {
        skippedCount++;
        ans.isCorrect = false;
        ans.isAnswered = false;
      } else if (actualQ && Number(ans.selectedOptionIndex) === Number(actualQ.correctAnswer)) {
        correctCount++;
        ans.isCorrect = true;
        ans.isAnswered = true;
        earnedMarks += (attempt.marksPerQuestion || 1);
        topicStats[topicName].correct += 1;
      } else {
        incorrectCount++;
        ans.isCorrect = false;
        ans.isAnswered = true;
        if (attempt.negativeMarking) {
          earnedMarks -= (attempt.negativeMarksPerQuestion || 0.25);
        }
      }
    });

    const finalScore = Math.max(0, Number(earnedMarks.toFixed(2)));
    const totalMaxScore = attempt.totalQuestions * (attempt.marksPerQuestion || 1);
    const percentage = Math.round((finalScore / totalMaxScore) * 100);
    const totalAttempted = correctCount + incorrectCount;
    const accuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;

    // Topic Performance Breakdown & Status Thresholds
    const topicPerformance = Object.keys(topicStats).map((tName) => {
      const t = topicStats[tName];
      const tPct = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
      let status = 'Good';
      if (tPct < 60) status = 'Weak';
      else if (tPct < 75) status = 'Needs Improvement';
      else if (tPct < 90) status = 'Good';
      else status = 'Strong';

      return {
        topic: tName,
        total: t.total,
        correct: t.correct,
        percentage: tPct,
        status,
      };
    });

    const isExpired = new Date() > new Date(attempt.expiresAt);

    attempt.score = finalScore;
    attempt.percentage = percentage;
    attempt.accuracy = accuracy;
    attempt.correctCount = correctCount;
    attempt.incorrectCount = incorrectCount;
    attempt.skippedCount = skippedCount;
    attempt.timeTakenSeconds = timeTakenSeconds;
    attempt.topicPerformance = topicPerformance;
    attempt.submittedAt = submittedAt;
    attempt.status = isExpired ? 'expired' : 'completed';

    await attempt.save();

    res.json({
      success: true,
      message: 'Quiz submitted and evaluated successfully.',
      quizId: attempt._id,
      results: {
        score: finalScore,
        maxScore: totalMaxScore,
        percentage,
        accuracy,
        correctCount,
        incorrectCount,
        skippedCount,
        timeTakenSeconds,
        topicPerformance,
      },
    });
  } catch (error) {
    console.error('Submit Quiz Error:', error);
    res.status(500).json({ success: false, message: 'Failed to evaluate quiz' });
  }
};

// @desc    Get current quiz attempt state (recoverable on refresh)
// @route   GET /api/quizzes/:id
// @access  Private
const getQuizAttempt = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({ _id: req.params.id, userId: req.user._id });
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Quiz attempt not found' });
    }

    const sanitizedQuestions = attempt.questions.map((q) => ({
      questionId: q.questionId,
      question: q.question,
      options: q.options,
      topic: q.topic,
    }));

    res.json({
      success: true,
      attempt: {
        id: attempt._id,
        category: attempt.category,
        difficulty: attempt.difficulty,
        mode: attempt.mode,
        totalQuestions: attempt.totalQuestions,
        timeLimitMinutes: attempt.timeLimitMinutes,
        expiresAt: attempt.expiresAt,
        status: attempt.status,
        questions: sanitizedQuestions,
        answers: attempt.answers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch quiz state' });
  }
};

// @desc    Get user's complete quiz attempt history
// @route   GET /api/quizzes/history
// @access  Private
const getQuizHistory = async (req, res) => {
  try {
    const history = await QuizAttempt.find({ userId: req.user._id, status: { $in: ['completed', 'expired'] } })
      .select('category topics difficulty mode totalQuestions score percentage accuracy timeTakenSeconds status submittedAt createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve quiz history' });
  }
};

// @desc    Get completed quiz result review with correct answers & explanations
// @route   GET /api/quizzes/:id/result
// @access  Private
const getQuizResult = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: { $in: ['completed', 'expired'] },
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Completed quiz result not found' });
    }

    // Retrieve actual questions for answer explanations review
    const questionIds = attempt.questions.map((q) => q.questionId);
    const actualQuestions = await Question.find({ _id: { $in: questionIds } });
    const questionMap = new Map(actualQuestions.map((q) => [q._id.toString(), q]));

    const reviewQuestions = attempt.questions.map((q) => {
      const actual = questionMap.get(q.questionId);
      const userAns = attempt.answers.find((a) => a.questionId === q.questionId);

      return {
        questionId: q.questionId,
        question: q.question,
        options: q.options,
        topic: q.topic,
        userAnswerIndex: userAns?.selectedOptionIndex ?? null,
        correctAnswerIndex: actual ? actual.correctAnswer : null,
        isCorrect: userAns ? userAns.isCorrect : false,
        isAnswered: userAns ? userAns.isAnswered : false,
        explanation: actual ? actual.explanation : 'Step-by-step reasoning available.',
      };
    });

    res.json({
      success: true,
      result: {
        id: attempt._id,
        category: attempt.category,
        difficulty: attempt.difficulty,
        mode: attempt.mode,
        totalQuestions: attempt.totalQuestions,
        score: attempt.score,
        percentage: attempt.percentage,
        accuracy: attempt.accuracy,
        correctCount: attempt.correctCount,
        incorrectCount: attempt.incorrectCount,
        skippedCount: attempt.skippedCount,
        timeTakenSeconds: attempt.timeTakenSeconds,
        topicPerformance: attempt.topicPerformance,
        submittedAt: attempt.submittedAt,
        questions: reviewQuestions,
      },
    });
  } catch (error) {
    console.error('Get Quiz Result Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve quiz result review' });
  }
};

module.exports = {
  startQuiz,
  saveAnswer,
  submitQuiz,
  getQuizAttempt,
  getQuizHistory,
  getQuizResult,
};

const mongoose = require('mongoose');

const questionSnapshotSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  marks: { type: Number, default: 1 },
  negativeMarks: { type: Number, default: 0 },
  topic: { type: String, default: 'General' },
});

const answerRecordSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  selectedOptionIndex: { type: Number, default: null }, // 0, 1, 2, 3 or null if skipped
  isAnswered: { type: Boolean, default: false },
  isCorrect: { type: Boolean, default: false },
});

const topicPerformanceSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  total: { type: Number, default: 0 },
  correct: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  status: { type: String, enum: ['Weak', 'Needs Improvement', 'Good', 'Strong'], default: 'Good' },
});

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['aptitude', 'technical'],
      required: true,
    },
    topics: [String],
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Mixed'],
      default: 'Mixed',
    },
    mode: {
      type: String,
      enum: ['exam', 'practice'],
      default: 'exam',
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    timeLimitMinutes: {
      type: Number,
      default: 15,
    },
    negativeMarking: {
      type: Boolean,
      default: false,
    },
    marksPerQuestion: {
      type: Number,
      default: 1,
    },
    negativeMarksPerQuestion: {
      type: Number,
      default: 0.25,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    submittedAt: Date,
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'expired', 'abandoned'],
      default: 'in_progress',
      index: true,
    },

    // Question Snapshot protecting attempt history
    questions: [questionSnapshotSchema],
    answers: [answerRecordSchema],

    // Score Metrics
    score: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 },
    skippedCount: { type: Number, default: 0 },
    timeTakenSeconds: { type: Number, default: 0 },

    topicPerformance: [topicPerformanceSchema],
  },
  { timestamps: true }
);

quizAttemptSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);

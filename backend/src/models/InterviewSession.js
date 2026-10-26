const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetRole: {
      type: String,
      required: true,
      trim: true,
    },
    interviewType: {
      type: String,
      enum: ['hr', 'technical', 'mixed', 'project'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    questionCount: {
      type: Number,
      default: 10,
    },
    durationMinutes: {
      type: Number,
      default: 15,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null,
    },
    jobDescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDescription',
      default: null,
    },
    status: {
      type: String,
      enum: ['created', 'in_progress', 'completed', 'expired', 'abandoned'],
      default: 'in_progress',
      index: true,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    questions: [
      {
        questionId: { type: String, required: true },
        questionText: { type: String, required: true },
        category: { type: String, default: 'general' },
        topic: { type: String, default: 'general' },
        difficulty: { type: String, default: 'Medium' },
        source: {
          type: String,
          enum: ['AI_GENERATED', 'QUESTION_BANK', 'RESUME_BASED', 'JD_BASED'],
          default: 'QUESTION_BANK',
        },
        expectedConcepts: [{ type: String }],
        followUpAllowed: { type: Boolean, default: true },
        order: { type: Number, default: 1 },
        askedAt: { type: Date, default: Date.now },
      },
    ],
    overallScore: {
      type: Number,
      default: 0,
    },
    overallMetrics: {
      technicalScore: { type: Number, default: 0 },
      communicationScore: { type: Number, default: 0 },
      relevanceScore: { type: Number, default: 0 },
      completenessScore: { type: Number, default: 0 },
      clarityScore: { type: Number, default: 0 },
      answeredCount: { type: Number, default: 0 },
      skippedCount: { type: Number, default: 0 },
      unansweredCount: { type: Number, default: 0 },
    },
    summaryFeedback: {
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      actionableTips: [{ type: String }],
    },
  },
  { timestamps: true }
);

// Compound Index for fast lookup by user and status
interviewSessionSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);

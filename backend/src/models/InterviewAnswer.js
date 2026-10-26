const mongoose = require('mongoose');

const interviewAnswerSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewSession',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    questionId: {
      type: String,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    answerText: {
      type: String,
      default: '',
    },
    answerType: {
      type: String,
      enum: ['TEXT', 'VOICE'],
      default: 'TEXT',
    },
    timeTaken: {
      type: Number,
      default: 0, // seconds
    },
    isSkipped: {
      type: Boolean,
      default: false,
    },
    scores: {
      relevance: { type: Number, default: 0 }, // 0-10
      correctness: { type: Number, default: 0 }, // 0-10
      completeness: { type: Number, default: 0 }, // 0-10
      clarity: { type: Number, default: 0 }, // 0-10
      confidenceIndicator: { type: Number, default: 0 }, // 0-10 (Text-based indicator)
      overallAnswerScore: { type: Number, default: 0 }, // 0-100
    },
    starMethodAnalysis: {
      situation: { type: Boolean, default: false },
      task: { type: Boolean, default: false },
      action: { type: Boolean, default: false },
      result: { type: Boolean, default: false },
      feedback: { type: String, default: '' },
    },
    feedback: {
      keyPositives: [{ type: String }],
      improvementAreas: [{ type: String }],
      suggestedBetterAnswer: { type: String, default: '' },
    },
    nextAdaptiveQuestion: {
      questionText: { type: String, default: '' },
      difficulty: { type: String, default: 'Medium' },
      rationale: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// Compound Index
interviewAnswerSchema.index({ sessionId: 1, userId: 1, createdAt: 1 });

module.exports = mongoose.model('InterviewAnswer', interviewAnswerSchema);

const mongoose = require('mongoose');

const interviewAnalysisSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewSession',
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    scoreInterpretation: {
      type: String,
      enum: ['Excellent', 'Strong', 'Good', 'Needs Improvement', 'Weak', 'Critical Improvement Needed'],
      default: 'Good',
    },
    metricsBreakdown: {
      technicalScore: { type: Number, default: 0 },
      correctnessScore: { type: Number, default: 0 },
      communicationScore: { type: Number, default: 0 },
      completenessScore: { type: Number, default: 0 },
      relevanceScore: { type: Number, default: 0 },
      structureScore: { type: Number, default: 0 },
      questionHandlingScore: { type: Number, default: 0 },
      consistencyScore: { type: Number, default: 0 },
    },
    starAnalysis: {
      overallStarScore: { type: Number, default: 0 },
      situationScore: { type: Number, default: 0 },
      taskScore: { type: Number, default: 0 },
      actionScore: { type: Number, default: 0 },
      resultScore: { type: Number, default: 0 },
      feedback: { type: String, default: '' },
    },
    communicationAnalysis: {
      clarityScore: { type: Number, default: 0 },
      fillerWordCount: { type: Number, default: 0 },
      fillerMarkers: [{ type: String }],
      repetitionScore: { type: Number, default: 0 },
      textConfidenceIndicator: { type: Number, default: 0 },
      averageAnswerTimeSec: { type: Number, default: 0 },
      feedback: { type: String, default: '' },
    },
    technicalEvaluation: {
      conceptCoverageScore: { type: Number, default: 0 },
      coveredConcepts: [{ type: String }],
      missingConcepts: [{ type: String }],
      technicalInaccuracies: [
        {
          questionOrder: Number,
          issue: String,
          correction: String,
        },
      ],
    },
    resumeConsistency: {
      consistencyScore: { type: Number, default: 100 },
      alerts: [
        {
          skillOrProject: String,
          issue: String,
        },
      ],
    },
    jdAlignment: {
      strongestJdSkill: { type: String, default: '' },
      weakestJdSkill: { type: String, default: '' },
      jdSkillScores: { type: Map, of: Number, default: {} },
    },
    topicPerformance: [
      {
        topic: String,
        score: Number,
        status: {
          type: String,
          enum: ['Strong', 'Good', 'Needs Improvement', 'Weak'],
          default: 'Good',
        },
        questionCount: Number,
      },
    ],
    strongTopics: [{ type: String }],
    weakTopics: [{ type: String }],
    repeatedWeaknesses: [{ type: String }],
    comparisonWithPrevious: {
      previousSessionId: { type: mongoose.Schema.Types.ObjectId, default: null },
      previousScore: { type: Number, default: 0 },
      currentScore: { type: Number, default: 0 },
      improvementDelta: { type: Number, default: 0 },
      trendStatus: { type: String, enum: ['Improving', 'Stable', 'Declining', 'First Session'], default: 'First Session' },
    },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    questionAnalyses: [
      {
        questionOrder: Number,
        questionText: String,
        category: String,
        topic: String,
        difficulty: String,
        studentAnswer: String,
        isSkipped: Boolean,
        scores: {
          relevance: Number,
          correctness: Number,
          completeness: Number,
          clarity: Number,
          structure: Number,
          technicalKnowledge: Number,
          communication: Number,
          overall: Number,
        },
        coveredConcepts: [String],
        missingConcepts: [String],
        feedback: String,
        star: Object,
      },
    ],
    improvementPlan: [
      {
        priority: Number,
        area: String,
        action: String,
        timeline: String,
      },
    ],
    analysisStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'completed',
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound Index for fast lookup by user and session
interviewAnalysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewAnalysis', interviewAnalysisSchema);

const mongoose = require('mongoose');

const codingSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodingProblem',
      required: true,
      index: true,
    },
    language: {
      type: String,
      enum: ['javascript', 'python', 'java'],
      required: true,
    },
    sourceCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'Accepted',
        'Wrong Answer',
        'Compilation Error',
        'Runtime Error',
        'Time Limit Exceeded',
        'Output Limit Exceeded',
        'Execution Error',
      ],
      required: true,
      index: true,
    },
    passedTests: {
      type: Number,
      default: 0,
    },
    totalTests: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    executionTimeMs: {
      type: Number,
      default: 0,
    },
    memoryUsedMB: {
      type: Number,
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    isPracticeRun: {
      type: Boolean,
      default: false,
    },
    errorType: String,
    safeErrorMessage: String,
  },
  { timestamps: true }
);

codingSubmissionSchema.index({ userId: 1, problemId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('CodingSubmission', codingSubmissionSchema);

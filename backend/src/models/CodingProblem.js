const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
});

const codingProblemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
      index: true,
    },
    category: {
      type: String,
      default: 'Arrays',
      index: true,
    },
    topics: [
      {
        type: String,
        trim: true,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    constraints: [String],
    inputFormat: {
      type: String,
      default: 'Standard input containing problem parameters.',
    },
    outputFormat: {
      type: String,
      default: 'Standard output matching expected format.',
    },
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    starterCode: {
      javascript: String,
      python: String,
      java: String,
    },
    testCases: [testCaseSchema],
    timeLimitSeconds: {
      type: Number,
      default: 2,
    },
    memoryLimitMB: {
      type: Number,
      default: 256,
    },
    hints: [String],
    solutionExplanation: String,
    optimalApproach: String,
    timeComplexity: {
      type: String,
      default: 'O(N)',
    },
    spaceComplexity: {
      type: String,
      default: 'O(1)',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

codingProblemSchema.index({ difficulty: 1, category: 1, isActive: 1 });

module.exports = mongoose.model('CodingProblem', codingProblemSchema);

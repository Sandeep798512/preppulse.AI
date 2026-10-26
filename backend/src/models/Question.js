const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['single-choice', 'multi-select'],
      default: 'single-choice',
    },
    category: {
      type: String,
      enum: ['aptitude', 'technical'],
      required: true,
      lowercase: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subtopic: {
      type: String,
      default: '',
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
      index: true,
    },
    options: [
      {
        type: String,
        required: true,
      },
    ],
    correctAnswer: {
      type: Number, // Option Index (0, 1, 2, 3)
      required: true,
    },
    explanation: {
      type: String,
      required: [true, 'Explanation is required for answer review'],
      trim: true,
    },
    hint: {
      type: String,
      default: '',
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    marks: {
      type: Number,
      default: 1,
    },
    negativeMarks: {
      type: Number,
      default: 0,
    },
    estimatedTime: {
      type: Number,
      default: 60, // seconds
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

// Compound Indexes for fast random selection & filtering
questionSchema.index({ category: 1, topic: 1, difficulty: 1, isActive: 1 });

module.exports = mongoose.model('Question', questionSchema);

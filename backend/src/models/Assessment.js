const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['aptitude', 'technical', 'coding', 'mock_interview'],
      required: true,
    },
    topic: String,
    totalQuestions: Number,
    correctCount: Number,
    scorePercentage: Number,
    timeTakenSeconds: Number,
    weakTopicsIdentified: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assessment', assessmentSchema);

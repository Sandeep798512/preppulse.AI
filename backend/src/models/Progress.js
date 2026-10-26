const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['aptitude', 'technical', 'coding', 'interview'],
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    completedCount: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Progress', progressSchema);

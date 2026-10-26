const mongoose = require('mongoose');

const learningProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    preparationPoints: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
    },
    completedTasksCount: {
      type: Number,
      default: 0,
    },
    totalStudyMinutes: {
      type: Number,
      default: 0,
    },
    unlockedBadges: [
      {
        badgeId: String,
        name: String,
        description: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('LearningProgress', learningProgressSchema);

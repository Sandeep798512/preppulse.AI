const mongoose = require('mongoose');

const weeklyReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningRoadmap',
      required: true,
    },
    weekNumber: {
      type: Number,
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    tasksPlanned: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    breakdownByModule: {
      coding: { planned: Number, completed: Number },
      quiz: { planned: Number, completed: Number },
      interview: { planned: Number, completed: Number },
      resume: { planned: Number, completed: Number },
    },
    whatWentWell: [{ type: String }],
    topGapsRemaining: [{ type: String }],
    nextWeekPriority: { type: String },
    readinessScoreStart: { type: Number, default: 0 },
    readinessScoreEnd: { type: Number, default: 0 },
    summaryText: { type: String },
  },
  { timestamps: true }
);

weeklyReviewSchema.index({ userId: 1, weekNumber: 1 });

module.exports = mongoose.model('WeeklyReview', weeklyReviewSchema);

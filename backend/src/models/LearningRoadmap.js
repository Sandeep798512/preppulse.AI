const mongoose = require('mongoose');

const phaseSchema = new mongoose.Schema({
  phaseNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  focusArea: { type: String, required: true },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
  },
  completedTasks: { type: Number, default: 0 },
  totalTasks: { type: Number, default: 0 },
});

const weeklyGoalSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  title: { type: String, required: true },
  primaryGoal: { type: String },
  targets: [{ type: String }],
  expectedImprovement: { type: String },
  completed: { type: Boolean, default: false },
});

const learningRoadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareerGoal',
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'archived'],
      default: 'active',
      index: true,
    },
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    currentPhase: {
      type: Number,
      default: 1,
    },
    phases: [phaseSchema],
    weeklyGoals: [weeklyGoalSchema],
    dailyStudyTarget: {
      type: Number,
      default: 2,
    },
    roadmapVersion: {
      type: Number,
      default: 1,
    },
    reason: {
      type: String,
      default: 'initial_generation',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

learningRoadmapSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('LearningRoadmap', learningRoadmapSchema);

const mongoose = require('mongoose');

const roadmapTaskSchema = new mongoose.Schema(
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
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['LEARN', 'PRACTICE', 'CODE', 'QUIZ', 'INTERVIEW', 'PROJECT', 'RESUME', 'REVISION', 'REVIEW'],
      default: 'PRACTICE',
      index: true,
    },
    skill: {
      type: String,
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
    },
    estimatedMinutes: {
      type: Number,
      default: 30,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    relatedModule: {
      type: String,
      enum: ['aptitude', 'technical', 'coding', 'interview', 'resume', 'jobMatch', 'project', 'core'],
      default: 'coding',
    },
    relatedRoute: {
      type: String,
      default: '/practice',
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'skipped', 'overdue'],
      default: 'not_started',
      index: true,
    },
    weekNumber: {
      type: Number,
      default: 1,
      index: true,
    },
    dayNumber: {
      type: Number,
      default: 1,
    },
    dueDate: {
      type: Date,
      index: true,
    },
    completedAt: {
      type: Date,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

roadmapTaskSchema.index({ userId: 1, roadmapId: 1, status: 1 });
roadmapTaskSchema.index({ userId: 1, dueDate: 1 });

module.exports = mongoose.model('RoadmapTask', roadmapTaskSchema);

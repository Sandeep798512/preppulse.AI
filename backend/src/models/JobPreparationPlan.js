const mongoose = require('mongoose');

const jobPreparationPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobOpening',
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
    },
    preparationReadinessScore: {
      type: Number,
      default: 0,
    },
    skillPriorities: [
      {
        skill: String,
        currentScore: Number,
        targetScore: Number,
        gap: Number,
        priority: String,
      },
    ],
    tasks: [
      {
        dayNumber: Number,
        title: String,
        description: String,
        type: String,
        skill: String,
        relatedModule: String,
        relatedRoute: String,
        estimatedMinutes: Number,
        completed: { type: Boolean, default: false },
      },
    ],
    overallProgress: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

jobPreparationPlanSchema.index({ userId: 1, jobId: 1, status: 1 });

module.exports = mongoose.model('JobPreparationPlan', jobPreparationPlanSchema);

const mongoose = require('mongoose');

const careerGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    primaryRole: {
      type: String,
      required: [true, 'Primary target role is required'],
      trim: true,
      default: 'Software Developer',
    },
    secondaryRoles: [
      {
        type: String,
        trim: true,
      },
    ],
    targetCompanyType: {
      type: String,
      enum: ['Product-Based', 'Service-Based', 'Startup', 'FAANG / Tier 1', 'Any Placement'],
      default: 'Product-Based',
    },
    targetExperienceLevel: {
      type: String,
      enum: ['Entry Level / Fresher (0-1 yr)', 'Junior (1-2 yrs)', 'Internship'],
      default: 'Entry Level / Fresher (0-1 yr)',
    },
    targetTimeline: {
      type: String,
      enum: ['1 Month', '3 Months', '6 Months', '1 Year'],
      default: '3 Months',
    },
    dailyStudyHours: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      default: 2,
    },
    availableDays: [
      {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
    ],
    preferredLearningStyle: {
      type: String,
      enum: ['Hands-on Coding', 'Theory & MCQs', 'Balanced Mix', 'Project-Based'],
      default: 'Balanced Mix',
    },
    currentLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    goalStatus: {
      type: String,
      enum: ['active', 'paused', 'completed', 'archived'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

// Ensure index on userId + goalStatus
careerGoalSchema.index({ userId: 1, goalStatus: 1 });

module.exports = mongoose.model('CareerGoal', careerGoalSchema);

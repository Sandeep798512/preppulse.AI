const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    normalizedName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    logoUrl: {
      type: String,
      default: '',
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^https:\/\//i.test(v);
        },
        message: 'Logo URL must use secure https:// scheme',
      },
    },
    website: {
      type: String,
      default: '',
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^https:\/\//i.test(v);
        },
        message: 'Website URL must use secure https:// scheme',
      },
    },
    industry: {
      type: String,
      default: 'Information Technology',
      trim: true,
    },
    companyType: {
      type: String,
      enum: ['Product-Based', 'Service-Based', 'Startup', 'FAANG / Tier 1', 'Consulting'],
      default: 'Product-Based',
    },
    description: {
      type: String,
      default: '',
    },
    headquarters: {
      type: String,
      default: 'Bengaluru, India',
    },
    locations: [{ type: String, trim: true }],
    roles: [{ type: String, trim: true }],
    requiredSkills: [{ type: String, trim: true }],
    preferredSkills: [{ type: String, trim: true }],
    eligibilityCriteria: {
      minCGPA: { type: Number, default: 6.0 },
      maxBacklogs: { type: Number, default: 0 },
      allowedBranches: [{ type: String, default: 'Computer Science & Engineering' }],
      graduationYears: [{ type: Number, default: 2026 }],
      backlogPolicy: {
        type: String,
        enum: ['No active backlog', 'Maximum 1 backlog', 'Maximum 2 backlogs', 'Backlogs allowed', 'Not specified'],
        default: 'No active backlog',
      },
    },
    interviewProcess: [
      {
        roundNumber: Number,
        roundName: String,
        description: String,
      },
    ],
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
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

companySchema.index({ normalizedName: 1 });
companySchema.index({ companyType: 1, isActive: 1 });

module.exports = mongoose.model('Company', companySchema);

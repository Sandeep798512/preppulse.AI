const mongoose = require('mongoose');

const jobOpeningSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Target role is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: 'Pan India / Remote',
      index: true,
    },
    workMode: {
      type: String,
      enum: ['Onsite', 'Hybrid', 'Remote'],
      default: 'Hybrid',
      index: true,
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Internship', 'Contract'],
      default: 'Full-time',
    },
    experienceLevel: {
      type: String,
      default: 'Fresher (0-1 yr)',
    },
    salaryMin: {
      type: Number,
      default: 0,
    },
    salaryMax: {
      type: Number,
      default: 0,
    },
    salaryCurrency: {
      type: String,
      default: 'INR',
    },
    requiredSkills: [{ type: String, trim: true }],
    preferredSkills: [{ type: String, trim: true }],
    eligibilityCriteria: {
      minimumCGPA: { type: Number, default: 6.0 },
      maximumBacklogs: { type: Number, default: 0 },
      backlogPolicy: {
        type: String,
        enum: ['No active backlog', 'Maximum 1 backlog', 'Maximum 2 backlogs', 'Backlogs allowed', 'Not specified'],
        default: 'No active backlog',
      },
      educationRequirements: { type: String, default: 'B.Tech / B.E. / M.Tech' },
      graduationYear: { type: Number, default: 2026 },
      allowedBranches: [{ type: String, default: 'Computer Science & Engineering' }],
    },
    applicationUrl: {
      type: String,
      default: '',
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^https:\/\//i.test(v);
        },
        message: 'Application URL must use secure https:// scheme',
      },
    },
    deadline: {
      type: Date,
      index: true,
    },
    source: {
      type: String,
      enum: ['Campus Placement', 'Company Website', 'Referral', 'Job Portal', 'User Added', 'Admin Added'],
      default: 'Campus Placement',
      index: true,
    },
    sourceReference: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Expired', 'Archived'],
      default: 'Published',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

jobOpeningSchema.index({ companyId: 1, status: 1 });
jobOpeningSchema.index({ role: 1, deadline: 1 });
jobOpeningSchema.index({ location: 1, workMode: 1 });

module.exports = mongoose.model('JobOpening', jobOpeningSchema);

const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      default: 'Target Employer',
      trim: true,
    },
    location: {
      type: String,
      default: '',
    },
    employmentType: {
      type: String,
      default: 'Full-time',
    },
    description: {
      type: String,
      required: true,
    },
    responsibilities: [String],
    requiredQualifications: [String],
    preferredQualifications: [String],
    requiredSkills: [String],
    preferredSkills: [String],
    softSkills: [String],
    tools: [String],
    technologies: [String],
    educationRequirements: [String],
    experienceRequirement: {
      type: String,
      default: '',
    },
    keywords: [String],
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);

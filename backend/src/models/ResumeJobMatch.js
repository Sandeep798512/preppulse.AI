const mongoose = require('mongoose');

const resumeJobMatchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    jobDescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDescription',
      required: true,
    },
    factorScores: {
      technicalSkillScore: { type: Number, default: 0 },
      experienceProjectScore: { type: Number, default: 0 },
      qualificationScore: { type: Number, default: 0 },
      semanticKeywordScore: { type: Number, default: 0 },
      softSkillRoleScore: { type: Number, default: 0 },
    },
    overallScore: {
      type: Number,
      required: true,
    },
    matchLevel: {
      type: String,
      enum: ['Excellent Match', 'Strong Match', 'Good Match', 'Moderate Match', 'Low Match', 'Weak Match'],
      required: true,
    },
    applicationDecision: {
      type: String,
      enum: ['Strong Fit', 'Possible Fit', 'Skill Gap Heavy', 'Qualification Mismatch'],
      default: 'Possible Fit',
    },
    matchedSkills: [String],
    partialSkills: [String],
    missingRequiredSkills: [String],
    missingPreferredSkills: [String],

    qualificationMatches: [String],
    qualificationGaps: [String],

    matchedProjects: [
      {
        projectTitle: String,
        relevanceReason: String,
        score: Number,
      },
    ],
    matchedExperience: [String],
    relevantResumeSections: [String],

    criticalActions: [String],
    recommendedSkills: [String],
    preparationSuggestions: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResumeJobMatch', resumeJobMatchSchema);

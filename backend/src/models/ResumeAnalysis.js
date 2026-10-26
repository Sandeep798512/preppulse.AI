const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema(
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
    matchingSkills: [String],
    missingSkills: [String],
    partialSkills: [String],
    extraSkills: [String],
    keywordMatchScore: {
      type: Number,
      default: 0,
    },
    semanticMatchScore: {
      type: Number,
      default: 0,
    },
    compatibilityScore: {
      type: Number,
      required: true,
    },
    scoreBreakdown: {
      skillMatch: Number,       // 35% weight
      experienceMatch: Number,  // 20% weight
      keywordMatch: Number,     // 15% weight
      educationMatch: Number,   // 10% weight
      semanticRelevance: Number // 20% weight
    },
    recommendations: [String],
    explanation: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

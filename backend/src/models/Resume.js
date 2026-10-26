const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx'],
      required: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
    parsedData: {
      contactInfo: {
        name: String,
        email: String,
        phone: String,
        linkedin: String,
        github: String,
        portfolio: String,
      },
      skills: [String],
      education: [
        {
          institution: String,
          degree: String,
          year: String,
          score: String,
        },
      ],
      projects: [
        {
          title: String,
          description: String,
          technologies: [String],
        },
      ],
      experience: [
        {
          role: String,
          company: String,
          duration: String,
          highlights: [String],
        },
      ],
      certifications: [String],
    },
    // Scores
    resumeScore: { type: Number, default: 0 },
    atsCompatibilityScore: { type: Number, default: 0 },
    sectionScore: { type: Number, default: 0 },
    contentScore: { type: Number, default: 0 },
    skillsScore: { type: Number, default: 0 },
    experienceScore: { type: Number, default: 0 },
    readabilityScore: { type: Number, default: 0 },

    // Top Level arrays for quick access
    skills: [String],
    education: [mongoose.Schema.Types.Mixed],
    experience: [mongoose.Schema.Types.Mixed],
    projects: [mongoose.Schema.Types.Mixed],
    certifications: [String],

    // AI Analysis Findings
    strengths: [String],
    weaknesses: [String],
    recommendations: [
      {
        priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
        text: String,
      },
    ],
    missingSections: [String],
    keywordSuggestions: [String],
    projectSuggestions: [String],
    contentIssues: [
      {
        weakStatement: String,
        suggestion: String,
      },
    ],
    sectionChecklist: {
      contactInfo: { type: Boolean, default: false },
      summary: { type: Boolean, default: false },
      education: { type: Boolean, default: false },
      skills: { type: Boolean, default: false },
      projects: { type: Boolean, default: false },
      experience: { type: Boolean, default: false },
      certifications: { type: Boolean, default: false },
    },
    analysisStatus: {
      type: String,
      enum: ['pending', 'analyzing', 'completed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);

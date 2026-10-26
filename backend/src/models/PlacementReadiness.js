const mongoose = require('mongoose');
const { SCORING_VERSION } = require('../config/readinessConfig');

const placementReadinessSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    scoringVersion: {
      type: String,
      default: SCORING_VERSION,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    scoreInterpretation: {
      type: String,
      enum: ['Placement Ready', 'Highly Prepared', 'Good Preparation', 'Needs Improvement', 'Underprepared', 'Significant Preparation Required'],
      default: 'Good Preparation',
    },
    dataCoveragePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    confidenceLevel: {
      type: String,
      enum: ['High Confidence', 'Medium Confidence', 'Low Confidence'],
      default: 'Medium Confidence',
    },
    scoresBreakdown: {
      resume: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 0.10 },
        contribution: { type: Number, default: 0 },
        status: { type: String, default: 'Pending' },
      },
      jobMatch: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 0.10 },
        contribution: { type: Number, default: 0 },
        status: { type: String, default: 'Pending' },
      },
      aptitude: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 0.15 },
        contribution: { type: Number, default: 0 },
        status: { type: String, default: 'Pending' },
      },
      technical: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 0.15 },
        contribution: { type: Number, default: 0 },
        status: { type: String, default: 'Pending' },
      },
      coding: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 0.20 },
        contribution: { type: Number, default: 0 },
        status: { type: String, default: 'Pending' },
      },
      interview: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 0.20 },
        contribution: { type: Number, default: 0 },
        status: { type: String, default: 'Pending' },
      },
      communication: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 0.10 },
        contribution: { type: Number, default: 0 },
        status: { type: String, default: 'Pending' },
      },
    },
    skillMatrix: [
      {
        skill: { type: String, required: true },
        level: {
          type: String,
          enum: ['Strong', 'Moderate', 'Weak', 'Missing'],
          default: 'Moderate',
        },
      },
    ],
    criticalGaps: [
      {
        gap: { type: String, required: true },
        role: { type: String, default: 'Software Developer' },
        severity: { type: String, enum: ['Critical', 'High', 'Medium'], default: 'High' },
      },
    ],
    targetRolesReadiness: [
      {
        role: { type: String, required: true },
        score: { type: Number, required: true },
        requiredSkills: [{ type: String }],
        missingSkills: [{ type: String }],
      },
    ],
    recommendations: [
      {
        priority: {
          type: String,
          enum: ['Critical', 'High', 'Medium', 'Low'],
          default: 'High',
        },
        action: { type: String, required: true },
        module: { type: String, default: 'general' },
        estimatedMinutes: { type: Number, default: 30 },
      },
    ],
    weeklyPlan: [
      {
        day: { type: String, required: true },
        task: { type: String, required: true },
        module: { type: String, default: 'general' },
        completed: { type: Boolean, default: false },
      },
    ],
    strongAreas: [{ type: String }],
    weakAreas: [{ type: String }],
    lastCalculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlacementReadiness', placementReadinessSchema);

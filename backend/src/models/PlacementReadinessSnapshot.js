const mongoose = require('mongoose');
const { SCORING_VERSION } = require('../config/readinessConfig');

const placementReadinessSnapshotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    scoringVersion: {
      type: String,
      default: SCORING_VERSION,
    },
    overallScore: { type: Number, required: true },
    resumeScore: { type: Number, default: 0 },
    jobMatchScore: { type: Number, default: 0 },
    aptitudeScore: { type: Number, default: 0 },
    technicalScore: { type: Number, default: 0 },
    codingScore: { type: Number, default: 0 },
    interviewScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    dataCoveragePercentage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound Index for fast historical query
placementReadinessSnapshotSchema.index({ userId: 1, createdAt: 1 });

module.exports = mongoose.model('PlacementReadinessSnapshot', placementReadinessSnapshotSchema);

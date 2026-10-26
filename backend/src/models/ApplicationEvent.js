const mongoose = require('mongoose');

const applicationEventSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobApplication',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    previousStatus: {
      type: String,
      default: '',
    },
    newStatus: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

applicationEventSchema.index({ applicationId: 1, timestamp: -1 });

module.exports = mongoose.model('ApplicationEvent', applicationEventSchema);

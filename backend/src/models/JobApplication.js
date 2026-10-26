const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobOpening',
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'Saved',
        'Planning to Apply',
        'Applied',
        'Assessment',
        'Technical Interview',
        'HR Interview',
        'Final Round',
        'Selected',
        'Rejected',
        'Withdrawn',
        'On Hold',
        'Offer Received',
        'Joined',
      ],
      default: 'Saved',
      index: true,
    },
    appliedAt: {
      type: Date,
    },
    source: {
      type: String,
      default: 'Campus Placement',
    },
    resumeVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    coverLetter: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    assessmentDate: {
      type: Date,
    },
    technicalInterviewDate: {
      type: Date,
    },
    hrInterviewDate: {
      type: Date,
    },
    nextAction: {
      type: String,
      default: '',
    },
    nextActionDate: {
      type: Date,
      index: true,
    },
    recruiterName: {
      type: String,
      default: '',
    },
    recruiterContact: {
      type: String,
      default: '',
    },
    offerStatus: {
      type: String,
      enum: ['None', 'Received', 'Accepted', 'Declined', 'Expired', 'Joined'],
      default: 'None',
    },
    salaryOffered: {
      type: Number,
      default: 0,
    },
    joiningDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      enum: [
        'None',
        'Eligibility',
        'Resume',
        'Aptitude',
        'Coding',
        'Technical Interview',
        'Communication',
        'HR',
        'Other',
        'Unknown',
      ],
      default: 'None',
    },
  },
  { timestamps: true }
);

jobApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });
jobApplicationSchema.index({ userId: 1, status: 1 });
jobApplicationSchema.index({ userId: 1, nextActionDate: 1 });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);

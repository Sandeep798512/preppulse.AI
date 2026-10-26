const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    profile: {
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      bio: { type: String, default: '' },
    },
    education: {
      degree: { type: String, default: 'B.Tech' },
      branch: { type: String, default: 'Computer Science & Engineering' },
      college: { type: String, default: '' },
      graduationYear: { type: Number, default: 2026 },
      cgpa: { type: Number, default: 0 },
      backlogs: { type: Number, default: 0 },
    },
    targetRoles: [
      {
        type: String,
        trim: true,
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: [
      {
        title: String,
        company: String,
        duration: String,
        description: String,
      },
    ],
    projects: [
      {
        title: String,
        description: String,
        techStack: [String],
        githubUrl: String,
      },
    ],
    certifications: [
      {
        title: String,
        issuer: String,
        year: Number,
      },
    ],
    preferences: {
      interviewDuration: { type: Number, default: 15 },
      difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);

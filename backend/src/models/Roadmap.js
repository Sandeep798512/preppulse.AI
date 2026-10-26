const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  estimatedHours: { type: Number, default: 2 },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  category: { type: String, enum: ['Aptitude', 'DSA', 'Core CS', 'Domain Skill', 'System Design', 'Interview Prep'], default: 'Core CS' },
  completed: { type: Boolean, default: false },
});

const weekSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  focusArea: { type: String, required: true },
  tasks: [taskSchema],
});

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    totalWeeks: {
      type: Number,
      default: 4,
    },
    weeks: [weekSchema],
    progressPercentage: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Roadmap', roadmapSchema);

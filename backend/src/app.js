const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const jobRoutes = require('./routes/jobRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const questionRoutes = require('./routes/questionRoutes');
const quizRoutes = require('./routes/quizRoutes');
const codingRoutes = require('./routes/codingRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const readinessRoutes = require('./routes/readinessRoutes');
const careerGoalRoutes = require('./routes/careerGoalRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const careerCoachRoutes = require('./routes/careerCoachRoutes');
const companyRoutes = require('./routes/companyRoutes');
const jobOpeningRoutes = require('./routes/jobOpeningRoutes');
const jobApplicationRoutes = require('./routes/jobApplicationRoutes');
const placementIntelligenceRoutes = require('./routes/placementIntelligenceRoutes');

const app = express();

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false,
}));

// Cross Origin Resource Sharing
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api/', limiter);

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static upload folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'AI Placement Preparation & Interview Analysis System',
    timestamp: new Date().toISOString(),
  });
});

// Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/job-descriptions', jobRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/placement-readiness', readinessRoutes);
app.use('/api/career-goals', careerGoalRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/career-coach', careerCoachRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobOpeningRoutes);
app.use('/api/applications', jobApplicationRoutes);
app.use('/api/placement-intelligence', placementIntelligenceRoutes);
app.use('/api/application-analytics', placementIntelligenceRoutes);

app.use('/api/analytics', (req, res, next) => {
  try {
    const analyticsRoutes = require('./routes/analyticsRoutes');
    return analyticsRoutes(req, res, next);
  } catch (e) {
    next();
  }
});

app.use('/api/ai', (req, res, next) => {
  try {
    const aiRoutes = require('./routes/aiRoutes');
    return aiRoutes(req, res, next);
  } catch (e) {
    next();
  }
});

app.use('/api/admin', (req, res, next) => {
  try {
    const adminRoutes = require('./routes/adminRoutes');
    return adminRoutes(req, res, next);
  } catch (e) {
    next();
  }
});

// Central Error Handler
app.use(errorHandler);

module.exports = app;

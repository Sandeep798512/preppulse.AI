const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_academic_key_2026', {
    expiresIn: '7d',
  });
};

// @desc    Register a new student/user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, targetRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
        code: 'VALIDATION_ERROR',
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
        code: 'EMAIL_EXISTS',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'student',
      targetRoles: targetRole ? [targetRole] : ['Software Developer'],
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        targetRoles: user.targetRoles,
        skills: user.skills,
        isOnboarded: user.isOnboarded,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      code: 'SERVER_ERROR',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
        code: 'VALIDATION_ERROR',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        targetRoles: user.targetRoles,
        skills: user.skills,
        isOnboarded: user.isOnboarded,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      code: 'SERVER_ERROR',
    });
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user data',
    });
  }
};

// @desc    Instant Demo Login for Viva Demonstrations
// @route   POST /api/auth/demo-login
// @access  Public
const demoLogin = async (req, res) => {
  try {
    let demoUser = await User.findOne({ email: 'demo.student@placement.edu' });
    if (!demoUser) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('DemoPass123!', salt);

      demoUser = await User.create({
        name: 'Rahul Sharma (Demo)',
        email: 'demo.student@placement.edu',
        passwordHash,
        role: 'student',
        isDemo: true,
        targetRoles: ['Full Stack Developer', 'Software Developer'],
        skills: ['Java', 'React', 'Node.js', 'SQL', 'Git', 'DSA', 'MongoDB', 'REST API'],
        education: {
          degree: 'B.Tech',
          branch: 'Computer Science & Engineering',
          college: 'National Institute of Technology',
          graduationYear: 2026,
          cgpa: 8.7,
          backlogs: 0,
        },
        isOnboarded: true,
      });
    }

    const token = generateToken(demoUser._id);

    res.json({
      success: true,
      token,
      user: {
        id: demoUser._id,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        targetRoles: demoUser.targetRoles,
        skills: demoUser.skills,
        education: demoUser.education,
        isOnboarded: demoUser.isOnboarded,
      },
    });
  } catch (error) {
    console.error('Demo Login Error:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate demo session' });
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'No account found with this email' });
  }

  res.json({
    success: true,
    message: 'Password reset link has been dispatched to your email address (Simulated Architecture).',
    resetToken: 'simulated-reset-token-' + Date.now(),
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  demoLogin,
  forgotPassword,
};

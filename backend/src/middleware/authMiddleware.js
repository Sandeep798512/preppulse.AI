const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Handle demo token for instant offline / Viva demo
      if (token === 'demo-jwt-token-guest-user') {
        let demoUser = await User.findOne({ email: 'demo.student@placement.edu' });
        if (!demoUser) {
          demoUser = await User.create({
            name: 'Rahul Sharma (Demo)',
            email: 'demo.student@placement.edu',
            passwordHash: 'demo_hashed_password',
            role: 'student',
            isDemo: true,
            targetRoles: ['Full Stack Developer', 'Software Developer'],
            skills: ['Java', 'React', 'Node.js', 'SQL', 'Git', 'DSA'],
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
        req.user = demoUser;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_academic_key_2026');
      req.user = await User.findById(decoded.id).select('-passwordHash');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User account not found', code: 'USER_NOT_FOUND' });
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired', code: 'UNAUTHORIZED' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided', code: 'NO_TOKEN' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admin privileges required', code: 'FORBIDDEN' });
  }
};

const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      if (token === 'demo-jwt-token-guest-user') {
        req.user = await User.findOne({ email: 'demo.student@placement.edu' });
        return next();
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_academic_key_2026');
      req.user = await User.findById(decoded.id).select('-passwordHash');
    } catch (e) {
      // Ignore token failure for optional auth
    }
  }
  next();
};

module.exports = protect;
module.exports.protect = protect;
module.exports.adminOnly = adminOnly;
module.exports.optionalAuth = optionalAuth;

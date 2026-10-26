const User = require('../models/User');

// @desc    Get current user profile & onboarding data
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, profile: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

// @desc    Update profile & complete onboarding setup wizard
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      bio,
      education,
      targetRoles,
      skills,
      experience,
      projects,
      certifications,
      preferences,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.profile.phone = phone;
    if (location !== undefined) user.profile.location = location;
    if (bio !== undefined) user.profile.bio = bio;

    if (education) {
      user.education = {
        ...user.education.toObject(),
        ...education,
      };
    }

    if (Array.isArray(targetRoles)) user.targetRoles = targetRoles;
    if (Array.isArray(skills)) user.skills = skills;
    if (Array.isArray(experience)) user.experience = experience;
    if (Array.isArray(projects)) user.projects = projects;
    if (Array.isArray(certifications)) user.certifications = certifications;

    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences,
      };
    }

    user.isOnboarded = true;
    await user.save();

    const updatedUser = await User.findById(user._id).select('-passwordHash');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedUser,
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};

const JobDescription = require('../models/JobDescription');
const { analyzeJobDescriptionText } = require('../services/ai/jobDescriptionAnalyzer');

// @desc    Analyze & Save Job Description
// @route   POST /api/jobs/analyze
// @access  Private
const analyzeJobDescription = async (req, res) => {
  try {
    const { title, company, description } = req.body;

    if (!description || description.trim().length < 30) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid job description containing enough information for analysis.',
        code: 'INVALID_JD_TEXT',
      });
    }

    // Run AI & Heuristic JD Extraction
    const extractedData = await analyzeJobDescriptionText(description);

    const jobDoc = await JobDescription.create({
      userId: req.user._id,
      title: title || extractedData.jobTitle || 'Software Engineer',
      company: company || extractedData.company || 'Target Employer',
      location: extractedData.location,
      employmentType: extractedData.employmentType,
      description,
      responsibilities: extractedData.responsibilities,
      requiredQualifications: extractedData.requiredQualifications,
      preferredQualifications: extractedData.preferredQualifications,
      requiredSkills: extractedData.requiredSkills,
      preferredSkills: extractedData.preferredSkills,
      softSkills: extractedData.softSkills,
      tools: extractedData.technologies,
      technologies: extractedData.technologies,
      educationRequirements: extractedData.educationRequirements,
      experienceRequirement: extractedData.experienceRequirement,
      keywords: extractedData.keywords,
    });

    res.status(201).json({
      success: true,
      message: 'Job Description analyzed and saved successfully.',
      jobDescription: jobDoc,
    });
  } catch (error) {
    console.error('JD Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Unable to analyze job description',
      code: 'JD_ANALYSIS_FAILED',
    });
  }
};

// @desc    Get user's saved Job Descriptions
// @route   GET /api/jobs
// @access  Private
const getUserJobDescriptions = async (req, res) => {
  try {
    const jobs = await JobDescription.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: jobs.length,
      jobDescriptions: jobs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve job descriptions' });
  }
};

// @desc    Get single Job Description by ID
// @route   GET /api/jobs/:id
// @access  Private
const getJobDescriptionById = async (req, res) => {
  try {
    const job = await JobDescription.findOne({ _id: req.params.id, userId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job Description not found' });
    }
    res.json({ success: true, jobDescription: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch job description' });
  }
};

// @desc    Delete single Job Description
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJobDescription = async (req, res) => {
  try {
    const job = await JobDescription.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job Description not found or access denied' });
    }
    res.json({ success: true, message: 'Job Description deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete job description' });
  }
};

module.exports = {
  analyzeJobDescription,
  getUserJobDescriptions,
  getJobDescriptionById,
  deleteJobDescription,
};

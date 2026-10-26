const Resume = require('../models/Resume');
const { extractTextFromBuffer, parseResumeBasic } = require('../utils/resumeParser');
const { analyzeResumeText } = require('../services/ai/resumeAnalyzer');

// @desc    Upload PDF/DOCX Resume & Extract Text
// @route   POST /api/resume/upload
// @access  Private
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a PDF or DOCX file.',
        code: 'NO_FILE',
      });
    }

    const { originalname, mimetype, buffer } = req.file;
    const fileType = originalname.split('.').pop().toLowerCase() === 'pdf' ? 'pdf' : 'docx';

    // Extract text from memory buffer
    const extractedText = await extractTextFromBuffer(buffer, mimetype, originalname);

    // Basic deterministic parse
    const basicParsed = parseResumeBasic(extractedText);

    const resumeDoc = await Resume.create({
      userId: req.user._id,
      originalFileName: originalname,
      fileType,
      extractedText,
      parsedData: {
        contactInfo: basicParsed.contactInfo,
        skills: basicParsed.extractedSkills,
      },
      skills: basicParsed.extractedSkills,
      sectionChecklist: basicParsed.sectionChecklist,
      analysisStatus: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and text extracted successfully.',
      resume: resumeDoc,
    });
  } catch (error) {
    console.error('Resume Upload Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to process uploaded resume file',
      code: 'UPLOAD_FAILED',
    });
  }
};

// @desc    Analyze extracted resume text with AI & transparent scoring engine
// @route   POST /api/resume/:id/analyze
// @access  Private
const analyzeResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume document not found or access denied.',
        code: 'NOT_FOUND',
      });
    }

    resume.analysisStatus = 'analyzing';
    await resume.save();

    const targetRole = req.user.targetRoles?.[0] || req.body.targetRole || 'Software Developer';

    // Run AI / Heuristic Analysis
    const analysisResult = await analyzeResumeText(resume.extractedText, targetRole);

    // Update Resume document with calculated findings & component scores
    resume.resumeScore = analysisResult.scores.resumeScore;
    resume.atsCompatibilityScore = analysisResult.scores.atsCompatibilityScore;
    resume.sectionScore = analysisResult.scores.structureScore;
    resume.contentScore = analysisResult.scores.contentScore;
    resume.skillsScore = analysisResult.scores.skillsScore;
    resume.experienceScore = analysisResult.scores.experienceScore;
    resume.readabilityScore = analysisResult.scores.readabilityScore;

    resume.strengths = analysisResult.strengths;
    resume.weaknesses = analysisResult.weaknesses;
    resume.missingSections = analysisResult.missingSections;
    resume.contentIssues = analysisResult.contentIssues;
    resume.keywordSuggestions = analysisResult.keywordSuggestions;
    resume.projectSuggestions = analysisResult.projectSuggestions;
    resume.recommendations = analysisResult.recommendations;

    // Update section checklist
    if (analysisResult.parsedBasic?.sectionChecklist) {
      resume.sectionChecklist = analysisResult.parsedBasic.sectionChecklist;
    }

    resume.analysisStatus = 'completed';
    await resume.save();

    res.json({
      success: true,
      message: 'Resume analysis completed successfully.',
      resume,
    });
  } catch (error) {
    console.error('Resume Analysis Error:', error);

    // Update status to failed
    await Resume.findByIdAndUpdate(req.params.id, { analysisStatus: 'failed' });

    res.status(500).json({
      success: false,
      message: error.message || 'AI Resume analysis encountered an unexpected error',
      code: 'ANALYSIS_FAILED',
    });
  }
};

// @desc    Get all uploaded resumes for logged-in user
// @route   GET /api/resume
// @access  Private
const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: resumes.length,
      resumes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve resumes' });
  }
};

// @desc    Get single resume analysis by ID
// @route   GET /api/resume/:id
// @access  Private
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume analysis not found' });
    }
    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve resume details' });
  }
};

// @desc    Delete single resume analysis
// @route   DELETE /api/resume/:id
// @access  Private
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found or access denied' });
    }

    res.json({
      success: true,
      message: 'Resume record deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete resume' });
  }
};

module.exports = {
  uploadResume,
  analyzeResume,
  getUserResumes,
  getResumeById,
  deleteResume,
};

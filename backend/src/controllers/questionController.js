const Question = require('../models/Question');

// @desc    Get paginated & filtered questions (with answer security for students)
// @route   GET /api/questions
// @access  Private (Student & Admin)
const getQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    // Students only get active questions
    if (!req.user || req.user.role !== 'admin') {
      filter.isActive = true;
    } else if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    if (req.query.category) {
      filter.category = req.query.category.toLowerCase();
    }
    if (req.query.topic) {
      filter.topic = new RegExp(req.query.topic, 'i');
    }
    if (req.query.subtopic) {
      filter.subtopic = new RegExp(req.query.subtopic, 'i');
    }
    if (req.query.difficulty && req.query.difficulty !== 'Mixed') {
      filter.difficulty = req.query.difficulty;
    }
    if (req.query.tags) {
      const tagsArr = req.query.tags.split(',').map(t => t.trim());
      filter.tags = { $in: tagsArr };
    }
    if (req.query.search) {
      filter.question = new RegExp(req.query.search, 'i');
    }

    const total = await Question.countDocuments(filter);
    let questionsQuery = Question.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

    // SECURITY: Strip correctAnswer & explanation for non-admins to prevent leaks
    if (!req.user || req.user.role !== 'admin') {
      questionsQuery = questionsQuery.select('-correctAnswer -explanation -hint');
    }

    const questions = await questionsQuery;

    res.json({
      success: true,
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Get Questions Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve questions' });
  }
};

// @desc    Admin Create New Question
// @route   POST /api/questions
// @access  Private (Admin Only)
const createQuestion = async (req, res) => {
  try {
    const {
      question,
      category,
      topic,
      subtopic,
      difficulty,
      options,
      correctAnswer,
      explanation,
      hint,
      tags,
      marks,
      negativeMarks,
    } = req.body;

    if (!question || !category || !topic || !options || correctAnswer === undefined || !explanation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide question text, category, topic, 4 options, correctAnswer index, and explanation.',
        code: 'VALIDATION_ERROR',
      });
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({
        success: false,
        message: 'Question must contain exactly four options.',
        code: 'INVALID_OPTIONS_COUNT',
      });
    }

    const newQuestion = await Question.create({
      question,
      category: category.toLowerCase(),
      topic,
      subtopic: subtopic || '',
      difficulty: difficulty || 'Medium',
      options,
      correctAnswer: Number(correctAnswer),
      explanation,
      hint: hint || '',
      tags: Array.isArray(tags) ? tags : [],
      marks: Number(marks) || 1,
      negativeMarks: Number(negativeMarks) || 0,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Question created successfully.',
      question: newQuestion,
    });
  } catch (error) {
    console.error('Create Question Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create question' });
  }
};

// @desc    Admin Update Question
// @route   PUT /api/questions/:id
// @access  Private (Admin Only)
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const fields = ['question', 'category', 'topic', 'subtopic', 'difficulty', 'options', 'correctAnswer', 'explanation', 'hint', 'tags', 'marks', 'negativeMarks', 'isActive'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        question[field] = req.body[field];
      }
    });

    await question.save();
    res.json({ success: true, message: 'Question updated successfully', question });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update question' });
  }
};

// @desc    Admin Toggle Active Status
// @route   PATCH /api/questions/:id/status
// @access  Private (Admin Only)
const toggleQuestionStatus = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    question.isActive = !question.isActive;
    await question.save();

    res.json({
      success: true,
      message: `Question ${question.isActive ? 'activated' : 'deactivated'} successfully.`,
      isActive: question.isActive,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle question status' });
  }
};

// @desc    Admin Delete Question
// @route   DELETE /api/questions/:id
// @access  Private (Admin Only)
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.json({ success: true, message: 'Question deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete question' });
  }
};

// @desc    Admin Bulk JSON Question Import
// @route   POST /api/admin/questions/import
// @access  Private (Admin Only)
const bulkImportQuestions = async (req, res) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of question objects.' });
    }

    let importedCount = 0;
    let rejectedCount = 0;
    const errors = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (q.question && q.category && q.topic && Array.isArray(q.options) && q.options.length === 4 && q.correctAnswer !== undefined && q.explanation) {
        await Question.create({
          ...q,
          category: q.category.toLowerCase(),
          createdBy: req.user._id,
        });
        importedCount++;
      } else {
        rejectedCount++;
        errors.push(`Record ${i + 1}: Missing required fields or invalid options count.`);
      }
    }

    res.json({
      success: true,
      message: `Import completed: ${importedCount} imported, ${rejectedCount} rejected.`,
      importedCount,
      rejectedCount,
      errors,
    });
  } catch (error) {
    console.error('Bulk Import Error:', error);
    res.status(500).json({ success: false, message: 'Bulk import failed' });
  }
};

module.exports = {
  getQuestions,
  createQuestion,
  updateQuestion,
  toggleQuestionStatus,
  deleteQuestion,
  bulkImportQuestions,
};

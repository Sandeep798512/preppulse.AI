const Company = require('../models/Company');

/**
 * GET /api/companies
 * Search & List active companies
 */
const getCompanies = async (req, res, next) => {
  try {
    const { search, industry, companyType } = req.query;
    const filter = { isActive: true };

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (industry) filter.industry = industry;
    if (companyType) filter.companyType = companyType;

    const companies = await Company.find(filter).sort({ name: 1 });
    res.json({
      success: true,
      data: companies,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/companies/:id
 * Get company details by ID
 */
const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.json({
      success: true,
      data: company,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/companies
 * Create a new company (Admin / Verified User)
 */
const createCompany = async (req, res, next) => {
  try {
    const { name, logoUrl, website, industry, companyType, description, headquarters, locations, roles, requiredSkills, preferredSkills, eligibilityCriteria, interviewProcess, difficulty } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    const normalizedName = name.toLowerCase().trim();
    let company = await Company.findOne({ normalizedName });
    if (company) {
      return res.status(400).json({ success: false, message: 'Company with this name already exists' });
    }

    company = await Company.create({
      name: name.trim(),
      normalizedName,
      logoUrl: logoUrl || '',
      website: website || '',
      industry: industry || 'Information Technology',
      companyType: companyType || 'Product-Based',
      description: description || '',
      headquarters: headquarters || 'Bengaluru, India',
      locations: locations || ['Bengaluru', 'Hyderabad', 'Pune'],
      roles: roles || ['Software Developer', 'Full Stack Developer'],
      requiredSkills: requiredSkills || ['JavaScript', 'DSA', 'SQL'],
      preferredSkills: preferredSkills || ['React', 'Node.js'],
      eligibilityCriteria: eligibilityCriteria || {},
      interviewProcess: interviewProcess || [],
      difficulty: difficulty || 'Medium',
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/companies/:id
 */
const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    res.json({ success: true, message: 'Company updated successfully', data: company });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
};

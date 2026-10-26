const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
} = require('../controllers/companyController');

router.use(protect);

router.route('/')
  .get(getCompanies)
  .post(createCompany);

router.route('/:id')
  .get(getCompanyById)
  .put(updateCompany);

module.exports = router;

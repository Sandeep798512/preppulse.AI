const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getJobOpenings,
  getJobOpeningById,
  createJobOpening,
  getJobEligibility,
  getJobReadiness,
  triggerJobPreparationPlan,
  getJobPreparationPlan,
} = require('../controllers/jobOpeningController');
const { handleJobComparison } = require('../controllers/placementIntelligenceController');
const {
  analyzeJobDescription,
  getUserJobDescriptions,
  getJobDescriptionById: getSavedJDById,
  deleteJobDescription,
} = require('../controllers/jobController');

router.use(protect);

// Phase 3 Job Description Analysis
router.post('/analyze', analyzeJobDescription);
router.get('/descriptions', getUserJobDescriptions);
router.get('/descriptions/:id', getSavedJDById);
router.delete('/descriptions/:id', deleteJobDescription);

router.route('/')
  .get(getJobOpenings)
  .post(createJobOpening);

router.post('/compare', handleJobComparison);

router.route('/:id')
  .get(getJobOpeningById);

router.get('/:id/eligibility', getJobEligibility);
router.get('/:id/readiness', getJobReadiness);
router.post('/:id/preparation/generate', triggerJobPreparationPlan);
router.get('/:id/preparation', getJobPreparationPlan);

module.exports = router;

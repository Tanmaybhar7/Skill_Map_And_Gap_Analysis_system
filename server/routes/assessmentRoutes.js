const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.get('/', assessmentController.getAssessments);
router.post('/', authorizeRoles('Admin', 'Faculty'), assessmentController.createAssessment);
router.get('/results', assessmentController.getAssessmentResults);
router.post('/submit', assessmentController.submitAssessmentResult);

module.exports = router;

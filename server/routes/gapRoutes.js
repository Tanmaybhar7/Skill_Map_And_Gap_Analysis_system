const express = require('express');
const router = express.Router();
const gapController = require('../controllers/gapController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/user/:userId?', gapController.getUserGapAnalysis);
router.get('/department-summary', gapController.getDepartmentGapSummary);

module.exports = router;

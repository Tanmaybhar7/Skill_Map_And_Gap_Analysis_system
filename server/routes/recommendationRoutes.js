const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.get('/user/:userId?', recommendationController.getRecommendationsForUser);
router.post('/assign', authorizeRoles('Admin', 'Faculty', 'Training Manager'), recommendationController.assignRecommendation);

module.exports = router;

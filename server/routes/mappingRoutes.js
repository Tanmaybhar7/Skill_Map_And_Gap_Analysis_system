const express = require('express');
const router = express.Router();
const mappingController = require('../controllers/mappingController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/matrix', mappingController.getUserSkillMatrix);
router.post('/map', mappingController.mapUserSkill);
router.get('/department-matrix', mappingController.getDepartmentSkillMatrix);

module.exports = router;

const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.get('/', skillController.getSkills);
router.get('/:id', skillController.getSkillById);
router.post('/', authorizeRoles('Admin', 'Faculty', 'Training Manager'), skillController.createSkill);
router.put('/:id', authorizeRoles('Admin', 'Faculty', 'Training Manager'), skillController.updateSkill);
router.delete('/:id', authorizeRoles('Admin'), skillController.deleteSkill);

module.exports = router;

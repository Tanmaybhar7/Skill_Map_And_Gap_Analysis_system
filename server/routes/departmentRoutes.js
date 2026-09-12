const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.get('/', departmentController.getDepartments);
router.get('/:id', departmentController.getDepartmentById);
router.post('/', authorizeRoles('Admin'), departmentController.createDepartment);
router.put('/:id', authorizeRoles('Admin'), departmentController.updateDepartment);
router.delete('/:id', authorizeRoles('Admin'), departmentController.deleteDepartment);

module.exports = router;

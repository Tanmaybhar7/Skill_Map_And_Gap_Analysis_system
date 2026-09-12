const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', authorizeRoles('Admin', 'Faculty', 'Training Manager'), courseController.createCourse);
router.put('/:id', authorizeRoles('Admin', 'Faculty', 'Training Manager'), courseController.updateCourse);
router.delete('/:id', authorizeRoles('Admin'), courseController.deleteCourse);

module.exports = router;

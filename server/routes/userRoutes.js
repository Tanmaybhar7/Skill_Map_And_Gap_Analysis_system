const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authenticateToken);

router.get('/', userController.getUsers);
router.get('/export-csv', userController.exportUsersCSV);
router.post('/import-csv', upload.single('file'), userController.importUsersCSV);
router.get('/:id', userController.getUserById);
router.post('/', authorizeRoles('Admin', 'HR Manager'), userController.createUser);
router.put('/:id', authorizeRoles('Admin', 'HR Manager'), userController.updateUser);
router.delete('/:id', authorizeRoles('Admin'), userController.deleteUser);

module.exports = router;

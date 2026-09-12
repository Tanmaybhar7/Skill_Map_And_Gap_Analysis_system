const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.get('/', settingsController.getSettings);
router.put('/', authorizeRoles('Admin'), settingsController.updateSettings);
router.get('/audit-logs', authorizeRoles('Admin'), settingsController.getAuditLogs);
router.post('/backup', authorizeRoles('Admin'), settingsController.backupDatabase);

module.exports = router;

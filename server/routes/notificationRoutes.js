const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/change-password', authenticateToken, authController.changePassword);

module.exports = router;

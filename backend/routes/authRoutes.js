// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/activate', authController.activateAccount);
router.post('/change-password', auth(['patient', 'provider', 'admin']), authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/profile', auth(['patient', 'provider', 'admin']), authController.getProfile);
router.post('/profile/update', auth(['patient', 'provider', 'admin']), authController.updateProfile);
router.post('/select-provider', authController.selectProvider);
router.post('/refresh', auth(['patient', 'provider', 'admin']), authController.refreshToken);

module.exports = router;
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/change-password', auth(['patient', 'provider', 'admin']), authController.changePassword);

module.exports = router;
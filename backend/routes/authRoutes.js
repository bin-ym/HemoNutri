const express = require('express');
const {
  login,
  register,
  activateAccount,
  changePassword,
  forgotPassword,
  resetPassword,
  getProfile,
  selectProvider,
  updateProfile,
} = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/activate', activateAccount);
router.post('/change-password', auth, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', auth, getProfile);
router.post('/profile/update', auth, updateProfile);
router.post('/select-provider', selectProvider);

module.exports = router;
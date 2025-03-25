const express = require('express');
const { getNotifications } = require('../controllers/notificationController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth(['patient', 'provider', 'admin']), getNotifications);

module.exports = router;
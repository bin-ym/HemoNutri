// backend/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.post('/', auth(['admin']), notificationController.sendNotification);
router.get('/', auth(['admin', 'patient', 'registered']), notificationController.getUserNotifications);
router.delete('/:id/notification', auth(['admin']), notificationController.deleteNotification);
router.put('/:id/notification/read', auth(['admin', 'patient', 'registered']), notificationController.markAsRead);

module.exports = router;
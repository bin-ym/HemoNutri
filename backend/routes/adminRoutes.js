const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

router.get('/users', auth(['admin']), adminController.getUsers);
router.post('/users', auth(['admin']), adminController.addUser);
router.delete('/users/:id', auth(['admin']), adminController.deleteUser);
router.get('/resources', auth(['admin']), adminController.getResources);
router.post('/resources', auth(['admin']), adminController.createResource); // Add this
router.delete('/resources/:id', auth(['admin']), adminController.deleteResource);
router.get('/report', auth(['admin']), adminController.getUsageReport);
router.post('/notifications', auth(['admin']), adminController.sendNotification);
router.get('/user-activity', auth(['admin']), adminController.getUserActivity);
router.get('/notifications', auth(['admin']), adminController.getNotifications);

module.exports = router;
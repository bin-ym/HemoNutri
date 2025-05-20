const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const auth = require('../middleware/auth');

router.get('/food-logs', auth(['patient']), patientController.getFoodLogs);
router.post('/food-logs', auth(['patient']), patientController.addFoodLog);

router.get('/notifications', auth(['patient', 'provider']), patientController.getNotifications);

router.get('/meal-plan', auth(['patient']), patientController.getMealPlan);
router.put('/meal-plan/consume', auth(['patient']), patientController.updateMealConsumption);

router.post('/message', auth(['patient']), patientController.sendMessage);
router.get('/messages', auth(['patient']), patientController.getMessages);
router.put('/messages/read', auth(['patient']), patientController.markMessagesRead);

router.get('/conversations/:userId', auth(['patient']), patientController.getConversation);

router.get('/resources', auth(['patient', 'provider']), patientController.getResources);

router.post('/emergency', auth(['patient']), patientController.sendEmergency);

module.exports = router;